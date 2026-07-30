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

export const PHASES = {
  MENSTRUATION: "menstruation",
  FOLLICULAR: "follicular",
  FERTILE: "fertile",
  LUTEAL: "luteal",
};

const parseDate = (dateStr) => new Date(`${dateStr}T00:00:00`);

const addDays = (dateStr, days) => {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
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
  const daysSinceStart = daysBetween(todayStr, lastPeriodStart);
  if (daysSinceStart < 0) return lastPeriodStart;
  const completedCycles = Math.floor(daysSinceStart / cycleLength);
  return addDays(lastPeriodStart, completedCycles * cycleLength);
};

/** Retorna o dia atual dentro do ciclo (1-indexado). */
export const getCurrentCycleDay = (lastPeriodStart, cycleLength, todayStr) => {
  const daysSinceStart = daysBetween(todayStr, lastPeriodStart);
  if (daysSinceStart < 0) return 1;
  return (daysSinceStart % cycleLength) + 1;
};

export const getOvulationDay = (cycleLength) => cycleLength - LUTEAL_PHASE_LENGTH;

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
 * Resumo completo do ciclo para uma data de referência — usado tanto
 * pela tela de quem registra quanto pelo serviço de insights do parceiro.
 */
export const summarizeCycle = ({
  lastPeriodStart,
  cycleLength = 28,
  periodLength = 5,
  todayStr,
}) => {
  const cycleStartDate = getCurrentCycleStartDate(lastPeriodStart, cycleLength, todayStr);
  const cycleDay = getCurrentCycleDay(lastPeriodStart, cycleLength, todayStr);
  const phase = getPhaseForDay(cycleDay, cycleLength, periodLength);
  const fertileWindow = getFertileWindow(cycleLength);
  const nextPeriodDate = addDays(cycleStartDate, cycleLength);

  return {
    cycleDay,
    cycleLength,
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
