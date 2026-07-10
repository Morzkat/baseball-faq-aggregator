import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDirectoryPage } from "../src/parsers/directoryParser.js";

describe("parseDirectoryPage", () => {
  it("extracts and deduplicates player profile links", () => {
    const html = fs.readFileSync(
      "tests/fixtures/directory-page.html",
      "utf8"
    );

    const players = parseDirectoryPage(html, "a");

    expect(players).toHaveLength(2);
    expect(players[0]).toEqual({
      id: "aardsda01",
      name: "David Aardsma",
      url: "https://www.baseball-reference.com/players/a/aardsda01.shtml",
      directoryLetter: "a"
    });
    expect(players[1]?.name).toBe("Tal Abernathy");
  });
});
