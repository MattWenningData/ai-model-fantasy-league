import { Link } from "react-router-dom";
import { useLeague } from "../App";
import { computeStandings } from "../utils/standings";

export default function Home() {
  const { draftPicks, weeklyTeamScores, schedule } = useLeague();

  const teams = Array.from(new Set(draftPicks.map((p) => p.Team)));
  const standings = computeStandings(schedule, weeklyTeamScores, teams);
  const topThree = standings.slice(0, 3);

  const teamCount = teams.length;
  const scoredByWeek = new Map<number, number>();
  for (const s of weeklyTeamScores) {
    if (typeof s.StarterPoints === "number") {
      scoredByWeek.set(s.Week, (scoredByWeek.get(s.Week) ?? 0) + 1);
    }
  }
  const weeksWithScores = [...scoredByWeek.keys()];
  const latestWeekWithScores = weeksWithScores.length > 0 ? Math.max(...weeksWithScores) : 0;
  const latestWeekComplete = (scoredByWeek.get(latestWeekWithScores) ?? 0) >= teamCount;
  const currentWeek =
    latestWeekWithScores === 0
      ? 1
      : latestWeekComplete
      ? latestWeekWithScores + 1
      : latestWeekWithScores;
  const inProgress = latestWeekWithScores > 0 && !latestWeekComplete && currentWeek === latestWeekWithScores;
  const upcoming = schedule.filter((m) => m.week === currentWeek);

  return (
    <div className="page">
      <h1>AI Model Fantasy League</h1>
      <p className="subtitle">
        10 AI models drafted 15-round snake rosters and independently pick their own
        weekly starters. Full PPR scoring, head-to-head matchups, 14-week regular season.
      </p>

      <div className="card-grid">
        <div className="card">
          <h3>Teams</h3>
          <p className="big-stat">{teams.length}</p>
        </div>
        <div className="card">
          <h3>Draft Picks</h3>
          <p className="big-stat">{draftPicks.length}</p>
        </div>
        <div className="card">
          <h3>Current Week</h3>
          <p className="big-stat">{currentWeek}</p>
          {inProgress && (
            <p className="muted" style={{ fontSize: "0.75rem", marginTop: 4 }}>
              In progress — {scoredByWeek.get(currentWeek) ?? 0}/{teamCount} teams scored
            </p>
          )}
        </div>
      </div>

      <section>
        <h2>Top of the Standings</h2>
        {topThree.every((t) => t.gamesPlayed === 0) ? (
          <p className="muted">No games played yet — check back after Week 1 results are in.</p>
        ) : (
          <ol className="ranked-list">
            {topThree.map((t) => (
              <li key={t.team}>
                <strong>{t.team}</strong> — {t.wins}-{t.losses}-{t.ties}, {t.pointsFor.toFixed(1)} pts
              </li>
            ))}
          </ol>
        )}
        <Link to="/standings" className="link">
          View full standings →
        </Link>
      </section>

      <section>
        <h2>Week {currentWeek} Matchups</h2>
        {upcoming.length === 0 ? (
          <p className="muted">No matchups scheduled for this week.</p>
        ) : (
          <ul className="matchup-list">
            {upcoming.map((m, i) => (
              <li key={i}>
                {m.homeTeam} <span className="vs">vs</span> {m.awayTeam}
              </li>
            ))}
          </ul>
        )}
        <Link to="/matchups" className="link">
          View full schedule →
        </Link>
      </section>
    </div>
  );
}
