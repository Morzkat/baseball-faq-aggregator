import type {
  AggregatedQuestion,
  AggregationResult,
  PlayerPageData
} from "../types.js";
import { writeJsonFile } from "../utils/fileUtils.js";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeQuestionText(question: string): string {
  return question
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceNameVariant(text: string, variant: string): string {
  const escapedVariant = escapeRegExp(variant);
  return text.replace(
    new RegExp(`(^|\\s)${escapedVariant}(?=\\s|$|[?.!,;:])`, "g"),
    " player"
  );
}

function replaceNameVariants(text: string, playerName: string): string {
  const variants = getPlayerNameVariants(playerName).map(normalizeName);
  let normalized = text;

  for (const variant of variants) {
    if (!variant) {
      continue;
    }

    normalized = replaceNameVariant(normalized, variant);
  }

  return normalized;
}

export function getPlayerNameVariants(fullName: string): string[] {
  const cleanedName = fullName.replace(/\s+/g, " ").trim();
  const parts = cleanedName.split(" ");
  const lastName = parts.at(-1);

  return [cleanedName, lastName].filter(
    (value): value is string => Boolean(value && value.length > 1)
  );
}

export function normalizeQuestion(
  question: string,
  playerName: string
): string {
  let normalized = normalizeQuestionText(question);
  const normalizedPlayerName = normalizeName(playerName);

  if (!normalizedPlayerName) {
    return normalized;
  }

  normalized = replaceNameVariants(normalized, playerName);

  const punctuation = normalized.match(/[?.!,;:]+$/)?.[0] ?? "";
  const body = normalized.replace(/[?.!,;:]+$/, "").trim();

  return `${body.replace(/\s+/g, " ").trim()}${punctuation}`;
}

export function normalizeFaqQuestion(
  question: string,
  playerName: string
): string {
  return normalizeQuestion(question, playerName);
}

export function aggregateFaqQuestions(
  playerPages: PlayerPageData[]
): AggregatedQuestion[] {
  const aggregated = new Map<string, AggregatedQuestion>();

  for (const { player, faqQuestions } of playerPages) {
    const seenQuestions = new Set<string>();

    for (const question of faqQuestions) {
      const normalizedQuestion = normalizeFaqQuestion(
        question,
        player.name
      );
      const dedupedKey = `${normalizedQuestion}::${player.id}`;

      if (seenQuestions.has(dedupedKey)) {
        continue;
      }

      seenQuestions.add(dedupedKey);

      const existing = aggregated.get(normalizedQuestion);

      if (existing) {
        existing.playerCount += 1;
        existing.displayQuestion = existing.displayQuestion || question;
      } else {
        aggregated.set(normalizedQuestion, {
          normalizedQuestion,
          displayQuestion: question,
          playerCount: 1
        });
      }
    }
  }

  return [...aggregated.values()];
}

export async function writeAggregationResult(
  result: AggregationResult,
  outputPath = "output/results.json"
): Promise<string> {
  await writeJsonFile(outputPath, result);
  return outputPath;
}
