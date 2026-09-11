import { Link, useParams } from "react-router-dom";
import { useLeague } from "../App";
import { getTeamWeekBreakdown } from "../utils/playerBreakdown";

function TeamColumn({
  team,
  totalPoints,
  playerScores,
}: {
  team: string;
  totalPoints: number | null;
  playerScores: ReturnType<typeof getTeamWeekBreakdown>;
}) {
  return (
    <div className="matchup-detail-col">
      <h2>{team}</h2>
      <p className="big-stat">{totalPoints !== null ? totalPoints.toFixed(1) : "—"}</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Player</th>
            <th>Pos</th>
            <th>Team</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {playerScores.map((r) => (
            <tr key={r.player} className={r.slot ? "started-row" : r.started === false ? "bench-row" : "pending-row"}>
              <td>{r.slot ?? (r.started === false ? "BN" : "—")}</td>
              <td>{r.player}</td>
              <td>{r.pos}</td>
              <td>{r.nflTeam}</td>
              <td>{r.points ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MatchupDetail() {
  const { week, home, away } = useParams<{ week: string; home: string; away: string }>();
  const { weeklyTeamScores, playerScores } = useLeague();

  const weekNum = Number(week);
  const homeTeam = decodeURIComponent(home ?? "");
  const awayTeam = decodeURIComponent(away ?? "");

  const scoreFor = (team: string) => {
    const row = weeklyTeamScores.find((s) => s.Week === weekNum && s.Team === team);
    return typeof row?.StarterPoints === "number" ? row.StarterPoints : null;
  };

  const homeRows = getTeamWeekBreakdown(playerScores, homeTeam, weekNum);
  const awayRows = getTeamWeekBreakdown(playerScores, awayTeam, weekNum);

  return (
    <div className="page">
      <Link to="/matchups" className="link">
        ← Back to matchups
      </Link>
      <h1>
        Week {weekNum}: {homeTeam} vs {awayTeam}
      </h1>
      <p className="subtitle">
        Player-by-player point breakdown. Rows marked with a lineup slot were started; others
        were benched or not yet decided.
      </p>

      <div className="matchup-detail-grid">
        <TeamColumn team={homeTeam} totalPoints={scoreFor(homeTeam)} playerScores={homeRows} />
        <TeamColumn team={awayTeam} totalPoints={scoreFor(awayTeam)} playerScores={awayRows} />
      </div>
    </div>
  );
}
