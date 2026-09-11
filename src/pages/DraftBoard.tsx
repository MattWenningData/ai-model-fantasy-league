import { useLeague } from "../App";

export default function DraftBoard() {
  const { draftPicks } = useLeague();

  const rounds = Array.from(new Set(draftPicks.map((p) => p.Round))).sort((a, b) => a - b);
  const teamsBySlot = Array.from(
    new Map(draftPicks.filter((p) => p.Round === 1).map((p) => [p.Slot, p.Team])).entries()
  ).sort((a, b) => a[0] - b[0]);

  const pickAt = (round: number, slot: number) =>
    draftPicks.find((p) => p.Round === round && p.Slot === slot);

  return (
    <div className="page">
      <h1>Draft Board</h1>
      <p className="subtitle">Snake draft, 15 rounds, 10 teams.</p>

      <div className="table-scroll">
        <table className="draft-table">
          <thead>
            <tr>
              <th>Rd</th>
              {teamsBySlot.map(([slot, team]) => (
                <th key={slot}>{team}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round}>
                <td className="round-label">{round}</td>
                {teamsBySlot.map(([slot]) => {
                  const pick = pickAt(round, slot);
                  return (
                    <td key={slot}>
                      {pick ? (
                        <div className="draft-cell">
                          <div className="draft-player">{pick.Player}</div>
                          <div className="draft-meta">
                            {pick.Pos} · {pick.NFLTeam} · #{pick.Overall}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
