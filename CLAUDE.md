# CLAUDE.md

Este arquivo é a fonte de verdade sobre estrutura, dados e estado do projeto.
> **Antes de alterar qualquer coisa**, consulte a seção "Mapa de arquivos por assunto" para localizar
> o(s) arquivo(s) relevante(s). **Depois de qualquer alteração** (novo campo, nova coleção, novo hook,
> nova regra de negócio, arquivo removido/renomeado), atualize este arquivo na mesma tarefa.

---

## 1. Stack e comandos

React 18 (CRA `react-scripts` 5) + Firebase 9 (Auth + Firestore) + Tailwind CSS 3.4 + Workbox (PWA).
Sem TypeScript, sem backend próprio — toda a lógica de servidor é Firestore Security Rules (não versionadas
neste repo) + Cloud Firestore diretamente do cliente.

```bash
npm install         # instalar dependências
npm start            # dev server (localhost:3000)
npm run build         # build de produção (PWA com service worker via Workbox)
npm test               # react-scripts test (Jest) — não há testes escritos
```

- Configuração: copiar `.env.example` → `.env` com as chaves `REACT_APP_FIREBASE_*` (ver
  `src/infrastructure/firebase/config.js`).
- `.eslintrc.json` é inútil hoje — só define parser TS, sem regras. O lint que roda é o
  padrão do `react-scripts`. `@typescript-eslint/parser` está listado mas não há arquivos TS.
- Deploy: Vercel (`vercel.json` com CSP + COOP para popup Google). Config `.replit` para Replit.
- **Não existem testes automatizados** — não presuma cobertura ao avaliar risco.

---

## 2. Mapa de arquivos por assunto

### Autenticação / sessão
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useAuth.js` |
| Presentation | `src/presentation/components/AuthPage.js`, `CompleteProfileView.js` |
| Roteamento | `src/App.js` (waterfall condicional por estado do perfil) |

### Vincular casal
| Camada | Arquivo |
|---|---|
| Presentation (violacao) | `src/presentation/components/LinkingPage.js` — toda logica de Firestore aqui |

### Atividades / matches / pontos
| Camada | Arquivo |
|---|---|
| Domain | — |
| Application | `src/application/hooks/useActivities.js` (516 linhas, runTransaction) |
| Presentation | `src/presentation/components/MainView.js` (1027 linhas), `AllActivitiesView.js` (132 linhas), `HotZone.js` (838 linhas) |

### Desafio semanal (DAILY CHALLENGE)
| Camada | Arquivo |
|---|---|
| Domain | — |
| Application | — (violacao: logica toda na presentation) |
| Presentation | `src/presentation/components/DailyChallenge.js` (~700 linhas, 3 writes Firestore diretos) |

### Sugestoes diarias / hot
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useSuggestions.js` (755 linhas, pool hard-coded) |
| Consumido por | `DuoMatchApp.js` → `MainView` / `HotZone` |

### Regra de pontuacao ciclica
| Camada | Arquivo |
|---|---|
| Domain | `src/domain/services/RoundRulesEvaluator.js` (161 linhas) |
| Application | `src/application/hooks/useRoundRules.js` (59 linhas) |

### Rodadas / placar
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useRounds.js` (80 linhas) |
| Presentation | `src/presentation/components/RoundsView.js` (216 linhas) |

### Loja / recompensas
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useRewards.js` (205 linhas) |
| Presentation | `src/presentation/components/ShopView.js` (416 linhas) |

### Carteira / saldo
| Camada | Arquivo |
|---|---|
| Presentation | `src/presentation/components/WalletView.js` (245 linhas) |

### Lista de desejos
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useWishlist.js` (210 linhas) |
| Presentation | `src/presentation/components/WishlistView.js` (201 linhas) |

### Chat por atividade
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useChat.js` (214 linhas) |
| Presentation | `src/presentation/components/ChatModal.js` |

### Conquistas
| Camada | Arquivo |
|---|---|
| Domain | `src/domain/entities/Achievement.js` (catalogo + regra), `src/domain/services/AchievementStatsBuilder.js` |
| Application | `src/application/hooks/useAchievements.js` (74 linhas) |
| Presentation | `src/presentation/components/AchievementSystem.js` (90 linhas), `AchievementAnimation.js` |

### Ciclo menstrual / insight de casal
| Camada | Arquivo |
|---|---|
| Domain | `src/domain/valueObjects/MenstrualCycle.js` (195 linhas), `src/domain/services/CycleInsightService.js` (210 linhas) |
| Application | `src/application/hooks/useMenstrualCycle.js` (150 linhas) |
| Presentation | `src/presentation/components/CycleView.js` (282 linhas), `CycleHealthInfo.js` |

### Central de notificacoes
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useNotificationCenter.js` (109 linhas, puro/sem side effects) |
| Presentation | `src/presentation/components/NotificationCenter.js` (111 linhas), `NotificationManager.js` |

### Tour / onboarding
| Camada | Arquivo |
|---|---|
| Presentation | `src/presentation/components/OnboardingView.js` (324 linhas, DOM queries) |

### Preview / demo mode
| Camada | Arquivo |
|---|---|
| Shared | `src/shared/previewData.js` |
| Presentation | `src/presentation/components/PreviewApp.js` (286 linhas) |

### PWA / offline
| Camada | Arquivo |
|---|---|
| Infrastructure | `src/service-worker.js` (Workbox), `src/serviceWorkerRegistration.js` |
| Presentation | `src/presentation/pwa/OfflineBanner.js`, `src/presentation/pwa/InstallPrompt.js` |

### Infraestrutura Firebase
| Camada | Arquivo |
|---|---|
| Infrastructure | `src/infrastructure/firebase/config.js` (43 linhas), `src/infrastructure/firebase/index.js` (84 linhas) |

### Utilitarios compartilhados
| Camada | Arquivo |
|---|---|
| Shared | `src/shared/utils.js` (20 linhas), `src/shared/utils/streakUtils.js` (85 linhas) |

---

## 3. Arquitetura em camadas

```
src/
  domain/                    # Regras de negocio puras. ZERO dependencia de Firestore/React.
    entities/Achievement.js
    services/AchievementStatsBuilder.js, CycleInsightService.js, RoundRulesEvaluator.js
    valueObjects/MenstrualCycle.js, Periodicity.js

  application/hooks/          # Orquestracao: hooks React que leem/gravam Firestore + domain/.
    useAuth.js, useCouple.js, useActivities.js, useRounds.js, useRoundRules.js,
    useWishlist.js, useRewards.js, useChat.js, useSuggestions.js, useAchievements.js,
    useMenstrualCycle.js, useNotificationCenter.js

  infrastructure/firebase/    # SDK Firebase, config, exports centralizados.
    config.js, index.js

  presentation/               # Componentes React (UI) + PWA.
    components/               # 46 arquivos
    pwa/                      # OfflineBanner.js, InstallPrompt.js

  shared/                     # Utilitarios genericos (datas, streak).
    utils.js, utils/streakUtils.js, previewData.js
```

**Regra de dependencia** (teoria vs. realidade):
- `domain/` nao importa nada de fora — **cumprido**.
- `application/` importa `domain/` + `infrastructure/` — **cumprido**.
- `presentation/` idealmente so fala com `application/` — **VIOLADO por 5 arquivos**:
  - `LinkingPage.js`: writes Firestore direto (batch, setDoc, updateDoc, deleteDoc)
  - `AuthPage.js`: setDoc para criar user doc + getDoc no login Google
  - `CompleteProfileView.js`: updateDoc para salvar perfil
  - `DuoMatchApp.js`: updateDoc + Firebase Auth SDK (password change)
  - `DailyChallenge.js`: 3 updateDoc diretos + increment() sem transaction
- `shared/` nao deveria importar `domain/` — **VIOLADO por `shared/utils.js`** (importa `Periodicity.js`)

**Camada de repositorio** (`infrastructure/firebase/repositories/`) ainda nao existe.
Hooks chamam Firestore diretamente. Ver ARCHITECTURE.md para o padrao a seguir.

---

## 4. Modelo de dados (Cloud Firestore) — dicionario de referencia

### `users/{uid}`
Perfil do usuario autenticado. Criado em `AuthPage.js`, completado em `CompleteProfileView.js`.

| Campo | Tipo | Observacoes |
|---|---|---|
| `uid` | string | Duplicado do ID do doc — comparacoes dependem dele no objeto |
| `nickname` | string | |
| `gender` | `"feminino" \| "masculino" \| null` | `null` ate completar perfil; trava app em `CompleteProfileView` |
| `email` | string | |
| `birthDate` | string? | Preenchido em `CompleteProfileView` |
| `avatar` | string? | ID do catalogo ou URL legacy |
| `partnerId` / `coupleId` | string \| null | `null` ate vincular |
| `score` | number | Nao e a fonte viva — pontuacao real fica em `rounds/{id}.scores` |
| `onboardingSkipped` | bool? | Marcado por "Vincular depois" |
| `seenWishlistItems` | string[]? | IDs de itens de wishlist ja vistos (`arrayUnion`) |
| `partnerData` | object (runtime) | **Nunca gravado no Firestore** — injetado em memoria por `useAuth.js` |

### `duomatches/{coupleId}`
Documento central do casal. Criado em `LinkingPage.js`. Deletado em `useCouple.js:handleUnlinkCouple`.

| Campo | Tipo | Gravado por |
|---|---|---|
| `members` | [uid, uid] | `LinkingPage.js` |
| `memberNicknames` | `{uid: nickname}` | `LinkingPage.js` |
| `confirmationTime` | string ("22:00") | `LinkingPage.js` |
| `onboardingCompletedBy` | uid[] | `useCouple.js` (`arrayUnion`) |
| `dailySignals` | `{date, signals: {uid: "willing"\|"unsure"\|"resting"}}` | `useCouple.js:handleSetDailySignal` |
| `dailyStatus` | `{[uid]: {confirmedAt, date}}` | `useActivities.js:confirmSelections` (**FUNCAO MORTA — ver bug #10**) |
| `intimacyPoints` | number | `useActivities.js` |
| `messageCount` | number | `useChat.js:handlePostComment` — conquista "communicator" |
| `achievements` | string[] | `useAchievements.js` (`arrayUnion`) |
| `streak` / `lastStreakUpdate` / `lastActivity` | number / string / Timestamp | `streakUtils.js:updateStreak` (ver bug #13) |
| `lastWishlistUpdate` | `{itemName, addedBy, timestamp}` | `useWishlist.js` |
| `cycleTracking` | `{ownerId, periods: [{startDate, periodLength}], cycleLengthOverride}` | `useMenstrualCycle.js` |
| `dailyChallengeCompletions` | number? | **NUNCA incrementado** — sempre 0 (ver bug #2) |

### `duomatches/{coupleId}/activities/{activityId}`
Atividades e desafios (mesma colecao, diferenciados por `type`).

| Campo | Tipo | Observacoes |
|---|---|---|
| `name`, `description`, `category` | string | `category === "Hot"` = intimidade |
| `type` | `"atividade" \| "desafio" \| "desafio_hot" \| ...` | `type?.startsWith("desafio")` = teste padrao |
| `points` | number | |
| `periodicity` | `{type, value} \| null` | Ver `Periodicity.js` |
| `selections` | `{[uid]: {status, date, resolution?}}` | `status`: `null \| "selected" \| "confirmed" \| "accepted"` |
| `pointsAwarded` | bool | Trava contra pontuacao dupla (transacao em `useActivities.js`) |
| `intimacyPointsAwarded` | bool | Idem para atividades Hot |
| `challengeState` | `"accepted" \| "declined" \| "completed" \| "not_completed" \| undefined` | So para desafios |
| `createdBy` | uid \| `"SYSTEM"` | `"SYSTEM"` para vinculacao e sugestoes |
| `createdAt` | Timestamp | Usado para ordenar e rodada atual |
| `expiresAt` | Timestamp? | So desafios — `isActivityForToday` usa isso |
| `lastMessage` | `{text, senderId, timestamp}` | Preview do chat |

Subcolecao `.../activities/{id}/comments/{commentId}`: `text`, `authorId`, `authorNickname`,
`createdAt`, `editedAt?`, `readAt?`.

### `duomatches/{coupleId}/rounds/{roundId}`
Rodadas — periodos com placar e regras ciclicas.

| Campo | Tipo | Observacoes |
|---|---|---|
| `startDate` / `endDate` | string `YYYY-MM-DD` | Rodada ativa: `today >= startDate && today <= endDate` |
| `scores` | `{[uid]: number}` | **Fonte real de pontuacao** |
| `rules` | `{minActivities?: {days, quantity, penalty}, minChallenges?: {...}}` | Opcional |
| `rulesLastChecked` | `{activities: dateStr, challenges: dateStr}` | Controle de avaliacao ciclica |

### `duomatches/{coupleId}/rewards/{rewardId}`
Loja/recompensas. `status`: `"pending_approval" → "approved" → "purchased"`.
Campos: `name`, `cost`, `createdBy`, `createdAt`, `status`, `purchasedBy`, `approvedBy`,
`notifiedForApproval`, `purchasedAt`. Compra deduz `scores.{uid}` da **rodada ativa**.

### `duomatches/{coupleId}/wishlist/{itemId}`
Lista de desejos. `status`: `"active" → "gifted" → "confirmed"`.
Campos: `name`, `points`, `createdBy`, `createdAt`, `status`, `giftedBy?`, `link?`, `description?`.

### `duomatches/{coupleId}/dailySuggestions/{YYYY-MM-DD}` e `.../hotSuggestions/{YYYY-MM-DD}`
Doc unico por dia, gerado sob demanda por `useSuggestions.js`. Pool hard-coded (~90 itens).
Campo `suggestions`: `{sug_0..sug_4: {..., selections: {[uid]: "selected"|null}, matched}}`.

### `duomatches/{coupleId}/weeklyChallenge/{weekKey}` (NAO DOCUMENTADO em versoes anteriores)
Desafio semanal — escrito diretamente por `DailyChallenge.js`. Campos nao formalizados.
`weekKey` = identificador da semana. Conteudo inclui estado do desafio por usuario.

### `inviteCodes/{code}` (colecao raiz)
Codigo de convite de 6 caracteres. `creatorId`, `creatorNickname`, `createdAt`. Deletado ao consumir.

---

## 5. Estrategia de negocio (regras de dominio)

### Pontuacao
- Pontuacao vive em `rounds/{id}.scores`, **nunca** em `users/{uid}.score`.
- Atividades confirmadas por **ambos** os parceiros geram pontos.
- Desafios geram pontos para quem completa (individual).
- Atividades Hot geram `intimacyPoints` no doc do casal, alem dos pontos normais.
- Transacoes Firestore (`runTransaction`) sao usadas em `useActivities.js` para evitar pontuacao dupla.
- Recompensas compradas deduzem pontos da rodada ativa.

### Regra ciclica (RoundRulesEvaluator)
- Define meta minima de atividades/desafios por periodo dentro de uma rodada.
- Se o parceiro A cumpriu a meta e B nao: A ganha `+penalty`, B perde `-penalty`.
- Se ambos cumpriram ou ambos falharam: sem alteracao.
- Avaliacao so roda quando o periodo (em dias) desde a ultima checagem >= `rule.days`.

### Conquistas (12 no catalogo)
Unlock por条件oes puras em `domain/entities/Achievement.js`:
`first_activity`, `first_match`, `first_hot_match`, `first_hot_challenge`,
`first_challenge`, `challenge_streak_5`, `challenge_master`, `streak_7`,
`communicator`, `big_spender`, `hot_streak`, `wish_granter`.

### Sugestoes
- Pool hard-coded de ~60 hot + ~10 normais.
- 5 sugestoes geradas por dia (aleatorio).
- Match = ambos selecionam a mesma sugestao → vira atividade real automaticamente.

### Ciclo menstrual
- Estimativa por metodo calendario (ovulacao = ciclo - 14, janela fertil = ovulacao-5 a ovulacao+1).
- Owner (por padrao `gender === "feminino"`) registra periodos.
- Partner recebe insight diario (emoji + frase).
- **Nao e diagnostico medico nem metodo contraceptivo** — disclaimer na tela.

### Streak
- Atividade hoje + atividade ontem = incrementa streak.
- Atividade hoje sem ontem = reseta para 1.
- Sem atividade hoje = no-op.
- Conquista `streak_7` = 7 dias consecutivos.

---

## 6. Layout e navegacao

### Arvore de rotas (App.js)
```
LoadingScreen → AuthPage → CompleteProfileView → LinkingPage (ou PreviewApp) → DuoMatchApp
                                                                      ↗
                                              if onboardingSkipped → PreviewApp
```

### DuoMatchApp.js — Hub central
Instancia 8 hooks, monta `propsForChildren` (~40+ props) e faz roteamento por estado `view`:
- `main` → MainView
- `hot` → HotZone
- `rounds` → RoundsView
- `shop` → ShopView
- `wallet` → WalletView
- `wishlist` → WishlistView
- `all-activities` → AllActivitiesView
- `profile` → ProfileView
- `cycle` → CycleView

View inicial lê `?view=` da URL no primeiro render (atalhos PWA).

### MainView (tela principal)
- Header com navegacao (desktop: completa, mobile: limitada)
- Placar da rodada ativa com avatares
- Progresso de regras ciclicas
- Streak tracker
- DailyTipCard (insight de ciclo para o parceiro)
- DailyChallenge (desafio da semana)
- Matches de hoje
- Sugestoes do dia
- Sugestoes especiais (hot)
- Jornada do casal (historico de matches)
- AchievementSystem

### HotZone
- IntimacyMeter (nivel + progresso)
- SignalGame (sinal diario: willing/unsure/resting)
- Sugestoes sensuais (match secreto)
- Desejos secretos (atividades hot disponiveis)
- Memorias intimas (itens finalizados)

### BottomNavBar (mobile)
5 itens: Inicio, Hot, Desejos, Loja, Carteira.
Rodadas e Perfil so acessiveis pelo header do MainView.

---

## 7. Convencoes especificas do projeto

- **Datas como string `YYYY-MM-DD`** (`shared/utils.js:getTodayDateString`), nao `Date`/`Timestamp`,
  para todo campo que representa "dia". Comparacao de intervalo e lexicografica.
- **"Rodada ativa"** sempre recalculada: `find(r => today >= r.startDate && today <= r.endDate)`.
  Reuse `findActiveRound` de `RoundRulesEvaluator.js` em vez de duplicar.
- **Transacoes Firestore** (`runTransaction`) em `useActivities.js` — nao trocar por `updateDoc`.
- **`type?.startsWith("desafio")`** e o teste padrao para "isto e um desafio".
- **`propsForChildren`** e o mecanismo de prop-drilling — ~40+ props passados a cada filho.
- **Eventos globais** via `window.dispatchEvent(CustomEvent(...))` para match e achievement.
- **`window.dispatchHotMatchEvent`** — funcao global re-escrita em 3 componentes (ver bug #14).

---

## 8. Lista completa de bugs e falhas

### Severidade ALTA

**Bug #1 — streakUtils.js: propriedade errada `coupleData` vs `partnerData`**
`streakUtils.js` le `userData.coupleData?.streak`, mas o campo correto e `userData.partnerData`.
Resultado: streak **sempre reseta para 1** porque `coupleData` e sempre `undefined`.

**Bug #2 — dailyChallengeCompletions: contator fantasma**
Lido por `AchievementStatsBuilder.js` e `MainView.js`, mas **nenhum lugar no codigo o incrementa**.
Resulta em `totalChallengesCompleted` sempre somando 0 por essa via. A conquista `first_challenge`
ainda pode acionar pela via de `allActivities`, mas o campo e morto.

**Bug #3 — HotZone: logica de compatibilidade de sinais completamente morta**
`getCompatibility()` (HotZone.js:110-118) compara sinais `"romantic"`, `"cuddly"`, `"passionate"`,
`"playful"`, `"recharging"`. Mas os sinais reais sao `"willing"`, `"unsure"`, `"resting"`.
**Nunca da match** — cai sempre no default `"Encontrem o meio termo"`.

**Bug #4 — DailyChallenge.js: increment() sem transaction**
O componente faz `updateDoc` com `increment()` no score da rodada **sem usar `runTransaction`**.
Enquanto `useActivities.js` usa `runTransaction` especificamente para evitar pontuacao dupla,
`DailyChallenge.js` permite race conditions que podem causar pontuacao corrompida.

**Bug #5 — DailyChallenge.js: onAcceptChallenge e prop fantasma**
O componente aceita a prop `onAcceptChallenge` mas **nunca a usa** — toda logica e feita via
Firestore direto. Isso engana qualquer consumidor que pense que esta delegando a acao.

**Bug #6 — streakUtils.js: comparacao de selecao de sugestoes incorreta**
`streakUtils.js:71-77` compara `activity.selections?.[userId] === "selected"`, mas `selections`
e um objeto `{[uid]: {status, date}}`. A comparacao object-vs-string **sempre retorna false** —
sugestoes nunca contam para o streak.

**Bug #7 — Periodicity.js: fontes de tempo misturadas**
`isActivityForToday()` recebe `todayDateString` mas usa `new Date()` para `semanal`/`mensal`/`anual`.
Se o caller e o sistema estiverem em dias diferentes (late-night call), resultados conflitantes.

**Bug #8 — vercel.json: CSP incompleto**
Faltam `style-src`, `img-src`, `font-src`, `connect-src`, e `default-src`. O browser pode bloquear
imagens de avatar, fontes Google, e conexoes Firestore/Firebase Auth.

### Severidade MEDIA

**Bug #9 — useSuggestions.js: race condition no match detection**
Ambos os parceiros clicam simultaneamente. Leitura do estado local antes do write Firestore propagar.
Ambos podem ver o outro como "selected" e ambos criam atividade duplicada.

**Bug #10 — useActivities.js: confirmSelections e codigo morto**
Exporta `confirmSelections` (grava `dailyStatus`), mas **nenhum componente o importa**.
O codigo acessa `batch._mutations` (API interna do Firebase) — quebraria em versoes novas.

**Bug #11 — useRewards.js: compra dupla em corrida**
Dois usuarios podem comprar a mesma recompensa ao mesmo tempo. Nao verifica `status === "approved"`
antes de deduzir pontos — ambos conseguem comprar.

**Bug #12 — useCouple.js: sinais diarios em condicao de corrida**
Se ambos definem sinais simultaneamente, o segundo write pode sobrescrever o primeiro
porque le `coupleData` do estado local, nao do Firestore.

**Bug #13 — useChat.js: write inside onSnapshot**
Read-receipts sao gravados a cada disparo de `onSnapshot`, criando um ciclo de write → snapshot → write.
Pode causar trafego de rede desnecessario.

**Bug #14 — window.dispatchHotMatchEvent re-escrito em 3 lugares**
Definido em `DuoMatchApp.js`, `MainView.js`, e `HotZone.js`. O ultimo a montar vence.
Condicional de race silenciosa.

**Bug #15 — RoundRulesEvaluator.js: merge inconsistente de score deltas**
Atividades usam `Object.assign` (sobrescreve), desafios usam adicao manual.
Funciona porque avaliacao e sequencial, mas quebra se a ordem mudar.

**Bug #16 — MenstrualCycle.js: timezone edge cases**
`new Date("YYYY-MM-DD")` interpretado como horario local, `toISOString()` retorna UTC.
No Brasil (UTC-3 a UTC-5), pode errar 1 dia em midnight boundary.

**Bug #17 — Orfao de subcollections no unlink**
`handleUnlinkCouple` deleta 5 subcollections mas **nao deleta `comments` aninhados sob activities**.
Documentos de chat ficam orfas no Firestore.

**Bug #18 — Duas chamadas duplicadas de useMenstrualCycle**
Hook instanciado em `MainView.js` (para DailyTipCard) E em `CycleView.js` E dentro de
`HotZone.js:SignalGame`. Cada um cria listeners Firestore independentes.

**Bug #19 — shared/utils.js importa domain (inversao de dependencia)**
`shared/utils.js` importa `formatPeriodicity` e `isActivityForToday` de `Periodicity.js`.
Camada shared deveria ser consumida, nao consumidora.

**Bug #20 — useActivities.js: forEach + async sem await**
Linhas 81 e 129: `activitiesToProcess.forEach(async (act) => ...)` dispara transacoes
concorrentes sem `await`. A funcao retorna antes de todas completarem.

### Severidade BAIXA

**Bug #21 — styles.css inteiramente redundante**
Duplica `@tailwind base/components/utilities` e keyframes ja existentes em `index.css`.
Deveria ser removido.

**Bug #22 — index.css + styles.css: Tailwind processado 2x**
Ambos declaram `@tailwind` directives — build processa camadas base/utilities duas vezes.

**Bug #23 — CountdownTimer.js: dependency ausente no useEffect**
`expiryTimestamp` usado dentro do effect mas nao esta no array de deps.
Timer nao reinicia se a prop mudar.

**Bug #24 — AddRoundModal.js: estado nao reseta ao reabrir**
`useState` com valores iniciais so roda uma vez. Ao reabrir o modal, dados antigos persistem.

**Bug #25 — EditActivityModal.js: sem useEffect de sincronizacao de props**
Se o componente e reutilizado com atividade diferente, estado nao atualiza.

**Bug #26 — NotificationToast.js: possivelmente codigo morto**
Componente limpo mas nao importado por ninguem (`NotificationManager` tem seu proprio inline toast).

**Bug #27 — previewData.js: formato incompativel com modelo real**
`rounds[0].rules` usa `{minActivities: 5}` em vez de `{minActivities: {days, quantity, penalty}}`.
Wishlist usa `status: "pending"` em vez de `"active"`. Rewards usa `"available"` em vez de `"pending_approval"`.

**Bug #28 — .eslintrc.json: inutil**
Define parser TS mas nao ha arquivos TS e nao ha regras. Deveria ser removido ou populado.

**Bug #29 — LinkingPage.js: window.location.reload()**
Apos vincular, recarrega a pagina inteira em vez de atualizar estado. Perde memoria, causa flash.

**Bug #30 — DuoMatchApp.js: propsForChildren com ~40+ props**
Anti-pattern de performance — todo filho re-renderiza a qualquer mudanca em DuoMatchApp.

**Bug #31 — Tema visual inconsistente**
`DeleteConfirmationModal`, `EditActivityModal`, `EditRoundModal`, `EditWishlistItemModal`,
`SetPointsModal`, `PeriodicityInputs` usam tema claro. Resto do app usa tema escuro.

**Bug #32 — UseMenstrualCycle: periodLength recebido como string**
`CycleView.js` envia `e.target.value` (string) em vez de `parseInt`. Hook pode receber tipo errado.

**Bug #33 — useRewards.js: write inside onSnapshot para notifiedForApproval**
Cria ciclo write → snapshot redundante no carregamento inicial.

**Bug #34 — RoundRulesEvaluator.js: exclusao de atividades no start date**
Ativadas criadas no `startDate` da rodada so contam se avaliadas no mesmo dia.

**Bug #35 — HotZone: hotItems sem useMemo**
Recalculado a cada render (linha 569-571), causando re-renders desnecessarios.

**Bug #36 — PreviewApp.js: IDs de demo com colisao**
`id: "demo-custom-${prev.length + 1}"` — ao adicionar/remover/adicionar, IDs colidem.

**Bug #37 — PreviewApp.js: falta view "cycle" no switch**
Navegar para ciclo no modo preview mostra nada.

**Bug #38 — useActivities.js: variaveis de estado declaradas mas nao usadas**
`matches` (sempre `[]`), `timeRemaining` (sempre `""`), `hotNotificationShown` (declarado, nao usado).

**Bug #39 — useActivities.js: console.log em producao**
Linhas 167, 299 — logs de debug de intimidade points.

**Bug #40 — HotZone.js: ~15 console.log de debug em producao**
Linhas 357-358, 364, 514, 533, 544, 551, 573-579, 591-600, 610-615, 831.

**Bug #41 — AchievementStatsBuilder.js: wishlistItemsGifted conta "gifted" nao confirmado**
Conquista `wish_granter` pode acionar antes do destinatario confirmar o presente.

**Bug #42 — RoundRulesEvaluator.js: activityCreationDate fallback para todayStr**
Se `createdAt` e ausente, atividade e tratada como criada hoje — pode contar indevidamente.

**Bug #43 — WalletView.js: deliveryStatus nao documentado**
Campo usado no componente mas nao existe no modelo de dados do Firestore documentado.

**Bug #44 — BottomNavBar: sem acesso a "Rounds" no mobile**
Apenas 5 itens: Inicio, Hot, Desejos, Loja, Carteira. Rodadas so pelo header do MainView.

**Bug #45 — OnboardingView.js: setTimeout(250) para transicao de view**
Timing-based — pode falhar em dispositivos lentos.

---

## 9. Violacoes de arquitetura (presentation → Firestore direto)

| Arquivo | Escopo da violacao |
|---|---|
| `LinkingPage.js` | **Pior ofensor** — batch writes, code generation, default activities (80 linhas de dados hardcoded) |
| `AuthPage.js` | setDoc para criar user doc + getDoc/setDoc no login Google |
| `CompleteProfileView.js` | updateDoc para salvar perfil |
| `DuoMatchApp.js` | updateDoc (profile) + Firebase Auth SDK (password change) |
| `DailyChallenge.js` | 3 updateDoc diretos + increment() sem transaction |
| `CycleView.js` | Importa `getPhaseLabel` diretamente de `CycleInsightService.js` (domain) |
| `shared/utils.js` | Importa `Periodicity.js` (domain) |

---

## 10. PWA

- Service worker Workbox: precache de assets, cache-first para imagens, stale-while-revalidate para fontes.
- **NAO intercepta** Firestore/Firebase Auth (tem proprio mecanismo offline via IndexedDB).
- Manifest completo com icons maskable, theme_color, display standalone, shortcuts.
- Meta tags iOS (apple-mobile-web-app-capable, apple-touch-icon).
- `vercel.json` define CSP + COOP para popup Google.

---

## 11. Diversos

### Dependencias
- React 18.2, Firebase ^9.6.10, Tailwind 3.4, Workbox 6.6.
- `@tailwindcss/forms`, `autoprefixer`, `postcss` estao em `dependencies` em vez de `devDependencies`.

### Configuracao
- `tailwind.config.js`: paleta `gray` e `yellow` remapeada para tons roxos/dourados. `spin-slow` definido 2x.
- `config.js`: validacao de env vars e `console.error` mas nao aborta — app tenta iniciar com `undefined`.
- `infrastructure/firebase/index.js`: `newUserData`/`setNewUserData` e estado global mutavel exportado.
- `index.js`: handler de update SW chama `reload()` antes da nova SW ativar — race condition leve.

### Arquivos para limpar
- `src/presentation/components/HotZone (1).js` — duplicado/divergente, nao importado.
- `src/styles.css` — redundante com `index.css`.
- `src/presentation/components/NotificationToast.js` — possivelmente nao importado.
- `.eslintrc.json` — inutil (parser TS sem arquivos TS, sem regras).
