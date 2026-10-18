# Recuperação de confirmações semanais

## Contrato e recuperação automática

`weeklyActions` é imutável e é gravada atomicamente com o incremento existente
da rodada. `weeklyEvents` é o recibo terminal (aplicado, ignorado ou
`status: rejected`). O gatilho de criação mantém retry; a função agendada
`reconcilePendingWeeklyActions` procura origens sem recibo a cada 30 minutos,
com paginação por nome, sem filtro de idade. Assim recupera documentos
anteriores ao gatilho e também os que ultrapassaram a janela de retry.
Ela chama o MESMO consumidor transacional/idempotente e NUNCA grava rodadas.
Concorrência entre gatilho, varredura e replay é deduplicada pelo mesmo recibo.

Uma varredura completa relê o histórico (custo cresce com o volume). O timeout
é 540 segundos. Monitorar duração/erros; se o histórico não couber nesse tempo,
executar replay administrativo por casal para alcançar os documentos restantes
e planejar checkpoint/indexação antes de escalar. Não declarar uma varredura
interrompida como concluída. Erros transitórios continuam pendentes e fazem a
execução falhar depois de tentar as outras origens da página/varredura.

## Replay administrativo (ADC, não cliente)

Executar a partir da raiz, com dependências de `functions` instaladas e
Application Default Credentials autorizadas no projeto. Não entregar chaves
no chat nem armazená-las no repositório. Confirmar o projeto e o casal com o
operador ANTES de usar `--apply`.

```sh
node functions/replayWeeklyActions.js --help
# Inspeção apenas; --project é obrigatório. Sem --couple inspeciona todos.
node functions/replayWeeklyActions.js --project PROJECT_ID --couple COUPLE_ID
# Depois da aprovação do operador:
node functions/replayWeeklyActions.js --project PROJECT_ID --couple COUPLE_ID --apply
# Repetir a inspeção: pending deve chegar a zero (rejeições têm recibo).
node functions/replayWeeklyActions.js --project PROJECT_ID --couple COUPLE_ID
```

`--apply` altera apenas estado semanal e recibos. A ferramenta não apaga,
recria nem atualiza as origens; o consumidor relê `createTime` ORIGINAL do
Firestore, nunca o relógio de entrega. NÃO apagar/recriar uma origem para
"disparar novamente". Update também não aciona `onDocumentCreated`.
Saída JSON: `scanned`, `pending`, `processed`, `rejected`, `failed`; erro de
infraestrutura dá exit não-zero. Dry-run não cria recibos e não concede pontos.

Teste executável isolado (não acessa produção):

```sh
/home/ubuntu/.hermes/scripts/fb emulators:exec --only firestore --project demo-duomatch "node --test test/functions/revision-i123.test.cjs"
```

Esse teste executa o CLI real em subprocessos (dry-run, apply e repetição),
verifica o estado semanal, o `createTime` preservado e o score da rodada intacto.

## Rejeições e alertas operacionais

O consumidor só reconhece uma rejeição permanente depois de persistir
`weeklyEvents/{eventId}` com `status: rejected` e `errorCode`. Falha ao salvar
esse recibo NÃO é absorvida: escapa para retry/reconciliação. O membro pode
ler o recibo; a tela exibe rejeição em vez de processamento interminável.
A primeira decisão persistida é definitiva naquela semana (não há novo fluxo
de confirmação após negar).

Antes da implantação, o operador deve criar alertas no Cloud Monitoring:
- Logs contendo `WEEKLY_ACTION_REJECTED`: notificar suporte para inspeção.
- Logs contendo `WEEKLY_RECONCILIATION_FAILED` ou falha/timeout de
  `reconcilePendingWeeklyActions`: notificar operação, investigar e executar replay.
- Ausência de `WEEKLY_RECONCILIATION_SUMMARY` por mais de dois períodos:
  verificar scheduler, permissões e função. Não confundir ausência de execução
  com ausência de pendências.

Filtros de Logs Explorer sugeridos (escopo do projeto confirmado):

```text
resource.type="cloud_run_revision"
("WEEKLY_ACTION_REJECTED" OR "WEEKLY_RECONCILIATION_FAILED")
```

Esta alteração adiciona os sinais de log e o runbook; NÃO provisiona canais
ou políticas de alerta em produção e NÃO implanta o scheduler.

Para rejeição: ler origem, recibo e `weeklyChallenge[weekKey]`; conferir actor,
claim, desafio e `createTime`. Não apagar o recibo para ocultar o problema.
Semanas já inválidas na criação não são elegíveis. Origens legadas sem valor
vinculado só permitem o fallback do catálogo/aceite disponível; não é possível
reconstruir automaticamente um preço histórico já sobrescrito. Auditar esses
casos com o histórico operacional, sem reescrever scores de rodadas neste fluxo.

## Compatibilidade e ordem de liberação (somente operador)

O servidor congela `awardPoints` no aceite. O cliente usa esse valor tanto na
origem quanto no incremento da rodada. Para aceite legado, lê o catálogo
servidor dentro da mesma transação; as regras verificam o valor no commit e
a origem imutável preserva esse valor para consumo posterior. As regras negam
novas origens SEM `awardPoints`: abas antigas precisam atualizar (falha fecha
atomicamente a origem e o incremento; não há score parcial).

Implantar servidor atualizado antes de habilitar novas regras/cliente, validar
no ambiente de homologação e combinar a atualização de regras/cliente para
minimizar a janela de incompatibilidade. Fazer inspeção dry-run das pendências
antes/depois. Não executar deploy como parte deste relatório de correção.
