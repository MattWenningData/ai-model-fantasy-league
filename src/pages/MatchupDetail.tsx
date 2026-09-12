import { Link, useParams } from "react-router-dom";
import { useLeague } from "../App";
import { getTeamWeekBreakdown, groupBreakdown, type PlayerBreakdownRow } from "../utils/playerBreakdown";

function PlayerTable({ rows, showSlot }: { rows: PlayerBreakdownRow[]; showSlot: boolean }) {
  if (rows.length === 0) {
    return <p className="muted small">None</p>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          {showSlot && <th>Slot</th>}
          <th>Player</th>
          <th>Pos</th>
          <th>Team</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.player}>
            {showSlot && <td>{r.slot}</td>}
            <td>{r.player}</td>
            <td>{r.pos}</td>
            <td>{r.nflTeam}</td>
            <td>{r.points ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TeamColumn({
  team,
  totalPoints,
  playerScores,
}: {
  team: string;
  totalPoints: number | null;
  playerScores: ReturnType<typeof getTeamWeekBreakdown>;
}) {
  const { starters, bench, pending } = groupBreakdown(playerScores);

  return (
    <div className="matchup-detail-col">
      <h2>{team}</h2>
      <p className="big-stat">{totalPoints !== null ? totalPoints.toFixed(1) : "—"}</p>

      <h3 className="section-label starting">🟢 Starting Lineup</h3>
      <PlayerTable rows={starters} showSlot />

      <h3 className="section-label bench">⚪ Bench</h3>
      <PlayerTable rows={bench} showSlot={false} />

      {pending.length > 0 && (
        <>
          <h3 className="section-label pending">🟡 Pending Decision</h3>
          <PlayerTable rows={pending} showSlot={false} />
        </>
      )}
    </div>
  );
}

export default function MatchupDetail() {
  const { week, home, away } = useParams<{ week: string; home: string; away: string }>();
  const { weeklyTeamScores, playerScores, rosters, weeklyLineups } = useLeague();

  const weekNum = Number(week);
  const homeTeam = decodeURIComponent(home ?? "");
  const awayTeam = decodeURIComponent(away ?? "");

  const scoreFor = (team: string) => {
    const row = weeklyTeamScores.find((s) => s.Week === weekNum && s.Team === team);
    return typeof row?.StarterPoints === "number" ? row.StarterPoints : null;
  };

  const homeRows = getTeamWeekBreakdown(rosters, weeklyLineups, playerScores, homeTeam, weekNum);
  const awayRows = getTeamWeekBreakdown(rosters, weeklyLineups, playerScores, awayTeam, weekNum);

  return (
    <div className="page">
      <Link to="/matchups" className="link">
        ← Back to matchups
      </Link>
      <h1>
        Week {weekNum}: {homeTeam} vs {awayTeam}
      </h1>
      <p className="subtitle">
        Player-by-player point breakdown, split clearly into starting lineup, bench, and any
        players still awaiting a lineup decision.
      </p>

      <div className="matchup-detail-grid">
        <TeamColumn team={homeTeam} totalPoints={scoreFor(homeTeam)} playerScores={homeRows} />
        <TeamColumn team={awayTeam} totalPoints={scoreFor(awayTeam)} playerScores={awayRows} />
      </div>
    </div>
  );
}
