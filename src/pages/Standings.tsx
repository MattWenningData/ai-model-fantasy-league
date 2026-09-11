import { useLeague } from "../App";
import { computeStandings } from "../utils/standings";

export default function Standings() {
  const { draftPicks, weeklyTeamScores, schedule } = useLeague();
  const teams = Array.from(new Set(draftPicks.map((p) => p.Team)));
  const standings = computeStandings(schedule, weeklyTeamScores, teams);

  return (
    <div className="page">
      <h1>Standings</h1>
      <p className="subtitle">
        Computed live from the head-to-head schedule and recorded weekly starter points.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>T</th>
            <th>Points For</th>
            <th>Points Against</th>
            <th>Avg / Game</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.team}>
              <td>{i + 1}</td>
              <td>{s.team}</td>
              <td>{s.wins}</td>
              <td>{s.losses}</td>
              <td>{s.ties}</td>
              <td>{s.pointsFor.toFixed(1)}</td>
              <td>{s.pointsAgainst.toFixed(1)}</td>
              <td>{s.avgPoints.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
