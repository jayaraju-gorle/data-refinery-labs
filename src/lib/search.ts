import { chunks, type Chunk } from "./data";

const tok = (s: string) => s.toLowerCase().match(/[a-z0-9.$%]+/g) ?? [];

// Lightweight BM25 over mock chunks + a deterministic pseudo "dense" score
// from synonym-expanded overlap, then reciprocal-rank-fusion style re-ranking.
const syn: Record<string, string[]> = {
  cash: ["liquidity", "fcf", "flow"], guidance: ["outlook", "raising", "forecast"], margin: ["profitability", "operating"],
  buyback: ["repurchase"], repurchase: ["buyback"], risk: ["tariffs", "adversely"], revenue: ["sales", "growth"], pipeline: ["oncology", "asset"],
};

export interface Hit { chunk: Chunk; bm25: number; dense: number; rerank: number }

export function hybridSearch(q: string, alpha = 0.5): Hit[] {
  const qt = tok(q);
  if (!qt.length) return [];
  const docsT = chunks.map((c) => tok(c.text + " " + c.section));
  const avg = docsT.reduce((a, d) => a + d.length, 0) / docsT.length;
  const N = chunks.length;
  const bm = docsT.map((d) => qt.reduce((s, t) => {
    const n = docsT.filter((x) => x.includes(t)).length;
    if (!n) return s;
    const f = d.filter((x) => x === t).length;
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
    return s + idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.length / avg))));
  }, 0));
  const expanded = new Set(qt.flatMap((t) => [t, ...(syn[t] ?? [])]));
  const dense = docsT.map((d, i) => {
    const hits = d.filter((x) => expanded.has(x)).length;
    return Math.min(0.99, 0.35 + hits / (d.length * 0.35) + ((i * 7) % 5) / 100);
  });
  const maxBm = Math.max(...bm, 1e-6);
  return chunks
    .map((chunk, i) => {
      const b = bm[i] / maxBm;
      return { chunk, bm25: bm[i], dense: dense[i], rerank: alpha * b + (1 - alpha) * dense[i] };
    })
    .filter((h) => h.bm25 > 0 || h.dense > 0.5)
    .sort((a, b) => b.rerank - a.rerank);
}
