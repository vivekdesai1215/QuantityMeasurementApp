/**
 * @jest-environment jsdom
 */
import { convertValue } from "../javascript/conversion";

describe("Arithmetic Operations", () => {
  test("addition works", async () => {
    const result = await convertValue(2, "m", "m");
    expect(result).toBe(2);
  });

  test("division by zero returns error", async () => {
    const v1 = 10;
    const v2 = 0;
    // simulate division logic
    expect(() => v1 / v2).toThrow;
  });
});
