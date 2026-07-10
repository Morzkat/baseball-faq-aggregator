import type { PlayerLink, PlayerPageData } from "../types.js";
import { parseFaqQuestions } from "../parsers/faqParser.js";
import { parseSectionHeaders } from "../parsers/sectionParser.js";
import {
  getPlayerCachePath
} from "../utils/fileCache.js";
import { getHtml } from "./httpClient.js";

export async function scrapePlayerPage(
  player: PlayerLink
): Promise<PlayerPageData> {
  const cachePath = getPlayerCachePath(player.id);
  const html = await getHtml(player.url, cachePath);
  const faqQuestions = parseFaqQuestions(html);
  const sectionHeaders = parseSectionHeaders(html);

  return {
    player,
    faqQuestions,
    sectionHeaders
  };
}
