import { aggregateFaqQuestions } from "./aggregators/faqAggregator.js";
import { aggregateSectionHeaders } from "./aggregators/sectionAggregator.js";
import { OUTPUT_PATH } from "./config/constants.js";
import { scrapeAllDirectories } from "./scraper/directoryScraper.js";
import { processPlayerPages } from "./services/playerPageService.js";
import type { AggregationResult, PlayerLink } from "./types.js";
import { writeJsonFile } from "./utils/fileUtils.js";
import { hasExactlyThreeAs } from "./utils/nameUtils.js";

function filterMatchingPlayers(players: PlayerLink[]): PlayerLink[] {
  return players.filter((player) => hasExactlyThreeAs(player.name));
}

export async function run(): Promise<AggregationResult> {
  const { players, processedPages, errors: directoryErrors } =
    await scrapeAllDirectories();

  console.log(`Discovered ${players.length} players.`);

  const matchingPlayers = filterMatchingPlayers(players);
  console.log(`Found ${matchingPlayers.length} players with exactly three As.`);

  const { playerPages, errors: playerPageErrors } = await processPlayerPages(
    matchingPlayers
  );

  const result: AggregationResult = {
    generatedAt: new Date().toISOString(),
    directoryPagesProcessed: processedPages,
    totalPlayersDiscovered: players.length,
    totalMatchingPlayers: matchingPlayers.length,
    totalPlayerPagesProcessed: playerPages.length,
    playersWithFaqs: playerPages.filter(
      (playerPage) => playerPage.faqQuestions.length > 0
    ).length,
    faqQuestions: aggregateFaqQuestions(playerPages),
    sectionHeaders: aggregateSectionHeaders(playerPages),
    errors: [...directoryErrors, ...playerPageErrors]
  };

  return result;
}

export async function main(): Promise<AggregationResult> {
  console.log("Starting Baseball Reference aggregation...");

  const result = await run();

  await writeJsonFile(OUTPUT_PATH, result);

  console.log(`Unique FAQ questions: ${result.faqQuestions.length}`);
  console.log(`Output written to ${OUTPUT_PATH}`);

  return result;
}
