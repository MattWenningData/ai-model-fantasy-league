import { useMemo, useState } from "react";
import { useLeague } from "../App";

export default function Matchups() {
  const { schedule, weeklyTeamScores } = useLeague();
  const weeks = useMemo(() => Array.from(new Set(schedule.map((m) => m.week))).sort((a, b) => a - b), [schedule]);
  const [week, setWeek] = useState(weeks[0] ?? 1);

  const scoreFor = (w: number, team: string) => {
    const row = weeklyTeamScores.find((s) => s.Week === w && s.Team === team);
    return typeof row?.StarterPoints === "number" ? row.StarterPoints : null;
  };

  const weekMatchups = schedule.filter((m) => m.week === week);

  return (
    <div className="page">
      <h1>Matchups</h1>
      <p className="subtitle">Head-to-head schedule across the 14-week regular season.</p>

      <div className="week-selector">
        {weeks.map((w) => (
          <button
            key={w}
            className={w === week ? "week-btn active" : "week-btn"}
            onClick={() => setWeek(w)}
          >
            Wk {w}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {weekMatchups.map((m, i) => {
          const homePts = scoreFor(m.week, m.homeTeam);
          const awayPts = scoreFor(m.week, m.awayTeam);
          const played = homePts !== null && awayPts !== null;
          const partial = !played && (homePts !== null || awayPts !== null);
          return (
            <div className="card matchup-card" key={i}>
              {partial && <div className="muted" style={{ fontSize: "0.7rem" }}>In progress</div>}
              <div className={played && homePts! > awayPts! ? "matchup-team winner" : "matchup-team"}>
                <span>{m.homeTeam}</span>
                <span className="score">{homePts ?? "—"}</span>
              </div>
              <div className="matchup-divider">vs</div>
              <div className={played && awayPts! > homePts! ? "matchup-team winner" : "matchup-team"}>
                <span>{m.awayTeam}</span>
                <span className="score">{awayPts ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
