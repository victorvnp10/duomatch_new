/**
 * Testes de src/application/hooks/useSuggestionWindow.js
 *
 * O defeito que originou este arquivo: o painel da rodada não contava as
 * sugestões especiais recém-marcadas. A causa era o hook carregar a janela com
 * uma leitura única e NUNCA reagir à marcação — o painel recalculava com o dado
 * velho, e o contador não andava.
 *
 * O teste que fecha isso é o caso "marcação aparece ao vivo": a assinatura de
 * HOJE precisa empurrar o novo estado para o consumidor sem remontar o hook.
 * Sem a assinatura ao vivo ele falha, porque nada além da montagem inicial
 * alimenta o valor devolvido.
 *
 * Testing Library não está instalada no projeto: usa-se react-dom/test-utils,
 * como em useMatchNotification.test.js.
 */
/* eslint-disable testing-library/no-unnecessary-act --
 * Sem Testing Library: `act` vem de react-dom/test-utils e é obrigatório para
 * createRoot. A regra dispara por engano. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";

import { doc, getDoc, onSnapshot } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/lib/dateUtils";
import { useSuggestionWindow } from "./useSuggestionWindow";

jest.mock("../../infrastructure/firebase", () => ({
  db: { __db: true },
  doc: jest.fn((_db, ...segments) => ({ path: segments.join("/") })),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock("../../shared/lib/dateUtils", () => ({
  getTodayDateString: jest.fn(() => "2026-10-20"),
}));

const HOJE = "2026-10-20";

// Caminho como o hook monta: `duomatches/{coupleId}/{colecao}/{dia}`.
const refDoDia = (colecao, dia) => `duomatches/casal-1/${colecao}/${dia}`;

const sugestao = (id, meuStatus, nome = id) => ({
  id,
  name: nome,
  selections: { eu: meuStatus },
});

let assinaturas;

beforeEach(() => {
  jest.clearAllMocks();
  assinaturas = [];
  // `resetMocks: true` no jest.config.cjs zera as implementações declaradas na
  // fábrica do jest.mock antes de cada teste — inclusive a do `doc`. Sem
  // reinstalar aqui, `doc` devolve `undefined` e a assinatura recebe caminho
  // vazio, o que faz o teste falhar por um motivo que não é o do hook.
  doc.mockImplementation((_db, ...segments) => ({ path: segments.join("/") }));
  // Mesma razão: sem reinstalar, o "hoje" vira `undefined` e o caminho da
  // assinatura passa a ser `.../dailySuggestions/undefined`.
  getTodayDateString.mockImplementation(() => HOJE);
  // getDoc resolve por caminho; cada teste ajusta o que quiser devolver.
  getDoc.mockImplementation(async (reference) => ({
    exists: () => false,
    data: () => ({}),
    __path: reference?.path,
  }));
  // onSnapshot captura o callback para o teste poder empurrar atualizações.
  onSnapshot.mockImplementation((reference, onNext) => {
    const entrada = { path: reference?.path, onNext };
    assinaturas.push(entrada);
    return () => {
      entrada.cancelado = true;
    };
  });
});

const Sonda = ({ coupleId, startDate, endDate, onValue }) => {
  const valor = useSuggestionWindow(coupleId, startDate, endDate);
  onValue(valor);
  return <div data-testid="n">{Object.keys(valor).length}</div>;
};

const montar = (props = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  let ultimo = null;
  act(() => {
    root.render(
      <Sonda
        coupleId="casal-1"
        startDate="2026-10-18"
        endDate="2026-10-24"
        onValue={(v) => {
          ultimo = v;
        }}
        {...props}
      />
    );
  });
  return {
    root,
    container,
    valor: () => ultimo,
    desmontar: () => {
      act(() => root.unmount());
      document.body.removeChild(container);
    },
  };
};

// Deixa as promessas pendentes do efeito resolverem dentro de `act`.
const assentar = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("useSuggestionWindow", () => {
  test("lê a janela e devolve as sugestões dos dias passados", async () => {
    getDoc.mockImplementation(async (reference) => {
      if (reference?.path === refDoDia("dailySuggestions", "2026-10-19")) {
        return {
          exists: () => true,
          data: () => ({ suggestions: { a1: sugestao("a1", "selected", "Jantar") } }),
        };
      }
      return { exists: () => false, data: () => ({}) };
    });

    const sonda = montar();
    await assentar();

    expect(sonda.valor()).toHaveProperty("a1");
    expect(sonda.valor().a1.name).toBe("Jantar");
    sonda.desmontar();
  });

  test("assinatura de hoje cobre as DUAS coleções, não só a diária", async () => {
    const sonda = montar();
    await assentar();

    const caminhos = assinaturas.map((a) => a.path).sort();
    expect(caminhos).toEqual([
      refDoDia("dailySuggestions", HOJE),
      refDoDia("hotSuggestions", HOJE),
    ]);
    sonda.desmontar();
  });

  test("marcação aparece ao vivo, sem remontar o hook", async () => {
    const sonda = montar();
    await assentar();

    // Antes de marcar: nada.
    expect(sonda.valor()).not.toHaveProperty("s1");

    // O usuário marca uma sugestão especial: o documento de hoje muda.
    const assinaturaDiaria = assinaturas.find((a) =>
      a.path === refDoDia("dailySuggestions", HOJE)
    );
    expect(assinaturaDiaria).toBeDefined();

    act(() => {
      assinaturaDiaria.onNext({
        exists: () => true,
        data: () => ({ suggestions: { s1: sugestao("s1", "selected", "Massagem") } }),
      });
    });

    // ESTE é o comportamento que faltava: o contador precisa ver a marcação.
    expect(sonda.valor()).toHaveProperty("s1");
    expect(sonda.valor().s1.selections.eu).toBe("selected");
    sonda.desmontar();
  });

  test("desmarcar também chega ao vivo", async () => {
    const sonda = montar();
    await assentar();

    const assinaturaDiaria = assinaturas.find((a) =>
      a.path === refDoDia("dailySuggestions", HOJE)
    );

    act(() => {
      assinaturaDiaria.onNext({
        exists: () => true,
        data: () => ({ suggestions: { s1: sugestao("s1", "selected") } }),
      });
    });
    expect(sonda.valor().s1.selections.eu).toBe("selected");

    // Desmarcou no mesmo dia: o campo volta a null.
    act(() => {
      assinaturaDiaria.onNext({
        exists: () => true,
        data: () => ({ suggestions: { s1: sugestao("s1", null) } }),
      });
    });
    expect(sonda.valor().s1.selections.eu).toBeNull();
    sonda.desmontar();
  });

  test("a hot zone ao vivo não apaga a diária (estados separados)", async () => {
    const sonda = montar();
    await assentar();

    const diaria = assinaturas.find((a) => a.path === refDoDia("dailySuggestions", HOJE));
    const hot = assinaturas.find((a) => a.path === refDoDia("hotSuggestions", HOJE));

    act(() => {
      diaria.onNext({
        exists: () => true,
        data: () => ({ suggestions: { d1: sugestao("d1", "selected") } }),
      });
    });
    act(() => {
      hot.onNext({
        exists: () => true,
        data: () => ({ suggestions: { h1: sugestao("h1", "selected") } }),
      });
    });

    // As duas convivem — um único estado compartilhado perderia uma delas.
    expect(sonda.valor()).toHaveProperty("d1");
    expect(sonda.valor()).toHaveProperty("h1");
    sonda.desmontar();
  });

  test("cancelar as assinaturas ao desmontar", async () => {
    const sonda = montar();
    await assentar();
    expect(assinaturas.length).toBe(2);

    sonda.desmontar();
    expect(assinaturas.every((a) => a.cancelado)).toBe(true);
  });

  test("sem coupleId não abre assinatura nenhuma", async () => {
    const sonda = montar({ coupleId: null });
    await assentar();
    expect(assinaturas).toHaveLength(0);
    expect(sonda.valor()).toEqual({});
    sonda.desmontar();
  });
});
