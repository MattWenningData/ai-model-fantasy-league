import type { PlayerScore, RosterEntry, WeeklyLineup } from "../types";

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

function sortRows(rows: PlayerBreakdownRow[]): PlayerBreakdownRow[] {
  return [...rows].sort((a, b) => {
    const aRank = a.slot ? SLOT_ORDER[a.slot] ?? 50 : a.started === false ? 90 : 60;
    const bRank = b.slot ? SLOT_ORDER[b.slot] ?? 50 : b.started === false ? 90 : 60;
    if (aRank !== bRank) return aRank - bRank;
    const aPos = POS_ORDER[a.pos] ?? 99;
    const bPos = POS_ORDER[b.pos] ?? 99;
    if (aPos !== bPos) return aPos - bPos;
    return a.player.localeCompare(b.player);
  });
}

/**
 * Returns a team's full roster breakdown for a given week, sorted with
 * known starters first (in lineup-slot order), then bench players.
 *
 * The Weekly Lineups tab (each model's own start/sit decision) is the
 * source of truth for who started, once it's been filled in for that
 * week. Actual points always come from Player Scores. If Weekly Lineups
 * hasn't been recorded yet for a week, we fall back to whatever Player
 * Scores' LineupSlot/Started fields already know (populated as games are
 * scored), so recently-played-but-undecided weeks still show something.
 */
export function getTeamWeekBreakdown(
  rosters: RosterEntry[],
  weeklyLineups: WeeklyLineup[],
  playerScores: PlayerScore[],
  team: string,
  week: number
): PlayerBreakdownRow[] {
  const lineupRows = weeklyLineups.filter(
    (l) => l.Team === team && l.Week === week && l.Player
  );

  const pointsByPlayer = new Map<string, number>();
  for (const p of playerScores) {
    if (p.Team === team && p.Week === week && typeof p.ActualFantasyPoints === "number") {
      pointsByPlayer.set(p.Player, p.ActualFantasyPoints);
    }
  }

  if (lineupRows.length > 0) {
    const starterSlotByPlayer = new Map<string, string>();
    for (const l of lineupRows) {
      if (l.Player) starterSlotByPlayer.set(l.Player, l.Slot);
    }

    const roster = rosters.filter((r) => r.Team === team);
    const rows: PlayerBreakdownRow[] = roster.map((r) => {
      const slot = starterSlotByPlayer.get(r.Player) ?? null;
      return {
        player: r.Player,
        pos: r.Pos,
        nflTeam: r.NFLTeam,
        slot,
        started: slot !== null,
        points: pointsByPlayer.get(r.Player) ?? null,
      };
    });
    return sortRows(rows);
  }

  // Fallback: no Weekly Lineups decision recorded yet for this week —
  // use whatever Player Scores already knows (post-hoc scoring metadata).
  const rows: PlayerBreakdownRow[] = playerScores
    .filter((p) => p.Team === team && p.Week === week)
    .map((p) => ({
      player: p.Player,
      pos: p.Pos,
      nflTeam: p.NFLTeam,
      slot: p.LineupSlot,
      started: typeof p.Started === "boolean" ? p.Started : null,
      points: typeof p.ActualFantasyPoints === "number" ? p.ActualFantasyPoints : null,
    }));

  return sortRows(rows);
}

export function sumStarterPoints(rows: PlayerBreakdownRow[]): number {
  return rows.filter((r) => r.slot !== null).reduce((sum, r) => sum + (r.points ?? 0), 0);
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
 * that has any recorded data (either a Weekly Lineups decision or a
 * Player Scores entry). */
export function buildLineupHistory(
  rosters: RosterEntry[],
  weeklyLineups: WeeklyLineup[],
  playerScores: PlayerScore[],
  team: string
): WeekLineup[] {
  const weeks = Array.from(
    new Set([
      ...weeklyLineups.filter((l) => l.Team === team && l.Player).map((l) => l.Week),
      ...playerScores.filter((p) => p.Team === team).map((p) => p.Week),
    ])
  ).sort((a, b) => a - b);

  return weeks.map((week) => {
    const rows = getTeamWeekBreakdown(rosters, weeklyLineups, playerScores, team, week);
    const { starters, bench, pending } = groupBreakdown(rows);
    const slots: Record<string, PlayerBreakdownRow | null> = {};
    for (const slotName of SLOT_LIST) {
      slots[slotName] = starters.find((s) => s.slot === slotName) ?? null;
    }
    return { week, slots, bench, pending };
  });
}

export { SLOT_LIST };
