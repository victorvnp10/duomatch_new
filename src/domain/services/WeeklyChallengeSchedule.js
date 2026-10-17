/**
 * Cálculos puros do Desafio Diário/Semanal.
 *
 * Toda a lógica de data (início da semana, progresso, seed do desafio) e as
 * derivações de estado a partir dos dados do casal vivem aqui, sem React e
 * sem Firestore. O componente de apresentação (`DailyChallenge.js`) e o hook
 * de aplicação (`useDailyChallenge.js`) apenas consomem estas funções.
 *
 * Convenção de fuso: usamos o fuso LOCAL do dispositivo (nunca toISOString),
 * como o resto do app. As datas no formato "YYYY-MM-DD" são produzidas pelo
 * chamador (application layer) via `shared/lib/dateUtils`.
 */

/**
 * Retorna a SEGUNDA-FEIRA que inicia a semana da data informada.
 * A fórmula `date - day + 1` erra no domingo (getDay() === 0 avançaria
 * para a segunda da semana SEGUINTE, mudando o desafio e o weekKey).
 */
export const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Progresso da semana atual: qual dia é hoje (domingo = 7), percentual e
 * quantos dias faltam, além dos limites (segunda a domingo) da semana.
 */
export const calculateWeeklyProgress = (now = new Date()) => {
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
  endOfWeek.setHours(23, 59, 59, 999);

  const totalDays = 7;
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Domingo = 7

  return {
    currentDay,
    totalDays,
    percentage: Math.round((currentDay / totalDays) * 100),
    daysRemaining: totalDays - currentDay,
    startOfWeek,
    endOfWeek,
  };
};

/**
 * Escolhe o desafio da semana a partir do catálogo.
 *
 * Anti-repetição: prioriza desafios que não apareceram recentemente; se todos
 * foram usados recentemente, cai no pool completo. O índice é derivado do
 * seed da semana (segunda-feira) para ser estável entre recargas.
 */
export const getWeeklyChallenge = ({ catalog, recentChallengeIds, now = new Date() }) => {
  if (!catalog || !catalog.length) return null;
  const startOfWeek = getStartOfWeek(now);

  // Usar a data da segunda-feira para gerar um índice consistente
  const weekSeed = startOfWeek.getTime();

  const recent = new Set(recentChallengeIds || []);
  const available = catalog.filter((c) => !recent.has(c.id));
  const pool = available.length ? available : catalog;

  const challengeIndex = Math.floor(weekSeed / (1000 * 60 * 60 * 24 * 7)) % pool.length;

  return pool[challengeIndex];
};

/**
 * Deriva o estado do desafio para o usuário atual a partir dos dados locais
 * (otimistas) ou do casal (Firestore). `weekKey` é o "YYYY-MM-DD" da
 * segunda-feira da semana, calculado pelo chamador.
 */
export const getChallengeState = ({ userData, localChallengeData, coupleData, weekKey }) => {
  if (!userData?.uid) return null;

  // Usar dados locais primeiro, depois dados do Firestore
  const sourceData = localChallengeData || coupleData?.weeklyChallenge;
  if (!sourceData) return null;

  const challengeData = sourceData[weekKey];

  if (!challengeData) {
    return {
      state: 'not_accepted',
      myAccepted: false,
      partnerAccepted: false,
      weekKey,
    };
  }

  // Verificar aceitações individuais
  const myAccepted = challengeData.acceptedBy?.includes(userData.uid);
  const partnerUid = userData.partnerId;
  const partnerAccepted = challengeData.acceptedBy?.includes(partnerUid);

  // Verificar confirmações individuais
  const myConfirmation = challengeData.confirmations?.[userData.uid];
  const partnerConfirmation = challengeData.confirmations?.[partnerUid];

  return {
    state: challengeData.state || 'not_accepted',
    myAccepted,
    partnerAccepted,
    myConfirmation,
    partnerConfirmation,
    weekKey,
    challengeData,
    partnerUid,
  };
};

/**
 * Depois que um dos parceiros aceita, o desafio da semana passa a ser o
 * desafio persistido no casal. O pool calculado localmente depende de
 * recentChallengeIds e poderia mudar entre dois clientes, exibindo um
 * desafio diferente daquele que foi aceito.
 */
export const selectWeeklyChallenge = ({ catalog, challengeState, weeklyChallenge }) => {
  const persistedChallengeId = challengeState?.challengeData?.challengeId;
  return (
    catalog?.find((challenge) => challenge.id === persistedChallengeId) ||
    weeklyChallenge
  );
};

/** Encontra a rodada ativa para a data informada ("YYYY-MM-DD"), ou undefined. */
export const findActiveRound = (rounds, todayStr) => {
  if (!rounds || rounds.length === 0) return null;
  return rounds.find((round) => todayStr >= round.startDate && todayStr <= round.endDate);
};
