import type { PlayerScore } from "../types";

const SLOT_ORDER: Record<string, number> = {
  QB: 0,
  RB1: 1,
  RB2: 2,
  WR1: 3,
  WR2: 4,
  TE: 5,
  FLEX: 6,
  K: 7,
  DST: 8,
};

const POS_ORDER: Record<string, number> = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DST: 5 };

export interface PlayerBreakdownRow {
  player: string;
  pos: string;
  nflTeam: string;
  slot: string | null;
  started: boolean | null;
  points: number | null;
}

/** Returns a team's full roster breakdown for a given week, sorted with
 * known starters first (in lineup-slot order), then bench/pending players. */
export function getTeamWeekBreakdown(
  playerScores: PlayerScore[],
  team: string,
  week: number
): PlayerBreakdownRow[] {
  const rows = playerScores
    .filter((p) => p.Team === team && p.Week === week)
    .map((p) => ({
      player: p.Player,
      pos: p.Pos,
      nflTeam: p.NFLTeam,
      slot: p.LineupSlot,
      started: typeof p.Started === "boolean" ? p.Started : null,
      points: typeof p.ActualFantasyPoints === "number" ? p.ActualFantasyPoints : null,
    }));

  rows.sort((a, b) => {
    const aRank = a.slot ? SLOT_ORDER[a.slot] ?? 50 : a.started === false ? 90 : 60;
    const bRank = b.slot ? SLOT_ORDER[b.slot] ?? 50 : b.started === false ? 90 : 60;
    if (aRank !== bRank) return aRank - bRank;
    const aPos = POS_ORDER[a.pos] ?? 99;
    const bPos = POS_ORDER[b.pos] ?? 99;
    if (aPos !== bPos) return aPos - bPos;
    return a.player.localeCompare(b.player);
  });

  return rows;
}

export function sumStarterPoints(rows: PlayerBreakdownRow[]): number {
  return rows
    .filter((r) => r.slot !== null)
    .reduce((sum, r) => sum + (r.points ?? 0), 0);
}
