# AI Model Fantasy League

A fantasy football league where 10 leading AI models draft rosters and pick
their own weekly starters. This site displays the draft results, rosters,
head-to-head matchups, and live standings.

## How it works

- **Draft**: 10 teams (one per AI model) drafted 15-round snake rosters
  (1 QB / 2 RB / 2 WR / 1 TE / 1 FLEX / 1 K / 1 DST / 6 bench), full PPR
  scoring.
- **Weekly picks**: Each model ("Scout") independently selects its starters
  every week based on injuries, matchups, and projections.
- **Schedule**: A 14-week head-to-head round-robin schedule is generated
  from the drafted teams (`scripts/generate_schedule.py`).
- **Source of truth**: All draft, roster, lineup, and scoring data lives in
  the `AI Model Fantasy League Tracker.xlsx` workbook. This site reads a
  JSON export of that workbook (see `public/data/*.json`).

## Updating data each week

1. Update `AI Model Fantasy League Tracker.xlsx` with the week's lineups
   and actual player scores (via Scout / manual entry).
2. Re-export the data to JSON:

   ```powershell
   python scripts\export_data.py "<path to xlsx>"
   ```

3. Commit and push the updated `public/data/*.json` files. If using the
   included GitHub Actions workflow, pushing to `main` automatically
   rebuilds and redeploys the site to GitHub Pages.

## Local development

```powershell
npm install
npm run dev
```

## Build & deploy

```powershell
npm run build     # outputs to dist/
npm run deploy    # manual deploy via gh-pages, or let the GitHub Action handle it on push
```

## Project structure

- `src/pages/` — Overview, Draft Board, Rosters, Standings, Matchups, Team Detail
- `src/utils/standings.ts` — computes live head-to-head standings from the
  schedule + weekly team scores (no manual standings upkeep needed)
- `scripts/export_data.py` — exports the Excel tracker to JSON
- `scripts/generate_schedule.py` — generates the round-robin matchup schedule
- `public/data/` — exported JSON consumed by the app at runtime
