/**
 * Testes de src/application/hooks/useMatchNotification.js
 *
 * A lógica de listener+parsing vivia duplicada, idêntica, em MainView.js
 * (evento `activityMatch`) e HotZone.js (`activityMatch` + `hotActivityMatch`).
 * Este hook é a fonte única. O teste usa react-dom/test-utils (Testing Library
 * não está instalada no projeto) e dispara CustomEvents reais na window.
 */
/* eslint-disable testing-library/no-unnecessary-act --
 * Sem Testing Library no projeto: `act` vem de react-dom/test-utils e é
 * obrigatório para `createRoot`. A regra dispara por engano. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  useMatchNotification,
  extractMatchActivityName,
} from "./useMatchNotification";

const Probe = ({ eventNames, extractActivityName }) => {
  const { showMatchNotification, matchedActivityName, hideMatchNotification } =
    useMatchNotification(eventNames, extractActivityName);
  return (
    <div>
      <span data-testid="show">{String(showMatchNotification)}</span>
      <span data-testid="name">{matchedActivityName}</span>
      <button onClick={hideMatchNotification}>hide</button>
    </div>
  );
};

const withRoot = (fn) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    return fn(root, container);
  } finally {
    act(() => root.unmount());
    document.body.removeChild(container);
  }
};

const text = (container, id) =>
  container.querySelector(`[data-testid="${id}"]`).textContent;

const dispatch = (name, detail) => {
  act(() => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  });
};

describe("extractMatchActivityName — parsing do detail (fonte única)", () => {
  it("aceita detail string (formato legado)", () => {
    expect(extractMatchActivityName({ detail: "Cinema" })).toBe("Cinema");
  });

  it("aceita detail objeto { activityName }", () => {
    expect(extractMatchActivityName({ detail: { activityName: "Praia" } })).toBe(
      "Praia"
    );
  });

  it("devolve string vazia quando não há nome", () => {
    expect(extractMatchActivityName({})).toBe("");
    expect(extractMatchActivityName({ detail: {} })).toBe("");
    expect(extractMatchActivityName(undefined)).toBe("");
  });
});

describe("useMatchNotification — listener de match", () => {
  it("preserva o parser estrito do App sem ampliar o contrato legado", () => {
    const extractActivityName = (event) => {
      const { activityName } = event.detail;
      return activityName;
    };
    withRoot((root, container) => {
      act(() => root.render(<Probe eventNames={["hotActivityMatch"]} extractActivityName={extractActivityName} />));
      dispatch("activityMatch", { activityName: "Ignorado" });
      expect(text(container, "show")).toBe("false");
      dispatch("hotActivityMatch", "Não era aceito pelo App");
      expect(text(container, "show")).toBe("true");
      expect(text(container, "name")).toBe("");
      dispatch("hotActivityMatch", { activityName: "Sinal quente" });
      expect(text(container, "name")).toBe("Sinal quente");
    });
  });

  it("começa oculto e sem nome", () => {
    withRoot((root, container) => {
      act(() => root.render(<Probe />));
      expect(text(container, "show")).toBe("false");
      expect(text(container, "name")).toBe("");
    });
  });

  it("mostra a notificação ao receber activityMatch (detail string)", () => {
    withRoot((root, container) => {
      act(() => root.render(<Probe />));
      dispatch("activityMatch", "Cinema");
      expect(text(container, "show")).toBe("true");
      expect(text(container, "name")).toBe("Cinema");
    });
  });

  it("mostra a notificação ao receber activityMatch (detail objeto)", () => {
    withRoot((root, container) => {
      act(() => root.render(<Probe />));
      dispatch("activityMatch", { activityName: "Praia" });
      expect(text(container, "name")).toBe("Praia");
    });
  });

  it("esconde ao chamar hideMatchNotification", () => {
    withRoot((root, container) => {
      act(() => root.render(<Probe />));
      dispatch("activityMatch", "Cinema");
      expect(text(container, "show")).toBe("true");
      act(() => {
        container.querySelector("button").click();
      });
      expect(text(container, "show")).toBe("false");
    });
  });

  it("HotZone: também escuta hotActivityMatch quando listado", () => {
    withRoot((root, container) => {
      act(() =>
        root.render(
          <Probe eventNames={["activityMatch", "hotActivityMatch"]} />
        )
      );
      dispatch("hotActivityMatch", "Sinal quente");
      expect(text(container, "show")).toBe("true");
      expect(text(container, "name")).toBe("Sinal quente");
    });
  });

  it("MainView: NÃO reage a hotActivityMatch (default só activityMatch)", () => {
    withRoot((root, container) => {
      act(() => root.render(<Probe />));
      dispatch("hotActivityMatch", "Sinal quente");
      expect(text(container, "show")).toBe("false");
      expect(text(container, "name")).toBe("");
    });
  });

  it("remove o listener ao desmontar", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<Probe />));
    act(() => root.unmount());
    expect(() => dispatch("activityMatch", "Cinema")).not.toThrow();
    document.body.removeChild(container);
  });
});
