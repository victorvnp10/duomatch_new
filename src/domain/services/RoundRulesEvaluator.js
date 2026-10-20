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
 * Normaliza uma marcação para `{ status, date }`, seja qual for o formato
 * gravado:
 *
 *  - objeto `{ status, date }` — formato atual (atividades);
 *  - string `"selected"` — formato legado, gravado em versões anteriores e
 *    ainda usado nas sugestões.
 *
 * Devolve `null` quando o valor não é uma marcação.
 *
 * LIMITE CONHECIDO: o formato string não carrega data. Sem data não há como
 * situar a marcação numa janela de ciclo, então `date` sai `null` e as
 * contagens por período não a incluem — em vez de somá-la a um ciclo
 * arbitrário (o que inflaria o progresso) ou descartá-la em silêncio (o que
 * era o defeito anterior: `selection?.status` sobre uma string é `undefined`).
 */
export const normalizeSelection = (selection) => {
  if (!selection) return null;
  if (typeof selection === "string") {
    return MARKED_SELECTION_STATUSES.has(selection)
      ? { status: selection, date: null }
      : null;
  }
  if (typeof selection === "object" && MARKED_SELECTION_STATUSES.has(selection.status)) {
    return { status: selection.status, date: selection.date || null };
  }
  return null;
};

/**
 * Conta quantas atividades (não-desafio) um usuário MARCOU dentro da
 * JANELA DE AVALIAÇÃO corrente (desde `periodStartDate` até hoje).
 *
 * CRITÉRIO = MARCAR. A meta cíclica do placar recompensa a PARTICIPAÇÃO:
 * basta o usuário marcar a atividade no período — NÃO exige match nem
 * conclusão (o "cumprir a atividade" pontua à parte, na conclusão). Assim,
 * marcar e depois declarar "não concluída" continua contando a marca.
 *
 * CONTA AS DUAS FONTES de marcação, porque o app tem duas:
 *  1. a coleção `activities` (formato `{ status, date }`);
 *  2. o mapa `suggestions` do documento do casal — as sugestões diárias e
 *     as da hot zone, marcadas como `"selected"`. Antes o contador lia
 *     apenas a coleção, então marcar uma sugestão não movia o painel: o
 *     usuário marcava e continuava vendo zero. Como a sugestão só vira
 *     atividade quando OS DOIS marcam, exigir a coleção invertia o
 *     propósito da regra — que é justamente não depender do parceiro.
 *
 * A data da sugestão vem de `selectionDates[uid]` quando existe e, quando não,
 * do DIA DO DOCUMENTO (`suggestionDay`), que é dado exato: a sugestão mora em
 * `dailySuggestions/{dia}` e o app só marca o documento de hoje. Marcações
 * anteriores à existência de `selectionDates` passam a contar em vez de
 * desaparecer do painel.
 *
 * Sugestão já `matched` NÃO é contada: nesse momento ela gera uma atividade
 * real, que passa a ser a fonte contável. Contar as duas dobraria o número.
 *
 * O `periodStartDate` é derivado de `rulesLastChecked` (ou `startDate` da
 * rodada se nunca houve checagem). Isso garante que o painel e o avaliador
 * contem EXATAMENTE as mesmas atividades.
 *
 * EXPORTADA também para a UI (MainView): o painel de progresso precisa
 * exibir EXATAMENTE o mesmo critério que o avaliador usa para pontuar —
 * critérios divergentes faziam o usuário ver "meta cumprida" e ainda
 * assim levar penalidade.
 */
export const countMarkedActivitiesInRound = (
  allActivities,
  userId,
  activeRound,
  todayStr,
  periodStartDate,
  suggestions = null
) => {
  const effectivePeriodStart = periodStartDate || activeRound.startDate;
  const inWindow = (date) =>
    Boolean(date) && date >= effectivePeriodStart && date <= todayStr;

  const fromActivities = allActivities.filter((activity) => {
    if (activity.type?.startsWith("desafio")) return false;
    const selection = normalizeSelection(activity.selections?.[userId]);
    if (!selection) return false;
    return inWindow(selection.date);
  }).length;

  const suggestionList = Array.isArray(suggestions)
    ? suggestions.flatMap((map) => Object.values(map || {}))
    : Object.values(suggestions || {});

  const fromSuggestions = suggestionList.filter((suggestion) => {
    if (suggestion?.matched) return false;
    const selection = normalizeSelection(suggestion?.selections?.[userId]);
    if (!selection) return false;
    // A data da marcação, por ordem de confiança:
    //  1. `selectionDates[uid]` — campo paralelo que a marcação atual grava;
    //  2. `suggestionDay` — o DIA DO DOCUMENTO da sugestão. A sugestão mora em
    //     `dailySuggestions/{dia}` e o app só marca o documento de HOJE, logo o
    //     dia do documento é a data exata da marcação. É o que resgata as
    //     marcações feitas antes de `selectionDates` existir, que ficavam
    //     visíveis na lista como "Sua escolha!" e invisíveis para o painel —
    //     o usuário marcava e continuava vendo zero;
    //  3. `selection.date` — formato de objeto, quando houver.
    // Não é soma a um ciclo arbitrário: o dia do documento é dado exato.
    return inWindow(
      suggestion?.selectionDates?.[userId] ||
        suggestion?.suggestionDay ||
        selection.date
    );
  }).length;

  return fromActivities + fromSuggestions;
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
  suggestions = null,
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
        activitiesPeriodStart,
        suggestions
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
  suggestions = null,
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
      activitiesPeriodStart,
      suggestions
    );
    const partnerCount = countMarkedActivitiesInRound(
      allActivities,
      partnerId,
      activeRound,
      todayStr,
      activitiesPeriodStart,
      suggestions
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
