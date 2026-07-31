import { PHASES, getFertileWindow } from "../valueObjects/MenstrualCycle";

/**
 * Domínio: Insight diário para o parceiro.
 *
 * Traduz o resumo do ciclo (ver `MenstrualCycle.js`) numa mensagem curta
 * e leve — nunca clínica, nunca uma instrução médica. A janela fértil é
 * tratada como "período de sorte" (maior receptividade/libido é algo
 * relatado por muitas pessoas nessa fase, mas varia — por isso o texto
 * de apresentação sempre inclui o aviso de que é uma estimativa, não uma
 * garantia nem substituto de conversa e consentimento do casal).
 *
 * Cada situação abaixo tem várias variações/sinônimos com o mesmo tom e
 * o mesmo objetivo — a escolha roda pelo dia do mês (1 a 31), então em
 * dias diferentes do mês a "Dica do dia" chega com uma frase diferente,
 * mesmo quando o casal fica vários dias seguidos na mesma fase do ciclo.
 */

const buildMessage = (icon, title, tone) => ({ icon, title, tone });

/** Escolhe uma variação de forma estável a partir do dia do mês corrente. */
const pickByDay = (variants) => {
  const dayOfMonth = new Date().getDate(); // 1–31
  return variants[dayOfMonth % variants.length];
};

const buildFromVariants = (variants, tone) => {
  const [icon, title] = pickByDay(variants);
  return buildMessage(icon, title, tone);
};

// --- Menstruação -----------------------------------------------------

const MENSTRUATION_ENDING_SOON = [
  ["🌤️", "Os dias difíceis estão acabando"],
  ["🌤️", "Os dias difíceis estão quase no fim"],
  ["🌅", "A fase mais pesada já está passando"],
  ["🌱", "Falta pouco para os dias difíceis acabarem"],
  ["🌤️", "O desconforto está chegando ao fim"],
  ["🌈", "Amanhã já deve estar mais leve"],
];

const MENSTRUATION_CAUTION = [
  ["🙏", "Cuidado, hoje não é um bom dia"],
  ["🙏", "Hoje pede mais cuidado e paciência"],
  ["🩷", "Um dia para ir com calma"],
  ["🙏", "Hoje é dia de cuidado redobrado"],
  ["🤍", "Vá com carinho hoje"],
  ["🙏", "Hoje merece mais atenção e gentileza"],
];

// --- Fase folicular ----------------------------------------------------

const FOLLICULAR_ONE_DAY_LEFT = [
  ["✨", "Sua sorte começa amanhã!"],
  ["✨", "Amanhã começa o período de sorte!"],
  ["🌟", "A sorte bate na porta amanhã!"],
  ["✨", "Só falta um dia para a sorte chegar!"],
  ["🌠", "Amanhã é véspera de sorte!"],
];

const FOLLICULAR_FEW_DAYS_LEFT = [
  (n) => ["⏳", `Faltam só ${n} dias para o período de sorte`],
  (n) => ["⏳", `Só mais ${n} dias até o período de sorte`],
  (n) => ["📅", `Em ${n} dias começa a fase de sorte`],
  (n) => ["🕐", `Faltam ${n} dias para a fase especial`],
];

const FOLLICULAR_NEUTRAL = [
  ["💛", "Fase tranquila — aproveitem de outras formas"],
  ["💛", "Fase calma — aproveitem de outros jeitos"],
  ["🌼", "Momento tranquilo — outras formas de conexão valem muito"],
  ["💛", "Fase mais serena — criatividade é bem-vinda"],
  ["🌤️", "Dia tranquilo — aproveitem de outras maneiras"],
];

// --- Janela fértil -----------------------------------------------------

const FERTILE_START = [
  ["🍀", "Hoje começa o seu período de sorte!"],
  ["🍀", "Hoje é o primeiro dia de sorte!"],
  ["🍀", "A fase de sorte começou hoje!"],
  ["🌟", "Hoje dá a largada no período de sorte!"],
  ["🍀", "Começou! Hoje inicia a fase de sorte"],
];

const FERTILE_OVULATION = [
  ["🔥", "Ótimo dia para um match mais quente!"],
  ["🔥", "Dia perfeito para esquentar as coisas!"],
  ["🔥", "Hoje pede um match mais intenso!"],
  ["💥", "Ótimo momento para um encontro mais quente!"],
  ["🔥", "Dia ótimo para aproveitarem ao máximo!"],
];

const FERTILE_LAST_DAY = [
  ["🎉", "Último dia de sorte — aproveitem!"],
  ["🎉", "Hoje é o último dia da fase de sorte!"],
  ["🎊", "Fecha com chave de ouro — último dia de sorte!"],
  ["🎉", "Aproveitem, é o último dia especial!"],
  ["🎉", "Reta final da sorte — hoje é o dia!"],
];

const FERTILE_DAYS_LEFT = [
  (n) => ["💫", `Só te restam mais ${n} dias especiais`],
  (n) => ["💫", `Ainda restam ${n} dias especiais`],
  (n) => ["✨", `Faltam ${n} dias de fase especial`],
  (n) => ["💫", `Mais ${n} dias nessa fase de sorte`],
  (n) => ["🌟", `${n} dias especiais ainda pela frente`],
];

// --- Fase lútea ----------------------------------------------------------

const LUTEAL_JUST_ENDED_FERTILE = [
  ["🤔", "Agora é um momento de atenção"],
  ["🤔", "Um momento para ir com mais atenção"],
  ["🌗", "Fase de transição — atenção redobrada"],
  ["🤔", "Agora pede mais cuidado e presença"],
  ["🌙", "Momento de atenção e paciência"],
];

const LUTEAL_CAUTION_SOON = [
  ["⚠️", "Cuidado, os próximos dias não serão bons"],
  ["⚠️", "Os próximos dias pedem mais cuidado"],
  ["🙏", "Fase de atenção se aproximando"],
  ["⚠️", "Cuidado, dias mais sensíveis estão chegando"],
  ["🌧️", "Os próximos dias merecem mais paciência"],
];

const LUTEAL_NEUTRAL = [
  ["💛", "Fase calma, aproveitem de outras formas"],
  ["💛", "Fase tranquila — aproveitem de outros jeitos"],
  ["🌼", "Dia calmo — outras formas de carinho valem muito"],
  ["💛", "Momento sereno — sejam criativos"],
  ["🌤️", "Fase mais leve — aproveitem de outras maneiras"],
];

/**
 * @param {object} cycleSummary - resultado de `summarizeCycle(...)`
 * @returns {{icon: string, title: string, tone: 'great'|'good'|'neutral'|'caution'}}
 */
export const getDailyInsight = (cycleSummary) => {
  const { phase, cycleDay, periodLength, fertileWindow, daysUntilFertileWindow, daysUntilNextPeriod } =
    cycleSummary;
  const { start: fertileStart, end: fertileEnd, ovulationDay } = fertileWindow;

  switch (phase) {
    case PHASES.MENSTRUATION: {
      const daysLeftInPeriod = periodLength - cycleDay;
      if (daysLeftInPeriod <= 1) {
        return buildFromVariants(MENSTRUATION_ENDING_SOON, "neutral");
      }
      return buildFromVariants(MENSTRUATION_CAUTION, "caution");
    }

    case PHASES.FOLLICULAR: {
      if (daysUntilFertileWindow === 1) {
        return buildFromVariants(FOLLICULAR_ONE_DAY_LEFT, "good");
      }
      if (daysUntilFertileWindow <= 3) {
        const [icon, title] = pickByDay(FOLLICULAR_FEW_DAYS_LEFT)(daysUntilFertileWindow);
        return buildMessage(icon, title, "good");
      }
      return buildFromVariants(FOLLICULAR_NEUTRAL, "neutral");
    }

    case PHASES.FERTILE: {
      if (cycleDay === fertileStart) {
        return buildFromVariants(FERTILE_START, "great");
      }
      if (cycleDay === ovulationDay || cycleDay === ovulationDay - 1) {
        return buildFromVariants(FERTILE_OVULATION, "great");
      }
      const daysLeft = fertileEnd - cycleDay;
      if (daysLeft <= 0) {
        return buildFromVariants(FERTILE_LAST_DAY, "great");
      }
      const [icon, title] = pickByDay(FERTILE_DAYS_LEFT)(daysLeft);
      return buildMessage(icon, title, "great");
    }

    case PHASES.LUTEAL:
    default: {
      const daysSinceFertileEnd = cycleDay - fertileEnd;
      if (daysSinceFertileEnd <= 3) {
        return buildFromVariants(LUTEAL_JUST_ENDED_FERTILE, "neutral");
      }
      if (daysUntilNextPeriod <= 2) {
        return buildFromVariants(LUTEAL_CAUTION_SOON, "caution");
      }
      return buildFromVariants(LUTEAL_NEUTRAL, "neutral");
    }
  }
};

/** Silhueta de resumo para o mês inteiro (usada num calendário simples, se necessário). */
export const getPhaseLabel = (phase) => {
  switch (phase) {
    case PHASES.MENSTRUATION:
      return "Menstruação";
    case PHASES.FOLLICULAR:
      return "Fase folicular";
    case PHASES.FERTILE:
      return "Janela fértil";
    case PHASES.LUTEAL:
    default:
      return "Fase lútea";
  }
};

export { getFertileWindow };
