import { getUnits, getConversion, getHistory } from "../javascript/api";

global.fetch = jest.fn();

describe("API Calls", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("getUnits fetches units", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ label: "Meter", symbol: "m" }]
    });

    const units = await getUnits("length");
    expect(units[0].label).toBe("Meter");
  });

  test("getConversion throws on error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getConversion("m", "km")).rejects.toThrow("HTTP Error: 404");
  });

  test("getHistory returns empty array on failure", async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    const history = await getHistory();
    expect(history).toEqual([]);
  });
});
