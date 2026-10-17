# Testes das regras do Firestore (emulador)

Prova executável da correção da falha de consentimento na vinculação de casal.

- `duomatch.rules.test.cjs` — suíte (12 casos, 4 fases).
- `firestore.legacy.rules` — cópia EXATA do `firestore.rules` de `HEAD` (branch
  `main`, commit `1b554bc`), usada para provar que o ataque passava antes.

## Como rodar

A partir da raiz do repositório, com o CLI do Firebase e o emulador:

```bash
./node_modules/.bin/firebase emulators:exec --only firestore --project demo-duomatch \
  "node test/rules/duomatch.rules.test.cjs"
```

Neste ambiente (Hermes) o CLI não está instalado no repositório; use o caminho
do tools:

```bash
/home/ubuntu/.hermes/tools/firebase-cli/node_modules/.bin/firebase \
  emulators:exec --only firestore --project demo-duomatch \
  "node test/rules/duomatch.rules.test.cjs"
```

As dependências de teste (`firebase` e `@firebase/rules-unit-testing`) são
carregadas por caminho absoluto de `FIREBASE_TOOLS_NODE_MODULES`
(default: `/home/ubuntu/.hermes/tools/firebase-cli/node_modules`) — nada é
instalado no repositório nem no ambiente principal do Hermes. Para usar outro
diretório: `FIREBASE_TOOLS_NODE_MODULES=/caminho/node_modules`.

Requisitos: Java (o emulador do Firestore é um jar) e Node.

## O que a suíte cobre

| Fase | Regras | O que prova |
|------|--------|-------------|
| 1 | `firestore.legacy.rules` (HEAD) | o ataque de casal forjado PASSA e o atacante lê o perfil privado da vítima |
| 2 | `firestore.rules` (corrigido) | create de casal forjado e escrita de `partnerId`/`coupleId` no doc da vítima são NEGADOS |
| 3 | `firestore.rules` (corrigido) | o fluxo legítimo (convite real, transação do app) CONTINUA passando; os dois ficam vinculados e podem ler o perfil um do outro |
| 4 | `firestore.rules` (corrigido) | a transação do cliente ATUAL (sem o campo `inviteCode`) é negada — evidência de que a mudança de 1 linha no app é necessária |

Saída esperada: `RESULTADO: 12 passaram, 0 falharam (de 12)` e exit code 0.

## Nota sobre "evaluation error" na saída

Nas tentativas de ATAQUE (fases 2 e 4) o emulador imprime
`evaluation error at L...` junto do `PERMISSION_DENIED`. Isso é esperado: a
cláusula de consentimento é avaliada sobre um payload que NÃO tem o campo
`inviteCode`, e o motor de regras trata o erro como negação. Nenhuma escrita do
fluxo legítimo (fase 3) gera esse erro. O resultado é o desejado em ambos os
casos: ataque negado, vínculo legítimo permitido.
