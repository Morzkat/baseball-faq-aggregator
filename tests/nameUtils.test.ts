import { describe, expect, it } from "vitest";
import { countAs, hasExactlyThreeAs } from "../src/utils/nameUtils.js";

describe("countAs", () => {
  it("counts uppercase and lowercase As", () => {
    expect(countAs("Amanda Aaron")).toBe(5);
  });

  it("returns zero when no As exist", () => {
    expect(countAs("John Smith")).toBe(0);
  });
});

describe("hasExactlyThreeAs", () => {
  it("rejects David Aardsma", () => {
    expect(hasExactlyThreeAs("David Aardsma")).toBe(false);
  });

  it("accepts Tal Abernathy", () => {
    expect(hasExactlyThreeAs("Tal Abernathy")).toBe(true);
  });
});
