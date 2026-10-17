import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  INVITE_CODE_TTL_MS,
  generateInviteCode,
} from "./inviteCode";

// ACHADO M-1 — convites adivinháveis.
// Garante que o código não voltou a ser curto/previsível e que a entropia
// anunciada (40 bits) corresponde ao alfabeto e ao tamanho escolhidos.

// O jsdom desta versão do CRA não expõe `crypto`. Instalamos um objeto com
// `getRandomValues` para exercitar o caminho de CSPRNG do módulo (o fallback
// Math.random é só para contextos não seguros e não é o que queremos testar).
const cryptoOriginal = globalThis.crypto;

beforeAll(() => {
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        },
      },
    });
  }
});

afterAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: cryptoOriginal,
  });
});

describe("inviteCode (M-1)", () => {
  test("alfabeto tem exatamente 32 símbolos (=> 5 bits por caractere)", () => {
    expect(INVITE_CODE_ALPHABET).toHaveLength(32);
    expect(new Set(INVITE_CODE_ALPHABET).size).toBe(32);
    // sem caracteres ambíguos
    expect(INVITE_CODE_ALPHABET).not.toMatch(/[01OI]/);
  });

  test("código tem 8 caracteres e entropia de 40 bits", () => {
    expect(INVITE_CODE_LENGTH).toBe(8);
    const bits = INVITE_CODE_LENGTH * Math.log2(INVITE_CODE_ALPHABET.length);
    expect(bits).toBe(40);
    expect(Math.pow(32, 8)).toBe(1099511627776);
  });

  test("gera códigos no formato esperado, só com símbolos do alfabeto", () => {
    const re = new RegExp(`^[${INVITE_CODE_ALPHABET}]{8}$`);
    for (let i = 0; i < 500; i++) {
      expect(generateInviteCode()).toMatch(re);
    }
  });

  test("não repete códigos numa amostra de 2000 (colisão seria sinal de PRNG fraco)", () => {
    const vistos = new Set();
    for (let i = 0; i < 2000; i++) vistos.add(generateInviteCode());
    expect(vistos.size).toBe(2000);
  });

  test("usa crypto.getRandomValues (CSPRNG), não Math.random", () => {
    const chamadas = [];
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (arr) => {
          chamadas.push(arr.length);
          for (let i = 0; i < arr.length; i++) arr[i] = (i * 37 + 11) % 256;
          return arr;
        },
      },
    });
    const mathSpy = jest.spyOn(Math, "random");

    const code = generateInviteCode();

    expect(chamadas).toEqual([INVITE_CODE_LENGTH]);
    expect(mathSpy).not.toHaveBeenCalled();
    expect(code).toHaveLength(INVITE_CODE_LENGTH);

    mathSpy.mockRestore();
    // volta o stub do beforeAll para os demais testes
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        },
      },
    });
  });

  test("validade do convite é de 24 horas", () => {
    expect(INVITE_CODE_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});
