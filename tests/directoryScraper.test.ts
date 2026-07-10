import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlayerLink } from "../src/types.js";

vi.mock("../src/scraper/httpClient.js", () => ({
  getHtml: vi.fn()
}));

vi.mock("../src/parsers/directoryParser.js", () => ({
  parseDirectoryPage: vi.fn()
}));

import { parseDirectoryPage } from "../src/parsers/directoryParser.js";
import { getHtml } from "../src/scraper/httpClient.js";
import {
  getDirectoryUrl,
  scrapeAllDirectories
} from "../src/scraper/directoryScraper.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("directory scraper", () => {
  it("generates directory URLs", () => {
    expect(getDirectoryUrl("a")).toBe(
      "https://www.baseball-reference.com/players/a/"
    );
  });

  it("processes all directories and continues after failures", async () => {
    const mockedGetHtml = vi.mocked(getHtml);
    const mockedParseDirectoryPage = vi.mocked(parseDirectoryPage);
    const progressSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    mockedGetHtml.mockImplementation(async (url) => {
      if (url.endsWith("/b/")) {
        throw new Error("temporary directory failure");
      }

      return "<html></html>";
    });
    mockedParseDirectoryPage.mockImplementation((_html, letter) => {
      const player: PlayerLink = {
        id: `${letter}player01`,
        name: `Player ${letter}`,
        url: `https://www.baseball-reference.com/players/${letter}/${letter}player01.shtml`,
        directoryLetter: letter
      };

      return [player];
    });

    const result = await scrapeAllDirectories();

    expect(result.processedPages).toBe(25);
    expect(result.players).toHaveLength(25);
    expect(result.errors).toEqual([
      {
        url: "https://www.baseball-reference.com/players/b/",
        message: "temporary directory failure"
      }
    ]);
    expect(progressSpy).toHaveBeenCalledTimes(26);
  });
});
