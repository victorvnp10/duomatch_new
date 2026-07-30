import {
  formatPeriodicity as formatPeriodicityDomain,
  isActivityForToday as isActivityForTodayDomain,
} from "../domain/valueObjects/Periodicity";

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Re-exportados a partir do domínio (src/domain/valueObjects/Periodicity.js)
// para manter compatibilidade com os imports existentes em todo o app
// (`import { isActivityForToday } from "../../shared/utils"`), sem
// espalhar a mudança de camada por dezenas de arquivos.
export const formatPeriodicity = formatPeriodicityDomain;
export const isActivityForToday = (activity) =>
  isActivityForTodayDomain(activity, getTodayDateString());
