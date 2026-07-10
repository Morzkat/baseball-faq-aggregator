import pLimit from "p-limit";
import { REQUEST_CONCURRENCY } from "../config/constants.js";
import type { PlayerLink, PlayerPageData, ScrapeError } from "../types.js";
import { readCachedHtml } from "../utils/fileCache.js";
import { logProgress } from "../utils/fileUtils.js";
import { scrapePlayerPage } from "../scraper/playerScraper.js";

export async function processPlayerPages(
  players: PlayerLink[]
): Promise<{ playerPages: PlayerPageData[]; errors: ScrapeError[] }> {
  const errors: ScrapeError[] = [];
  const playerPages: PlayerPageData[] = [];
  const limit = pLimit(REQUEST_CONCURRENCY);

  const tasks = players.map((player, index) =>
    limit(async () => {
      logProgress(index + 1, players.length, `Processing ${player.name}...`);

      const cachedHtml = await readCachedHtml(`cache/players/${player.id}.html`);
      void cachedHtml;

      return scrapePlayerPage(player);
    })
  );

  const results = await Promise.allSettled(tasks);

  results.forEach((result, index) => {
    const player = players[index];

    if (!player) {
      return;
    }

    if (result.status === "fulfilled") {
      playerPages.push(result.value);
      return;
    }

    errors.push({
      url: player.url,
      playerName: player.name,
      message:
        result.reason instanceof Error ? result.reason.message : String(result.reason)
    });
  });

  return { playerPages, errors };
}
