# Baseball FAQ Aggregator

A TypeScript CLI that scrapes Baseball Reference player directories, filters players whose full name contains exactly three letter "a" characters, downloads matching player pages, extracts FAQ questions, aggregates them by normalized question, and writes the results to JSON.

## Features

- Scrapes all Baseball Reference player directory pages
- Filters players by the exact three-"a" rule
- Caches downloaded HTML in the local cache folders
- Parses FAQ questions from player pages
- Normalizes FAQ text so player names and casing do not affect uniqueness
- Writes aggregated output to JSON

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Usage

Run the full workflow:

```bash
npm run dev
```

This writes the generated report to:

```text
output/results.json
```

## Testing

Run the test suite:

```bash
npm test
```

## Approach & Notes

The project uses a modular TypeScript workflow:

- directory pages are scraped and parsed into player links,
- matching players are filtered by the exact three-"a" rule,
- player pages are fetched and cached locally,
- FAQ questions and section headers are parsed and normalized,
- the final aggregation is written to JSON for inspection.

The implementation is intentionally cache-aware so repeated runs can reuse previously downloaded pages and avoid re-scraping everything. In practice, Baseball Reference can rate-limit live requests, so the full end-to-end run may take longer or may need to rely on cached HTML for some pages. If more time were available, the next improvements would be adding more graceful resume behavior, richer logging, and optional CLI flags for limiting or skipping network fetches.

## Project Structure

- src/index.ts - main entry point
- src/scraper - directory and player page scraping
- src/parsers - HTML parsing logic
- src/aggregators - FAQ aggregation and JSON output
- src/utils - helpers for caching, names, and text normalization
- tests - Vitest test coverage
