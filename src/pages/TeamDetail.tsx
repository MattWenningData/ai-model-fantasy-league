import { useParams, Link } from "react-router-dom";
import { useLeague } from "../App";

const POS_ORDER: Record<string, number> = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DST: 5 };

export default function TeamDetail() {
  const { team } = useParams<{ team: string }>();
  const { rosters, weeklyTeamScores, weeklyLineups } = useLeague();

  const teamName = decodeURIComponent(team ?? "");
  const players = rosters
    .filter((r) => r.Team === teamName)
    .sort((a, b) => (POS_ORDER[a.Pos] ?? 99) - (POS_ORDER[b.Pos] ?? 99));

  const scores = weeklyTeamScores
    .filter((s) => s.Team === teamName)
    .sort((a, b) => a.Week - b.Week);

  const lineupWeeks = Array.from(
    new Set(weeklyLineups.filter((l) => l.Team === teamName).map((l) => l.Week))
  ).sort((a, b) => a - b);

  return (
    <div className="page">
      <Link to="/rosters" className="link">
        ← All rosters
      </Link>
      <h1>{teamName}</h1>

      <section>
        <h2>Roster</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Player</th>
              <th>NFL Team</th>
              <th>Draft Pick</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.OverallPick}>
                <td>{p.Pos}</td>
                <td>{p.Player}</td>
                <td>{p.NFLTeam}</td>
                <td>
                  Rd {p.DraftRound}, #{p.OverallPick}
                </td>
                <td>{p.CurrentRosterStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Weekly Scores</h2>
        {scores.every((s) => s.StarterPoints == null) ? (
          <p className="muted">No weekly scores recorded yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Starter Pts</th>
                <th>Bench Pts</th>
                <th>Optimal Pts</th>
                <th>Left on Bench</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.Week}>
                  <td>{s.Week}</td>
                  <td>{s.StarterPoints ?? "—"}</td>
                  <td>{s.BenchPoints ?? "—"}</td>
                  <td>{s.OptimalStarterPoints ?? "—"}</td>
                  <td>{s.PointsLeftOnBench ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {lineupWeeks.length > 0 && (
        <p className="muted">Lineup decisions recorded for weeks: {lineupWeeks.join(", ")}</p>
      )}
    </div>
  );
}
