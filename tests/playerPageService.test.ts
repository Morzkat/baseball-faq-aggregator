import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlayerLink } from "../src/types.js";

vi.mock("../src/scraper/playerScraper.js", () => ({
  scrapePlayerPage: vi.fn()
}));

vi.mock("../src/utils/fileCache.js", () => ({
  readCachedHtml: vi.fn()
}));

vi.mock("../src/utils/fileUtils.js", () => ({
  logProgress: vi.fn()
}));

import { scrapePlayerPage } from "../src/scraper/playerScraper.js";
import {
  getPlayerLimit,
  processPlayerPages
} from "../src/services/playerPageService.js";

const players: PlayerLink[] = Array.from({ length: 7 }, (_, index) => ({
  id: `player${index + 1}`,
  name: `Player ${index + 1}`,
  url: `https://example.com/player${index + 1}`,
  directoryLetter: "p"
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("getPlayerLimit", () => {
  it("returns no limit when the parameter is omitted", () => {
    expect(getPlayerLimit("")).toBeUndefined();
  });

  it("accepts a positive integer parameter", () => {
    expect(getPlayerLimit("12")).toBe(12);
  });

  it("rejects invalid limits", () => {
    expect(() => getPlayerLimit("0")).toThrow(
      "PLAYER_LIMIT must be a positive integer."
    );
    expect(() => getPlayerLimit("2.5")).toThrow(
      "PLAYER_LIMIT must be a positive integer."
    );
  });
});

describe("processPlayerPages", () => {
  it("processes all players when no limit is provided", async () => {
    vi.stubEnv("PLAYER_LIMIT", "");
    vi.mocked(scrapePlayerPage).mockImplementation(async (player) => ({
      player,
      faqQuestions: [],
      sectionHeaders: []
    }));

    const result = await processPlayerPages(players);

    expect(result.playerPages).toHaveLength(7);
    expect(result.errors).toEqual([]);
    expect(scrapePlayerPage).toHaveBeenCalledTimes(7);
  });

  it("accepts an explicit player limit", async () => {
    vi.mocked(scrapePlayerPage).mockImplementation(async (player) => ({
      player,
      faqQuestions: [],
      sectionHeaders: []
    }));

    const result = await processPlayerPages(players, 2);

    expect(result.playerPages).toHaveLength(2);
    expect(scrapePlayerPage).toHaveBeenCalledTimes(2);
  });
});
