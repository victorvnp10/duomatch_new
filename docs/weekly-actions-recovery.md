# Recuperação de confirmações semanais

## Contrato e recuperação automática

`weeklyActions` é imutável e é gravada atomicamente com o incremento existente
da rodada. `weeklyEvents` é o recibo terminal (aplicado, ignorado ou
`status: rejected`). O gatilho de criação mantém retry e registra uma entrada
em `weeklyActionPending/{base64url(sourcePath)}` ANTES de tentar o consumidor.
A função agendada `reconcilePendingWeeklyActions` lê SOMENTE esse índice a cada
30 minutos, não o collectionGroup de origens. A entrada é removida somente após
o recibo transacional terminal; limpeza malsucedida é repetível. Recibo existente
permite limpar uma entrada obsoleta sem aplicar pontos. Nenhum índice composto
ou alteração de regras/cliente é necessário: a consulta usa o nome do documento,
e os documentos operacionais são exclusivos do Admin SDK (default deny).
Ela chama o MESMO consumidor transacional/idempotente e NUNCA grava rodadas.
Concorrência entre gatilho, varredura, callable e replay usa o mesmo recibo.

Escolhemos índice em vez de janela recente porque a aceitação de confirmações
usa o `createTime` ORIGINAL, sem expiração por atraso de entrega. Uma janela por
semana/data atual perderia origens antigas ainda recuperáveis. Pendências
registradas permanecem elegíveis sem limite de idade; histórico com recibo não
é relido pelo scheduler.

### Limites, checkpoint e retomada

- `systemJobs/reconcileWeeklyActions` guarda `cursor` (id do índice),
  `leaseOwner` e `leaseUntil`. A lease transacional impede ciclos sobrepostos;
  expira após 600000 ms, além do timeout de 540 segundos da função.
- Cada ciclo consulta no máximo 5 páginas de 20 entradas (teto de 100 entradas
  lidas), e verifica orçamento de 120000 ms antes de iniciar cada origem.
  É um deadline **cooperativo**, não cancela RPC/transação em andamento. A folga
  é destinada à unidade em voo e checkpoint/limpeza; indisponibilidade prolongada
  ainda pode produzir timeout de plataforma, que deve alertar, não ser mascarado.
- Checkpoint por entrada, inclusive após falha transitória. A pendência com falha
  fica no índice, mas não bloqueia entradas posteriores. O ciclo lança erro ao
  final se houve falha. Exaurir o teto normalmente NÃO é erro.
- Ao alcançar uma página vazia, salva `cursor: null`; o próximo ciclo começa
  no início, alcançando falhas anteriores e inserções abaixo do cursor. Não faz
  wrap dentro do mesmo ciclo. `exhausted: true` indica fim da passagem do índice,
  não ausência global de pendências.
- Crash após checkpoint retoma da próxima entrada quando a lease expira. Crash
  antes do checkpoint pode reler a entrada; a garantia é de efeito exatamente
  uma vez pelo recibo, não de leitura exatamente uma vez diante de crash.
- Não apagar o estado/índice como rotina, nem apagar recibos. Para investigar,
  ler estado, índice, origem e recibo com credenciais administrativas. Nunca
  liberar lease ainda ativa só para forçar paralelismo.

### Limite de cobertura do índice onCreate

O registro é feito na entrega de criação pelo servidor, **não na mesma transação
cliente que cria a origem**. Com a restrição de não mudar cliente/regras, não há
outbox atomicamente copiada no commit cliente. Se a primeira entrega/registro
falhar até esgotar o retry da plataforma, a origem existe mas não está no índice:
a varredura indexada não a descobre. Alertar também falhas de `consumeWeeklyAction`
e executar o CLI abaixo após incidentes de entrega prolongados. Não apresentar
esta fila como garantia independente de entrega do Eventarc.

Origens anteriores à implantação do registro exigem replay administrativo,
que permanece capaz de ler TODO o histórico sem janela. Conforme contexto de
liberação, `weeklyActions` está vazia em produção; confirmar isso com o operador
antes de habilitar a fase. Se houver dados, executar dry-run/apply autorizado
para recuperar/indexar os pendentes antes de depender do scheduler. Replay que
falha após registro deixa a origem indexada para recuperação posterior.

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

`--apply` altera estado semanal, recibos e o índice derivado de pendências. Não
altera o checkpoint/lease do scheduler. Sem `--couple`, continua sendo replay
administrativo de todo o histórico, não uma execução limitada do scheduler.
Dry-run é estritamente leitura, inclusive para índice e documento de estado.
A ferramenta não apaga,
recria nem atualiza as origens; o consumidor relê `createTime` ORIGINAL do
Firestore, nunca o relógio de entrega. NÃO apagar/recriar uma origem para
"disparar novamente". Update também não aciona `onDocumentCreated`.
Saída JSON: `scanned`, `pending`, `processed`, `rejected`, `failed`; erro de
infraestrutura dá exit não-zero. Dry-run não cria recibos e não concede pontos.

Teste executável isolado (não acessa produção):

```sh
/home/ubuntu/.hermes/scripts/fb emulators:exec --only firestore --project demo-duomatch "node --test test/functions/revision-i123.test.cjs"
```

Esses testes executam o CLI real em subprocessos (dry-run, apply e repetição),
verificam estado semanal, `createTime` preservado e score da rodada intacto.
A prova de retomada executa ciclos em processos novos, retém uma falha anterior
ao cursor e também mata um processo com SIGKILL após checkpoint real no emulador.
O teste de orçamento injeta apenas o relógio; todas as leituras/escritas usam o
Firestore emulado. Inclui concorrência entre consumidor, callable e varredura.

```sh
/home/ubuntu/.hermes/scripts/fb emulators:exec --only firestore --project demo-duomatch "node --test test/functions/reconciliation-bounded.test.cjs test/functions/revision-i123.test.cjs"
```

## Rejeições e alertas operacionais

O consumidor só reconhece uma rejeição permanente depois de persistir
`weeklyEvents/{eventId}` com `status: rejected` e `errorCode`. Falha ao salvar
esse recibo NÃO é absorvida: escapa para retry/reconciliação. O membro pode
ler o recibo; a tela exibe rejeição em vez de processamento interminável.
A primeira decisão persistida é definitiva naquela semana (não há novo fluxo
de confirmação após negar).

Antes da implantação, o operador deve criar alertas no Cloud Monitoring:
- Logs contendo `WEEKLY_ACTION_REJECTED`: notificar suporte para inspeção.
- Falha/timeout de `consumeWeeklyAction` (inclusive registro do índice): investigar
  entrega/retry e executar replay após indisponibilidade prolongada.
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
