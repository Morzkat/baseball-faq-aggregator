import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseFaqQuestions } from "../src/parsers/faqParser.js";

describe("parseFaqQuestions", () => {
  it("extracts questions from the commented player fixture", () => {
    const html = fs.readFileSync(
      "tests/fixtures/player-page.html",
      "utf8"
    );

    expect(parseFaqQuestions(html)).toEqual([
      "When was Tal Abernathy born?",
      "How tall was Tal Abernathy?",
      "How many seasons did Tal Abernathy play?"
    ]);
  });

  it("deduplicates questions and ignores answers", () => {
    const html = `
      <div itemscope itemtype="https://schema.org/FAQPage">
        <div itemscope itemprop="mainEntity">
          <h3 itemprop="name">When was Tal Abernathy born?</h3>
          <div itemprop="acceptedAnswer">Tal Abernathy was born in 1921.</div>
        </div>
        <div itemscope itemprop="mainEntity">
          <h3 itemprop="name">When was Tal Abernathy born?</h3>
          <div itemprop="acceptedAnswer">A duplicate answer.</div>
        </div>
        <div itemscope itemprop="mainEntity">
          <h3 itemprop="name">How tall was Tal Abernathy?</h3>
          <div itemprop="acceptedAnswer">Tal Abernathy was 6-2 tall.</div>
        </div>
      </div>
    `;

    expect(parseFaqQuestions(html)).toEqual([
      "When was Tal Abernathy born?",
      "How tall was Tal Abernathy?"
    ]);
  });

  it("uses a heading-based fallback when FAQ markup is absent", () => {
    const html = `
      <section>
        <h2>Frequently Asked Questions</h2>
        <div>
          <h3>When did Tal Abernathy retire?</h3>
          <p>Tal Abernathy last played in 1944.</p>
        </div>
      </section>
    `;

    expect(parseFaqQuestions(html)).toEqual([
      "When did Tal Abernathy retire?"
    ]);
  });
});
