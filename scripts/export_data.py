"""
Exports data from the AI Model Fantasy League Tracker.xlsx into JSON files
consumed by the React app (public/data/*.json).

Usage:
    python export_data.py "<path to xlsx>"

If no path is given, defaults to the copy in this repo's scripts folder
expectation: C:\\GHCLI\\AI_Fantasy_League.xlsx
"""
import json
import sys
from pathlib import Path

import openpyxl

DEFAULT_SOURCE = r"C:\GHCLI\AI_Fantasy_League.xlsx"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"


def rows_as_dicts(ws):
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [h if h is not None else f"col{i}" for i, h in enumerate(rows[0])]
    out = []
    for row in rows[1:]:
        if all(v is None for v in row):
            continue
        out.append({headers[i]: row[i] for i in range(len(headers))})
    return out


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(DEFAULT_SOURCE)
    if not source.exists():
        print(f"Source file not found: {source}")
        sys.exit(1)

    wb = openpyxl.load_workbook(source, data_only=True)

    sheet_to_file = {
        "Draft Picks": "draftPicks.json",
        "Rosters": "rosters.json",
        "Weekly Lineups": "weeklyLineups.json",
        "Player Scores": "playerScores.json",
        "Weekly Team Scores": "weeklyTeamScores.json",
        "Standings": "standings.json",
        "Token Usage": "tokenUsage.json",
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for sheet_name, filename in sheet_to_file.items():
        ws = wb[sheet_name]
        data = rows_as_dicts(ws)
        out_path = OUTPUT_DIR / filename
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        print(f"Wrote {len(data)} rows -> {out_path}")

    print("Export complete.")


if __name__ == "__main__":
    main()
