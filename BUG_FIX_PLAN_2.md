# Plano de Solução de Bugs 2 — DuoMatch (Segunda Auditoria)

Resultado de nova varredura completa do código (hooks, domain, presentation, infra),
realizada APÓS a conclusão do plano original (`BUG_FIX_PLAN.md`, 43/45 corrigidos).
Itens marcados com ✓ foram verificados manualmente linha a linha; os demais foram
confirmados por auditoria cruzada consistente entre revisores independentes.

Numeração `B2-xx` para não colidir com os bugs #1–#45 do plano original.

---

## Status atual (atualizado na continuidade da segunda auditoria)

> A maioria dos itens deste plano JÁ foi corrigida no código atual. ÚNICAS
> pendências: **B2-32** (LinkingPage não atômico — refactor de batch para
> transação) e **B2-33** (meta de desafios conta criação — requer decisão de
> produto).
>
> Itens **CORRIGIDOS nesta continuação** (lote de robustez + baixos):
> B2-13 (memos `.length` no MainView), B2-16 (último ponto UTC —
> `coupleJourneyMatches`), B2-19, B2-26 (error handler nos `onSnapshot` +
> `ErrorScreen` em vez de Loading infinito), B2-30, B2-31 (lastMessage
> recalculado do servidor no edit/delete do chat), B2-34, B2-36, B2-37,
> B2-38, B2-39 (toasts fantasma removidos do NotificationManager), B2-40
> (contagem regressiva da rodada + dias até checagem alinhados ao avaliador),
> B2-41 (insight de ciclo só para o parceiro na Hot Zone), B2-42 (botão de
> adicionar no header desktop para o tour), B2-44, B2-49, B2-53, B2-55, e a
> **família ciclo menstrual** — B2-27 (períodos com `runTransaction`
> read-modify-write), B2-28 (owner determinístico por menor uid + `ownerId`
> persistido no 1º registro), B2-29 (`clampCycleLength` em [15,60] no domínio
> + gap mínimo de 15 dias entre registros) — e B2-48 (notificação de wishlist
> por itens não vistos, não por timestamp único).

---

## FASE 1 — Bugs CRITICOS (corrompem dados ou matam feature core)

### B2-01 ✓ Streak sempre volta para 1 — REGRESSÃO do fix #1
**Arquivo:** `src/shared/utils/streakUtils.js:25`
**Impacto:** Streak nunca passa de 1. Conquista `streak_7` é matematicamente inalcançável.

```js
streak: userData.partnerData?.streak ? userData.partnerData.streak + 1 : 1,
```

O fix original trocou `coupleData` → `partnerData`, mas apontou para a fonte errada:
`partnerData` (injetado em `useAuth.js:60-63`) é o documento `users/{partnerUid}`,
que **nunca tem** `streak`. O streak vive em `duomatches/{coupleId}` e chega à função
via `coupleData` (MainView chama `updateStreak(id, { ...userData, coupleData }, ...)`).

**Correcao:** ler `userData.coupleData?.streak`. Revisar também B2-04 (idempotência) junto.
**Risco:** BAIXO — uma linha, mas testar com B2-04.

---

### B2-02 ✓ Penalidade cíclica aplicada em dobro (race entre os dois clientes)
**Arquivo:** `src/application/hooks/useRoundRules.js:38-48`
**Impacto:** `±penalty` pode ser gravado 2x no placar da rodada.

O batch aplica `increment(delta)` e atualiza `rulesLastChecked` **sem transação nem
precondição**, e o `useEffect` dispara em todo cliente onde `rounds`/`allActivities`
mudarem — ou seja, nos dois celulares do casal simultaneamente. Ambos computam o plano
a partir do mesmo `rulesLastChecked` desatualizado antes do snapshot propagar.

**Correcao:** envolver em `runTransaction`: ler o doc da rodada DENTRO da transação,
só aplicar deltas se `rulesLastChecked[key]` ainda for o valor antigo (compare-and-set).
Mesmo padrão dos fixes #9/#11/#12.
**Risco:** MEDIO — refactor do commit, padrão já estabelecido.

---

### B2-03 ✓ Resolução de desafio concede pontos duplicados
**Arquivo:** `src/application/hooks/useActivities.js:242-298` (`handleResolveChallenge`)
**Impacto:** Duplo clique ou dois parceiros resolvendo ao mesmo tempo = `+points` 2x.

A guarda usa `activity.challengeState` do **prop React** (estado possivelmente obsoleto)
e o batch não verifica o valor no servidor. Atividades normais têm `runTransaction` +
flag `pointsAwarded`; desafios ficaram sem proteção nenhuma.

**Correcao:** converter para `runTransaction`; dentro dela ler o doc e só prosseguir se
`challengeState === "accepted"`; gravar `challengeState: resolution` e o incremento
atomicamente. Considerar flag `resolutionAwarded` como `pointsAwarded`.
**Risco:** MEDIO — padrão já estabelecido.

---

### B2-04 ✓ CountdownTimer congela após 1 segundo (fix #23 não resolveu)
**Arquivo:** `src/presentation/components/CountdownTimer.js:25-31`
**Impacto:** Todos os countdowns de expiração de desafio (MainView, HotZone, MatchItem)
exibem tempo errado — travado no valor de montagem +1s.

O `useEffect` roda uma vez e agenda um único `setTimeout`; quando ele dispara, o efeito
não re-executa (deps `[expiryTimestamp]` inalteradas) e nada reagenda. Adicionar
`expiryTimestamp` às deps (fix #23) não criou um loop.

**Correcao:** trocar por `setInterval` com `clearInterval` no cleanup, ou fazer o
timeout se reagendar (agendar próximo tick dentro do callback). Atualizar estado só
quando o valor calculado mudar para evitar re-render por segundo desnecessário.
**Risco:** BAIXO — componente isolado.

---

### B2-05 ✓ 4 conquistas de desafio são inalcançáveis (sinal errado)
**Arquivo:** `src/domain/services/AchievementStatsBuilder.js:34-36, 46-48`
**Impacto:** `first_challenge`, `challenge_streak_5`, `challenge_master` e
`first_hot_challenge` jamais desbloqueiam pelo fluxo normal.

O builder conta desafio concluído como `selections[uid].status === "confirmed"`, mas o
fluxo real de desafios grava `status: "accepted"` ao aceitar (`useActivities.js:414`) e
depois apenas `challengeState: "completed"` ao resolver — `selections` não é tocado.
O sinal canônico de conclusão é `challengeState === "completed"` (já usado em
`streakUtils.js:55-57` e `MainView.js:386`).

**Correcao:** contar desafio como concluído quando
`challengeState === "completed"` OU manter `selections confirmed` (para compatibilidade
com dados legados). Decidir quem "completou": `challengedId` (quem recebeu) para stats
individuais — hoje o builder é por usuário.
**Risco:** BAIXO — função pura no domain.

---

### B2-06 ✓ Notificação de HOT match nunca renderiza + evento disparado 2x
**Arquivos:** `DuoMatchApp.js:282-288`, `useSuggestions.js:743-749`, `useActivities.js:338-344`
**Impacto:** Celebração de match hot quebrada/duplicada em todo o app.

Três defeitos encadeados:
1. `DuoMatchApp` renderiza `<MatchNotification onClose={...} isHot />` **sem `isVisible`**
   (contrato real: `{ isVisible, activityName, isHot, onComplete }`) e usa prop
   inexistente `onClose` → este overlay nunca aparece.
2. `window.dispatchHotMatchEvent(name)` JÁ dispara `'hotActivityMatch'`; a linha seguinte
   dispara o mesmo evento de novo com `detail` = string → handler do hub faz
   `const { activityName } = event.detail` e recebe `undefined`, sobrescrevendo o nome.
3. `MainView` também escuta `'hotActivityMatch'` e mostra overlay com `isHot={false}`
   (tema verde genérico) — quando o hub funcionar, haverá dois overlays sobrepostos.

**Correcao:** (a) passar `isVisible={showHotMatchNotification}` e `onComplete`;
(b) remover o dispatch manual duplicado em `useSuggestions`/`useActivities` — chamar
APENAS `window.dispatchHotMatchEvent`; (c) decidir dono único do overlay (hub OU view)
e remover o listener redundante.
**Risco:** BAIXO — remoção de duplicação + props.

---

### B2-07 ✓ Desafio semanal muda no DOMINGO e grava na semana errada
**Arquivo:** `src/presentation/components/DailyChallenge.js:396-403, 410-418, 434-438`
**Impacto:** No domingo o casal vê OUTRO desafio; aceites/pontos de domingo ficam na
chave da semana seguinte (na segunda real o desafio já aparece "aceito").

```js
startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
```

Para `getDay() === 0` (domingo), a fórmula dá `date + 1` = segunda da semana SEGUINTE.
Afeta `getWeeklyChallenge` (weekSeed → índice), `calculateWeeklyProgress` e `weekKey`.

**Correcao:** normalizar: `const day = now.getDay(); const diff = day === 0 ? -6 : 1 - day;`
(`diff = 1 - day` com domingo tratado como 7). Extrair helper único usado pelas 3 funções.
**Risco:** BAIXO — aritmética de datas pontual.

---

### B2-08 Pontos do desafio semanal: dupla concessão + rodada "some" à noite
**Arquivo:** `src/presentation/components/DailyChallenge.js:621-641`
**Impacto:** (a) Se o `updateDoc` de status falhar depois da transação commitar, novo
clique DOBRA os pontos (transação não confere idempotência; status gravado fora dela).
(b) `today = new Date().toISOString().slice(0,10)` é UTC: após ~21h no Brasil acha
rodada do "dia seguinte" → confirmação gravada como confirmada, mas **nenhum ponto
escrito**.

**Correcao:** mover a escrita do status PARA DENTRO da `runTransaction` e conferir
`confirmations[uid].status !== "confirmed"` antes de incrementar; usar data local
(`getTodayDateString()`).
**Risco:** MEDIO — refactor do fluxo de claim.

---

### B2-09 ✓ Estado global `newUserData` nunca é limpo — vazamento entre contas
**Arquivos:** `src/infrastructure/firebase/index.js:57-60`, `src/application/hooks/useAuth.js:93-104`,
setado em `AuthPage.js:66`
**Impacto:** Email/nickname de um usuário gravados permanentemente no perfil de outro.

`newUserData` sobrevive ao logout (SPA) e nunca é resetado. Usuário B logando depois
(尤其 via Google, caminho de contingência do doc inexistente) herda
`email: newUserData.email` do usuário A — o `||` prefere o valor obsoleto sobre
`currentUser.email`.

**Correcao:** (1) preferir sempre `currentUser.email` e usar `newUserData` só para
nickname/gender; (2) chamar `setNewUserData(null)` após o primeiro snapshot do doc
criado e no sign-out.
**Risco:** BAIXO — mudança pontual.

---

### B2-10 Desvincular casal estoura o limite de operações do batch
**Arquivo:** `src/application/hooks/useCouple.js:121-159`
**Impacto:** Com meses de uso (atividades + comments + rounds + rewards + wishlist +
2 docs/dia de sugestões), o `batch.commit()` passa do limite do Firestore e falha
ATOMICAMENTE — o casal fica impossibilitado de desvincular para sempre.

**Correcao:** fatiar deleções em batches de ≤450 ops (loop sequencial); deletar o doc do
casal e zerar vínculos dos users no ÚLTIMO batch (ou após todos), para não deixar estado
pela metade se um batch intermediário falhar.
**Risco:** MEDIO — loop de batches + ordem de operações.

---

### B2-11 Confirmação de presente da wishlist concede pontos duplicados
**Arquivo:** `src/application/hooks/useWishlist.js:163-192`
**Impacto:** Duplo clique (botão continua clicável até o snapshot chegar) credita
`item.points` 2x ao presenteador. Mesma classe do bug #11 (corrigido em rewards, não aqui).

Batch atualiza `status: "confirmed"` sem verificar estado atual e sem transação.

**Correcao:** `runTransaction`: ler item, abortar se `status !== "gifted"`; senão gravar
`confirmed` + incremento na mesma transação.
**Risco:** BAIXO — padrão estabelecido.

---

### B2-12 Custo negativo na aprovação permite inflação infinita de pontos
**Arquivos:** `src/presentation/components/ShopView.js:155-173`, `src/application/hooks/useRewards.js:93-105`
**Impacto:** Aprovar reward com custo `-50` → compra credita 50 pontos
(`currentScore < cost` passa com saldo 0; `increment(-(-50))` soma). Repetível sem limite.
Também permite re-aprovar reward já `purchased` (reset para `approved` → recompra).

O input está fora de `<form>` (atributos min/max não validam digitação) e o hook grava
qualquer valor.

**Correcao:** validar no hook: `Number.isInteger(finalCost) && finalCost >= 0` (ou > 0);
na aprovação, usar transação que aborta se `status !== "pending_approval"`.
**Risco:** BAIXO — validação + padrão transacional.

---

### B2-13 Avaliação de conquistas congela — deps só observam `.length`
**Arquivo:** `src/application/hooks/useAchievements.js:66-73` (agravado por memos em `MainView.js`)
**Impacto:** Quase todas as condições dependem de STATUS (`purchased`, `confirmed`,
`streak`, `messageCount`, `challengeState`), mas o efeito só reavalia quando muda o
COMPRIMENTO das listas. `big_spender`, `wish_granter`, `streak_7`, `communicator` e as
conquistas de desafio ficam presas até alguém criar/apagar atividade/reward/item.

**Correcao:** depender dos valores derivados (ex.: `JSON.stringify`-free: contar status
relevantes via `useMemo` e usá-los como deps), ou simplesmente incluir os arrays
completos nas deps (custo de reavaliação é trivial — função pura). Remover os memos por
`.length` no MainView que mascaram atualizações.
**Risco:** BAIXO — ajuste de deps.

---

### B2-14 ✓ Notificação "Seu par lançou um desafio!" nunca aparece
**Arquivo:** `src/application/hooks/useNotificationCenter.js:55`
**Impacto:** Item 2 da central filtra exatamente o caso que deveria notificar.

```js
if (activity.challengeState) return; // já aceito/recusado/resolvido
```

Todo desafio nasce com `challengeState: "pending_acceptance"` (`AddItemModal.js:91`) —
truthy → descartado. Outras telas tratam `"pending_acceptance"` corretamente.

**Correcao:** `if (activity.challengeState && activity.challengeState !== "pending_acceptance") return;`
**Risco:** BAIXO — uma linha.

---

### B2-15 HotZone: desafios clicáveis geram falso match e poluem Memórias Íntimas
**Arquivo:** `src/presentation/components/HotZone.js:227-283 (fall-through), 320-349, 547-557`
**Impacto:** Cartão de desafio `accepted` (ou pendente criado por mim) cai no branch
default clicável → clique grava `selections.{uid}.status = "confirmed"` num DESAFIO;
dois cliques disparam falso "MATCH HOT!" e movem desafio não resolvido para Memórias
Íntimas como "💞 Match realizado!".

**Correcao:** no branch de desafio, retornar cartão NÃO clicável para todos os estados
(pendente-criador: "Aguardando resposta..."; aceito: botões resolver, como MatchItem faz);
excluir desafios de `finalizedHotItems` (critério de match deve exigir `!isChallenge`).
**Risco:** BAIXO — JSX condicional.

---

## FASE 2 — Bugs ALTO/MEDIO (datas UTC, corridas menores, UX quebrada)

### B2-16 FAMÍLIA UTC: cinco pontos usam data UTC onde o app usa data local
O projeto convencionou datas locais `YYYY-MM-DD` (`getTodayDateString`), mas estes
pontos usam `toISOString()` (UTC) — no Brasil (UTC-3), entre 21h e 23:59 o "hoje" vira
amanhã:

| Arquivo | Linha | Efeito |
|---|---|---|
| `shared/utils/streakUtils.js` | 9-10 | Streak não encontra atividade "hoje" à noite → não incrementa |
| `presentation/components/MainView.js` | 121-123 | `todayStr` decide RODADA ATIVA e placar → à noite "rodada não encontrada", placar zera |
| `presentation/components/MainView.js` | 203 | Bucket diário de atividades errado à noite |
| `presentation/components/RoundsView.js` | 44-58 | Classificação ativa/futura errada até 3h da madrugada |
| `domain/services/RoundRulesEvaluator.js` | 28-31 | `activityCreationDate` UTC: desafio criado 21h30 no fim da rodada é EXCLUÍDO da meta |
| `presentation/components/DailyChallenge.js` | 623 | Ver B2-08 |

**Correcao:** extrair helper `getDateFromTimestamp(ts)` (local) em `shared/utils.js` e
substituir todos os `.toISOString().slice(0,10)` por `getTodayDateString()`/helper.
Um único workstream resolve os 6 pontos.
**Risco:** MEDIO — tocar vários arquivos, mas mudança mecânica.

---

### B2-17 Sugestões nunca contam para streak (formato de selections divergente)
**Arquivo:** `src/shared/utils/streakUtils.js:70-79`
**Impacto:** Marcar sugestão (normal ou hot) nunca conta para o streak, contradizendo o
comentário do próprio código.

Itens 4/5 leem `selections[uid]?.date`, mas em sugestões `selections[uid]` é a STRING
`"selected"` (`useSuggestions.js:690`) → `.date` é `undefined` → filtro nunca bate.

**Correcao:** para sugestões, comparar `selections[uid] === "selected"` (string) — o doc
de sugestão não guarda data; considerar "hoje" implícito (doc é por dia). Ou padronizar
formato do write em `useSuggestions` para objeto `{status, date}`.
**Risco:** BAIXO — decidir formato e alinhar leitor/escritor.

---

### B2-18 Painel de regras cíclicas diverge do avaliador que aplica penalidade
**Arquivo:** `src/presentation/components/MainView.js:255-289` vs `RoundRulesEvaluator.js:39-55`
**Impacto:** Duas divergências display × scorer: (1) painel EXCLUI atividades criadas no
1º dia da rodada (condição antiga do bug #34, corrigida só no domínio); (2) painel SOMA
sugestões apenas marcadas (`countMarkedSuggestions`) que o avaliador não conta. Usuário
vê "meta cumprida" e leva penalidade mesmo assim.

**Correcao:** o painel deve consumir o MESMO critério do evaluator — expor do domínio
uma função de contagem (ex.: `countQualifyingActivities(activity, userId, round)`) e
usá-la nos dois lugares.
**Risco:** MEDIO — pequeno refactor para compartilhar critério.

---

### B2-19 Reset de sinal diário apaga o sinal do parceiro (ping-pong)
**Arquivo:** `src/application/hooks/useCouple.js:38-51`
**Impacto:** Com parceiros em fusos diferentes (ou 23:59 × 00:01), cada write vê
`date !== hoje` e RESETA o objeto inteiro `dailySignals`, apagando o sinal recém-gravado
do outro. Os dois alternam sem nunca ver o sinal um do outro.

**Correcao:** dentro da transação existente, ao detectar data nova, PRESERVAR estrutura
mas aceitar que o dia virou (é esperado); o problema real é o relógio local divergente —
solução completa exige chave de dia acordada (ver B2-16/B2-24). Correção mínima: só
resetar se `date < todayStr` (nunca se `date > todayStr`, que indica relógio atrasado).
**Risco:** BAIXO — condição mais precisa.

---

### B2-20 Unlink zera vínculos do parceiro sem validar casal atual
**Arquivo:** `src/application/hooks/useCouple.js:150-157`
**Impacto:** Cliente stale executa unlink obsoleto e zera `partnerId/coupleId` do
parceiro que JÁ se vinculou a outro casal — quebra o relacionamento novo.

**Correcao:** dentro do batch/transação, só atualizar o doc do parceiro se
`partner.coupleId === coupleId` sendo deletado.
**Risco:** BAIXO — verificação extra.

---

### B2-21 `onboardingSkipped` nunca é limpo — pós-unlink cai no PreviewApp
**Arquivos:** `src/application/hooks/useCouple.js` (unlink), `src/App.js:33`
**Impacto:** Depois de desvincular um casal real, o usuário com `onboardingSkipped: true`
é roteado direto para o modo demo em vez da LinkingPage — não consegue vincular novo
parceiro sem limpar dados.

**Correcao:** no unlink, incluir `onboardingSkipped: false` (deleteField) no update do
doc do usuário.
**Risco:** BAIXO — um campo no write existente.

---

### B2-22 Geração concorrente de sugestões com `setDoc` sem merge apaga seleção
**Arquivo:** `src/application/hooks/useSuggestions.js:640, 655-661`
**Impacto:** Dois clientes abrindo o dia quase juntos: cada um gera conjunto aleatório
diferente e faz `setDoc` full-replace. Last-write-wins apaga seleção já feita e os
índices `sug_N` passam a apontar para sugestões diferentes em cada cliente.

**Correcao:** gerar dentro de `runTransaction`: ler doc; se não existe, gravar conjunto;
se existe, USAR o existente (nunca substituir). Já há transaction no fluxo de seleção —
estender para a geração.
**Risco:** MEDIO — mover geração para dentro da transação.

---

### B2-23 Toggle de sugestão baseado em estado React obsoleto
**Arquivo:** `src/application/hooks/useSuggestions.js:677-690`
**Impacto:** Dois cliques rápidos recalculam o mesmo valor (desmarcar não persiste);
pior: escreve `"selected"` numa sugestão já casada (`matched: true`) usando estado antigo.

**Correcao:** ler-modificar-escrever dentro da transação já existente (que detecta o
match) em vez de `updateDoc` solto com estado do closure.
**Risco:** MEDIO — unificar os dois caminhos de escrita.

---

### B2-24 Meia-noite: listener preso no doc antigo, clique grava no doc novo
**Arquivo:** `src/application/hooks/useSuggestions.js:648-653 vs 671-676`
**Impacto:** App aberto virando o dia: estado mostra sugestões do dia antigo, mas o
clique grava no doc do NOVO dia — índice `sug_N` aponta para outra sugestão (corrupção
silenciosa) ou `updateDoc` falha sem feedback.

**Correcao:** guardar `today` capturado na montagem do listener e USAR ESSE valor no
handler (coerência UI ↔ write); idealmente re-subscribir quando o dia mudar (timer que
compara `getTodayDateString()` a cada minuto).
**Risco:** BAIXO — capturar valor e reuso.

---

### B2-25 Side effects (setTimeout + eventos) dentro do corpo da transação
**Arquivo:** `src/application/hooks/useSuggestions.js:741-756`
**Impacto:** Corpo de `runTransaction` re-executa em retry → eventos
`activityMatch`/`hotActivityMatch` duplicados (toasts repetidos); timer agendado mesmo
se o commit falhar; nunca limpo no unmount.

**Correcao:** coletar dados do match em variável local e disparar eventos APÓS o `await`
da transação resolver, no chamador.
**Risco:** BAIXO — mover código para fora do callback.

---

### B2-26 LoadingScreen infinita quando snapshot falha (sem error handler)
**Arquivos:** `src/application/hooks/useAuth.js:51,58`, `src/application/hooks/useCouple.js:64-71`,
consumido em `App.js:19` e `DuoMatchApp.js:274-276`
**Impacto:** Erro de permissão/rede no onSnapshot → nenhum callback seta dados →
`loading`/`coupleData` ficam nulos para sempre → tela de carregamento eterna, sem
mensagem/logout.

**Correcao:** adicionar callback de erro nos onSnapshot: setar estado de erro e renderizar
tela de erro com botão "Tentar novamente"/logout.
**Risco:** BAIXO — handlers novos + UI mínima de erro.

---

### B2-27 Ciclo menstrual: read-modify-write de `periods` sem transação
**Arquivo:** `src/application/hooks/useMenstrualCycle.js:98-120, 123-137`
**Impacto:** Array reconstruído do snapshot local e sobrescrito — dois dispositivos do
owner registrando/removendo períodos concorrentemente → lost update (perda silenciosa de
histórico de saúde).

**Correcao:** `runTransaction` lendo `cycleTracking.periods` atual e aplicando a mutação
dentro dela.
**Risco:** BAIXO — padrão estabelecido.

---

### B2-28 Owner do ciclo disputado em casal com duas pessoas "feminino"
**Arquivo:** `src/application/hooks/useMenstrualCycle.js:69-77`
**Impacto:** Cada cliente infere a SI mesma como owner enquanto `cycleTracking.ownerId`
não existe → ambas veem formulário, cada write sobrescreve o histórico da outra.

**Correcao:** definir desempate determinístico (ex.: menor uid vence enquanto ownerId
não persistido) e persistir `ownerId` no primeiro registro; UI mostra painel de registro
só para a owner efetiva.
**Risco:** BAIXO — regra de desempate.

---

### B2-29 `cycleLength` sem validação → janela fértil invertida
**Arquivo:** `src/domain/valueObjects/MenstrualCycle.js:67-76` (entrada: `CycleView.js`, `useMenstrualCycle.js:86`)
**Impacto:** Períodos registrados com 3 dias de diferença (typo) → `averageLength = 3` →
`ovulationDay = -11` → janela fértil com `end < start`, fases erradas, insight ruído.

**Correcao:** clampar/rejeitar `cycleLength` fora de [15, 60] (mínimo fisiológico); no
registro de período, exigir gap mínimo (ex.: 15 dias) do anterior ou avisar; validar
`cycleLengthOverride` na entrada.
**Risco:** BAIXO — validação no domain + hook.

---

### B2-30 "Minhas Vendas" da carteira usa critério errado
**Arquivo:** `src/presentation/components/WalletView.js:14-18`
**Impacto:** `mySales = purchasedBy !== user.uid` inclui itens que o PARCEIRO criou e
comprou para si — atribuição de entrega trocada (quem marca "Entregue" é quem não tem
relação com o item).

**Correcao:** `mySales = r.createdBy === user.uid && r.purchasedBy !== user.uid`.
Decidir também se compra do próprio item deve ser bloqueada (hoje é permitida).
**Risco:** BAIXO — filtro.

---

### B2-31 Preview `lastMessage` do chat corrompido por estado stale
**Arquivo:** `src/application/hooks/useChat.js:158-165 (edição), 179-197 (exclusão)`
**Impacto:** Decisão "sou a última mensagem?" usa array local possivelmente atrasado →
sobrescreve preview com texto/autor antigos; notificação de chat mente sobre quem disse
o quê até a próxima mensagem.

**Correcao:** buscar a última mensagem real (query orderBy desc limit 1) antes de
decidir atualizar `lastMessage`, ou simplesmente limpar/regenerar o preview a partir do
servidor.
**Risco:** BAIXO — query pontual.

---

### B2-32 LinkingPage: colisão de código sequestra convite + fluxo não atômico
**Arquivo:** `src/presentation/components/LinkingPage.js:51-57, 91-122`
**Impacto:** (a) `setDoc` do código sem checar existência → colisão sobrescreve convite
ativo de outro usuário; (b) fluxo em 3 etapas (addDoc casal → batch users → batch
atividades) sem transação/rollback → falha parcial deixa casal órfão ou usuários
vinculados sem seeds; (c) sem checagem "usuário já possui casal" → convite esquecido
arranca usuário já vinculado (split-brain).

**Correcao:** (a) usar `createDoc`/transação que falha se código existe (regenerar em
colisão); (b) agrupar users+casal numa transação e atividades em batch posterior com
rollback compensatório; (c) recusar resgate se `currentUser.partnerId` já está setado.
**Risco:** MEDIO — refactor do fluxo de vinculação.

---

### B2-33 Meta de desafios conta CRIAÇÃO (recusados incluem), não conclusão
**Arquivo:** `src/domain/services/RoundRulesEvaluator.js:58-68`
**Impacto:** A cria 5 desafios, B recusa todos → A cumpre a meta, B leva −penalty mesmo
tendo completado os desafios de A. Contradiz a semântica do resto do sistema ("desafio
vale para quem completa"). Possível decisão de produto — CONFIRMAR antes de mudar.

**Correcao (se confirmado):** contar `challengeState === "completed"` atribuído ao
usuário avaliado (quem completou), não `createdBy`.
**Risco:** BAIXO — função pura; requer decisão de produto.

---

### B2-34 Desafios expirados notificam para sempre
**Arquivo:** `src/application/hooks/useNotificationCenter.js:52-65`
**Impacto:** Central ignora `expiresAt` → desafio ignorado gera notificação permanente
"esperando sua resposta".

**Correcao:** pular desafios com `expiresAt` no passado (mesmo critério de
`isActivityForToday`).
**Risco:** BAIXO — filtro.

---

### B2-35 Erros da transação de compra são engolidos
**Arquivo:** `src/application/hooks/useRewards.js:137-166` (chamador `ShopView.js:183`)
**Impacto:** "Pontos insuficientes.", reward indisponível ou falha de rede viram unhandled
rejection — usuário clica Comprar, confirma, e nada acontece, sem feedback.

**Correcao:** try/catch no hook retornando/lançando erro tratado; ShopView exibe alert/
toast com a mensagem.
**Risco:** BAIXO — tratamento de erro.

---

## FASE 3 — Bugs BAIXO (limpeza, polimento, casos raros)

| ID | Arquivo | Problema | Correção |
|---|---|---|---|
| B2-36 | `domain/entities/Achievement.js:42,49` | `first_activity` e `first_match` têm condição idêntica (`completedActivities >= 1`) — desbloqueiam sempre juntos | Diferenciar: `first_match` exigir atividade originada de match (campo `createdBy === "SYSTEM"` + origem sugestão) |
| B2-37 | `RoundRulesEvaluator.js:47-53` | Atividade depois marcada `not_completed` continua contando para a meta (pontuação zera, meta permanece) | Exigir `resolution !== "not_completed"` na contagem da meta |
| B2-38 | `MenstrualCycle.js:166` | `.at(-1)` sem polyfill — TypeError em Safari/iOS < 15.4 (PWA de casal) | Substituir por `arr[arr.length - 1]` |
| B2-39 | `NotificationManager.js:52-104` + `useActivities.js:24-30` | 3 notificações declaradas/consumidas mas NUNCA setadas visíveis (`showMatchNotification`, `partnerNotification`, `showHotSelectionNotification`) — código morto que simula feature | Implementar os sets nos fluxos correspondentes ou remover |
| B2-40 | `MainView.js:148-164, 294-321` | Branch `diffDays === 1` inalcançável (`<= 1` acima); `daysUntilNextCheck === rule.days` mapeado a 0 → "Hoje!" mas avaliador não avalia no dia 0 | Corrigir condições; alinhar display com `evaluateGoal` |
| B2-41 | `HotZone.js:70, 178-185` | SignalGame mostra `DailyTipCard` (insight do ciclo) para a PRÓPRIA owner — MainView filtra com `!isCycleOwner` | Aplicar mesmo filtro |
| B2-42 | `OnboardingView.js` + `DuoMatchApp.js:300-308` | Passos do tour buscam elementos inexistentes por breakpoint (`md:hidden` / `hidden md:flex`) → degradam sem destaque | Selecionar alvos por breakpoint ou usar elementos sempre presentes |
| B2-43 | `LinkingPage.js:87-89, 226-230` | Erros específicos ("seu próprio código", "código inválido") engolidos por mensagem genérica | Propagar `error.message` quando for erro de validação própria |
| B2-44 | `useChat.js:128-134 vs 174-198` | Apagar mensagem não decrementa `messageCount` — mensagens apagadas contam para conquista `communicator` | Decrementar na exclusão (ou contar via query no builder) |
| B2-45 | `useAchievements.js:37` | `coupleData.partnerId` nunca existe no doc do casal — campo morto | Remover, ficar com fallback `userData.partnerId` |
| B2-46 | `useRewards.js:63-68` | `batch.commit()` sem catch na marcação `notifiedForApproval` — toast reaparece a cada reload se falhar | try/catch silencioso (retry no próximo ciclo é aceitável) |
| B2-47 | `useWishlist.js:107, 185` | `!itemData.points` rejeita 0 legítimo e aceitaria negativo; confirmação com pontos ≤ 0 confirma SEM creditar ninguém, sem aviso | Validar `points >= 0` na criação; tornar comportamento explícito para 0 |
| B2-48 | `useWishlist.js:65-88` | Casamento por `createdAt.isEqual(timestamp)` — rajada de 2+ itens notifica só o último | Notificar por itens não vistos (`seenWishlistItems` já existe — usar como base) |
| B2-49 | `WishlistView.js:55-62` | `href={item.link}` sem sanitização de esquema — `javascript:` executável (XSS armazenado entre o par) | Validar esquema http/https na entrada (`AddWishlistItemModal`) e/ou na renderização |
| B2-50 | `useWishlist.js:154-160` | Presentear sem checar `status === "active"` — item gifted/confirmed pode ser presenteado de novo, invertendo `giftedBy` | Transação com guarda de status (junto com B2-11) |
| B2-51 | `useAuth.js:102` | `setDoc` de contingência sem merge pode substituir doc rico criado em paralelo por `AuthPage` | `{ merge: true }` |
| B2-52 | `useAuth.js:103` | `setUserData(initialData)` pós-await reverte estado mais novo do snapshot (flicker de perfil incompleto) | Não setar; deixar o snapshot (latency compensation) atualizar |
| B2-53 | `useCouple.js:160-165` | Falha no `signOut` DEPOIS do commit mostra "erro grave" embora tudo tenha sido apagado — usuário pode tentar de novo sobre estado destruído | Separar try/catch do signOut; mensagem condizente |
| B2-54 | `useSuggestions.js:690` | `updateDoc` sem tratamento de doc inexistente — clique não faz nada sem feedback | catch → regenerar doc ou avisar |
| B2-55 | `HotZone.js:498` | `showHistory` declarado no pai e nunca usado (estado fantasma) | Remover |

---

## Ordem de execução recomendada

| Ordem | Itens | Tema | Esforço | Impacto |
|---|---|---|---|---|
| 1 | B2-01 + B2-04 (streak idempotência) | Streak funciona de verdade | 1-2h | Streak + streak_7 |
| 2 | B2-02, B2-03, B2-11, B2-50 | Família runTransaction (penalidade, desafio, wishlist) | 3-4h | Placar íntegro |
| 3 | B2-05 + B2-13 | Conquistas voltam a funcionar | 1-2h | 8+ conquistas desbloqueáveis |
| 4 | B2-06 | Notificação de match única e correta | 30min | UX de match |
| 5 | B2-07 + B2-08 | Desafio semanal (domingo + pontos) | 2h | Feature semanal confiável |
| 6 | B2-09, B2-14, B2-15 | Correções de uma linha / isoladas | 1h | Vários |
| 7 | B2-16 | Família UTC (6 pontos, 1 helper) | 2h | Datas consistentes à noite |
| 8 | B2-10, B2-20, B2-21 | Unlink seguro | 2h | Saída garantida do casal |
| 9 | B2-22, B2-23, B2-24, B2-25, B2-54 | Família sugestões | 3h | Matches sem corrupção |
| 10 | B2-12, B2-35, B2-46 | Economia (validação + erros) | 1h | Anti-explore |
| 11 | B2-17, B2-18 | Streak/display coerentes com scorer | 2h | Confiança no placar |
| 12 | B2-19, B2-26 a B2-32, B2-34 | Médios diversos | 4-5h | Robustez geral |
| 13 | B2-33 | Decisão de produto + fix | 30min | Justa meta de desafios |
| 14 | B2-36 a B2-55 | Baixos / limpeza | 3-4h | Polimento |

**Total estimado: ~25-32 horas**

---

## Notas

- **Fase 1 inteira** afeta integridade de dados ou features centrais — prioridade máxima.
- **Famílias de correção** (resolver juntas): transações (B2-02/03/11/50), UTC (B2-16),
  sugestões (B2-22/23/24/25/54), conquistas (B2-05/13), unlink (B2-10/20/21).
- B2-33 depende de decisão de produto (semântica da meta de desafios).
- B2-16 resolve de quebra parte de B2-08 e B2-19 (raiz comum: data UTC/local).
- Nenhum leak de `onSnapshot` foi encontrado nos hooks (todos retornam unsubscribe) —
  diferente da primeira auditoria, esse classe de bug está limpa.
