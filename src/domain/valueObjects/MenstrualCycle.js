/**
 * Domínio: Ciclo Menstrual.
 *
 * Cálculo por método calendário (o mesmo usado por apps de referência
 * como Clue/Flo para estimativas): a partir da data de início da última
 * menstruação e da duração média do ciclo, deriva-se o dia atual do
 * ciclo, a fase, e a janela fértil estimada.
 *
 * IMPORTANTE — limites do método:
 *   - É uma ESTIMATIVA por calendário, não um diagnóstico médico nem um
 *     método contraceptivo. Ciclos variam de mês a mês mesmo em pessoas
 *     saudáveis.
 *   - A ovulação é estimada como `cycleLength - 14` dias (a fase lútea
 *     pós-ovulação tem duração relativamente constante de ~14 dias na
 *     maioria dos ciclos; é a fase pré-ovulação que varia).
 *   - A janela fértil considera a sobrevida do espermatozoide (~5 dias)
 *     e do óvulo (~24h): do dia da ovulação estimada -5 até +1.
 *
 * Nenhum valor aqui deve ser apresentado como certeza — a camada de
 * apresentação sempre inclui o aviso de que é uma estimativa.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const LUTEAL_PHASE_LENGTH = 14;
const FERTILE_WINDOW_START_OFFSET = 5; // dias antes da ovulação
const FERTILE_WINDOW_END_OFFSET = 1; // dias depois da ovulação

// B2-29: limites fisiológicos do comprimento do ciclo. Ciclos humanos reais
// quase nunca saem de ~21–35 dias; o intervalo [15, 60] serve de rede de
// segurança contra typos (ex.: registrar um ciclo de "3 dias" invertia a
// janela fértil — `end < start` — e gerava fases/insights sem sentido).
export const MIN_CYCLE_LENGTH = 15;
export const MAX_CYCLE_LENGTH = 60;

/** Restringe o comprimento do ciclo a um intervalo fisiologicamente plausível. */
export const clampCycleLength = (cycleLength) => {
  const value = Number(cycleLength);
  if (!Number.isFinite(value) || value <= 0) return 28;
  return Math.min(MAX_CYCLE_LENGTH, Math.max(MIN_CYCLE_LENGTH, value));
};

/** `true` se o comprimento está dentro do intervalo fisiológico aceito. */
export const isValidCycleLength = (cycleLength) => {
  const value = Number(cycleLength);
  return Number.isFinite(value) && value >= MIN_CYCLE_LENGTH && value <= MAX_CYCLE_LENGTH;
};

export const PHASES = {
  MENSTRUATION: "menstruation",
  FOLLICULAR: "follicular",
  FERTILE: "fertile",
  LUTEAL: "luteal",
};

const parseDate = (dateStr) => new Date(`${dateStr}T00:00:00Z`);

const addDays = (dateStr, days) => {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const daysBetween = (laterDateStr, earlierDateStr) =>
  Math.floor((parseDate(laterDateStr) - parseDate(earlierDateStr)) / MS_PER_DAY);

/**
 * Data de início do ciclo em curso — avança `lastPeriodStart` em ciclos
 * completos até chegar ao ciclo que contém `todayStr`. Sem isso, se a
 * pessoa não atualiza o registro a cada mês, a previsão de próxima
 * menstruação e a janela fértil ficariam presas ao primeiro ciclo
 * registrado.
 */
export const getCurrentCycleStartDate = (lastPeriodStart, cycleLength, todayStr) => {
  // B2-29: ciclo seguro — um typo (ex.: 3) quebraria módulo/divisão.
  const safeLength = clampCycleLength(cycleLength);
  const daysSinceStart = daysBetween(todayStr, lastPeriodStart);
  if (daysSinceStart < 0) return lastPeriodStart;
  const completedCycles = Math.floor(daysSinceStart / safeLength);
  return addDays(lastPeriodStart, completedCycles * safeLength);
};

/** Retorna o dia atual dentro do ciclo (1-indexado). */
export const getCurrentCycleDay = (lastPeriodStart, cycleLength, todayStr) => {
  const safeLength = clampCycleLength(cycleLength);
  const daysSinceStart = daysBetween(todayStr, lastPeriodStart);
  if (daysSinceStart < 0) return 1;
  return (daysSinceStart % safeLength) + 1;
};

export const getOvulationDay = (cycleLength) => clampCycleLength(cycleLength) - LUTEAL_PHASE_LENGTH;

export const getFertileWindow = (cycleLength) => {
  const ovulationDay = getOvulationDay(cycleLength);
  return {
    start: Math.max(1, ovulationDay - FERTILE_WINDOW_START_OFFSET),
    end: ovulationDay + FERTILE_WINDOW_END_OFFSET,
    ovulationDay,
  };
};

/** Classifica o dia do ciclo em uma das 4 fases. */
export const getPhaseForDay = (cycleDay, cycleLength, periodLength) => {
  const { start: fertileStart, end: fertileEnd } = getFertileWindow(cycleLength);

  if (cycleDay <= periodLength) return PHASES.MENSTRUATION;
  if (cycleDay < fertileStart) return PHASES.FOLLICULAR;
  if (cycleDay <= fertileEnd) return PHASES.FERTILE;
  return PHASES.LUTEAL;
};

/**
 * Estatísticas de regularidade a partir do histórico de ciclos
 * registrados (datas de início de cada menstruação, mais antiga primeiro).
 *
 * Referência de regularidade: o ACOG (American College of Obstetricians
 * and Gynecologists) considera um ciclo "regular" quando a variação entre
 * o ciclo mais curto e o mais longo, em um conjunto recente de ciclos, é
 * de até ~8 dias. É uma referência de educação em saúde, não um
 * diagnóstico — variações pontuais são normais e várias condições de
 * saúde só podem ser avaliadas por um profissional.
 */
const REGULARITY_VARIATION_THRESHOLD_DAYS = 8;
const MAX_CYCLES_FOR_STATS = 6;

/** Duração (em dias) entre cada início de período consecutivo. */
export const computeCycleLengths = (periods) => {
  if (!periods || periods.length < 2) return [];
  const sorted = [...periods].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const recent = sorted.slice(-MAX_CYCLES_FOR_STATS - 1);
  const lengths = [];
  for (let i = 1; i < recent.length; i++) {
    lengths.push(daysBetween(recent[i].startDate, recent[i - 1].startDate));
  }
  return lengths;
};

/**
 * @param {Array<{startDate: string, periodLength: number}>} periods
 * @param {number} fallbackCycleLength - usado enquanto não há histórico suficiente
 */
export const computeCycleStatistics = (periods, fallbackCycleLength = 28) => {
  const lengths = computeCycleLengths(periods);
  const cycleCount = periods?.length || 0;

  if (lengths.length === 0) {
    return {
      cycleCount,
      hasEnoughData: false,
      averageLength: fallbackCycleLength,
      shortest: null,
      longest: null,
      variation: null,
      isRegular: null,
    };
  }

  const averageLength = Math.round(
    lengths.reduce((sum, len) => sum + len, 0) / lengths.length
  );
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  const variation = longest - shortest;

  return {
    cycleCount,
    hasEnoughData: true,
    averageLength,
    shortest,
    longest,
    variation,
    isRegular: variation <= REGULARITY_VARIATION_THRESHOLD_DAYS,
  };
};

/** Duração média da menstruação em si, a partir do histórico. */
export const computeAveragePeriodLength = (periods, fallback = 5) => {
  if (!periods || periods.length === 0) return fallback;
  const recent = periods.slice(-MAX_CYCLES_FOR_STATS);
  const withLength = recent.filter((p) => p.periodLength);
  if (withLength.length === 0) return fallback;
  return Math.round(
    withLength.reduce((sum, p) => sum + p.periodLength, 0) / withLength.length
  );
};

/** Início da menstruação mais recente registrada. */
export const getLastPeriodStart = (periods) => {
  if (!periods || periods.length === 0) return null;
  // B2-38: `.at(-1)` precisa de polyfill em Safari/iOS < 15.4 — usar
  // indexação clássica (app é PWA usado em qualquer navegador de casal).
  const sorted = [...periods].sort((a, b) =>
    a.startDate < b.startDate ? -1 : 1
  );
  return sorted[sorted.length - 1].startDate;
};
export const summarizeCycle = ({
  lastPeriodStart,
  cycleLength = 28,
  periodLength = 5,
  todayStr,
}) => {
  // B2-29: clamp no ponto central de consumo — ciclo vindo de override ou de
  // média de dados legados podem conter valores inválidos.
  const safeCycleLength = clampCycleLength(cycleLength);
  const cycleStartDate = getCurrentCycleStartDate(lastPeriodStart, safeCycleLength, todayStr);
  const cycleDay = getCurrentCycleDay(lastPeriodStart, safeCycleLength, todayStr);
  const phase = getPhaseForDay(cycleDay, safeCycleLength, periodLength);
  const fertileWindow = getFertileWindow(safeCycleLength);
  const nextPeriodDate = addDays(cycleStartDate, safeCycleLength);

  return {
    cycleDay,
    cycleLength: safeCycleLength,
    periodLength,
    phase,
    fertileWindow,
    fertileWindowDates: {
      start: addDays(cycleStartDate, fertileWindow.start - 1),
      end: addDays(cycleStartDate, fertileWindow.end - 1),
    },
    nextPeriodDate,
    daysUntilFertileWindow: Math.max(0, fertileWindow.start - cycleDay),
    daysUntilNextPeriod: daysBetween(nextPeriodDate, todayStr),
  };
};
