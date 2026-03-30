import { applyConversion } from "../javascript/conversion";

describe("Conversion Logic", () => {
  test("factor-based conversion works", () => {
    const convObj = { factor: 1000 };
    expect(applyConversion(2, convObj)).toBe(2000);
  });

  test("formula-based conversion works", () => {
    const convObj = { formula: "x * 9/5 + 32" }; // Celsius → Fahrenheit
    expect(applyConversion(0, convObj)).toBe(32);
  });

  test("throws error for invalid number", () => {
    const convObj = { factor: 1000 };
    expect(() => applyConversion(NaN, convObj)).toThrow("Invalid number");
  });
});
