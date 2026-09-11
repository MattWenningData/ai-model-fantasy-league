import type { PlayerScore } from "../types";

const SLOT_LIST = ["QB", "RB1", "RB2", "WR1", "WR2", "TE", "FLEX", "K", "DST"];

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

export interface GroupedBreakdown {
  starters: PlayerBreakdownRow[]; // has a confirmed lineup slot
  bench: PlayerBreakdownRow[]; // explicitly not started
  pending: PlayerBreakdownRow[]; // decision not recorded yet
}

/** Splits a team-week breakdown into clearly labeled starters / bench /
 * pending groups so the UI never has to guess from row styling alone. */
export function groupBreakdown(rows: PlayerBreakdownRow[]): GroupedBreakdown {
  const starters: PlayerBreakdownRow[] = [];
  const bench: PlayerBreakdownRow[] = [];
  const pending: PlayerBreakdownRow[] = [];
  for (const r of rows) {
    if (r.slot !== null) starters.push(r);
    else if (r.started === false) bench.push(r);
    else pending.push(r);
  }
  return { starters, bench, pending };
}

export interface WeekLineup {
  week: number;
  slots: Record<string, PlayerBreakdownRow | null>;
  bench: PlayerBreakdownRow[];
  pending: PlayerBreakdownRow[];
}

/** Builds a week-by-week lineup history for a team: which player started in
 * each roster slot, and who was benched / still pending, for every week
 * that has any recorded data. */
export function buildLineupHistory(playerScores: PlayerScore[], team: string): WeekLineup[] {
  const weeks = Array.from(
    new Set(playerScores.filter((p) => p.Team === team).map((p) => p.Week))
  ).sort((a, b) => a - b);

  return weeks.map((week) => {
    const rows = getTeamWeekBreakdown(playerScores, team, week);
    const { starters, bench, pending } = groupBreakdown(rows);
    const slots: Record<string, PlayerBreakdownRow | null> = {};
    for (const slotName of SLOT_LIST) {
      slots[slotName] = starters.find((s) => s.slot === slotName) ?? null;
    }
    return { week, slots, bench, pending };
  });
}

export { SLOT_LIST };
