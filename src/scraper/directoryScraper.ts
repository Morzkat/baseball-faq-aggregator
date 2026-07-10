import {
  BASE_URL,
  DIRECTORY_LETTERS
} from "../config/constants.js";
import type {
  PlayerLink,
  ScrapeError
} from "../types.js";
import { parseDirectoryPage } from "../parsers/directoryParser.js";
import { getHtml } from "./httpClient.js";
import { getDirectoryCachePath } from "../utils/fileCache.js";
import { getErrorMessage } from "../utils/fileUtils.js";

export function getDirectoryUrl(letter: string): string {
  return `${BASE_URL}/players/${letter}/`;
}

export async function scrapeAllDirectories(): Promise<{
  players: PlayerLink[];
  processedPages: number;
  errors: ScrapeError[];
}> {
  const allPlayers = new Map<string, PlayerLink>();
  const errors: ScrapeError[] = [];
  let processedPages = 0;

  for (const [index, letter] of DIRECTORY_LETTERS.entries()) {
    const url = getDirectoryUrl(letter);
    const cachePath = getDirectoryCachePath(letter);

    console.log(
      `[Directory ${index + 1}/${DIRECTORY_LETTERS.length}] Processing ${letter.toUpperCase()}...`
    );

    try {
      const html = await getHtml(url, cachePath);
      const players = parseDirectoryPage(html, letter);

      for (const player of players) {
        allPlayers.set(player.id, player);
      }

      processedPages += 1;
    } catch (error) {
      errors.push({
        url,
        message: getErrorMessage(error)
      });
    }
  }

  return {
    players: [...allPlayers.values()],
    processedPages,
    errors
  };
}
