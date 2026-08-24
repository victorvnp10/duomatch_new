import {
  formatPeriodicity as formatPeriodicityDomain,
  isActivityForToday as isActivityForTodayDomain,
} from "../domain/valueObjects/Periodicity";

export const getTodayDateString = () => getDateString(new Date());

// Formata um Date para "YYYY-MM-DD" no fuso LOCAL do dispositivo
// (convenção do projeto — nunca usar toISOString(), que é UTC).
export const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Re-exportados a partir do domínio (src/domain/valueObjects/Periodicity.js)
// para manter compatibilidade com os imports existentes em todo o app
// (`import { isActivityForToday } from "../../shared/utils"`), sem
// espalhar a mudança de camada por dezenas de arquivos.
export const formatPeriodicity = formatPeriodicityDomain;
export const isActivityForToday = (activity) =>
  isActivityForTodayDomain(activity, getTodayDateString());
