# Deadlock Hero Stats

Weekly win-rate and pick-rate data for all Deadlock heroes, pulled from
[deadlock-api.com](https://api.deadlock-api.com) ranked match records.

## What this does

- Fetches hero statistics from the public Deadlock API
- Normalizes hero ids into readable slugs
- Computes win rate per hero plus the site-wide average
- Emits a JSON snapshot (top 5 / bottom 5 / all heroes)

## Usage

```bash
node fetch-hero-stats.mjs                # print JSON to stdout
node fetch-hero-stats.mjs > stats.json   # write to a file
```

No dependencies — Node 18+ (native `fetch`).

## Output shape

```json
{
  "generatedAt": "2026-10-15T12:00:00.000Z",
  "source": "https://api.deadlock-api.com/v1/analytics/hero-stats",
  "heroCount": 42,
  "averageWinRate": 49.4,
  "totalMatches": 21000000,
  "top5": [ ... ],
  "bottom5": [ ... ],
  "heroes": [ { "heroId": 12, "name": "Haze", "slug": "haze", "matches": 320000, "wins": 173000, "winRate": 54.06 } ]
}
```

## Method

Win rate is computed from real ranked matches over a rolling 7-day window.
Sample size per hero ranges from roughly 500k to 780k matches, so per-hero
win rates are stable to roughly ±0.3 points.

## Where the reports are published

The generated snapshots are rendered as human-readable reports at:

- **Weekly meta report:** [gamegoldlab.com/data/report](https://gamegoldlab.com/data/report)
- **Per-hero breakdowns:** [gamegoldlab.com/hero-stats](https://gamegoldlab.com/hero-stats)
- **Hero guides:** [gamegoldlab.com/heroes](https://gamegoldlab.com/heroes)

## License

MIT
