export interface PlayerLink {
  id: string;
  name: string;
  url: string;
  directoryLetter: string;
}

export interface PlayerPageData {
  player: PlayerLink;
  faqQuestions: string[];
  sectionHeaders: string[];
}

export interface AggregatedQuestion {
  normalizedQuestion: string;
  displayQuestion: string;
  playerCount: number;
}

export interface AggregatedSection {
  normalizedSection: string;
  displaySection: string;
  playerCount: number;
}

export interface ScrapeError {
  url: string;
  playerName?: string;
  message: string;
}

export interface AggregationResult {
  generatedAt: string;
  directoryPagesProcessed: number;
  totalPlayersDiscovered: number;
  totalMatchingPlayers: number;
  totalPlayerPagesProcessed: number;
  playersWithFaqs: number;
  faqQuestions: AggregatedQuestion[];
  sectionHeaders?: AggregatedSection[];
  errors: ScrapeError[];
}
