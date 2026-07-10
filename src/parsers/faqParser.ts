import * as cheerio from "cheerio";
import {
  cleanText,
  exposeCommentedHtml
} from "../utils/textUtils.js";

function extractQuestions($: cheerio.CheerioAPI): string[] {
  const questions = new Set<string>();

  const addQuestions = (selector: string): void => {
    $(selector).each((_, element) => {
      const text = cleanText($(element).text());

      if (text) {
        questions.add(text);
      }
    });
  };

  addQuestions('[itemprop="mainEntity"] [itemprop="name"]');

  if (questions.size > 0) {
    return [...questions];
  }

  $(
    '[id*="faq"], [id*="FAQ"], [class*="faq"], [class*="FAQ"]'
  ).each((_, container) => {
    $(container)
      .find('[itemprop="name"], h3, h4')
      .each((__, questionElement) => {
        const text = cleanText($(questionElement).text());

        if (text) {
          questions.add(text);
        }
      });
  });

  if (questions.size > 0) {
    return [...questions];
  }

  $("h2, h3, h4").each((_, element) => {
    if (cleanText($(element).text()).toLowerCase() !== "frequently asked questions") {
      return;
    }

    const parent = $(element).parent();
    parent.find("h3, h4").each((__, questionElement) => {
      const text = cleanText($(questionElement).text());

      if (text && text.toLowerCase() !== "frequently asked questions") {
        questions.add(text);
      }
    });
  });

  return [...questions];
}

export function parseFaqQuestions(html: string): string[] {
  const originalDocument = cheerio.load(html);
  const originalQuestions = extractQuestions(originalDocument);

  if (originalQuestions.length > 0) {
    return originalQuestions;
  }

  const uncommentedHtml = exposeCommentedHtml(html);
  const uncommentedDocument = cheerio.load(uncommentedHtml);

  return extractQuestions(uncommentedDocument);
}
