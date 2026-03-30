/**
 * @jest-environment jsdom
 */
import { renderHistory } from "../javascript/main";

describe("DOM Rendering", () => {
  beforeEach(() => {
    document.body.innerHTML = `<ul id="history-list"></ul>`;
  });

  test("renders empty history", () => {
    renderHistory([]);
    expect(document.querySelector("#history-list").textContent).toContain("No history yet.");
  });

  test("renders history records", () => {
    const records = [
      { expression: "2+2", result: "4", timestamp: Date.now() }
    ];
    renderHistory(records);
    expect(document.querySelector("#history-list").textContent).toContain("2+2 = 4");
  });
});
