# Spec: Pontuação de Atividades e Desafios (dois sistemas)

## Objective
Corrigir o placar para incentivar uso do sistema. Existem DOIS sistemas de pontuação
independentes que somam no `scores` da rodada ativa:

1. **Regra Cíclica (`RoundRulesEvaluator`)** — bônus/penalidade por cumprir meta
   periódica de atividades marcadas e de desafios lançados.
2. **Conclusão** — pontos por concluir atividade em casal ou desafio recebido.

Objetivo: a Regra Cíclica deve ser **individual** (cada usuário pontua/perde
independente do parceiro), e não competitiva/diferencial como está hoje.

## Regras de negócio (fonte de verdade — confirmado com o usuário)

### Sistema 1 — Regra Cíclica (INDIVIDUAL)
- Ao criar uma rodada, define-se a meta: `minActivities: {days, quantity, penalty}`
  e/ou `minChallenges: {days, quantity, penalty}`.
- Exemplo do usuário: "10 pts, 5 dias para cumprir, regra: 5 atividades. O usuário tem
  5 dias para marcar pelo menos 5 atividades; se conseguir ganha os 10 pts, se não perde."
- Ou seja, para **cada usuário independentemente**:
  - cumpriu a meta (`minCount >= quantity`) → `+penalty`
  - não cumpriu → `-penalty`
- Desafios: mesma regra, contados por **desafios lançados** pelo usuário.
- Avaliação só roda quando o período (dias desde a última checagem) >= `rule.days`
  (já implementado em `evaluateGoal`).
- A escrita continua transacional e idempotente via `rulesLastChecked`
  (compare-and-set em `useRoundRules.js`) — NÃO muda.

### Sistema 2 — Conclusão (MANTER como está)
- Atividade feita em casal (ambos `resolution === "completed"`) → ambos ganham
  `activity.points` (via `checkForPoints` / `useActivities.js`).
- Desafio recebido e cumprido → quem cumpriu ganha `challenge.points`
  (via `handleResolveChallenge`).

## Mudança principal
`src/domain/services/RoundRulesEvaluator.js` → `evaluateGoal`:
- **HOJE (errado):** só aplica `scoreDeltas` quando `iMetGoal !== partnerMetGoal`
  (diferencial/competitivo). Se ambos cumprem ou ambos falham → nenhuma alteração.
- **NOVO (correto):** independente por usuário:
  - `iMetGoal` → `{ [userId]: +penalty }`
  - `!iMetGoal` → `{ [userId]: -penalty }`
  - idem para `partnerId`.
- `evaluateCyclicalRules` continua agregando os deltas por usuário e retornando
  `{ scoreDeltas, lastCheckedUpdates }`.

## Arquivos afetados
- `src/domain/services/RoundRulesEvaluator.js` (lógica do `evaluateGoal`)
- Sem mudanças em `useRoundRules.js` (já aplica `plan.scoreDeltas` genericamente)
- Verificar consumidores da UI: `MainView.js` `RuleProgressDisplay` (usa counts, não deltas)
- `CLAUDE.md` (documentar a regra individual)

## Sucesso
- Um usuário que cumpriu a meta e o parceiro NÃO: usuário `+penalty`, parceiro `-penalty`.
- Ambos cumpriram: ambos `+penalty`.
- Ambos falharam: ambos `-penalty`.
- Período ruim sempre avalia; `rulesLastChecked` atualizado uma vez.
- Conclusão (Sistema 2) inalterada.
- Build passa.
