import fs from "node:fs/promises";
import path from "node:path";
import {
  CACHE_DIRECTORIES_PATH,
  CACHE_PLAYERS_PATH
} from "../config/constants.js";

export async function readCachedHtml(
  filePath: string
): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function writeCachedHtml(
  filePath: string,
  html: string
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, "utf8");
}

export function getDirectoryCachePath(letter: string): string {
  return path.join(CACHE_DIRECTORIES_PATH, `${letter}.html`);
}

export function getPlayerCachePath(playerId: string): string {
  return path.join(CACHE_PLAYERS_PATH, `${playerId}.html`);
}
