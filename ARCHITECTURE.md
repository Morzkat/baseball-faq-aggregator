# Architecture and Implementation Notes

## Overview

This project is a TypeScript CLI that scrapes Baseball Reference player-directory pages, filters players whose full names contain exactly three letter "a" characters, downloads the matching player pages, extracts FAQ questions and section headers, normalizes the content, and writes the aggregated results to JSON.

The implementation is intentionally modular so each responsibility is isolated and easy to test independently.

## Approach

The workflow follows a simple pipeline:

1. Scrape all directory pages for player links.
2. Filter the discovered players by the exact three-"a" rule.
3. Download and cache matching player pages.
4. Parse FAQ questions and section headers from each player page.
5. Normalize the parsed data so names and casing do not affect uniqueness.
6. Aggregate the results and write them to JSON.

## Architecture

The codebase is organized into clear layers:

- src/app.ts
  - Main orchestration layer for the full workflow.
  - Coordinates scraping, filtering, aggregation, and output writing.

- src/index.ts
  - Minimal CLI entrypoint.
  - Bootstraps the application and handles startup errors.

- src/services/playerPageService.ts
  - Dedicated service for processing matching player pages.
  - Encapsulates the concurrency logic and page-processing flow.

- src/scraper/
  - Handles network access and HTML retrieval.
  - Includes the directory scraper, player-page scraper, and HTTP client.

- src/parsers/
  - Contains HTML parsing logic for directory pages, FAQ content, and section headers.

- src/aggregators/
  - Aggregates FAQ questions and section headers into the final summary structure.

- src/utils/
  - Shared helpers for caching, file I/O, logging, name validation, and text normalization.

- src/types.ts
  - Central TypeScript interfaces and shared data contracts.

## Best Practices Applied

- Separation of concerns
  - Scraping, parsing, aggregation, and orchestration are kept in distinct modules.

- Small, focused functions
  - Utility functions are narrow and reusable.

- Type safety
  - Shared types define the structure of players, scraped pages, aggregation results, and errors.

- Cache-aware execution
  - Downloaded HTML is stored locally to reduce repeated fetches and make reruns more efficient.

- Concurrency control
  - Player-page processing uses bounded concurrency to avoid overwhelming the target site.

- Test-driven reliability
  - Core logic is covered by automated tests to reduce regressions.

## Testing

The project uses Vitest for automated tests.

Coverage includes:

- name filtering logic,
- text normalization utilities,
- directory parsing,
- FAQ parsing,
- FAQ aggregation,
- section-header aggregation,
- caching behavior,
- and HTTP client behavior.

The current verification command is:

```bash
npm test
```

## Build and Run

Run the app:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

## Notes and Limitations

The live run depends on the target site responding reliably. In practice, Baseball Reference can rate-limit requests, so the implementation uses a slower and more conservative request strategy and relies on local caching where possible.

Important edge cases considered in the design include:

- duplicate player links,
- uppercase and lowercase `a` handling,
- middle names and suffixes in the displayed full name,
- duplicate questions on the same page,
- accented characters,
- possessive names,
- curly apostrophes,
- failed requests,
- and partial runs.

If more time were available, the next improvements would include:

- normalizing error messages consistently across the scraper and app layers,
- richer resume support,
- more detailed progress reporting,
- and optional CLI flags for controlling the scrape behavior.
