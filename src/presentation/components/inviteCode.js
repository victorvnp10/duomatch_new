/**
 * ACHADO M-1 — geração de códigos de convite de casal.
 *
 * Antes (`LinkingPage`): `Math.random().toString(36).substring(2, 8)` — 6
 * caracteres de um alfabeto de 36 (≈31 bits) vindos de um PRNG NÃO
 * criptográfico. O xorshift128+ do V8 tem estado recuperável a partir de
 * algumas saídas, então o código era previsível; somado a não expirar, um
 * terceiro podia consumir o convite e sequestrar o vínculo.
 *
 * Agora:
 *  - alfabeto de 32 símbolos (sem 0/O/1/I ambíguos) → exatamente 5 bits/caractere;
 *  - 8 caracteres → 40 bits de entropia (32^8 = 1.099.511.627.776 combinações);
 *  - `crypto.getRandomValues` (CSPRNG do sistema), com rejeição de viés zero
 *    porque 256 % 32 === 0;
 *  - validade de 24h gravada no documento (`expiresAt`), exigida pelas regras.
 *
 * Este módulo é intencionalmente livre de dependências (nem React nem
 * Firebase) para poder ser testado isoladamente.
 */

export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 símbolos
export const INVITE_CODE_LENGTH = 8; // 8 × 5 = 40 bits
export const INVITE_CODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/** Gera um código de convite com CSPRNG. */
export const generateInviteCode = () => {
  const bytes = new Uint8Array(INVITE_CODE_LENGTH);
  const cryptoObj =
    typeof globalThis !== "undefined" && globalThis.crypto
      ? globalThis.crypto
      : typeof window !== "undefined" && window.crypto
      ? window.crypto
      : null;

  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    cryptoObj.getRandomValues(bytes);
  } else {
    // Fallback SÓ para contextos não seguros (ex.: dev servido em http numa
    // interface de rede). Em produção o app é uma PWA — service workers e Web
    // Push exigem contexto seguro — logo `crypto.getRandomValues` existe por
    // especificação (Secure Contexts). Nunca deve ser usado em produção.
    console.warn(
      "[DuoMatch] crypto.getRandomValues indisponível — usando fallback NÃO criptográfico."
    );
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // 256 % 32 === 0, portanto `byte % 32` é uniforme (sem viés de módulo).
  return Array.from(
    bytes,
    (b) => INVITE_CODE_ALPHABET[b % INVITE_CODE_ALPHABET.length]
  ).join("");
};
