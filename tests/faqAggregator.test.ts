import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  aggregateFaqQuestions,
  getPlayerNameVariants,
  normalizeFaqQuestion,
  normalizeQuestion,
  writeAggregationResult
} from "../src/aggregators/faqAggregator.js";
import type { AggregationResult, PlayerPageData } from "../src/types.js";

describe("getPlayerNameVariants", () => {
  it("returns full and last-name forms for normalization", () => {
    expect(getPlayerNameVariants("Tal Abernathy")).toEqual([
      "Tal Abernathy",
      "Abernathy"
    ]);
  });
});

describe("normalizeQuestion", () => {
  it("normalizes player names and punctuation so similar questions collapse", () => {
    expect(
      normalizeQuestion("When was Tal Abernathy born?", "Tal Abernathy")
    ).toBe("when was player born?");
    expect(
      normalizeQuestion("When was Bob Smith born?", "Bob Smith")
    ).toBe("when was player born?");
  });
});

describe("normalizeFaqQuestion", () => {
  it("normalizes player names and casing so similar questions collapse", () => {
    expect(
      normalizeFaqQuestion("When was Tal Abernathy born?", "Tal Abernathy")
    ).toBe("when was player born?");
    expect(
      normalizeFaqQuestion("When was Bob Smith born?", "Bob Smith")
    ).toBe("when was player born?");
  });
});

describe("aggregateFaqQuestions", () => {
  it("counts each normalized question once per player and aggregates players across pages", () => {
    const playerPages: PlayerPageData[] = [
      {
        player: {
          id: "abernte01",
          name: "Tal Abernathy",
          url: "https://example.com/abernte01",
          directoryLetter: "a"
        },
        faqQuestions: [
          "When was Tal Abernathy born?",
          "When was Tal Abernathy born?",
          "How tall was Tal Abernathy?"
        ],
        sectionHeaders: []
      },
      {
        player: {
          id: "smithjo01",
          name: "Bob Smith",
          url: "https://example.com/smithjo01",
          directoryLetter: "s"
        },
        faqQuestions: [
          "When was Bob Smith born?",
          "How tall was Bob Smith?"
        ],
        sectionHeaders: []
      }
    ];

    expect(aggregateFaqQuestions(playerPages)).toEqual([
      {
        normalizedQuestion: "when was player born?",
        displayQuestion: "When was Tal Abernathy born?",
        playerCount: 2
      },
      {
        normalizedQuestion: "how tall was player?",
        displayQuestion: "How tall was Tal Abernathy?",
        playerCount: 2
      }
    ]);
  });
});

describe("writeAggregationResult", () => {
  it("writes the aggregation result to disk as JSON", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "faq-agg-"));
    const outputPath = path.join(tempDir, "results.json");
    const result: AggregationResult = {
      generatedAt: "2026-07-10T00:00:00.000Z",
      directoryPagesProcessed: 1,
      totalPlayersDiscovered: 2,
      totalMatchingPlayers: 2,
      totalPlayerPagesProcessed: 2,
      playersWithFaqs: 2,
      faqQuestions: [
        {
          normalizedQuestion: "when was player born",
          displayQuestion: "When was Tal Abernathy born?",
          playerCount: 2
        }
      ],
      errors: []
    };

    await writeAggregationResult(result, outputPath);

    const written = JSON.parse(await fs.readFile(outputPath, "utf8"));

    expect(written).toEqual(result);
  });

  it("writes the recommended aggregation shape with the documented fields", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "faq-agg-"));
    const outputPath = path.join(tempDir, "results.json");
    const result: AggregationResult = {
      generatedAt: "2026-07-10T00:00:00.000Z",
      directoryPagesProcessed: 3,
      totalPlayersDiscovered: 10,
      totalMatchingPlayers: 4,
      totalPlayerPagesProcessed: 4,
      playersWithFaqs: 2,
      faqQuestions: [
        {
          normalizedQuestion: "when was player born?",
          displayQuestion: "When was Tal Abernathy born?",
          playerCount: 2
        }
      ],
      sectionHeaders: [
        {
          normalizedSection: "bio",
          displaySection: "Bio",
          playerCount: 1
        }
      ],
      errors: []
    };

    await writeAggregationResult(result, outputPath);

    const written = JSON.parse(await fs.readFile(outputPath, "utf8"));

    expect(written).toMatchObject({
      generatedAt: result.generatedAt,
      directoryPagesProcessed: result.directoryPagesProcessed,
      totalPlayersDiscovered: result.totalPlayersDiscovered,
      totalMatchingPlayers: result.totalMatchingPlayers,
      totalPlayerPagesProcessed: result.totalPlayerPagesProcessed,
      playersWithFaqs: result.playersWithFaqs,
      faqQuestions: result.faqQuestions,
      sectionHeaders: result.sectionHeaders,
      errors: result.errors
    });
  });
});
