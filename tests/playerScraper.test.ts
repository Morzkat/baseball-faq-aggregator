import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { PlayerLink } from "../src/types.js";

vi.mock("../src/scraper/httpClient.js", () => ({
  getHtml: vi.fn()
}));

vi.mock("../src/parsers/faqParser.js", () => ({
  parseFaqQuestions: vi.fn()
}));

import { parseFaqQuestions } from "../src/parsers/faqParser.js";
import { getHtml } from "../src/scraper/httpClient.js";
import { scrapePlayerPage } from "../src/scraper/playerScraper.js";

describe("scrapePlayerPage", () => {
  it("loads cached HTML, parses FAQs, and returns player data", async () => {
    const player: PlayerLink = {
      id: "abernte01",
      name: "Tal Abernathy",
      url: "https://www.baseball-reference.com/players/a/abernte01.shtml",
      directoryLetter: "a"
    };
    const mockedGetHtml = vi.mocked(getHtml);
    const mockedParseFaqQuestions = vi.mocked(parseFaqQuestions);

    mockedGetHtml.mockResolvedValue("<html>player page</html>");
    mockedParseFaqQuestions.mockReturnValue([
      "When was Tal Abernathy born?"
    ]);

    await expect(scrapePlayerPage(player)).resolves.toEqual({
      player,
      faqQuestions: ["When was Tal Abernathy born?"],
      sectionHeaders: []
    });
    expect(mockedGetHtml).toHaveBeenCalledWith(
      player.url,
      path.join("cache", "players", "abernte01.html")
    );
    expect(mockedParseFaqQuestions).toHaveBeenCalledWith(
      "<html>player page</html>"
    );
  });
});
