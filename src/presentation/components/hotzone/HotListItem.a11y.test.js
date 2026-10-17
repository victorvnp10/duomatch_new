/* eslint-disable testing-library/no-unnecessary-act -- Native React DOM tests; Testing Library is not installed. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import HotListItem from "./HotListItem";

global.IS_REACT_ACT_ENVIRONMENT = true;

it.each([undefined, "confirmed"])("supports keyboard and click selection (status %s)", (status) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const select = jest.fn();
  try {
    act(() => root.render(<ul><HotListItem
      activity={{ id: "activity-1", name: "Atividade" }} user={{ uid: "me" }}
      props={{ mySelections: { "activity-1": { status } }, handleSelectActivity: select }}
    /></ul>));
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
    expect(select).toHaveBeenLastCalledWith("activity-1");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
