/**
 * Domínio: Periodicidade de uma atividade recorrente.
 *
 * Esta é uma regra de negócio genuína — "quando uma atividade recorrente
 * conta como válida para hoje" — e não um utilitário técnico genérico.
 * Antes vivia em `src/utils.js` misturada com formatação de string.
 * Aqui ela é isolada como Value Object de domínio: dado um `periodicity`
 * (imutável, definido por seus atributos `type`/`value`), sabe responder
 * duas perguntas de negócio sobre si mesma.
 */

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/** Formata a periodicidade para exibição amigável ao usuário. */
export const formatPeriodicity = (periodicity) => {
  if (!periodicity || periodicity.type === "none") return "";
  const { type, value } = periodicity;
  try {
    switch (type) {
      case "diaria":
        return `(Diariamente)`;
      case "especifica": {
        const [year, month, day] = value.split("-");
        return `(Em ${day}/${month}/${year})`;
      }
      case "semanal":
        return `(Toda ${WEEKDAY_NAMES[value]})`;
      case "mensal":
        return `(Todo dia ${value})`;
      case "anual": {
        const [, annualMonth, annualDay] = value.split("-");
        return `(Anual em ${annualDay}/${annualMonth})`;
      }
      default:
        return "";
    }
  } catch {
    return "";
  }
};

/**
 * Decide se uma atividade (com sua periodicidade) é válida/aplicável
 * para a data de hoje. Desafios usam uma regra diferente (validade por
 * expiração, não por periodicidade).
 */
export const isActivityForToday = (activity, todayDateString) => {
  if (activity.type?.startsWith("desafio")) {
    return activity.expiresAt && activity.expiresAt.toDate() > new Date();
  }

  if (!activity.periodicity || activity.periodicity.type === "none") {
    return true;
  }

  const { type, value } = activity.periodicity;

  switch (type) {
    case "diaria":
      return true;
    case "especifica":
      return value === todayDateString;
    case "semanal": {
      const date = new Date(`${todayDateString}T00:00:00Z`);
      return date.getUTCDay() === parseInt(value, 10);
    }
    case "mensal": {
      const day = parseInt(todayDateString.split("-")[2], 10);
      return day === parseInt(value, 10);
    }
    case "anual": {
      const [, month, day] = value.split("-");
      const [, , todayDay] = todayDateString.split("-");
      const todayMonth = todayDateString.split("-")[1];
      return (
        parseInt(todayMonth, 10) === parseInt(month, 10) &&
        parseInt(todayDay, 10) === parseInt(day, 10)
      );
    }
    default:
      return false;
  }
};
