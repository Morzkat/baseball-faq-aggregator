import { describe, expect, it } from "vitest";
import { aggregateSectionHeaders } from "../src/aggregators/sectionAggregator.js";
import type { PlayerPageData } from "../src/types.js";

describe("aggregateSectionHeaders", () => {
  it("counts section headers once per player and aggregates them across pages", () => {
    const playerPages: PlayerPageData[] = [
      {
        player: {
          id: "abernte01",
          name: "Tal Abernathy",
          url: "https://example.com/abernte01",
          directoryLetter: "a"
        },
        faqQuestions: [],
        sectionHeaders: ["Biography", "Career", "Biography"]
      },
      {
        player: {
          id: "smithjo01",
          name: "Bob Smith",
          url: "https://example.com/smithjo01",
          directoryLetter: "s"
        },
        faqQuestions: [],
        sectionHeaders: ["Career", "Awards"]
      }
    ];

    expect(aggregateSectionHeaders(playerPages)).toEqual([
      {
        normalizedSection: "awards",
        displaySection: "Awards",
        playerCount: 1
      },
      {
        normalizedSection: "biography",
        displaySection: "Biography",
        playerCount: 1
      },
      {
        normalizedSection: "career",
        displaySection: "Career",
        playerCount: 2
      }
    ]);
  });
});
