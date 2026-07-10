import * as cheerio from "cheerio";
import { BASE_URL } from "../config/constants.js";
import type { PlayerLink } from "../types.js";

const PLAYER_URL_PATTERN =
  /^\/players\/([a-z])\/([a-z0-9]+)\.shtml$/i;

export function parseDirectoryPage(
  html: string,
  directoryLetter: string
): PlayerLink[] {
  const $ = cheerio.load(html);
  const players = new Map<string, PlayerLink>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const name = $(element).text().trim();

    if (!href || !name) {
      return;
    }

    const match = href.match(PLAYER_URL_PATTERN);
    const playerId = match?.[2];

    if (!playerId) {
      return;
    }

    players.set(playerId, {
      id: playerId,
      name,
      url: new URL(href, BASE_URL).toString(),
      directoryLetter
    });
  });

  return [...players.values()];
}
