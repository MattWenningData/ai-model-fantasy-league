import { useEffect, useState } from "react";
import type { LeagueData } from "../types";

const BASE = import.meta.env.BASE_URL;

async function loadJson<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE}data/${file}`);
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useLeagueData() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [
          draftPicks,
          rosters,
          standings,
          weeklyTeamScores,
          weeklyLineups,
          playerScores,
          tokenUsage,
          schedule,
        ] = await Promise.all([
          loadJson<LeagueData["draftPicks"]>("draftPicks.json"),
          loadJson<LeagueData["rosters"]>("rosters.json"),
          loadJson<LeagueData["standings"]>("standings.json"),
          loadJson<LeagueData["weeklyTeamScores"]>("weeklyTeamScores.json"),
          loadJson<LeagueData["weeklyLineups"]>("weeklyLineups.json"),
          loadJson<LeagueData["playerScores"]>("playerScores.json"),
          loadJson<LeagueData["tokenUsage"]>("tokenUsage.json"),
          loadJson<LeagueData["schedule"]>("schedule.json"),
        ]);
        if (!cancelled) {
          setData({
            draftPicks,
            rosters,
            standings,
            weeklyTeamScores,
            weeklyLineups,
            playerScores,
            tokenUsage,
            schedule,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}
