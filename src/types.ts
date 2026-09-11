export interface DraftPick {
  Overall: number;
  Round: number;
  Pick: string;
  Slot: number;
  Team: string;
  Player: string;
  Pos: string;
  NFLTeam: string;
}

export interface RosterEntry {
  Team: string;
  ModelID: string;
  DraftSlot: number;
  DraftRound: number;
  OverallPick: number;
  Player: string;
  Pos: string;
  NFLTeam: string;
  CurrentRosterStatus: string;
  Notes: string | null;
}

export interface StandingsRow {
  Team: string;
  ModelID: string;
  TotalPoints: number;
  AverageWeeklyPoints: number | null;
  BestWeek: number | null;
  BestWeekPoints: number | null;
  WorstWeek: number | null;
  WorstWeekPoints: number | null;
  WeeksWon: number;
  CurrentRank: number | null;
  TokenEfficiencyPtsPer1K: number | null;
  Notes: string | null;
}

export interface WeeklyTeamScore {
  Week: number;
  Team: string;
  ModelID: string;
  StarterPoints: number | null;
  BenchPoints: number | null;
  OptimalStarterPoints: number | null;
  PointsLeftOnBench: number | null;
  WeeklyRank: number | null;
  Notes: string | null;
}

export interface WeeklyLineup {
  Week: number;
  Team: string;
  ModelID: string;
  Slot: string;
  Player: string | null;
  Pos: string | null;
  NFLTeam: string | null;
  Opponent: string | null;
  ProjectedPoints: number | null;
  StartConfidence: number | null;
  DecisionRationale: string | null;
  InjuryStatus: string | null;
  NewsSnapshot: string | null;
  DecisionTimestamp: string | null;
  EstimatedInputTokens: number | null;
  EstimatedOutputTokens: number | null;
  DecisionModel: string;
}

export interface PlayerScore {
  Week: number;
  Team: string;
  Player: string;
  Pos: string;
  NFLTeam: string;
  LineupSlot: string | null;
  Started: boolean | string | null;
  ActualFantasyPoints: number | null;
  PassingYards: number | null;
  PassingTD: number | null;
  Interceptions: number | null;
  RushingYards: number | null;
  RushingTD: number | null;
  Receptions: number | null;
  ReceivingYards: number | null;
  ReceivingTD: number | null;
  FumblesLost: number | null;
  KickingPoints: number | null;
  DSTPoints: number | null;
  ScoringSource: string | null;
  ScoredTimestamp: string | null;
}

export interface TokenUsageRow {
  Week: number;
  Team: string;
  ModelID: string;
  LineupInputTokens: number | null;
  LineupOutputTokens: number | null;
  TotalLineupTokens: number | null;
  ScoringOrAnalysisTokens: number | null;
  WeeklyStarterPoints: number | null;
  PointsPer1KLineupTokens: number | null;
  Notes: string | null;
}

export interface Matchup {
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface LeagueData {
  draftPicks: DraftPick[];
  rosters: RosterEntry[];
  standings: StandingsRow[];
  weeklyTeamScores: WeeklyTeamScore[];
  weeklyLineups: WeeklyLineup[];
  playerScores: PlayerScore[];
  tokenUsage: TokenUsageRow[];
  schedule: Matchup[];
}
