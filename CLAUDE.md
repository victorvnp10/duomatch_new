# CLAUDE.md

Este arquivo é a fonte de verdade sobre estrutura, dados e estado do projeto.
> **Antes de alterar qualquer coisa**, consulte a seção "Mapa de arquivos por assunto" para localizar
> o(s) arquivo(s) relevante(s). **Depois de qualquer alteração** (novo campo, nova coleção, novo hook,
> nova regra de negócio, arquivo removido/renomeado), atualize este arquivo na mesma tarefa.

---

## 1. Stack e comandos

React 18 (CRA `react-scripts` 5) + Firebase 9 (Auth + Firestore) + Tailwind CSS 3.4 + Workbox (PWA).
Sem TypeScript, sem backend próprio — toda a lógica de servidor é Firestore Security Rules (agora versionadas
em `firestore.rules`; deploy: `npx firebase-tools deploy --only firestore:rules`) + Cloud Firestore diretamente do cliente.

```bash
npm install         # instalar dependências
npm start            # dev server (localhost:3000)
npm run build         # build de produção (PWA com service worker via Workbox)
npm test               # react-scripts test (Jest) — não há testes escritos
```

- Configuração: copiar `.env.example` → `.env` com as chaves `REACT_APP_FIREBASE_*` (ver
  `src/infrastructure/firebase/config.js`). Para push "com app fechado" adicionar
  `REACT_APP_FIREBASE_VAPID_KEY` (Console > Configurações do projeto > Cloud Messaging > Web Push).
- `.eslintrc.json` foi removido — era inutil (parser TS sem arquivos TS, sem regras).
- Deploy: Vercel (`vercel.json` com CSP para Google Auth via **redirect** + endpoints de
  FCM em `connect-src`). Config `.replit` para Replit.
  - **Login Google = `signInWithRedirect`** (nao popup): o popup quebrava em producao porque a header
    `Cross-Origin-Opener-Policy` impedia o SDK de ler `popupWindow.closed`, abortando com
    `auth/popup-closed-by-user` ("nao sai do login"). O redirect faz navegacao top-level, sem essa
    interacao. Ver `AuthPage.js` (usa `getRedirectResult` para criar o doc do usuario).
- **Não existem testes automatizados** — não presuma cobertura ao avaliar risco.

---

## 2. Mapa de arquivos por assunto

### Autenticação / sessão
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useAuth.js` |
| Presentation | `src/presentation/components/AuthPage.js`, `CompleteProfileView.js` |
| Roteamento | `src/App.js` (waterfall condicional por estado do perfil) |

**Login unificado (Google + e-mail/senha → mesma conta):** o Google é um
provider separado do e-mail/senha no Firebase — a "mesma conta" só existe se
os dois providers forem vinculados ao MESMO `uid`. Regras em `AuthPage.js`:
- **`auth/account-exists-with-different-credential`** (login Google quando já
  há conta e-mail/senha com o mesmo e-mail): guarda `{email, credential}` em
  `linkRequest`, pede a senha e executa `signInWithEmailAndPassword` +
  `linkWithCredential` (mesmo UID, dois providers). O componente pode desmontar
  após o sign-in (o `onAuthStateChanged` navega sozinho); o link roda na mesma
  promise do handler.
- **`auth/email-already-in-use`** no cadastro: consulta
  `fetchSignInMethodsForEmail`; se o e-mail existe só no Google (`["google.com"]`),
  orienta a usar "Continuar com o Google" em vez de criar uma segunda conta.
- **Login e-mail/senha com e-mail só-Google**: `fetchSignInMethodsForEmail`
  retorna `["google.com"]` → orienta o login pelo Google em vez de mostrar
  "senha inválida".

> **Login Google:** usa `signInWithPopup` como via primária (redirect falha no Chrome 2024+
> por restrição de storage cross-origin). O popup funciona porque `vercel.json` envia
> `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Fallback para `signInWithRedirect`
> se popup for bloqueado. Ver `AuthPage.js:handleGoogleSignIn`.

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

### Catalogo de conteudo (atividades + desafios)
| Camada | Arquivo |
|---|---|
| Shared (seed) | `src/shared/contentCatalog.js` (~192k, 473 atividades + 217 desafios) |
| Infrastructure | `src/infrastructure/firebase/repositories/ContentRepository.js` (le do Firestore + seed por upsert) |
| Consumido por | `useSuggestions.js` (sugestoes do dia/hot), `DailyChallenge.js` (desafio semanal) |

### Sugestoes diarias / hot
| Camada | Arquivo |
|---|---|
| Application | `src/application/hooks/useSuggestions.js` (pool vem do catalogo no Firestore, anti-repeticao via `recentActivityIds`) |
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
| Application | `src/application/hooks/useNotificationCenter.js` (puro/sem side effects, usado no MainView e no DuoMatchApp) |
| Presentation | `src/presentation/components/NotificationCenter.js` (sino + painel de pendencias + botao de permissao), `NotificationManager.js` (toasts efemeros) |

### Notificacoes do sistema (PWA) + Web Push (FCM, app fechado)
| Camada | Arquivo |
|---|---|
| Presentation (service) | `src/presentation/pwa/systemNotifications.js` (Notification API + dedup + App Badging) |
| Presentation (hook) | `src/presentation/pwa/usePwaNotifications.js` (bridge foco/pendencia + retry + badge) |
| Presentation (push) | `src/presentation/pwa/pushSubscription.js`, `src/presentation/pwa/usePushSubscription.js` (token FCM → `pushTokens/{uid}`) |
| Presentation (componente) | `src/presentation/pwa/PwaNotificationBridge.js` (sem UI), montado no `DuoMatchApp.js` |
| SW (FCM) | `src/service-worker.js` (Workbox + handler `onBackgroundMessage` + `notificationclick` num UNICO SW) |
| Backend (emissor) | `functions/index.js` (Cloud Functions: triggers de Firestore + cron do lembrete) |

> **Escopo (decisao ATUALIZADA):** alem das notificacoes com aba aberta (puros
> lado cliente), o app agora tem **Web Push (FCM)** para notificar **com app
> fechado** — o SW unico (Workbox + FCM) mostra a notificacao em background e o
> emissor e server-side (`functions/`): gatilhos que espelham os criterios da
> Central (par marcou atividade, par lancou desafio) + cron diario 21h SP
> (lembrete). O CLIENTE está implementado e builda; as FUNCTIONS estão
> **DEPLOYADAS** (Node 22, 2ª gen): `notifyPartnerMarkedActivity` (activity
> confirmada → alerta ao par), `notifyPartnerSelectedSuggestion` (sugestão
> marcada → alerta ao par), `notifyPartnerCreatedChallenge` (desafio lançado
> → alerta ao par) em **southamerica-east1** (região do banco) e
> `dailyReminder` (scheduler) em `us-central1` — cleanup policy do Artifact
> Registry configurada. Redeploy: `npx firebase-tools deploy --only functions`
> (ver header do `functions/index.js`).
> Sem `REACT_APP_FIREBASE_VAPID_KEY` no `.env` o push e no-op silencioso.
> Com o app ABERTO, o alerta chega pelo `onMessage` (foreground handler em
> `pushSubscription.js`) — o SW só exibe com o app fechado. `eventId`s dos
> triggers batem com os ids da Central (`partner-activity-*`,
> `partner-challenge-*`) para o dedup do `showSystemNotification` não duplicar.
> Clicar na notificacao foca/navega (`?view=<target>`); badge usa
> `navigator.setAppBadge` (requer HTTPS + PWA instalado).
> **Importante:** a região dos triggers de Firestore precisa ser a mesma da
> localização do banco (neste projeto: `southamerica-east1`).

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
| Infrastructure | `src/infrastructure/firebase/config.js` (43 linhas), `src/infrastructure/firebase/index.js` (exporta `getFirebaseMessaging`/`getToken`/`isMessagingSupported` lazy), `src/infrastructure/firebase/repositories/ContentRepository.js` |
| Backend (serverless) | `functions/` (Cloud Functions — ver seção de notificações) |

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

**Camada de repositorio** (`infrastructure/firebase/repositories/`) existe apenas para
conteudo: `ContentRepository.js` (le catalogos globais do Firestore + seed por upsert).
Os demais hooks ainda chamam Firestore diretamente. Ver ARCHITECTURE.md para o padrao a seguir.

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
| `recentActivityIds` | string[] | `useSuggestions.js` (`arrayUnion`) — anti-repeticao de sugestoes do dia/hot |
| `recentChallengeIds` | string[] | `DailyChallenge.js` (`arrayUnion`) — anti-repeticao do desafio semanal |
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
Doc unico por dia, gerado sob demanda por `useSuggestions.js`. Pool vem do catalogo
global (`contentActivities`), com anti-repeticao via `recentActivityIds`.
Campo `suggestions`: `{sug_0..sug_4: {..., selections: {[uid]: "selected"|null}, matched}}`.

### `duomatches/{coupleId}/weeklyChallenge/{weekKey}` (NAO DOCUMENTADO em versoes anteriores)
Desafio semanal — escrito diretamente por `DailyChallenge.js`. Campos nao formalizados.
`weekKey` = identificador da semana. Conteudo inclui estado do desafio por usuario.
Desafio escolhido do catalogo global `contentChallenges`, com anti-repeticao via
`recentChallengeIds`.

### `contentActivities/{id}` e `contentChallenges/{id}` (colecoes raiz — catalogo global)
Fonte de verdade do conteudo (sugestoes do dia/hot e desafio semanal). Populadas
automaticamente por **upsert** (grava so os `id` ausentes) a partir de
`src/shared/contentCatalog.js` (473 atividades: 72 normal + 101 hot do seed
original + 150 do lote m6 + 150 do lote m7; 217 desafios) quando o `ContentRepository` le.
Depois disso, leituras vem do Firestore — pode-se ampliar/editar no banco sem rebuild.
- `contentActivities`: `{id, name, category, points, description, flavor: "normal"|"hot", active}`
- `contentChallenges`: `{id, title, description, points, type, active}`

### `inviteCodes/{code}` (colecao raiz)
Codigo de convite de 6 caracteres. `creatorId`, `creatorNickname`, `createdAt`. Deletado ao consumir.

### `pushTokens/{uid}` (colecao raiz — Web Push / FCM)
Tokens de push de cada usuario (um doc por usuario, varios devices). Escrito pelo cliente
(`src/presentation/pwa/pushSubscription.js`) via `setDoc` + merge, lido pelas Cloud Functions
(ao notificar com app fechado). **Nao versionado** em regras de seguranca (Console):
`allow create, update: if request.auth.uid == uid`.

| Campo | Tipo | Observacoes |
|---|---|---|
| `uid` | string | Duplicado do ID do doc |
| `tokens` | `{ [deviceId]: string }` | Map device→token FCM (deviceId estavel por navegador via localStorage) |
| `updatedAt` | Timestamp | Ultimo registro/refresh |

Tokens rejeitados pelo FCM (`unregistered`) sao podados pela function `sendPushToUser`.
**Regras de seguranca sugeridas (colecao raiz `pushTokens`):**
`match /pushTokens/{uid} { allow read, update: if request.auth.uid == uid; allow create: if request.auth.uid == request.resource.data.uid; }` (functions usam admin SDK e ignoram regras).

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
- **Pontuacao INDIVIDUAL e independente do parceiro**: para cada usuario, cumprir a
  meta (`count >= rule.quantity`) no periodo = `+penalty`; nao cumprir = `-penalty`.
  (Antes era diferencial/competitiva — so aplicava quando um cumpria e o outro nao;
  corrigido para incentivar uso individual.)
- Avaliacao so roda quando o periodo (em dias) desde a ultima checagem >= `rule.days`.
- **Meta ciclica = PARTICIPACAO**, nao conclusao:
  - **Atividades = MARCADAS pelo usuario** (`countMarkedActivitiesInRound`): basta marcar
    a atividade no periodo (`selections.{uid}.status === "confirmed"`), sem exigir match
    nem conclusao. Marcar e depois declarar "nao concluida" continua contando a marca.
  - **Desafios = LANCADOS pelo usuario** (`countChallengesCreatedInRound`): basta desafiar
    o parceiro (`createdBy === userId`), sem exigir aceite nem conclusao.
  - (Reversao do antigo B2-33, que exigia `challengeState === "completed"`.)
- **Contadores period-aware**: os contadores recebem `periodStartDate` (= `rulesLastChecked`
  ou `startDate` da rodada) e contam apenas maracoes/lançamentos feitos DENTRO da janela
  de avaliacao corrente (B2-59). Isso impede que atividades de periodos anteriores
  acumulem no progresso do painel.
- **Dois sistemas de pontuacao SOMAM no `scores` da rodada**: (1) regra ciclica acima
  (marcar/desafiar); (2) conclusao — atividade com match cumprida em casal (ambos
  concluiram) = ambos ganham `activity.points`; desafio cumprido = quem cumpriu ganha
  `challenge.points` (`useActivities.js`).

### Conquistas (12 no catalogo)
Unlock por条件oes puras em `domain/entities/Achievement.js`:
`first_activity`, `first_match`, `first_hot_match`, `first_hot_challenge`,
`first_challenge`, `challenge_streak_5`, `challenge_master`, `streak_7`,
`communicator`, `big_spender`, `hot_streak`, `wish_granter`.

### Sugestoes
- Catalogo vem do banco (`contentActivities`, 473 itens: 72 normal + 101 hot do
  seed original + 150 do lote m6 + 150 do lote m7), seed por upsert — ampliar
  `contentCatalog.js` planta o novo conteudo na proxima inicializacao.
- 5 sugestoes geradas por dia (aleatorio), com anti-repeticao de itens recentes
  (historico `recentActivityIds` no doc do casal).
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
- **`window.dispatchHotMatchEvent`** — funcao global definida apenas em `DuoMatchApp.js`.

---

## 8. Bugs (45 originais → 43 corrigidos, 2 cancelados) + 4 de travamento/cascata

> **Segunda auditoria concluída**: novos bugs numerados `B2-01` a `B2-55` documentados em
> `BUG_FIX_PLAN_2.md` (todos corrigidos — ver "Status atual" no topo do plano). Nenhuma
> pendência restante.
> **B2-56** (pós-auditoria, fix entregue): o bloco de match em `useSuggestions.js`
> gravava `selections.{uid}` (notação de ponto) e `selections` inteiro→`{}` na MESMA
> transação — paths de update sobrepostos são rejeitados pelo Firestore, abortando a
> transação inteira (rollback atômico). Sintoma: clicar numa sugestão já selecionada
> pela parceira dava "Não foi possível registrar sua escolha" e nenhum match/atividade
> era criada. Confirmado via Firestore (casal ativo: `matched=false` + só uma seleção).
> Fix: marcar apenas `matched=true` (UI já filtra `activity.matched`; matches históricos
> mantêm as seleções).
> **B2-57** (pós-auditoria, fix entregue): regressão do B2-56 — o fix anterior removeu o
> `selections inteiro→{}` mas deixou dois `transaction.update` separados no MESMO doc
> (`suggestionsRef`) quando havia match: um para `selections.{uid}` e outro para `matched`.
> Firestore rejeita múltiplos updates no mesmo doc numa transação. Fix: fundido em um único
> `transaction.update` com spread condicional (`...(isMatch && { matched: true })`).
> **B2-58** (pós-auditoria, fix entregue): `doc(db, "duomatches/.../activities")` tem path
> de coleção (3 segmentos — ímpar), o que na API modular do Firestore v9 lança exceção
> (`Expected collection, got document`). Sintoma: toda tentativa de match lançava o erro
> capturado pelo catch → "Não foi possível registrar sua escolha". Fix: substituído por
> `doc(collection(db, path))` que gera ID automático válido. `collection` adicionado ao
> import de `useSuggestions.js`.
> **B2-59** (pós-auditoria, fix entregue): painel de progresso das regras cíclicas contava
> atividades marcadas e desafios lançados em TODO o período da rodada (desde `startDate`),
> acumulando contagens de períodos anteriores. Isso inflava o progresso do painel — o
> usuário via "meta cumprida" mesmo tendo atingido a meta em períodos passados, não no
> período corrente. Fix: `countMarkedActivitiesInRound` e `countChallengesCreatedInRound`
> agora recebem `periodStartDate` (= `rulesLastChecked` ou `startDate` da rodada) e contam
> apenas marações/lançamentos feitos DENTRO da janela de avaliação corrente. O avaliador
> (`evaluateCyclicalRules`) e o painel (`MainView.js:roundRulesProgress`) usam os MESMOS
> parâmetros, garantindo alinhamento entre visualização e pontuação.
> **Login Google** (pós-auditoria, fix entregue): `signInWithRedirect` nunca finalizava em
> produção (Chrome 2024+ restringe storage cross-origin; `getRedirectResult` retornava null
> determinísticamente). Fix: `signInWithPopup` como via primária — funciona porque `vercel.json`
> envia `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Fallback para redirect se popup
> bloqueado. `AuthPage.js:handleGoogleSignIn`.
> Último item entregue: `B2-33` (meta cíclica de desafios exige conclusão — crédito ao
> propositor com `challengeState === "completed"`). Antes dele, `B2-32` (vinculação
> atômica no LinkingPage — convite reservado/consumido por transação, guard "conta já
> vinculada" e rollback compensatório do seed).
> Destaques já corrigidos: regressao do fix #1 (`streakUtils.js`), penalidade ciclica
> aplicada 2x (`useRoundRules.js`), pontos duplicados na resolucao de desafio e na
> confirmacao de wishlist, CountdownTimer congelado, 4 conquistas de desafio inalcancaveis,
> notificacao de hot match morta + evento disparado 2x, weekKey do desafio semanal errado no
> domingo, familia de datas UTC (6 pontos), custo negativo de reward permite inflar pontos,
> familia ciclo menstrual (transacao nos períodos, owner deterministico por menor uid,
> comprimento de ciclo validado/clampeado em [15,60]), toasts fantasma removidos do
> NotificationManager (B2-39), display de regras ciclicas e contagem regressiva alinhados
> ao avaliador (B2-40), insight de ciclo so para o parceiro na Hot Zone (B2-41), botao de
> adicionar no header desktop para o tour (B2-42), erros de validacao do LinkingPage
> propagados (B2-43), notificacao de wishlist por itens nao vistos (B2-48), error handler
> nos `onSnapshot` com `ErrorScreen` em vez de Loading infinito (B2-26) e `lastMessage`
> do chat recalculado do servidor (B2-31).

### Corrigidos (44)

| # | Arquivo | Resumo |
|---|---------|--------|
| 1 | `streakUtils.js` | `coupleData` → `partnerData` |
| 2 | `AchievementStatsBuilder.js` | `dailyChallengeCompletions` morto removido |
| 3 | `HotZone.js` | Sinais corrigidos (`willing`/`unsure`/`resting`) |
| 4 | `DailyChallenge.js` | `increment()` envolto em `runTransaction` |
| 5 | `DailyChallenge.js` | Import Firebase centralizado |
| 6 | `streakUtils.js` | `selections[uid]?.status` (object access) |
| 7 | `Periodicity.js` | Fontes de tempo unificadas (`todayDateString`) |
| 8 | `vercel.json` | CSP completo (style, img, font, connect, default) |
| 9 | `useSuggestions.js` | Race condition com `runTransaction` |
| 10 | `useActivities.js` | `confirmSelections` morto removido |
| 11 | `useRewards.js` | Compra em `runTransaction` |
| 12 | `useCouple.js` | Sinais diários em `runTransaction` |
| 13 | `useChat.js` | `markedAsReadRef` prevenindo write cycle |
| 14 | `HotZone.js` + `MainView.js` | `dispatchHotMatchEvent` removido (só DuoMatchApp) |
| 15 | `RoundRulesEvaluator.js` | Merge consistente (aditivo) |
| 16 | `MenstrualCycle.js` | Parsing UTC (`T00:00:00Z`) |
| 17 | `useCouple.js` | Comments + hotSuggestions no unlink |
| 18 | *(mantido — duplicacao menor)* | — |
| 19 | *(cancelado — requer refactor 16 arquivos)* | — |
| 20 | `useActivities.js` | `forEach(async...)` → `for...of` |
| 21/22 | `styles.css` removido | Tailwind processado 1x |
| 23 | `CountdownTimer.js` | `expiryTimestamp` no useEffect deps |
| 24 | `AddRoundModal.js` | Reset de estado ao reabrir |
| 25 | `EditActivityModal.js` | useEffect sincroniza props |
| 26 | `NotificationToast.js` removido | — |
| 27 | `previewData.js` | Formato compatível com Firestore |
| 28 | `.eslintrc.json` removido | — |
| 29 | *(mantido — UX menor)* | — |
| 30 | *(mantido — refactor arquitetura)* | — |
| 31 | 6 modais + NotificationManager + LinkingPage | Tema dark |
| 32 | `CycleView.js` | `parseInt()` no periodLength |
| 33 | `useRewards.js` | `notifiedRewardsRef` prevenindo write cycle |
| 34 | `RoundRulesEvaluator.js` | CreationDate inclusivo |
| 35 | `HotZone.js` | `useMemo` em hotItems |
| 36 | `PreviewApp.js` | Counter ref para IDs demo |
| 37 | `PreviewApp.js` | View `cycle` adicionada |
| 38 | `useActivities.js` | Variáveis mortas removidas |
| 39 | `useActivities.js` | Console.logs removidos |
| 40 | `HotZone.js` | ~15 console.logs removidos |
| 41 | `AchievementStatsBuilder.js` | wishlistItemsGifted conta só "confirmed" |
| 42 | *(mantido — fallback razoável)* | — |
| 45 | *(mantido — timing-based menor)* | — |
| — | `HotZone (1).js` removido | Duplicado |
| — | `index.js` | Import styles.css removido |
| — | `useSuggestions.js` | `handleAddActivity` morto removido |
| — | `useActivities.js` | Imports `Timestamp`/`serverTimestamp` mortos |
| — | `CountdownTimer.js` | Tema dark |
| — | `AuthPage.js` + `vercel.json` | Google: `signInWithPopup` → `signInWithRedirect` + `getRedirectResult`. COOP bloqueava `popupWindow.closed` e abonava o login como `auth/popup-closed-by-user` ("nao sai do login") |
| — | `MainView.js` | `countConfirmedActivitiesInRound` / `countChallengesCreatedInRound` nao importados de `RoundRulesEvaluator` → `ReferenceError` crashava a main view (B2-18) |

### Travamento/cascata (4) — analise de "sistema travado"

> **Auditoria de travamento**: sintoma principal de "app congelado" era **crash na view main**:
> `useActivities.js` NAO retornava `matches` (foi perdido num refactor), mas `MainView.js:174`
> chamava `matches.some(...)` — `TypeError` derrubava a arvore a cada render. Reforco causava
> cascata de re-render/trava via deps instaveis.

| # | Arquivo | Causa raiz | Correcao |
|---|---------|-----------|----------|
| T1 | `useActivities.js` | `matches` nunca retornado pelo hook (variavel `undefined`) → `MainView.js:174` `matches.some()` quebrava a main view | `matches` calculado com `useMemo` (confirmaçoes do dia) e retornado |
| T2 | `useActivities.js` | `checkForPoints` no array de deps do onSnapshot: mudava de identidade a cada snapshot de rodadas → cancelava/recriava o listener (janela de perda de eventos + churn) | `checkForPointsRef` (useRef) + effect chaveado em primitivas `[coupleId, partnerId, uid]` |
| T3 | `useRoundRules.js` | `runEvaluation` nos deps (arrays com identidade nova a cada snapshot) → re-evaluation/re-transaction em cascata | `runEvaluationRef` + effect chaveado em `[rounds.length, allActivities.length, coupleId]` |
| T4 | `DailyChallenge.js` | `useEffect` reseta `localChallengeData` com a propria state em deps → re-render ping-pong | effect chaveado so em `coupleData?.weeklyChallenge` |

### Cancelados (2)
- **#43** — `deliveryStatus` não documentado (requer análise Firestore real)
- **#44** — BottomNavBar sem Rounds (decisão de UX intencional)

### Login Google "bate e volta" — histórico do fix (resolvido)

**Sintoma:** clicar "Continuar com o Google" vai ao accounts.google.com, autentica e
**volta para a tela de login** sem entrar. Determinístico. A causa confirmada é o
**`signInWithRedirect` NÃO finalizar** neste deploy: desde segundo semestre de 2024 o Chrome
restringe cookies/storage cross-origin e o fluxo redirect morre no handler do Firebase — o
`getRedirectResult` (AuthPage.js) retorna null e o `onAuthStateChanged` segue sem usuário →
router pinta `AuthPage` de novo (a mensagem "O Google confirmou o login, mas a confirmação não
chegou ao app…" foi exibida em produção, confirmando o `getRedirectResult === null`).

**Evidência dura:** `victornogueirapinto@gmail.com` **NÃO existe** como conta no Firebase Auth
(createAuthUri devolve só `sessionId`, sem `signinMethods`) — o login Google **nunca chegou a
completar** neste projeto. O Google só "parece" autenticar porque o handler redireciona de volta;
a finalização do credencial nunca acontece.

**FIX DE MITIGAÇÃO APLICADO (commit "22"):** `AuthPage.js:handleGoogleSignIn` agora tenta
**`signInWithPopup` como via PRIMÁRIA** (o popup entrega o credential via `window.opener.postMessage`,
não depende de cookies cross-origin restritos) e cai em **`signInWithRedirect` apenas como fallback**
quando o popup é bloqueado (`auth/popup-blocked`/`auth/popup-closed-by-user`). O popup SÓ funciona
porque o `vercel.json` envia `Cross-Origin-Opener-Policy: same-origin-allow-popups` (confirmado no
deploy via `curl -sI`; sem COEP). **Atenção:** `same-origin-allow-popups` é obrigatório — com COOP
`same-origin` o popup morreria silenciosamente (sem recipient do postMessage). Não há COEP no
`vercel.json`, o que é necessário para o popup. O redirect de fallback mantém o debug visível:
`sessionStorage["duomatch_google_redirect_started"]` + exibição do erro no `setError`.

**COMO CONTINUAR (próximo passo):** testar no NA VEGADOR REAL (browser isolado do DevTools MCP é
bloqueado pelo Google e não reproduz o fluxo). Confirmar que o popup fecha e entra. Se AINDA bater
e voltar: procurar nas boas práticas do Firebase (`firebase.google.com/docs/auth/web/redirect-best-practices`)
a solução oficial do redirect — exige habilitar os "Authorized redirect URIs"/FedCM. Suspeitos já
descartados: CSP (`vercel.json` permite identitytoolkit/securetoken); inicialização do Firebase é
única (`firebase/index.js:48-49`; `DuoMatchApp.js:164` usa o mesmo singleton); não há COEP.

---

## 9. Violacoes de arquitetura (presentation → Firestore direto)

| Arquivo | Escopo da violacao |
|---|---|
| `LinkingPage.js` | **Pior ofensor** — batch writes, code generation, default activities (80 linhas de dados hardcoded) |
| `AuthPage.js` | setDoc para criar user doc + getDoc/setDoc no login Google |
| `CompleteProfileView.js` | updateDoc para salvar perfil |
| `DuoMatchApp.js` | updateDoc (profile) + Firebase Auth SDK (password change) |
| `CycleView.js` | Importa `getPhaseLabel` diretamente de `CycleInsightService.js` (domain) |
| `shared/utils.js` | Importa `Periodicity.js` (domain) |

---

## 10. PWA

- Service worker Workbox: precache de assets, cache-first para imagens, stale-while-revalidate para fontes.
  **Atualização automática**: `serviceWorkerRegistration.js` chama `registration.update()` no load e no
  `visibilitychange` para `visible`; nova versão ativa via `SKIP_WAITING` e recarrega pelo `controllerchange`
  — um PWA instalado nunca fica preso na versão antiga em cache (evita bugs que só existem no bundle antigo).
  **Unico SW**: os handlers de push do FCM (`onBackgroundMessage` + `notificationclick`) ficam no MESMO
  `src/service-worker.js` — dois SW disputando o escopo `/` se anulariam. A config do Firebase chega no
  SW via query no URL de registro (`service-worker.js?fb=<JSON>`), injetada por `serviceWorkerRegistration.js`.
- **NAO intercepta** Firestore/Firebase Auth (tem proprio mecanismo offline via IndexedDB).
- Manifest completo com icons maskable, theme_color, display standalone, shortcuts.
- Meta tags iOS (apple-mobile-web-app-capable, apple-touch-icon).
- `vercel.json` define CSP para Google Auth via **redirect** (`signInWithRedirect`) + conecta-se aos
  endpoints do FCM (`fcm.googleapis.com`, `fcmregistrations.googleapis.com`) no `connect-src`.

---

## 11. Diversos

### Dependencias
- React 18.2, Firebase ^9.6.10, Tailwind 3.4, Workbox 6.6.
- `@tailwindcss/forms`, `autoprefixer`, `postcss` estao em `dependencies` em vez de `devDependencies`.

### Configuracao
- `tailwind.config.js`: paleta `gray` e `yellow` remapeada para tons roxos/dourados. `spin-slow` definido 2x.
- `config.js`: validacao de env vars e `console.error` mas nao aborta — app tenta iniciar com `undefined`.
- `infrastructure/firebase/index.js`: `newUserData`/`setNewUserData` e estado global mutavel exportado.

### Arquivos limpos
- ~~`src/presentation/components/HotZone (1).js`~~ — removido (duplicado)
- ~~`src/styles.css`~~ — removido (redundante com `index.css`)
- ~~`src/presentation/components/NotificationToast.js`~~ — removido (morto)
- ~~`.eslintrc.json`~~ — removido (inutil)
