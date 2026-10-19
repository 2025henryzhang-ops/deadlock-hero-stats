#!/usr/bin/env node
/**
 * Pull Deadlock hero win-rate statistics from the public deadlock-api.com and
 * emit a normalized JSON snapshot.
 *
 * The hero-stats endpoint only returns numeric hero ids, so we also fetch
 * /v1/assets/heroes to resolve ids into readable names and slugs.
 *
 * Usage:
 *   node fetch-hero-stats.mjs                 # print JSON to stdout
 *   node fetch-hero-stats.mjs > stats.json    # write to a file
 */

const BASE = "https://api.deadlock-api.com/v1";
const STATS_URL = `${BASE}/analytics/hero-stats`;
const ASSETS_URL = `${BASE}/assets/heroes`;

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

async function main() {
  const [rows, assets] = await Promise.all([getJson(STATS_URL), getJson(ASSETS_URL)]);

  // id -> { name, slug }, keeping only heroes players can actually pick.
  const byId = new Map();
  for (const a of assets) {
    if (a.player_selectable === false) continue;
    if (!a.name) continue;
    byId.set(a.id, { name: a.name, slug: slugify(a.name) });
  }

  const heroes = rows
    .map((r) => {
      const meta = byId.get(r.hero_id) ?? { name: null, slug: null };
      const matches = Number(r.matches ?? 0);
      const wins = Number(r.wins ?? 0);
      return {
        heroId: r.hero_id,
        name: meta.name,
        slug: meta.slug,
        matches,
        wins,
        winRate: matches > 0 ? +((wins / matches) * 100).toFixed(2) : null,
      };
    })
    .filter((h) => h.name !== null) // drop entries we could not resolve
    .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));

  const rated = heroes.filter((h) => h.winRate !== null);
  const averageWinRate = rated.length
    ? +(rated.reduce((s, h) => s + h.winRate, 0) / rated.length).toFixed(2)
    : null;

  const brief = (h) => ({ name: h.name, slug: h.slug, wins: h.wins, matches: h.matches, winRate: h.winRate });

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: STATS_URL,
        heroCount: heroes.length,
        averageWinRate,
        totalMatches: heroes.reduce((s, h) => s + h.matches, 0),
        top5: heroes.slice(0, 5).map(brief),
        bottom5: heroes.slice(-5).map(brief),
        heroes,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error("failed:", e.message);
  process.exit(1);
});
