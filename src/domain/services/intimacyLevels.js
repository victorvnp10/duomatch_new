/**
 * Domínio: regra de níveis de intimidade do casal.
 *
 * "Cada nível requer 4 pontos (matches hot)". A regra estava duplicada: o
 * literal `4` aparecia em `hotzone/IntimacyMeter.js` (como `pointsPerLevel`)
 * e em `HotZone.js` (detecção de level up, `Math.floor(currentPoints / 4)`).
 * Esta é a fonte única — qualquer mudança no custo do nível deve acontecer
 * apenas aqui.
 */
export const POINTS_PER_LEVEL = 4;

/**
 * Nível de intimidade a partir dos pontos acumulados.
 * `undefined`/`null`/`NaN` contam como 0 (mesma tolerância que os dois
 * consumidores aplicavam com `coupleData?.intimacyPoints || 0`).
 */
export const getIntimacyLevel = (points) =>
  Math.floor((points || 0) / POINTS_PER_LEVEL);
