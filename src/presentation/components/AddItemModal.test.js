/**
 * Testes de src/presentation/components/AddItemModal.js
 *
 * O componente declarava `useMemo` DEPOIS de um early return
 * (`if (!isOpen) return null;`), então o número de hooks chamados variava
 * entre renderizações — violação de `react-hooks/rules-of-hooks`.
 *
 * O defeito só aparece ao alternar `isOpen` de false para true no MESMO
 * componente montado: o React aborta com "Rendered more hooks than during
 * the previous render". Por isso o teste renderiza o mesmo root duas vezes,
 * em vez de montar já aberto (que nunca exercita o caminho com bug).
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import AddItemModal from "./AddItemModal";

// Evita inicializar o Firebase real no ambiente de teste.
jest.mock("../../infrastructure/firebase", () => ({
  Timestamp: { fromDate: (date) => date },
  serverTimestamp: () => null,
}));

const baseProps = {
  onClose: () => {},
  user: { uid: "user-1" },
  rounds: [],
  allActivities: [],
  handleAddActivity: () => {},
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

describe("AddItemModal — ordem de hooks (AddItemModal.js:31-44)", () => {
  it("não quebra a ordem dos hooks ao alternar isOpen false → true", () => {
    withRoot((root) => {
      expect(() => {
        act(() => {
          root.render(<AddItemModal {...baseProps} isOpen={false} />);
        });
        act(() => {
          root.render(<AddItemModal {...baseProps} isOpen={true} />);
        });
      }).not.toThrow();
    });
  });

  it("renderiza o formulário quando aberto", () => {
    withRoot((root, container) => {
      act(() => {
        root.render(<AddItemModal {...baseProps} isOpen={true} />);
      });
      expect(container.textContent).toContain("Adicionar Novo Item");
    });
  });

  it("não renderiza nada quando fechado", () => {
    withRoot((root, container) => {
      act(() => {
        root.render(<AddItemModal {...baseProps} isOpen={false} />);
      });
      expect(container.textContent).toBe("");
    });
  });
});
