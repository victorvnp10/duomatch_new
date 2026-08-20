# Plano de Solução de Bugs — DuoMatch

Priorizado por severidade e impacto no usuario. Bugs agrupados quando a correção se sobrepoe.

---

## FASE 1 — Bugs CRITICOS (afetam funcionalidade core)

### 1.1 streakUtils.js — propriedade errada + comparacao incorreta (Bugs #1 e #6)
**Arquivo:** `src/shared/utils/streakUtils.js`
**Impacto:** Streak **sempre reseta para 1** — ninguem nunca consegue streak > 1 dia.

| Bug | Linha | Problema | Correcao |
|---|---|---|---|
| #1 | ~25 | `userData.coupleData?.streak` — campo nao existe | Trocar para `userData.partnerData?.streak` |
| #6 | 71-77 | `activity.selections?.[userId] === "selected"` — compara objeto com string | Trocar para `activity.selections?.[userId]?.status === "confirmed"` |

**Plano:**
1. Ler `streakUtils.js` inteiro
2. Corrigir linha ~25: `coupleData` → `partnerData`
3. Corrigir linhas 71-77: acessar `.status` dentro do objeto de selecao
4. Testar manualmente: criar atividade, confirmar, verificar se streak incrementa

**Risco:** BAIXO — correcao pontual, sem side effects

---

### 1.2 DailyChallenge.js — increment() sem transaction + prop morta (Bugs #4 e #5)
**Arquivo:** `src/presentation/components/DailyChallenge.js`
**Impacto:** Race condition pode causar pontuacao corrompida. Prop `onAcceptChallenge` engana consumidores.

**Problema:** O componente faz `updateDoc` com `increment()` no score da rodada **sem `runTransaction`**, enquanto `useActivities.js` usa transaction especificamente para evitar pontuacao dupla.

**Plano:**
1. Extrair logica de pontuacao para um hook `useWeeklyChallenge.js` em `application/hooks/`
2. Usar `runTransaction` para incrementar score (padrao ja estabelecido em `useActivities.js`)
3. Remover prop `onAcceptChallenge` ou implementar delegation correta
4. Mover dados hardcoded do componente (~360 linhas de weeklyChallenges) para constante em `domain/constants/weeklyChallenges.js`
5. Atualizar `DuoMatchApp.js` para usar o novo hook em vez de props diretas

**Risco:** MEDIO — requer criacao de hook + refatoracao de componente grande

---

### 1.3 HotZone — logica de compatibilidade de sinais completamente morta (Bug #3)
**Arquivo:** `src/presentation/components/HotZone.js`
**Impacto:** Compatibilidade de sinais **nunca funciona** — sempre cai no default "Encontrem o meio termo".

**Problema:** `getCompatibility()` (linhas 110-118) compara sinais `"romantic"`, `"cuddly"`, `"passionate"`, `"playful"`, `"recharging"`, mas os sinais reais sao `"willing"`, `"unsure"`, `"resting"`.

**Plano:**
1. Mapear os 3 sinais reais para mensagens de compatibilidade:
   - `willing` + `willing` = "Ambos no clima!"
   - `willing` + `unsure` = "Um quer, o outro ta na duvida"
   - `willing` + `resting` = "Um quer, o outro precisa descansar"
   - `unsure` + `unsure` = "Nao tem certeza, conversem"
   - `unsure` + `resting` = "Um ta na duvida, o outro descansando"
   - `resting` + `resting` = "Dia de descanso para ambos"
2. Reescrever `getCompatibility()` com as 6 combinacoes possiveis (3x3 / 2 + 3)
3. Testar: sinalizar como "willing" nos dois usuarios e verificar se mensagem muda

**Risco:** BAIXO — logica isolada no componente

---

### 1.4 streakUtils.js — comparacao de selecao de sugestoes (Bug #6 detalhe)
**Ja coberto em 1.1** — a correcao do comparador tambem corrige a contagem de sugestoes no streak.

---

## FASE 2 — Bugs ALTO (afetam dados ou causam perda de informacao)

### 2.1 useCouple.js — comments subcollection orfa no unlink (Bug #17)
**Arquivo:** `src/application/hooks/useCouple.js`
**Impacto:** Documentos de chat ficam permanentemente no Firestore, sem casal associado.

**Plano:**
1. Em `handleUnlinkCouple`, antes de deletar activities, buscar todos os activity IDs
2. Para cada activity, deletar a subcollection `comments` (via `getDocs` + batch)
3. Adicionar `comments` a lista de subcollections deletadas
4. Respeitar limite de 500 ops por batch (adicionar loop se necessario)

**Risco:** MEDIO — requer queries adicionais antes do batch

---

### 2.2 useActivities.js — forEach + async sem await (Bug #20)
**Arquivo:** `src/application/hooks/useActivities.js`
**Impacto:** Funcao retorna antes de todas as transacoes completarem. Erros podem ser perdidos.

**Plano:**
1. Trocar `forEach` por `for...of` com `await` em linhas 81 e 129
2. Ou usar `Promise.all()` com `map` se as transacoes forem independentes
3. Verificar se o chamador depende do retorno imediato (provavelmente nao)

**Risco:** BAIXO — mudanca sintatica

---

### 2.3 useSuggestions.js — race condition no match detection (Bug #9)
**Arquivo:** `src/application/hooks/useSuggestions.js`
**Impacto:** Dois parceiros clicando ao mesmo tempo podem criar atividade duplicada.

**Plano:**
1. Usar `runTransaction` para selecionar + detectar match atomicamente
2. Dentro da transaction: ler doc, verificar se parceiro ja selecionou, so entao gravar
3. Se ambos selecionaram na mesma transaction: criar atividade e marcar `matched`
4. Se so um selecionou: atualizar `selections` normalmente

**Risco:** MEDIO — requer refactor do `handleSelectSuggestion` para transaction

---

### 2.4 useRewards.js — compra dupla em corrida (Bug #11)
**Arquivo:** `src/application/hooks/useRewards.js`
**Impacto:** Dois usuarios compram mesma recompensa, ambos deduzem pontos.

**Plano:**
1. Envolver `handlePurchaseReward` em `runTransaction`
2. Dentro da transaction: ler doc da recompensa, checar `status === "approved"`, so entao
   mudar status para "purchased" e deduzir pontos
3. Se status ja nao e "approved", abortar transaction

**Risco:** BAIXO — padrao ja estabelecido em `useActivities.js`

---

### 2.5 useCouple.js — sinais diarios em condicao de corrida (Bug #12)
**Arquivo:** `src/application/hooks/useCouple.js`
**Impacto:** Segundo write pode sobrescrever sinal do parceiro.

**Plano:**
1. Envolver `handleSetDailySignal` em `runTransaction`
2. Dentro da transaction: ler doc, verificar data, atualizar apenas o campo do usuario atual
3. Se a data mudou, resetar objeto `dailySignals` e gravar novo sinal

**Risco:** BAIXO — padrao transaction ja estabelecido

---

### 2.6 useChat.js — write inside onSnapshot (Bug #13)
**Arquivo:** `src/application/hooks/useChat.js`
**Impacto:** Ciclo write → snapshot → write causa trafego de rede desnecessario.

**Plano:**
1. Usar `useRef` para rastrear `lastProcessedTimestamp`
2. No callback do `onSnapshot`, so processar read-receipts se o timestamp do ultimo
   comment for posterior ao `lastProcessedTimestamp`
3. Alternativa: usar `getDocs` uma vez ao abrir o chat em vez de marcar no snapshot

**Risco:** MEDIO — requer refatoracao do listener

---

### 2.7 MenstrualCycle.js — timezone edge cases (Bug #16)
**Arquivo:** `src/domain/valueObjects/MenstrualCycle.js`
**Impacto:** Em timezone brasileiro (UTC-3 a UTC-5), pode errar 1 dia em midnight.

**Plano:**
1. Usar `getTodayDateString()` (ja definido em `shared/utils.js`) em vez de `new Date()` nas comparacoes
2. Em `addDays`: usar aritmetica de string YYYY-MM-DD em vez de `toISOString()`
3. Em `daysBetween`: parsear YYYY-MM-DD manualmente (split, year/month/day) em vez de `new Date()`
4. Garantir que todas as entradas/saidas de datas sejam YYYY-MM-DD sem componentes de hora

**Risco:** MEDIO — requer mudanca em varias funcoes de data

---

## FASE 3 — Bugs MEDIO (afetam UX ou causam comportamento inesperado)

### 3.1 vercel.json — CSP incompleto (Bug #8)
**Arquivo:** `vercel.json`
**Impacto:** Browser pode bloquear imagens de avatar, fontes, conexoes Firebase.

**Plano:**
1. Adicionar diretrizes ausentes:
   ```
   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
   img-src 'self' data: https:;
   font-src 'self' https://fonts.gstatic.com;
   connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com;
   default-src 'self';
   ```

**Risco:** BAIXO — arquivo de configuracao

---

### 3.2 RoundRulesEvaluator.js — merge inconsistente de score deltas (Bug #15)
**Arquivo:** `src/domain/services/RoundRulesEvaluator.js`
**Impacto:** Funciona hoje porque avaliacao e sequencial, mas quebra se a ordem mudar.

**Plano:**
1. Padronizar: usar `scoreDeltas[uid] = (scoreDeltas[uid] || 0) + delta` em ambos os ramos
2. Remover `Object.assign` das atividades e usar adicao manual igual aos desafios

**Risco:** BAIXO — mudanca pontual no domain

---

### 3.3 RoundRulesEvaluator.js — exclusao de atividades no start date (Bug #34)
**Arquivo:** `src/domain/services/RoundRulesEvaluator.js`
**Impacto:** Atividades criadas no startDate so contam se avaliadas no mesmo dia.

**Plano:**
1. Revisar condicao `creationDate > activeRound.startDate || (creationDate === activeRound.startDate && creationDate === todayStr)`
2. Simplificar para `creationDate >= activeRound.startDate` — atividades criadas no inicio da rodada devem sempre contar

**Risco:** BAIXO — logica pura, testavel

---

### 3.4 Periodicity.js — fontes de tempo misturadas (Bug #7)
**Arquivo:** `src/domain/valueObjects/Periodicity.js`
**Impacto:** `semanal`/`mensal`/`anual` usam `new Date()` em vez do `todayDateString` passado.

**Plano:**
1. Parsear `todayDateString` em vez de usar `new Date()` para todos os tipos
2. Extrair dia da semana, dia do mes, mes e dia do mes a partir da string YYYY-MM-DD
3. Garantir consistencia: a funcao responde pela data informada, nao pelo relogio do sistema

**Risco:** BAIXO — mudanca pontual

---

### 3.5 DuoMatchApp.js + MainView + HotZone — dispatchHotMatchEvent re-escrito (Bug #14)
**Arquivos:** `DuoMatchApp.js`, `MainView.js`, `HotZone.js`
**Impacto:** Ultimo componente a montar vence — race condition silenciosa.

**Plano:**
1. Definir `window.dispatchHotMatchEvent` **uma unica vez** em `App.js` ou `DuoMatchApp.js`
2. Remover as 2 definicoes duplicadas em `MainView.js` e `HotZone.js`
3. Todos os componentes usam a mesma funcao global

**Risco:** BAIXO — remocao de codigo duplicado

---

### 3.6 useActivities.js — confirmSelections e codigo morto (Bug #10)
**Arquivo:** `src/application/hooks/useActivities.js`
**Impacto:** Funcao exporta mas ninguem importa. Acessa API interna do Firebase (`batch._mutations`).

**Plano:**
1. Remover a funcao `confirmSelections` e o campo `dailyStatus` do write
2. Se necessario no futuro, recriar com API publica do Firebase

**Risco:** BAIXO — remocao de codigo morto

---

### 3.7 useActivities.js — variaveis nao usadas (Bug #38)
**Arquivo:** `src/application/hooks/useActivities.js`
**Impacto:** `matches`, `timeRemaining`, `hotNotificationShown` sempre vazio/nulo.

**Plano:**
1. Remover as 3 declaracoes de estado nao utilizadas
2. Remover do return do hook

**Risco:** BAIXO — limpeza

---

### 3.8 shared/utils.js importa domain (Bug #19)
**Arquivos:** `src/shared/utils.js`, `src/domain/valueObjects/Periodicity.js`
**Impacto:** Inversao de dependencia — shared deveria ser consumida, nao consumidora.

**Plano:**
1. Mover `formatPeriodicity` e `isActivityForToday` para `application/hooks/useActivities.js`
   ou criar `application/services/periodicityService.js`
2. Atualizar imports em `shared/utils.js` e todos os consumidores
3. Alternativa: mover as funcoes para `shared/` (mas ai domain perde autonomia)
4. Recomendacao: manter em `domain/` e importar direto de la nos componentes que precisam

**Risco:** MEDIO — requer atualizacao de imports em varios arquivos

---

### 3.9 dailyChallengeCompletions — contator fantasma (Bug #2)
**Arquivos:** `AchievementStatsBuilder.js`, `MainView.js`
**Impacto:** Campo lido mas nunca incrementado — sempre soma 0.

**Plano:**
1. Opcao A: implementar incremento em `DailyChallenge.js` quando usuario completa desafio
2. Opcao B: remover a leitura de `dailyChallengeCompletions` de `AchievementStatsBuilder`
   e confiar apenas na contagem via `allActivities`
3. Recomendacao: Opcao B (manter consistencia com a contagem existente via activities)

**Risco:** BAIXO — decisao de design + remocao de referencia

---

### 3.10 CycleView.js — periodLength como string (Bug #32)
**Arquivo:** `src/presentation/components/CycleView.js`
**Impacto:** Hook recebe string em vez de number para `periodLength`.

**Plano:**
1. Envolver `e.target.value` em `parseInt(e.target.value, 10)` antes de passar ao hook
2. Validar: se NaN, usar valor default (5)

**Risco:** BAIXO — uma linha

---

### 3.11 useRewards.js — write inside onSnapshot (Bug #33)
**Arquivo:** `src/application/hooks/useRewards.js`
**Impacto:** Ciclo write → snapshot redundante no carregamento.

**Plano:**
1. Usar `useRef` para rastrear se ja processou a notificacao inicial
2. Ou mover a marcacao de `notifiedForApproval` para uma acao do usuario (botao "ok")

**Risco:** BAIXO — melhoria de performance

---

## FASE 4 — Bugs BAIXO (UX, performance, limpeza)

### 4.1 styles.css redundante (Bugs #21 e #22)
**Arquivo:** `src/styles.css`
**Impacto:** Tailwind processado 2x, build mais lento, possiveis conflitos.

**Plano:** Remover `src/styles.css` e a importacao em `src/index.js`.

**Risco:** BAIXO

---

### 4.2 .eslintrc.json inutil (Bug #28)
**Arquivo:** `.eslintrc.json`
**Impacto:** Nenhuma regra aplicada.

**Plano:** Remover o arquivo ou configurar regras basicas (`eslint:recommended`).

**Risco:** BAIXO

---

### 4.3 Tema visual inconsistente (Bug #31)
**Arquivos:** `DeleteConfirmationModal`, `EditActivityModal`, `EditRoundModal`,
`EditWishlistItemModal`, `SetPointsModal`, `PeriodicityInputs`
**Impacto:** 6 componentes usam tema claro, resto do app usa escuro.

**Plano:**
1. Atualizar classes Tailwind em cada componente: `bg-white` → `bg-gray-900`,
   `text-gray-900` → `text-gray-100`, `border-gray-*` → `border-gray-700`, etc.
2. Seguir paleta escura do `tailwind.config.js` (gray remapeado para tons roxos)

**Risco:** BAIXO — so CSS

---

### 4.4 AddRoundModal.js — estado nao reseta ao reabrir (Bug #24)
**Arquivo:** `src/presentation/components/AddRoundModal.js`
**Impacto:** Dados antigos persistem ao reabrir modal.

**Plano:** Envolver o conteudo do modal num componente que se desmonta quando `isOpen=false`,
ou usar `key={isOpen}` para forcar remount.

**Risco:** BAIXO

---

### 4.5 EditActivityModal.js — sem useEffect de sync (Bug #25)
**Arquivo:** `src/presentation/components/EditActivityModal.js`
**Impacto:** Mostra dados antigos se o componente e reutilizado.

**Plano:** Adicionar `useEffect` que sincroniza estado local com prop `activity` quando ela muda
(igual ao `EditRewardModal.js` ja faz).

**Risco:** BAIXO

---

### 4.6 CountdownTimer.js — dependency ausente (Bug #23)
**Arquivo:** `src/presentation/components/CountdownTimer.js`
**Impacto:** Timer nao reinicia se `expiryTimestamp` mudar.

**Plano:** Adicionar `expiryTimestamp` ao array de dependencias do `useEffect`.

**Risco:** BAIXO

---

### 4.7 HotZone — hotItems sem useMemo (Bug #35)
**Arquivo:** `src/presentation/components/HotZone.js`
**Impacto:** Recalculado a cada render, causando re-renders desnecessarios.

**Plano:** Envolver em `useMemo` com dependencias `[allActivities, user]`.

**Risco:** BAIXO

---

### 4.8 previewData.js — formato incompativel (Bug #27)
**Arquivo:** `src/shared/previewData.js`
**Impacto:** Dados de demo nao batem com modelo real — pode causar erros de rendering.

**Plano:** Atualizar mock data para usar o formato correto:
- `rules`: `{minActivities: {days: 7, quantity: 5, penalty: 10}}`
- Wishlist status: `"active"`
- Rewards status: `"pending_approval"`

**Risco:** BAIXA

---

### 4.9 AchievementStatsBuilder.js — wishlistItemsGifted conta nao confirmado (Bug #41)
**Arquivo:** `src/domain/services/AchievementStatsBuilder.js`
**Impacto:** Conquista `wish_granter` pode acionar antes do destinatario confirmar.

**Plano:** Filtrar por `status === "confirmed"` em vez de incluir `"gifted"`.

**Risco:** BAIXO — uma linha

---

### 4.10 RoundRulesEvaluator.js — activityCreationDate fallback (Bug #42)
**Arquivo:** `src/domain/services/RoundRulesEvaluator.js`
**Impacto:** Atividade sem `createdAt` e tratada como criada hoje.

**Plano:** Se `createdAt` ausente, excluir a atividade da contagem (ou log warning).

**Risco:** BAIXO

---

### 4.11 WalletView.js — deliveryStatus nao documentado (Bug #43)
**Arquivo:** `src/presentation/components/WalletView.js`
**Impacto:** Campo usado mas possivelmente nao persistido.

**Plano:** Verificar se `handleMarkAsDelivered` em `useRewards.js` grava `deliveryStatus`.
Se nao, adicionar o campo no write. Se sim, documentar no CLAUDE.md.

**Risco:** BAIXO

---

### 4.12 OnboardingView.js — setTimeout(250) (Bug #45)
**Arquivo:** `src/presentation/components/OnboardingView.js`
**Impacto:** Transicao pode falhar em dispositivos lentos.

**Plano:** Usar `MutationObserver` ou `requestAnimationFrame` para detectar quando o DOM
da nova view esta pronto, em vez de timeout fixo.

**Risco:** BAIXO

---

### 4.13 PreviewApp.js — IDs de demo com colisao (Bug #36)
**Arquivo:** `src/presentation/components/PreviewApp.js`
**Impacto:** Adicionar/remover/adicionar causa IDs duplicados.

**Plano:** Usar `Date.now()` ou contador `useRef` em vez de `prev.length + 1`.

**Risco:** BAIXO

---

### 4.14 console.log em producao (Bugs #39 e #40)
**Arquivos:** `useActivities.js`, `HotZone.js`
**Impacto:** Logs de debug no console do usuario.

**Plano:** Remover todos os `console.log` dos arquivos (HotZone tem ~15, useActivities tem 2).

**Risco:** BAIXO

---

### 4.15 BottomNavBar — sem acesso a Rounds no mobile (Bug #44)
**Arquivo:** `src/presentation/components/BottomNavBar.js`
**Impacto:** Rounds so acessivel pelo header do MainView no mobile.

**Plano:** Considerar adicionar 6o item ou substituir "Carteira" por "Rodadas"
(e mover Carteira para o header). Decisao de produto.

**Risco:** BAIXO — decisao de UX

---

### 4.16 NotificationToast.js — possivelmente morto (Bug #26)
**Arquivo:** `src/presentation/components/NotificationToast.js`
**Impacto:** Componente nao importado por ninguem.

**Plano:** Verificar se e importado em algum lugar. Se nao, remover.

**Risco:** BAIXO

---

## Ordem de execucao recomendada

| Fase | Bugs | Esforco | Impacto |
|---|---|---|---|
| **1** | #1, #6 (streak) | 30 min | Streak funciona |
| **1** | #4, #5 (DailyChallenge) | 2-3h | Pontuacao segura |
| **1** | #3 (HotZone sinais) | 30 min | Compatibilidade funciona |
| **2** | #17 (comments orphan) | 1h | Dados limpos |
| **2** | #20 (forEach async) | 30 min | Transacoes seguras |
| **2** | #9 (suggestions race) | 2h | Matches sem duplicata |
| **2** | #11 (rewards race) | 1h | Compras seguras |
| **2** | #12 (daily signals race) | 1h | Sinais seguros |
| **2** | #13 (chat write loop) | 1h | Performance chat |
| **2** | #16 (timezone) | 2h | Ciclo preciso |
| **3** | #8 (CSP) | 30 min | Recursos nao bloqueados |
| **3** | #15 (merge inconsistente) | 15 min | Codigo consistente |
| **3** | #34 (start date) | 15 min | Regra correta |
| **3** | #7 (time sources) | 30 min | Periodicidade correta |
| **3** | #14 (dispatch event) | 15 min | Sem race condition |
| **3** | #10, #38 (dead code) | 15 min | Codigo limpo |
| **3** | #19 (import inversion) | 1h | Arquitetura correta |
| **3** | #2 (ghost counter) | 15 min | Conquista confiavel |
| **3** | #32 (string period) | 5 min | Tipo correto |
| **3** | #33 (write in snapshot) | 30 min | Performance |
| **4** | #21, #22 (styles.css) | 5 min | Build mais limpo |
| **4** | #28 (eslintrc) | 5 min | Limpeza |
| **4** | #31 (theme) | 1-2h | Visual consistente |
| **4** | #24, #25 (modals) | 30 min | UX modal |
| **4** | #23 (countdown) | 5 min | Timer correto |
| **4** | #35 (useMemo) | 5 min | Performance |
| **4** | #27 (preview data) | 30 min | Demo correta |
| **4** | #41-45 (misc) | 1-2h | Diversos |

**Total estimado: ~18-24 horas de trabalho**

---

## Notas

- **Fase 1 e 2** devem ser feitas primeiro — afetam dados e funcionalidade core.
- **Fase 3** pode ser feita em paralelo por um dev diferente.
- **Fase 4** e nice-to-have, pode ser feita em qualquer momento.
- Bugs #9, #11, #12 (race conditions) tem padrao de correcao identico: envolver em `runTransaction`.
- Bugs #2, #38, #10 (dead code) podem ser resolvidos juntos em uma unica passada de limpeza.
