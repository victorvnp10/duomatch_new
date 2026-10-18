/**
 * Utilitário compartilhado: hash determinístico de string.
 *
 * Usado para selecionar de forma determinística (estável entre renders do
 * mesmo dia) quais atividades antigas aparecem no feed diário — ordenar por
 * `seededHash(id + todayStr)` dá uma "embaralhada" que não muda a cada
 * render, ao contrário de `Math.random()`.
 *
 * Extraído de `MainView` (definição inline dentro do useEffect). É um
 * utilitário técnico puro, sem regra de negócio — por isso vive em
 * `shared/lib`, junto de `dateUtils`.
 *
 * O `hash &= hash` do original é preservado: apesar de parecer um no-op,
 * força o valor para inteiro de 32 bits (o operador `&`), que é o que dá
 * ao hash o seu comportamento numérico observado.
 */
export const seededHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return hash;
};
