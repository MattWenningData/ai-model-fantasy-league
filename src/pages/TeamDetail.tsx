import { useParams, Link } from "react-router-dom";
import { useLeague } from "../App";
import { buildLineupHistory, SLOT_LIST } from "../utils/playerBreakdown";

const POS_ORDER: Record<string, number> = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DST: 5 };

export default function TeamDetail() {
  const { team } = useParams<{ team: string }>();
  const { rosters, weeklyTeamScores, playerScores, weeklyLineups } = useLeague();

  const teamName = decodeURIComponent(team ?? "");
  const players = rosters
    .filter((r) => r.Team === teamName)
    .sort((a, b) => (POS_ORDER[a.Pos] ?? 99) - (POS_ORDER[b.Pos] ?? 99));

  const scores = weeklyTeamScores
    .filter((s) => s.Team === teamName)
    .sort((a, b) => a.Week - b.Week);

  const lineupHistory = buildLineupHistory(rosters, weeklyLineups, playerScores, teamName);
  const hasPending = lineupHistory.some((w) => w.pending.length > 0);

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

      {lineupHistory.length > 0 && (
        <section>
          <h2>Lineup History</h2>
          <p className="muted small">
            🟢 Starting slot &nbsp;·&nbsp; ⚪ Bench (confirmed not started){hasPending && " · 🟡 Pending decision"}
          </p>
          <div className="table-scroll">
            <table className="data-table lineup-history-table">
              <thead>
                <tr>
                  <th>Week</th>
                  {SLOT_LIST.map((slot) => (
                    <th key={slot}>{slot}</th>
                  ))}
                  <th>Bench</th>
                  {hasPending && <th>Pending</th>}
                </tr>
              </thead>
              <tbody>
                {lineupHistory.map((w) => (
                  <tr key={w.week}>
                    <td className="round-label">{w.week}</td>
                    {SLOT_LIST.map((slot) => {
                      const p = w.slots[slot];
                      return (
                        <td key={slot} className={p ? "started-row" : "pending-row"}>
                          {p ? (
                            <>
                              {p.player}
                              <span className="muted"> ({p.points ?? "—"})</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                    <td className="bench-row">
                      {w.bench.length === 0
                        ? "—"
                        : w.bench.map((b) => `${b.player} (${b.points ?? "—"})`).join(", ")}
                    </td>
                    {hasPending && (
                      <td className="pending-row">
                        {w.pending.length === 0 ? "—" : w.pending.map((b) => b.player).join(", ")}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
