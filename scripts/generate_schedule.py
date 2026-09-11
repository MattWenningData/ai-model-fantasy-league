"""
Generates a 14-week head-to-head matchup schedule for the 10 fantasy teams
using the circle (round-robin) method, then repeats an early rotation with
home/away flipped to fill out extra weeks beyond the single round-robin (9
weeks for 10 teams).

Outputs public/data/schedule.json
"""
import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"
TEAMS_FILE = OUTPUT_DIR / "draftPicks.json"
TOTAL_WEEKS = 14


def get_teams():
    with open(TEAMS_FILE, encoding="utf-8") as f:
        picks = json.load(f)
    seen = []
    for p in picks:
        t = p.get("Team")
        if t and t not in seen:
            seen.append(t)
    return seen


def round_robin_rounds(teams):
    """Standard circle method. Returns list of rounds; each round is a list
    of (teamA, teamB) pairs. Works for even team counts."""
    n = len(teams)
    fixed = teams[0]
    rotating = teams[1:]
    rounds = []
    for _ in range(n - 1):
        arrangement = [fixed] + rotating
        pairs = []
        for i in range(n // 2):
            pairs.append((arrangement[i], arrangement[n - 1 - i]))
        rounds.append(pairs)
        rotating = rotating[-1:] + rotating[:-1]
    return rounds


def main():
    teams = get_teams()
    n = len(teams)
    base_rounds = round_robin_rounds(teams)  # n-1 rounds (9 for 10 teams)

    schedule = []
    week = 1
    round_idx = 0
    extra_weeks = TOTAL_WEEKS - len(base_rounds)

    # Weeks 1..(n-1): single round robin
    for pairs in base_rounds:
        for home, away in pairs:
            schedule.append({
                "week": week,
                "homeTeam": home,
                "awayTeam": away,
                "homeScore": None,
                "awayScore": None,
            })
        week += 1

    # Extra weeks: reuse early rounds with home/away flipped so every team
    # still gets one matchup per week.
    for i in range(extra_weeks):
        pairs = base_rounds[i % len(base_rounds)]
        for home, away in pairs:
            schedule.append({
                "week": week,
                "homeTeam": away,
                "awayTeam": home,
                "homeScore": None,
                "awayScore": None,
            })
        week += 1

    out_path = OUTPUT_DIR / "schedule.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(schedule, f, indent=2)
    print(f"Wrote {len(schedule)} matchups across {TOTAL_WEEKS} weeks -> {out_path}")


if __name__ == "__main__":
    main()
