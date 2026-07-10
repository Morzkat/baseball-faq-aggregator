import * as cheerio from "cheerio";
import { cleanText } from "../utils/textUtils.js";

function extractSectionHeaders($: cheerio.CheerioAPI): string[] {
  const headers = new Set<string>();

  $('h2, h3, h4, [itemprop="name"]').each((_, element) => {
    const text = cleanText($(element).text());

    if (text) {
      headers.add(text);
    }
  });

  return [...headers];
}

export function parseSectionHeaders(html: string): string[] {
  const $ = cheerio.load(html);
  return extractSectionHeaders($);
}
