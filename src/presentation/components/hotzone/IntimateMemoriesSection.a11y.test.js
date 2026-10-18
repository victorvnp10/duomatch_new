/* eslint-disable testing-library/no-unnecessary-act -- Native React DOM tests; Testing Library is not installed. */
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import IntimateMemoriesSection from "./IntimateMemoriesSection";

global.IS_REACT_ACT_ENVIRONMENT = true;

it("preserves memory identity and chat focus when items without ids reorder or prepend", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  // Identical content deliberately rules out colliding content-derived keys.
  const first = { name: "Memória" };
  const second = { name: "Memória" };
  const chat = jest.fn();
  const render = (items) => act(() => root.render(<IntimateMemoriesSection
    finalizedHotItems={items} user={{ uid: "me" }} userData={{ partnerId: "partner" }}
    setActiveChatActivity={chat}
  />));
  try {
    render([first, second]);
    act(() => container.querySelector("button").click());
    const firstChat = container.querySelectorAll('[aria-label="Abrir chat"]')[0];
    firstChat.focus();
    render([second, first]);
    expect(container.querySelectorAll('[aria-label="Abrir chat"]')[1]).toBe(firstChat);
    expect(document.activeElement).toBe(firstChat);
    render([{ name: "Nova" }, second, first]);
    expect(container.querySelectorAll('[aria-label="Abrir chat"]')[2]).toBe(firstChat);
    act(() => firstChat.click());
    expect(chat).toHaveBeenCalledWith(first);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
