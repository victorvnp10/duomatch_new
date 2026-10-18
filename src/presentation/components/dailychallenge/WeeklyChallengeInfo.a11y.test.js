/* eslint-disable testing-library/no-unnecessary-act -- Native React DOM tests; Testing Library is not installed. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import WeeklyChallengeInfo from "./WeeklyChallengeInfo";

global.IS_REACT_ACT_ENVIRONMENT = true;

it("announces acceptance updates without changing the existing visible status text", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = (challengeState) => act(() => root.render(<WeeklyChallengeInfo
    categoryStyle={{ label: "Categoria" }} selectedChallenge={{ title: "Desafio", points: 10 }}
    challengeState={challengeState} />));
  try {
    render({ myAccepted: false, partnerAccepted: false });
    const status = container.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("❌ Você: Não aceito❌ Parceiro: Não aceito");
    render({ myAccepted: true, partnerAccepted: false });
    expect(container.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent).toBe("✅ Você: Aceito❌ Parceiro: Não aceito");
    render({ myAccepted: true, partnerAccepted: true });
    expect(status.textContent).toBe("✅ Você: Aceito✅ Parceiro: Aceito");
  } finally {
    act(() => root.unmount());
  }
});
