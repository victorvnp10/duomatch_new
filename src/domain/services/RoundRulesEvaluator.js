/**
 * Domínio: Regras cíclicas de uma Rodada (Round)
 *
 * Esta lógica de negócio vivia inteiramente dentro de
 * `src/components/DuoMatchApp.js` (função `checkCyclicalRules`), misturada
 * com estado de React e chamadas diretas ao Firestore. Isso violava a
 * regra da dependência da Clean Architecture (regra de negócio dependendo
 * de infraestrutura) e tinha duas implementações quase idênticas
 * (atividades x desafios) coladas lado a lado — uma violação clara de DRY.
 *
 * Aqui a decisão de negócio ("quem cumpriu a meta, quem não cumpriu, e
 * qual é a penalidade resultante") é isolada em funções puras, sem
 * nenhuma dependência de Firestore ou React. A camada de aplicação
 * (`src/application/hooks/useRoundRules.js`) usa o resultado para decidir
 * o que gravar.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Dias inteiros decorridos entre duas datas YYYY-MM-DD (data local).
 * `Math.floor` — mesmo critério usado pelo avaliador e pelo painel.
 * Exportado para ser a fonte única dessa aritmética (avaliador + UI).
 */
export const daysBetween = (laterDateStr, earlierDateStr) =>
  Math.floor((new Date(laterDateStr) - new Date(earlierDateStr)) / MS_PER_DAY);

/**
 * Resolve o início da janela de avaliação corrente de uma regra: a última
 * checagem registrada (`rulesLastChecked.<key>`) ou, na ausência dela, o
 * início da rodada. Fonte ÚNICA dessa decisão — usada tanto pelo avaliador
 * (`evaluateCyclicalRules`) quanto pelo painel de progresso da UI
 * (`buildRoundRulesProgress`). Antes, o painel (MainView) reimplementava
 * essa resolução inline, o que podia divergir em silêncio.
 */
export const resolveRulePeriodStart = (lastCheckedDate, roundStartDate) =>
  lastCheckedDate || roundStartDate;

// Formata em data LOCAL (YYYY-MM-DD). `toISOString()` é UTC e, em fusos
// negativos (ex.: Brasil), deslocava a criação para "amanhã" à noite,
// excluindo atividades criadas no mesmo dia da contagem da rodada.
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Retorna a rodada ativa na data informada, ou `null`. */
export const findActiveRound = (rounds, todayStr) =>
  rounds.find((r) => todayStr >= r.startDate && todayStr <= r.endDate) || null;

/**
 * Regras cíclicas também precisam ser avaliadas quando o casal não tem
 * atividades: nesse caso a contagem é zero e o período pode gerar penalidade.
 */
export const shouldEvaluateCyclicalRules = ({ rounds = [], coupleId } = {}) =>
  Boolean(coupleId && rounds.length > 0);

const activityCreationDate = (activity, fallback) => {
  if (activity.createdAt?.toDate) {
    return toLocalDateString(activity.createdAt.toDate());
  }
  return activity.createdAt?.slice(0, 10) || fallback;
};

// "selected" foi usado por versões anteriores do app para representar uma
// marcação. Mantê-lo como compatibilidade evita zerar o progresso de dados
// antigos; novas marcações usam "confirmed".
const MARKED_SELECTION_STATUSES = new Set(["confirmed", "selected"]);

/**
 * Conta quantas atividades (não-desafio) um usuário MARCOU dentro da
 * JANELA DE AVALIAÇÃO corrente (desde `periodStartDate` até hoje).
 *
 * CRITÉRIO = MARCAR. A meta cíclica do placar recompensa a PARTICIPAÇÃO:
 * basta o usuário marcar a atividade no período — NÃO exige match nem
 * conclusão (o "cumprir a atividade" pontua à parte, na conclusão). Assim,
 * marcar e depois declarar "não concluída" continua contando a marca. O
 * status legado "selected" também é reconhecido para não perder progresso
 * de atividades criadas em versões anteriores.
 *
 * O `periodStartDate` é derivado de `rulesLastChecked` (ou `startDate` da
 * rodada se nunca houve checagem). Isso garante que o painel e o avaliador
 * contem EXATAMENTE as mesmas atividades — antes, os contadores usavam
 * `startDate` da rodada inteira, acumulando contagens de períodos
 * anteriores e inflando o progresso do painel.
 *
 * EXPORTADA também para a UI (MainView): o painel de progresso precisa
 * exibir EXATAMENTE o mesmo critério que o avaliador usa para pontuar —
 * critérios divergentes faziam o usuário ver "meta cumprida" e ainda
 * assim levar penalidade.
 */
export const countMarkedActivitiesInRound = (allActivities, userId, activeRound, todayStr, periodStartDate) => {
  const effectivePeriodStart = periodStartDate || activeRound.startDate;
  return allActivities.filter((activity) => {
    if (activity.type?.startsWith("desafio")) return false;

    const selection = activity.selections?.[userId];
    if (!MARKED_SELECTION_STATUSES.has(selection?.status)) return false;

    // Conta apenas marções feitas DENTRO da janela de avaliação corrente.
    //selection.date é a data em que o usuário MARCOU (não a de criação).
    // Atividades marcadas e desmarcadas no mesmo dia não contam porque
    // desmarcar seta `status: null` — o filtro acima já exclui.
    if (!selection.date) return false;
    return (
      selection.date >= effectivePeriodStart &&
      selection.date <= todayStr
    );
  }).length;
};

/**
 * Conta quantos desafios foram LANÇADOS (criados) por um usuário dentro da
 * JANELA DE AVALIAÇÃO corrente (desde `periodStartDate` até hoje).
 *
 * CRITÉRIO = LANÇAR/DESAFIAR. A meta cíclica do placar recompensa a
 * PARTICIPAÇÃO: basta o usuário DESAFIAR o parceiro no período — NÃO exige
 * que o parceiro aceite nem que o desafio seja concluído (o "cumprir o
 * desafio" pontua à parte, na conclusão, para quem completa).
 *
 * O `periodStartDate` é derivado de `rulesLastChecked` (ou `startDate` da
 * rodada se nunca houve checagem). Mesma lógica do contador de atividades.
 *
 * EXPORTADA também para a UI (MainView): o painel de progresso precisa
 * exibir EXATAMENTE o mesmo critério que o avaliador usa para pontuar.
 */
export const countChallengesCreatedInRound = (allActivities, userId, activeRound, periodStartDate, todayStr) => {
  const effectivePeriodStart = periodStartDate || activeRound.startDate;
  const upperBound = todayStr || activeRound.endDate;
  return allActivities.filter((activity) => {
    if (!activity.type?.startsWith("desafio")) return false;
    if (activity.createdBy !== userId) return false;

    const activityDate = activityCreationDate(activity, activeRound.startDate);
    return (
      activityDate >= effectivePeriodStart && activityDate <= upperBound
    );
  }).length;
};

/**
 * Avalia uma meta cíclica (atividades OU desafios) e devolve o resultado
 * da avaliação, sem gravar nada. `countFn` decide como contar cada lado.
 */
const evaluateGoal = ({ rule, lastCheckedDate, todayStr, userId, partnerId, countFn }) => {
  if (!rule) return null;

  const referenceDate = lastCheckedDate || todayStr;
  if (daysBetween(todayStr, referenceDate) < rule.days) return null;

  const myCount = countFn(userId);
  const partnerCount = countFn(partnerId);
  const iMetGoal = myCount >= rule.quantity;
  const partnerMetGoal = partnerCount >= rule.quantity;

  // Pontuação INDIVIDUAL e independente do parceiro: cada usuário ganha
  // `penalty` se cumprir a meta e perde `penalty` se não cumprir. Antes a
  // regra era diferencial/competitiva (só aplicava quando um cumpria e o
  // outro não), o que contradizia o objetivo do placar de incentivar o uso.
  const scoreDeltas = {
    [userId]: iMetGoal ? rule.penalty : -rule.penalty,
    [partnerId]: partnerMetGoal ? rule.penalty : -rule.penalty,
  };

  return { myCount, partnerCount, iMetGoal, partnerMetGoal, scoreDeltas };
};

/**
 * Avalia as duas metas cíclicas (mínimo de atividades e mínimo de
 * desafios) de uma rodada ativa e retorna um "plano" com as alterações
 * de placar e os marcadores `rulesLastChecked` a atualizar.
 *
 * Retorna `null` quando não há nada a fazer (nenhuma regra configurada,
 * ou nenhuma regra venceu ainda).
 *
 * @returns {{ scoreDeltas: Object<string, number>, lastCheckedUpdates: Object<string,string> } | null}
 */
export const evaluateCyclicalRules = ({
  activeRound,
  allActivities,
  userId,
  partnerId,
  todayStr,
}) => {
  if (!activeRound) return null;

  const activitiesRule = activeRound.rules?.minActivities;
  const challengesRule = activeRound.rules?.minChallenges;
  if (!activitiesRule && !challengesRule) return null;

  const scoreDeltas = {};
  const lastCheckedUpdates = {};
  let hasUpdates = false;

  const activitiesPeriodStart = resolveRulePeriodStart(
    activeRound.rulesLastChecked?.activities,
    activeRound.startDate
  );
  const activitiesResult = evaluateGoal({
    rule: activitiesRule,
    lastCheckedDate: activitiesPeriodStart,
    todayStr,
    userId,
    partnerId,
    countFn: (uid) =>
      countMarkedActivitiesInRound(
        allActivities,
        uid,
        activeRound,
        todayStr,
        activitiesPeriodStart
      ),
  });
  if (activitiesResult) {
    if (activitiesResult.scoreDeltas) {
      for (const [uid, delta] of Object.entries(activitiesResult.scoreDeltas)) {
        scoreDeltas[uid] = (scoreDeltas[uid] || 0) + delta;
      }
    }
    lastCheckedUpdates.activities = todayStr;
    hasUpdates = true;
  }

  const challengesPeriodStart = resolveRulePeriodStart(
    activeRound.rulesLastChecked?.challenges,
    activeRound.startDate
  );
  const challengesResult = evaluateGoal({
    rule: challengesRule,
    lastCheckedDate: challengesPeriodStart,
    todayStr,
    userId,
    partnerId,
    countFn: (uid) =>
      countChallengesCreatedInRound(
        allActivities,
        uid,
        activeRound,
        challengesPeriodStart,
        todayStr
      ),
  });
  if (challengesResult) {
    if (challengesResult.scoreDeltas) {
      for (const [uid, delta] of Object.entries(challengesResult.scoreDeltas)) {
        scoreDeltas[uid] = (scoreDeltas[uid] || 0) + delta;
      }
    }
    lastCheckedUpdates.challenges = todayStr;
    hasUpdates = true;
  }

  if (!hasUpdates) return null;
  return { scoreDeltas, lastCheckedUpdates };
};

/**
 * Monta os dados de progresso das regras cíclicas exibidos no painel do
 * placar (atividades marcadas / desafios lançados no ciclo corrente).
 *
 * FONTE ÚNICA DE VERDADE: antes esta derivação vivia inteira dentro de
 * `src/presentation/components/MainView.js` (useMemo `roundRulesProgress`),
 * reimplementando a resolução do período e a aritmética de dias que o
 * avaliador (`evaluateCyclicalRules`) também fazia. Além de duplicar a
 * regra, qualquer mudança em um lado deixava o outro errado em silêncio —
 * o usuário podia ver "meta cumprida" no painel e ainda assim levar
 * penalidade. Agora painel e avaliador compartilham `resolveRulePeriodStart`
 * e `daysBetween`, e os contadores são exatamente os mesmos.
 *
 * Retorna o mesmo shape consumido por `RuleProgressDisplay`:
 * `{ activitiesRule?, challengesRule? }`, cada um com
 * `{ myProgress: { count, target }, partnerProgress: { count, target },
 *    penalty, daysRemaining }`. `daysRemaining` é clampado em 0 ("Hoje!").
 */
export const buildRoundRulesProgress = ({
  activeRound,
  allActivities,
  userId,
  partnerId,
  todayStr,
}) => {
  if (!activeRound || !activeRound.rules) return {};

  const result = {};
  const activitiesRule = activeRound.rules.minActivities;
  const challengesRule = activeRound.rules.minChallenges;

  if (activitiesRule) {
    // Period-aware: conta apenas atividades marcadas DENTRO da janela de
    // avaliação corrente, exatamente como o avaliador.
    const activitiesPeriodStart = resolveRulePeriodStart(
      activeRound.rulesLastChecked?.activities,
      activeRound.startDate
    );
    const myCount = countMarkedActivitiesInRound(
      allActivities,
      userId,
      activeRound,
      todayStr,
      activitiesPeriodStart
    );
    const partnerCount = countMarkedActivitiesInRound(
      allActivities,
      partnerId,
      activeRound,
      todayStr,
      activitiesPeriodStart
    );

    // Alinhado ao gate do avaliador: `daysBetween(today, reference) >=
    // rule.days`. O painel mostra a contagem regressiva até esse dia.
    const activitiesDaysRemaining = Math.max(
      0,
      activitiesRule.days - Math.max(0, daysBetween(todayStr, activitiesPeriodStart))
    );

    result.activitiesRule = {
      myProgress: { count: myCount, target: activitiesRule.quantity },
      partnerProgress: { count: partnerCount, target: activitiesRule.quantity },
      penalty: activitiesRule.penalty,
      daysRemaining: activitiesDaysRemaining,
    };
  }

  if (challengesRule) {
    // Period-aware: conta apenas desafios lançados DENTRO da janela de
    // avaliação corrente, exatamente como o avaliador.
    const challengesPeriodStart = resolveRulePeriodStart(
      activeRound.rulesLastChecked?.challenges,
      activeRound.startDate
    );
    const myChallengesCount = countChallengesCreatedInRound(
      allActivities,
      userId,
      activeRound,
      challengesPeriodStart,
      todayStr
    );
    const partnerChallengesCount = countChallengesCreatedInRound(
      allActivities,
      partnerId,
      activeRound,
      challengesPeriodStart,
      todayStr
    );

    const challengesDaysRemaining = Math.max(
      0,
      challengesRule.days - Math.max(0, daysBetween(todayStr, challengesPeriodStart))
    );

    result.challengesRule = {
      myProgress: { count: myChallengesCount, target: challengesRule.quantity },
      partnerProgress: { count: partnerChallengesCount, target: challengesRule.quantity },
      penalty: challengesRule.penalty,
      daysRemaining: challengesDaysRemaining,
    };
  }

  return result;
};
