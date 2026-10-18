# Desenho — backend de conteúdo e pontos (18/10/2026)

## Por quê

Duas responsabilidades que hoje vivem no cliente e não deveriam:

1. **Semear o catálogo de conteúdo.** O cliente escreve 690 documentos em
   `contentActivities`/`contentChallenges`, e para as regras permitirem isso
   existe uma **allowlist de 690 ids embutida no `firestore.rules`** (43 KB de
   arquivo). Consequência: publicar uma atividade nova exige editar o catálogo,
   **fazer deploy do app e republicar as regras**. E o catálogo viaja no bundle
   do cliente (chunk de 155 KB) para uma operação que roda uma vez por instalação.

2. **Escrever os pontos do desafio semanal.** O cliente grava
   `weeklyChallenge.{weekKey}` com `runTransaction` + `increment`. As regras só
   validam o **envelope** (quais chaves mudaram), não os valores — então os
   pontos internos são forjáveis e incrementos podem ser repetidos.

## Não-objetivo (explicitamente fora)

- **Seleção diária no servidor.** É a que mais mexe na experiência (muda o que o
  usuário vê a cada dia) e a de maior risco. Fica documentada como fase futura.
- **`scores` das rodadas.** O `increment` em `scores.{partnerUid}` pertence ao
  fluxo de rodadas, não ao desafio semanal. Mexer nele é outra frente.
- **Anti-trapaça como motivação principal.** O adversário aqui é um dos dois
  parceiros trapaceando num jogo privado do casal — severidade baixa. O ganho
  real é arquitetural: manutenção e tamanho, não segurança contra estranhos.

## Decisões (do agente, não do dono do produto)

- **Estender as Cloud Functions existentes** (`functions/`, v2, Node 22) em vez
  de criar serviço novo. Já há quatro funções publicadas e no ar.
- **Região `southamerica-east1`** para gatilhos de Firestore (é onde o banco
  está — divergir dá 403 no deploy, como já aconteceu). Scheduler em `us-central1`.
- **Escrita só pelo Admin SDK**: o cliente perde a permissão de escrita nas
  coleções afetadas; a regra passa a ser `allow write: if false`.
- **Idempotência por marcador**: cada operação grava um documento-marcador com
  id derivado do evento. Repetir o mesmo evento não soma duas vezes.

## Fase 1 — Conteúdo pelo servidor

**Contrato:**
- Nova função `syncContentCatalog` (callable v2, `southamerica-east1`), Admin SDK.
  Recebe opcionalmente uma lista de ids; sem argumento, sincroniza tudo.
  Idempotente: só escreve o que falta ou difere.
- `ContentRepository` no cliente deixa de escrever e passa a **chamar a callable**.
- Regras: `contentActivities` e `contentChallenges` → `allow write: if false`;
  leitura mantida para quem está autenticado. **A allowlist de 690 ids sai do
  arquivo.**
- O catálogo pode sair do bundle do cliente (ele passa a só ler).

**Prova exigida:** a suíte de regras (114 casos) continua verde; o teste de
sincronia da allowlist é removido junto com a allowlist (e isso é registrado);
a função sincroniza de fato (prova executável contra o emulador); publicar
conteúdo novo passa a não exigir deploy de app nem de regras.

## Fase 2 — Pontos pelo servidor

**Contrato:**
- Nova função `recordWeeklyProgress` (callable v2), Admin SDK.
  Recebe `{ coupleId, eventId, kind, payload }`, **valida contra os documentos de
  origem** (a atividade existe, pertence ao casal, tem as confirmações exigidas,
  a semana confere) e aplica com `increment`.
- Marcador de idempotência: `duomatches/{coupleId}/weeklyEvents/{eventId}`.
- Cliente para de escrever `weeklyChallenge`; passa a enviar o evento.
- Regras: `weeklyChallenge` → `allow write: if false` para o cliente.

**Prova exigida:** fluxo legítimo dos dois parceiros preservado ponta a ponta;
evento repetido **não** soma duas vezes; evento forjado (sem a confirmação de
origem) é rejeitado; suíte de regras verde com o caso novo.

## Ordem e por que é sequencial

As duas fases editam `functions/index.js` e `firestore.rules` — os mesmos
arquivos. Rodar em paralelo produziria conflito de merge exatamente nos arquivos
mais sensíveis. Fase 1 primeiro, verificada, depois Fase 2.

## Implantação

A ordem é **funções → app → regras**, e não "app primeiro" como nas correções
anteriores. O motivo: o cliente passa a **chamar** a função. Se o app for
publicado antes da função existir, o seed quebra. Publicar a função antes é
inofensivo (nada a chama ainda). Só depois de o app estar no ar é que as regras
podem negar a escrita direta do cliente.

Rollback: as funções são versionadas pelo deploy; as regras voltam do baseline
salvo. Se o app subir e o seed falhar, promover o deployment anterior no Vercel
resolve em segundos.
