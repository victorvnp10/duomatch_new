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
 */

const buildMessage = (icon, title, tone) => ({ icon, title, tone });

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
        return buildMessage("🌤️", "Os dias difíceis estão acabando", "neutral");
      }
      return buildMessage("🙏", "Cuidado, hoje não é um bom dia", "caution");
    }

    case PHASES.FOLLICULAR: {
      if (daysUntilFertileWindow === 1) {
        return buildMessage("✨", "Sua sorte começa amanhã!", "good");
      }
      if (daysUntilFertileWindow <= 3) {
        return buildMessage(
          "⏳",
          `Faltam só ${daysUntilFertileWindow} dias para o período de sorte`,
          "good"
        );
      }
      return buildMessage("💛", "Fase tranquila — aproveitem de outras formas", "neutral");
    }

    case PHASES.FERTILE: {
      if (cycleDay === fertileStart) {
        return buildMessage("🍀", "Hoje começa o seu período de sorte!", "great");
      }
      if (cycleDay === ovulationDay || cycleDay === ovulationDay - 1) {
        return buildMessage("🔥", "Ótimo dia para um match mais quente!", "great");
      }
      const daysLeft = fertileEnd - cycleDay;
      if (daysLeft <= 0) {
        return buildMessage("🎉", "Último dia de sorte — aproveitem!", "great");
      }
      return buildMessage("💫", `Só te restam mais ${daysLeft} dias especiais`, "great");
    }

    case PHASES.LUTEAL:
    default: {
      const daysSinceFertileEnd = cycleDay - fertileEnd;
      if (daysSinceFertileEnd <= 3) {
        return buildMessage("🤔", "Agora é um momento de atenção", "neutral");
      }
      if (daysUntilNextPeriod <= 2) {
        return buildMessage("⚠️", "Cuidado, os próximos dias não serão bons", "caution");
      }
      return buildMessage("💛", "Fase calma, aproveitem de outras formas", "neutral");
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
