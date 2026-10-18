/* eslint-disable testing-library/no-unnecessary-act -- Native React DOM tests; Testing Library is not installed. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import HotSuggestionsSection from "./HotSuggestionsSection";

global.IS_REACT_ACT_ENVIRONMENT = true;

it.each([undefined, "selected"])("supports keyboard and click suggestion selection (status %s)", (status) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const select = jest.fn();
  try {
    act(() => root.render(<HotSuggestionsSection
      sortedHotSuggestions={[{ id: "suggestion-1", name: "Sugestão", selections: { me: status } }]}
      user={{ uid: "me" }} handleSelectHotSuggestion={select}
    />));
    const card = container.querySelector("li");
    expect(card.getAttribute("role")).toBe("button");
    expect(card.tabIndex).toBe(0);
    card.focus();
    expect(document.activeElement).toBe(card);
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      act(() => card.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(true);
    }
    act(() => card.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(select).toHaveBeenCalledTimes(2);
    act(() => card.click());
    expect(select).toHaveBeenCalledTimes(3);
    expect(select).toHaveBeenLastCalledWith("suggestion-1");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
