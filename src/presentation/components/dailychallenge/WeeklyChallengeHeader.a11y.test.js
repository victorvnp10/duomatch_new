/* eslint-disable testing-library/no-unnecessary-act -- Native React DOM tests; Testing Library is not installed. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import WeeklyChallengeHeader from "./WeeklyChallengeHeader";

global.IS_REACT_ACT_ENVIRONMENT = true;

it.each([0, 50, 100])("exposes weekly progress %s with a name and range", (percentage) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    act(() => root.render(<WeeklyChallengeHeader categoryStyle={{}}
      calculateWeeklyProgress={{ percentage, daysRemaining: 3 }} />));
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).not.toBeNull();
    expect(progress.getAttribute("aria-label")).toBe("Progresso do desafio semanal");
    expect(progress.getAttribute("aria-valuenow")).toBe(String(percentage));
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.style.width).toBe(`${percentage}%`);
  } finally {
    act(() => root.unmount());
  }
});
