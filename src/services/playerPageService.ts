import pLimit from "p-limit";
import { REQUEST_CONCURRENCY } from "../config/constants.js";
import type { PlayerLink, PlayerPageData, ScrapeError } from "../types.js";
import { readCachedHtml } from "../utils/fileCache.js";
import { logProgress } from "../utils/fileUtils.js";
import { scrapePlayerPage } from "../scraper/playerScraper.js";

export async function processPlayerPages(
  players: PlayerLink[],
  playerLimit: number | undefined = getPlayerLimit()
): Promise<{ playerPages: PlayerPageData[]; errors: ScrapeError[] }> {
  if (
    playerLimit !== undefined &&
    (!Number.isInteger(playerLimit) || playerLimit <= 0)
  ) {
    throw new Error("Player limit must be a positive integer.");
  }

  const playersToProcess =
    playerLimit === undefined ? players : players.slice(0, playerLimit);
  const errors: ScrapeError[] = [];
  const playerPages: PlayerPageData[] = [];
  const limit = pLimit(REQUEST_CONCURRENCY);

  const tasks = playersToProcess.map((player, index) =>
    limit(async () => {
      logProgress(
        index + 1,
        playersToProcess.length,
        `Processing ${player.name}...`
      );

      const cachedHtml = await readCachedHtml(`cache/players/${player.id}.html`);
      void cachedHtml;

      return scrapePlayerPage(player);
    })
  );

  const results = await Promise.allSettled(tasks);

  results.forEach((result, index) => {
    const player = playersToProcess[index];

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

export function getPlayerLimit(
  value: string | undefined = process.env.PLAYER_LIMIT
): number | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const playerLimit = Number(value);

  if (!Number.isInteger(playerLimit) || playerLimit <= 0) {
    throw new Error("PLAYER_LIMIT must be a positive integer.");
  }

  return playerLimit;
}
