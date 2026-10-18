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
const url = require("url");

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
  Timestamp,
  writeBatch,
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
  // Guarda a instância de regras ANTIGAS para as fases 5 e 6 (A-1 / M-1).
  const envLegado = env;
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
      // M-1: as regras novas exigem validade explícita no convite.
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)),
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
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)),
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

  // ---------------------------------------------------------------------
  // FASE 5 — ACHADO A-1: poluição do catálogo global
  // ---------------------------------------------------------------------
  const catalogMod = await import(
    url.pathToFileURL(
      path.join(__dirname, "..", "..", "src", "infrastructure", "seed", "contentCatalog.js")
    ).href
  );
  const ACTIVITIES = catalogMod.ACTIVITY_CATALOG;
  const CHALLENGES = catalogMod.CHALLENGE_CATALOG;
  const LEGIT_ACTIVITY = ACTIVITIES[0];
  const LEGIT_CHALLENGE = CHALLENGES[0];

  // Payload de injeção: tem EXATAMENTE o formato aceito pelas regras (mesmas
  // chaves, tipos válidos, pontos plausíveis). A única coisa "errada" é o id,
  // que não existe no catálogo publicado pelo app. As regras novas negam
  // qualquer escrita do cliente, independentemente de formato ou id.
  const INJECTED_ACTIVITY = {
    id: "act-evil-injected",
    name: "Oferta imperdível",
    category: "Hot",
    points: 20,
    description: "Clique em http://evil.example para resgatar",
    flavor: "hot",
    active: true,
  };
  const INJECTED_CHALLENGE = {
    id: "week-evil-injected",
    title: "Desafio imperdível",
    description: "Clique em http://evil.example para resgatar",
    points: 20,
    type: "communication",
    active: true,
  };

  console.log(
    "\n=== FASE 5 (A-1): regras ANTIGAS — injeção no catálogo DEVE passar ==="
  );
  await envLegado.clearFirestore();
  await seed(envLegado, async (db) => {
    await setDoc(doc(db, "users", "injetor"), perfil("injetor", "Injetor"));
  });
  const dbInjetorAntigo = envLegado.authenticatedContext("injetor").firestore();

  await teste(
    "ANTIGAS: usuário injeta atividade falsa no catálogo global (PASSA)",
    async () => {
      await assertSucceeds(
        setDoc(
          doc(dbInjetorAntigo, "contentActivities", INJECTED_ACTIVITY.id),
          INJECTED_ACTIVITY
        )
      );
    }
  );

  await teste(
    "ANTIGAS: usuário injeta desafio falso no catálogo global (PASSA)",
    async () => {
      await assertSucceeds(
        setDoc(
          doc(dbInjetorAntigo, "contentChallenges", INJECTED_CHALLENGE.id),
          INJECTED_CHALLENGE
        )
      );
    }
  );

  console.log(
    "\n=== FASE 5 (A-1): regras NOVAS — injeção DEVE ser bloqueada ==="
  );
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "injetor"), perfil("injetor", "Injetor"));
  });
  const dbInjetorNovo = env.authenticatedContext("injetor").firestore();

  await teste(
    "NOVAS: injeção de atividade com id fora do catálogo é NEGADA",
    async () => {
      await assertFails(
        setDoc(
          doc(dbInjetorNovo, "contentActivities", INJECTED_ACTIVITY.id),
          INJECTED_ACTIVITY
        )
      );
    }
  );

  await teste(
    "NOVAS: injeção de desafio com id fora do catálogo é NEGADA",
    async () => {
      await assertFails(
        setDoc(
          doc(dbInjetorNovo, "contentChallenges", INJECTED_CHALLENGE.id),
          INJECTED_CHALLENGE
        )
      );
    }
  );

  await teste(
    "NOVAS: o catálogo NÃO contém as entradas injetadas (leitura do app)",
    async () => {
      const dbLeitor = env.authenticatedContext("injetor").firestore();
      const act = await getDoc(
        doc(dbLeitor, "contentActivities", INJECTED_ACTIVITY.id)
      );
      const chal = await getDoc(
        doc(dbLeitor, "contentChallenges", INJECTED_CHALLENGE.id)
      );
      if (act.exists() || chal.exists()) {
        throw new Error("entrada injetada ficou visível no catálogo global");
      }
    }
  );

  console.log(
    "\n=== FASE 5 (A-1): regras NOVAS — seed só pelo servidor; cliente não escreve ==="
  );
  await teste(
    "NOVAS: seed direto do cliente (batch de ids reais) é NEGADO",
    async () => {
      await assertFails(
        (async () => {
          const batch = writeBatch(dbInjetorNovo);
          batch.set(
            doc(dbInjetorNovo, "contentActivities", LEGIT_ACTIVITY.id),
            LEGIT_ACTIVITY
          );
          batch.set(
            doc(dbInjetorNovo, "contentChallenges", LEGIT_CHALLENGE.id),
            LEGIT_CHALLENGE
          );
          ACTIVITIES.slice(1, 4).forEach((it) => {
            batch.set(doc(dbInjetorNovo, "contentActivities", it.id), it);
          });
          CHALLENGES.slice(1, 3).forEach((it) => {
            batch.set(doc(dbInjetorNovo, "contentChallenges", it.id), it);
          });
          await batch.commit();
        })()
      );
    }
  );

  for (const [name, item] of [['contentActivities', LEGIT_ACTIVITY], ['contentChallenges', LEGIT_CHALLENGE]]) {
    await teste(`NOVAS: create individual do cliente em ${name} é NEGADO`, async () => {
      await assertFails(setDoc(doc(dbInjetorNovo, name, item.id), item));
    });
  }

  await seed(env, async (db) => {
    await setDoc(doc(db, "contentActivities", LEGIT_ACTIVITY.id), LEGIT_ACTIVITY);
    await setDoc(doc(db, "contentChallenges", LEGIT_CHALLENGE.id), LEGIT_CHALLENGE);
  });

  for (const [name, item] of [['contentActivities', LEGIT_ACTIVITY], ['contentChallenges', LEGIT_CHALLENGE]]) {
    await teste(`NOVAS: update do cliente em ${name} é NEGADO`, async () => {
      await assertFails(setDoc(doc(dbInjetorNovo, name, item.id), { ...item, points: 99 }));
    });
    await teste(`NOVAS: delete do cliente em ${name} é NEGADO`, async () => {
      await assertFails(deleteDoc(doc(dbInjetorNovo, name, item.id)));
    });
    await teste(`NOVAS: leitura anônima de ${name} é NEGADA`, async () => {
      await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), name, item.id)));
    });
  }

  await teste(
    "NOVAS: itens semeados pelo servidor são legíveis e idênticos ao catálogo",
    async () => {
      const dbLeitor = env.authenticatedContext("injetor").firestore();
      const snap = await getDoc(
        doc(dbLeitor, "contentActivities", LEGIT_ACTIVITY.id)
      );
      if (!snap.exists()) throw new Error("seed não gravou a atividade legítima");
      if (snap.data().name !== LEGIT_ACTIVITY.name) {
        throw new Error("conteúdo semeado diverge do catálogo");
      }
    }
  );

  await teste(
    "NOVAS: cliente não pode regravar id já semeado pelo servidor",
    async () => {
      await assertFails(
        setDoc(
          doc(dbInjetorNovo, "contentActivities", LEGIT_ACTIVITY.id),
          LEGIT_ACTIVITY
        )
      );
    }
  );

  // ---------------------------------------------------------------------
  // FASE 6 — ACHADO M-1: convites adivinháveis / sem expiração
  // ---------------------------------------------------------------------
  const TTL_H = 60 * 60 * 1000;

  console.log(
    "\n=== FASE 6 (M-1): regras ANTIGAS — convite sem validade NUNCA expira ==="
  );
  await envLegado.clearFirestore();
  await seed(envLegado, async (db) => {
    await setDoc(doc(db, "users", "vitima2"), perfil("vitima2", "Vítima 2"));
    await setDoc(doc(db, "users", "atacante2"), perfil("atacante2", "Atacante 2"));
    // Convite criado há 30 dias, sem expiresAt (exatamente o que o app antigo
    // gravava). O atacante que adivinhar/obter o código ainda o consome hoje.
    await setDoc(doc(db, "inviteCodes", "AAAAAA"), {
      creatorId: "vitima2",
      creatorNickname: "Vítima 2",
      coupleId: "casal-m1",
      createdAt: new Date(Date.now() - 30 * 24 * TTL_H),
    });
  });
  const dbAtacante2Antigo = envLegado.authenticatedContext("atacante2").firestore();

  await teste(
    "ANTIGAS: convite de 30 dias (sem expiresAt) ainda é consumível — sequestro PASSA",
    async () => {
      await assertSucceeds(
        runTransaction(dbAtacante2Antigo, async (transaction) => {
          const inviteRef = doc(dbAtacante2Antigo, "inviteCodes", "AAAAAA");
          const snap = await transaction.get(inviteRef);
          if (!snap.exists()) throw new Error("convite inexistente");
          const inv = snap.data();
          const coupleRef = doc(dbAtacante2Antigo, "duomatches", "casal-m1");
          transaction.set(coupleRef, {
            members: ["atacante2", inv.creatorId],
            memberNicknames: {
              atacante2: "Atacante 2",
              [inv.creatorId]: inv.creatorNickname,
            },
            createdAt: serverTimestamp(),
            createdBy: "atacante2",
            invitedUserId: inv.creatorId,
            inviteCode: "AAAAAA",
            confirmationTime: "22:00",
          });
          transaction.update(doc(dbAtacante2Antigo, "users", "atacante2"), {
            partnerId: inv.creatorId,
            coupleId: "casal-m1",
          });
          transaction.update(doc(dbAtacante2Antigo, "users", inv.creatorId), {
            partnerId: "atacante2",
            coupleId: "casal-m1",
          });
          transaction.delete(inviteRef);
        })
      );
    }
  );

  console.log(
    "\n=== FASE 6 (M-1): regras NOVAS — convite exige validade e expira ==="
  );
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", "vitima2"), perfil("vitima2", "Vítima 2"));
    await setDoc(doc(db, "users", "atacante2"), perfil("atacante2", "Atacante 2"));
    // Convite legado (pré-deploy), sem expiresAt: não pode mais ser consumido.
    await setDoc(doc(db, "inviteCodes", "SEMEXP"), {
      creatorId: "vitima2",
      creatorNickname: "Vítima 2",
      coupleId: "casal-m1-semexp",
      createdAt: new Date(Date.now() - 30 * 24 * TTL_H),
    });
    // Convite já expirado.
    await setDoc(doc(db, "inviteCodes", "EXPIRD"), {
      creatorId: "vitima2",
      creatorNickname: "Vítima 2",
      coupleId: "casal-m1-expird",
      createdAt: new Date(Date.now() - 2 * TTL_H),
      expiresAt: Timestamp.fromDate(new Date(Date.now() - TTL_H)),
    });
    // Convite válido para o fluxo legítimo.
    await setDoc(doc(db, "inviteCodes", "VAL123"), {
      creatorId: "vitima2",
      creatorNickname: "Vítima 2",
      coupleId: "casal-m1-val",
      createdAt: new Date(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + TTL_H)),
    });
  });
  const dbVitima2 = env.authenticatedContext("vitima2").firestore();
  const dbAtacante2Novo = env.authenticatedContext("atacante2").firestore();

  const transacaoVinculo = (db, code) =>
    runTransaction(db, async (transaction) => {
      const inviteRef = doc(db, "inviteCodes", code);
      const snap = await transaction.get(inviteRef);
      if (!snap.exists()) throw new Error("convite inexistente");
      const inv = snap.data();
      const coupleRef = doc(db, "duomatches", inv.coupleId);
      transaction.set(coupleRef, {
        members: ["atacante2", inv.creatorId],
        memberNicknames: {
          atacante2: "Atacante 2",
          [inv.creatorId]: inv.creatorNickname,
        },
        createdAt: serverTimestamp(),
        createdBy: "atacante2",
        invitedUserId: inv.creatorId,
        inviteCode: code,
        confirmationTime: "22:00",
      });
      transaction.update(doc(db, "users", "atacante2"), {
        partnerId: inv.creatorId,
        coupleId: inviteRef.id && coupleRef.id,
      });
      transaction.update(doc(db, "users", inv.creatorId), {
        partnerId: "atacante2",
        coupleId: coupleRef.id,
      });
      transaction.delete(inviteRef);
    });

  await teste(
    "NOVAS: criar convite SEM expiresAt é NEGADO (campo obrigatório)",
    async () => {
      await assertFails(
        setDoc(doc(dbVitima2, "inviteCodes", "NEW001"), {
          creatorId: "vitima2",
          creatorNickname: "Vítima 2",
          coupleId: "casal-novo",
          createdAt: serverTimestamp(),
        })
      );
    }
  );

  await teste(
    "NOVAS: criar convite com validade acima do teto (3 dias) é NEGADO",
    async () => {
      await assertFails(
        setDoc(doc(dbVitima2, "inviteCodes", "NEW002"), {
          creatorId: "vitima2",
          creatorNickname: "Vítima 2",
          coupleId: "casal-novo",
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * TTL_H)),
        })
      );
    }
  );

  await teste(
    "NOVAS: criar convite válido (expira em 24h) é PERMITIDO — fluxo do app",
    async () => {
      await assertSucceeds(
        setDoc(doc(dbVitima2, "inviteCodes", "NEW003"), {
          creatorId: "vitima2",
          creatorNickname: "Vítima 2",
          coupleId: "casal-novo",
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * TTL_H)),
        })
      );
    }
  );

  await teste(
    "NOVAS: convite legado sem expiresAt NÃO pode ser consumido (atacante bloqueado)",
    async () => {
      await assertFails(transacaoVinculo(dbAtacante2Novo, "SEMEXP"));
    }
  );

  await teste(
    "NOVAS: convite expirado NÃO pode ser consumido (atacante bloqueado)",
    async () => {
      await assertFails(transacaoVinculo(dbAtacante2Novo, "EXPIRD"));
    }
  );

  await teste(
    "NOVAS: convite válido e não expirado continua consumível — fluxo legítimo",
    async () => {
      await assertSucceeds(transacaoVinculo(dbAtacante2Novo, "VAL123"));
    }
  );

  await require('./integrity.cjs')({ env, seed, teste, host: EMU_HOST, port: Number(EMU_PORT) });
  await envLegado.cleanup();
  await env.cleanup();

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
