import type { AggregatedSection, PlayerPageData } from "../types.js";

export function aggregateSectionHeaders(
  playerPages: PlayerPageData[]
): AggregatedSection[] {
  const aggregated = new Map<string, AggregatedSection>();

  for (const { player, sectionHeaders } of playerPages) {
    const seenHeaders = new Set<string>();

    for (const header of sectionHeaders) {
      const normalizedHeader = header.toLowerCase().trim();
      const dedupedKey = `${normalizedHeader}::${player.id}`;

      if (seenHeaders.has(dedupedKey)) {
        continue;
      }

      seenHeaders.add(dedupedKey);

      const existing = aggregated.get(normalizedHeader);

      if (existing) {
        existing.playerCount += 1;
      } else {
        aggregated.set(normalizedHeader, {
          normalizedSection: normalizedHeader,
          displaySection: header,
          playerCount: 1
        });
      }
    }
  }

  return [...aggregated.values()].sort((left, right) => {
    return left.normalizedSection.localeCompare(right.normalizedSection);
  });
}
