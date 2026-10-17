/**
 * Testes executáveis das regras do Firestore do DuoMatch (emulador).
 *
 * Prova os dois lados da correção da falha de consentimento na vinculação:
 *   1. Nas regras ANTIGAS (firestore.legacy.rules, extraído de HEAD), o ataque
 *      de "criar casal forjado + escrever partnerId/coupleId no doc da vítima"
 *      PASSA e o atacante lê o perfil privado da vítima.
 *   2. Nas regras NOVAS (firestore.rules), o ataque é BLOQUEADO e o fluxo
 *      legítimo de vinculação (convite gerado pelo parceiro) CONTINUA passando.
 *
 * Como rodar (a partir da raiz do repositório):
 *   ./node_modules/.bin/firebase emulators:exec --only firestore --project demo-duomatch \
 *     "node test/rules/duomatch.rules.test.cjs"
 * (neste ambiente o CLI está em /home/ubuntu/.hermes/tools/firebase-cli)
 *
 * As dependências (firebase e @firebase/rules-unit-testing) são carregadas de
 * FIREBASE_TOOLS_NODE_MODULES (default: /home/ubuntu/.hermes/tools/firebase-cli/node_modules)
 * para não instalar nada no repositório nem no ambiente principal do Hermes.
 */

const fs = require("fs");
const path = require("path");

const NM =
  process.env.FIREBASE_TOOLS_NODE_MODULES ||
  "/home/ubuntu/.hermes/tools/firebase-cli/node_modules";

/* eslint-disable import/no-dynamic-require */
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require(NM + "/@firebase/rules-unit-testing");
const {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  deleteDoc,
  serverTimestamp,
} = require(NM + "/firebase/firestore");

const RULES_LEGACY = fs.readFileSync(
  path.join(__dirname, "firestore.legacy.rules"),
  "utf8"
);
const RULES_FIXED_PATH =
  process.env.RULES_FIXED_PATH || path.join(__dirname, "..", "..", "firestore.rules");
const RULES_FIXED = fs.readFileSync(RULES_FIXED_PATH, "utf8");

const [EMU_HOST, EMU_PORT] = (
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080"
).split(":");

let passou = 0;
let falhou = 0;

async function teste(nome, fn) {
  try {
    await fn();
    passou++;
    console.log(`  [OK]    ${nome}`);
  } catch (err) {
    falhou++;
    console.log(`  [FALHA] ${nome}`);
    console.log(`          -> ${err && err.message ? err.message : err}`);
  }
}

/** Semeia dados sem passar pelas regras (estado "já existente" no banco). */
async function seed(env, fn) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await fn(ctx.firestore());
  });
}

function perfil(uid, nickname) {
  return {
    uid,
    nickname,
    gender: "outro",
    email: `${uid}@exemplo.com`,
    birthDate: "1995-01-01",
    photoURL: null,
    createdAt: new Date(),
    partnerId: null,
    coupleId: null,
    score: 0,
  };
}

async function main() {
  // Duas "instâncias" (project ids distintos) porque esta versão do
  // @firebase/rules-unit-testing não expõe loadFirestoreRules: cada env carrega
  // o seu conjunto de regras no mesmo emulador.
  let env = await initializeTestEnvironment({
    projectId: "demo-duomatch-legacy",
    firestore: { rules: RULES_LEGACY, host: EMU_HOST, port: Number(EMU_PORT) },
  });
  const envNovo = await initializeTestEnvironment({
    projectId: "demo-duomatch-fixed",
    firestore: { rules: RULES_FIXED, host: EMU_HOST, port: Number(EMU_PORT) },
  });

  // ---------------------------------------------------------------------
  // FASE 1 — regras ANTIGAS: o ataque passa (evidência da falha)
  // ---------------------------------------------------------------------
  console.log("\n=== FASE 1: regras ANTIGAS (HEAD) — o ataque DEVE passar ===");
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "vitima"), perfil("vitima", "Vítima"));
    await setDoc(doc(db, "users", "atacante"), perfil("atacante", "Atacante"));
  });

  const dbAtacanteAntigo = env.authenticatedContext("atacante").firestore();

  await teste(
    "atacante cria casal forjado {members:[atacante,vitima]} sem nenhum convite",
    async () => {
      await assertSucceeds(
        setDoc(doc(dbAtacanteAntigo, "duomatches", "casal-forjado"), {
          members: ["atacante", "vitima"],
          memberNicknames: { atacante: "Atacante", vitima: "Vítima" },
          createdAt: serverTimestamp(),
          createdBy: "atacante",
          invitedUserId: "vitima",
          confirmationTime: "22:00",
        })
      );
    }
  );

  await teste(
    "atacante grava partnerId/coupleId no documento da VÍTIMA (ramo 2)",
    async () => {
      await assertSucceeds(
        setDoc(
          doc(dbAtacanteAntigo, "users", "vitima"),
          { partnerId: "atacante", coupleId: "casal-forjado" },
          { merge: true }
        )
      );
    }
  );

  await teste(
    "atacante lê o perfil privado da vítima (email/birthDate) após o vínculo forjado",
    async () => {
      await assertSucceeds(getDoc(doc(dbAtacanteAntigo, "users", "vitima")));
      const snap = await getDoc(doc(dbAtacanteAntigo, "users", "vitima"));
      console.log(
        `          -> VAZAMENTO CONFIRMADO: email=${snap.data().email} birthDate=${
          snap.data().birthDate
        }`
      );
    }
  );

  // ---------------------------------------------------------------------
  // FASE 2 — regras NOVAS: ataque bloqueado
  // ---------------------------------------------------------------------
  console.log("\n=== FASE 2: regras NOVAS — o ataque DEVE ser bloqueado ===");
  env = envNovo;
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "vitima"), perfil("vitima", "Vítima"));
    await setDoc(doc(db, "users", "atacante"), perfil("atacante", "Atacante"));
    // Casal forjado pré-existente: simula o elo fraco já gravado no banco,
    // para testar ISOLADAMENTE a escrita no documento da vítima.
    await setDoc(doc(db, "duomatches", "casal-forjado-pre"), {
      members: ["atacante", "vitima"],
      memberNicknames: { atacante: "Atacante", vitima: "Vítima" },
      createdAt: new Date(),
      createdBy: "atacante",
      invitedUserId: "vitima",
      confirmationTime: "22:00",
    });
  });

  const dbAtacanteNovo = env.authenticatedContext("atacante").firestore();

  await teste(
    "create de casal forjado com invitedUserId=vítima é NEGADO (sem convite)",
    async () => {
      await assertFails(
        setDoc(doc(dbAtacanteNovo, "duomatches", "casal-forjado"), {
          members: ["atacante", "vitima"],
          memberNicknames: { atacante: "Atacante", vitima: "Vítima" },
          createdAt: serverTimestamp(),
          createdBy: "atacante",
          invitedUserId: "vitima",
          confirmationTime: "22:00",
        })
      );
    }
  );

  await teste(
    "create de casal forjado com convite do PRÓPRIO atacante também é NEGADO",
    async () => {
      await seed(env, async (db) => {
        await setDoc(doc(db, "inviteCodes", "ATAC01"), {
          creatorId: "atacante",
          creatorNickname: "Atacante",
          coupleId: "casal-forjado-2",
          createdAt: new Date(),
        });
      });
      await assertFails(
        setDoc(doc(dbAtacanteNovo, "duomatches", "casal-forjado-2"), {
          members: ["atacante", "vitima"],
          memberNicknames: { atacante: "Atacante", vitima: "Vítima" },
          createdAt: serverTimestamp(),
          createdBy: "atacante",
          invitedUserId: "vitima",
          confirmationTime: "22:00",
          inviteCode: "ATAC01",
        })
      );
    }
  );

  await teste(
    "escrita de partnerId/coupleId no documento da VÍTIMA é NEGADA (ramo 2)",
    async () => {
      await assertFails(
        setDoc(
          doc(dbAtacanteNovo, "users", "vitima"),
          { partnerId: "atacante", coupleId: "casal-forjado-pre" },
          { merge: true }
        )
      );
    }
  );

  await teste(
    "atacante NÃO consegue mais ler o perfil privado da vítima",
    async () => {
      await assertFails(getDoc(doc(dbAtacanteNovo, "users", "vitima")));
    }
  );

  // ---------------------------------------------------------------------
  // FASE 3 — regras NOVAS: fluxo legítimo continua funcionando
  // ---------------------------------------------------------------------
  console.log("\n=== FASE 3: regras NOVAS — fluxo LEGÍTIMO (convite real) ===");
  await env.clearFirestore();
  const CODE = "ABC123";
  const LEGIT = "casal-legit";
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "convidador"), perfil("convidador", "Convidador"));
    await setDoc(doc(db, "users", "entrante"), perfil("entrante", "Entrante"));
    await setDoc(doc(db, "inviteCodes", CODE), {
      creatorId: "convidador",
      creatorNickname: "Convidador",
      coupleId: LEGIT,
      createdAt: new Date(),
    });
  });

  const dbEntrante = env.authenticatedContext("entrante").firestore();

  await teste(
    "transação de vinculação do app (convite real) é PERMITIDA para os dois docs",
    async () => {
      await assertSucceeds(
        runTransaction(dbEntrante, async (transaction) => {
          const inviteRef = doc(dbEntrante, "inviteCodes", CODE);
          const inviteSnap = await transaction.get(inviteRef);
          if (!inviteSnap.exists()) throw new Error("convite inválido");
          const invite = inviteSnap.data();
          if (invite.creatorId === "entrante") throw new Error("convite próprio");

          const coupleRef = doc(dbEntrante, "duomatches", invite.coupleId);
          transaction.set(coupleRef, {
            members: ["entrante", invite.creatorId],
            memberNicknames: {
              entrante: "Entrante",
              [invite.creatorId]: invite.creatorNickname,
            },
            createdAt: serverTimestamp(),
            createdBy: "entrante",
            invitedUserId: invite.creatorId,
            confirmationTime: "22:00",
            // ÚNICO acréscimo exigido no app: persistir o código usado.
            inviteCode: CODE,
          });
          transaction.update(doc(dbEntrante, "users", "entrante"), {
            partnerId: invite.creatorId,
            coupleId: coupleRef.id,
          });
          transaction.update(doc(dbEntrante, "users", invite.creatorId), {
            partnerId: "entrante",
            coupleId: coupleRef.id,
          });
          transaction.delete(inviteRef);
        })
      );
    }
  );

  await teste(
    "estado final: os dois usuários ficaram vinculados ao casal",
    async () => {
      const dbAdmin = env.authenticatedContext("entrante").firestore();
      const eu = await getDoc(doc(dbAdmin, "users", "entrante"));
      if (eu.data().partnerId !== "convidador" || eu.data().coupleId !== LEGIT) {
        throw new Error("doc do entrante não foi vinculado corretamente");
      }
      await seed(env, async (db) => {
        const ele = await getDoc(doc(db, "users", "convidador"));
        if (ele.data().partnerId !== "entrante" || ele.data().coupleId !== LEGIT) {
          throw new Error("doc do convidador não foi vinculado corretamente");
        }
        const casal = await getDoc(doc(db, "duomatches", LEGIT));
        if (!casal.exists() || casal.data().members.length !== 2) {
          throw new Error("documento do casal ausente/ inválido");
        }
      });
    }
  );

  await teste(
    "parceiro vinculado consegue ler o perfil um do outro (app funciona)",
    async () => {
      await assertSucceeds(
        getDoc(doc(env.authenticatedContext("convidador").firestore(), "users", "entrante"))
      );
      await assertSucceeds(
        getDoc(doc(env.authenticatedContext("entrante").firestore(), "users", "convidador"))
      );
    }
  );

  await teste(
    "convite é consumido (não pode ser reutilizado por um terceiro)",
    async () => {
      const dbTerceiro = env.authenticatedContext("terceiro").firestore();
      await seed(env, async (db) => {
        await setDoc(doc(db, "users", "terceiro"), perfil("terceiro", "Terceiro"));
      });
      await assertFails(
        runTransaction(dbTerceiro, async (transaction) => {
          const coupleRef = doc(dbTerceiro, "duomatches", "casal-2");
          transaction.set(coupleRef, {
            members: ["terceiro", "convidador"],
            memberNicknames: { terceiro: "Terceiro", convidador: "Convidador" },
            createdAt: serverTimestamp(),
            createdBy: "terceiro",
            invitedUserId: "convidador",
            confirmationTime: "22:00",
            inviteCode: CODE,
          });
          transaction.update(doc(dbTerceiro, "users", "convidador"), {
            partnerId: "terceiro",
            coupleId: "casal-2",
          });
        })
      );
    }
  );

  // ---------------------------------------------------------------------
  // FASE 4 — evidência de que o app precisa da mudança de 1 campo
  // ---------------------------------------------------------------------
  console.log(
    "\n=== FASE 4: cliente ATUAL (sem campo inviteCode) nas regras NOVAS ==="
  );
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "convidador"), perfil("convidador", "Convidador"));
    await setDoc(doc(db, "users", "entrante"), perfil("entrante", "Entrante"));
    await setDoc(doc(db, "inviteCodes", "XYZ789"), {
      creatorId: "convidador",
      creatorNickname: "Convidador",
      coupleId: "casal-legado",
      createdAt: new Date(),
    });
  });
  const dbLegado = env.authenticatedContext("entrante").firestore();
  await teste(
    "transação sem o campo inviteCode é NEGADA (por isso a mudança no app é necessária)",
    async () => {
      await assertFails(
        runTransaction(dbLegado, async (transaction) => {
          const coupleRef = doc(dbLegado, "duomatches", "casal-legado");
          transaction.set(coupleRef, {
            members: ["entrante", "convidador"],
            memberNicknames: { entrante: "Entrante", convidador: "Convidador" },
            createdAt: serverTimestamp(),
            createdBy: "entrante",
            invitedUserId: "convidador",
            confirmationTime: "22:00",
          });
          transaction.update(doc(dbLegado, "users", "entrante"), {
            partnerId: "convidador",
            coupleId: "casal-legado",
          });
          transaction.update(doc(dbLegado, "users", "convidador"), {
            partnerId: "entrante",
            coupleId: "casal-legado",
          });
        })
      );
    }
  );

  await env.cleanup();
  await envNovo.cleanup();

  console.log(
    `\n=== RESULTADO: ${passou} passaram, ${falhou} falharam (de ${
      passou + falhou
    }) ===`
  );
  if (falhou > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("ERRO FATAL NO HARNESS:", err);
  process.exitCode = 2;
});
