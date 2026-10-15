import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { hybridSearch } from "@/lib/search";
import { docById } from "@/lib/data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Hybrid Search — Insight Refinery" },
      { name: "description", content: "BM25 lexical plus dense vector search with re-ranking and bounding-box citations." },
      { property: "og:title", content: "Hybrid Search — Insight Refinery" },
      { property: "og:description", content: "Hybrid retrieval with re-ranking scores and source traceability." },
    ],
  }),
  component: SearchPage,
});

const examples = ["free cash flow guidance", "share repurchase", "tariff risk supply chain", "oncology pipeline peak sales", "operating margin"];

function SearchPage() {
  const [q, setQ] = useState(examples[0]);
  const [alpha, setAlpha] = useState(0.5);
  const hits = useMemo(() => hybridSearch(q, alpha), [q, alpha]);
  const [selId, setSelId] = useState<string | null>(null);
  const sel = hits.find((h) => h.chunk.id === selId) ?? hits[0];

  return (
    <>
      <PageHeader eyebrow="Stage 3 · Deliver" title="Hybrid Search & Traceability" desc="Lexical BM25 and dense vector retrieval fused and re-ranked. Every answer resolves to a cited page and bounding box in the source document." />
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setSelId(null); }} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="Search refined documents…" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {examples.map((e) => <button key={e} onClick={() => { setQ(e); setSelId(null); }} className="rounded-full border px-2.5 py-1 hover:bg-muted">{e}</button>)}
        <div className="ml-auto flex items-center gap-2 text-muted-foreground">
          Dense <input type="range" min={0} max={1} step={0.05} value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="accent-[var(--primary)]" /> Lexical
          <span className="font-mono text-foreground">α={alpha.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-3">
          {hits.map((h, i) => (
            <button key={h.chunk.id} onClick={() => setSelId(h.chunk.id)} className={`block w-full rounded-lg border bg-card p-4 text-left hover:border-primary ${sel?.chunk.id === h.chunk.id ? "border-primary ring-1 ring-primary" : ""}`}>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-muted-foreground">#{i + 1}</span>
                <span className="font-medium">{docById(h.chunk.docId)?.title}</span>
              </div>
              <p className="mt-1.5 text-sm">{h.chunk.text}</p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[11px]">
                {[["BM25", h.bm25, 6], ["Dense cos", h.dense, 1], ["Re-rank", h.rerank, 1]].map(([l, v, m]) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-muted-foreground"><span>{l}</span><span className="font-mono text-foreground">{(v as number).toFixed(3)}</span></div>
                    <div className="mt-1 h-1.5 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${Math.min(100, ((v as number) / (m as number)) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </button>
          ))}
          {!hits.length && <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">No matches.</div>}
        </div>

        <Panel title="Citation & source trace" className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
          {sel ? (
            <>
              <div className="text-xs text-muted-foreground">{sel.chunk.docId} · {sel.chunk.section}</div>
              <div className="relative mx-auto mt-3 aspect-[8.5/11] w-full max-w-xs rounded border bg-card">
                <div className="absolute inset-0 space-y-2 p-5">{Array.from({ length: 30 }).map((_, i) => <div key={i} className="h-1.5 rounded bg-muted" style={{ width: `${50 + ((i * 41) % 48)}%` }} />)}</div>
                <div className="absolute rounded-sm border-2 border-primary bg-primary/15" style={{ left: `${(sel.chunk.bbox[0] / 612) * 100}%`, top: `${(sel.chunk.bbox[1] / 792) * 100}%`, width: `${((sel.chunk.bbox[2] - sel.chunk.bbox[0]) / 612) * 100}%`, height: `${((sel.chunk.bbox[3] - sel.chunk.bbox[1]) / 792) * 100}%` }} />
                <div className="absolute bottom-2 right-2 font-mono text-[10px] text-muted-foreground">p.{sel.chunk.page}</div>
              </div>
              <pre className="mt-3 overflow-x-auto rounded bg-muted/60 p-3 font-mono text-[11px]">{JSON.stringify({ chunk_id: sel.chunk.id, document_id: sel.chunk.docId, page: sel.chunk.page, bbox: sel.chunk.bbox, as_of: docById(sel.chunk.docId)?.validFrom }, null, 2)}</pre>
              <div className="mt-2 flex flex-wrap gap-1">{sel.chunk.entities.map((e) => <Pill key={e}>{e}</Pill>)}</div>
            </>
          ) : <div className="text-sm text-muted-foreground">Select a result.</div>}
        </Panel>
      </div>
    </>
  );
}
