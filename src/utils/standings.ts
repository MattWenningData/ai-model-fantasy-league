import type { Matchup, WeeklyTeamScore } from "../types";

export interface ComputedStanding {
  team: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  gamesPlayed: number;
  avgPoints: number;
}

/** Look up a team's starter points for a given week from Weekly Team Scores. */
function scoreFor(
  scores: WeeklyTeamScore[],
  week: number,
  team: string
): number | null {
  const row = scores.find((s) => s.Week === week && s.Team === team);
  const pts = row?.StarterPoints;
  return typeof pts === "number" ? pts : null;
}

/**
 * Builds head-to-head standings by pairing the schedule with recorded
 * Weekly Team Scores. Matchups without recorded scores for both teams are
 * skipped (not yet played), so this table updates automatically as new
 * weeks are exported from the tracker.
 */
export function computeStandings(
  schedule: Matchup[],
  weeklyScores: WeeklyTeamScore[],
  teams: string[]
): ComputedStanding[] {
  const table: Record<string, ComputedStanding> = {};
  for (const team of teams) {
    table[team] = {
      team,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      gamesPlayed: 0,
      avgPoints: 0,
    };
  }

  for (const m of schedule) {
    const homePts = scoreFor(weeklyScores, m.week, m.homeTeam);
    const awayPts = scoreFor(weeklyScores, m.week, m.awayTeam);
    if (homePts === null || awayPts === null) continue; // not played yet

    const home = table[m.homeTeam];
    const away = table[m.awayTeam];
    if (!home || !away) continue;

    home.pointsFor += homePts;
    home.pointsAgainst += awayPts;
    away.pointsFor += awayPts;
    away.pointsAgainst += homePts;
    home.gamesPlayed += 1;
    away.gamesPlayed += 1;

    if (homePts > awayPts) {
      home.wins += 1;
      away.losses += 1;
    } else if (awayPts > homePts) {
      away.wins += 1;
      home.losses += 1;
    } else {
      home.ties += 1;
      away.ties += 1;
    }
  }

  const rows = Object.values(table).map((row) => ({
    ...row,
    avgPoints: row.gamesPlayed > 0 ? row.pointsFor / row.gamesPlayed : 0,
  }));

  rows.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return rows;
}
