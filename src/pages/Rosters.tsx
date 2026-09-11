import { Link } from "react-router-dom";
import { useLeague } from "../App";

const POS_ORDER: Record<string, number> = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DST: 5 };

export default function Rosters() {
  const { rosters } = useLeague();

  const teams = Array.from(new Set(rosters.map((r) => r.Team)));

  return (
    <div className="page">
      <h1>Rosters</h1>
      <p className="subtitle">Full 15-man rosters as drafted by each model.</p>

      <div className="card-grid">
        {teams.map((team) => {
          const players = rosters
            .filter((r) => r.Team === team)
            .sort((a, b) => (POS_ORDER[a.Pos] ?? 99) - (POS_ORDER[b.Pos] ?? 99));
          return (
            <div className="card roster-card" key={team}>
              <h3>
                <Link to={`/rosters/${encodeURIComponent(team)}`}>{team}</Link>
              </h3>
              <ul className="roster-list">
                {players.map((p) => (
                  <li key={p.OverallPick}>
                    <span className="pos-tag">{p.Pos}</span> {p.Player}
                    <span className="muted"> · {p.NFLTeam}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
