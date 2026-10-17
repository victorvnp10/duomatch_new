import { renderToStaticMarkup } from "react-dom/server";
import IntimacyMeter from "./IntimacyMeter";

it("depends only on coupleData and never reads unused user props", () => {
  const readUnused = jest.fn(() => ({ uid: "unused" }));
  const props = { coupleData: { intimacyPoints: 7 } };
  Object.defineProperties(props, {
    user: { get: readUnused },
    userData: { get: readUnused },
  });
  const view = renderToStaticMarkup(IntimacyMeter(props));
  expect(readUnused).not.toHaveBeenCalled();
  expect(view).toBe(renderToStaticMarkup(IntimacyMeter({ coupleData: props.coupleData })));
  expect(view).toContain("7 pontos totais");
});
