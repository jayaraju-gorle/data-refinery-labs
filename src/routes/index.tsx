import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Inbox, Layers, ShieldCheck, Search, Bot, Send } from "lucide-react";
import { PageHeader, Panel } from "@/components/AppShell";
import { docs, exceptions } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Insight Refinery" },
      { name: "description", content: "End-to-end document lifecycle: sourcing, refinement, curation and AI-ready delivery." },
      { property: "og:title", content: "Overview — Insight Refinery" },
      { property: "og:description", content: "End-to-end document lifecycle from ingestion to agentic consumption." },
    ],
  }),
  component: Overview,
});

const stages = [
  { to: "/ingestion", icon: Inbox, n: "01", t: "Source & Ingest", d: "Filings, transcripts, statements, research, news via API, SFTP, RSS, web." },
  { to: "/refinery", icon: Layers, n: "02", t: "Parse & Enrich", d: "Layout-aware parsing, OCR, chunking, entity resolution, JSON contracts." },
  { to: "/curation", icon: ShieldCheck, n: "03", t: "Curate (HITL)", d: "Exception routing for low-confidence extractions with full audit trail." },
  { to: "/search", icon: Search, n: "04", t: "Retrieve", d: "Hybrid BM25 + dense vectors, re-ranking, cited bounding boxes." },
  { to: "/agents", icon: Bot, n: "05", t: "Serve Agents", d: "MCP tools for LLMs and autonomous agents to consume the refinery." },
  { to: "/delivery", icon: Send, n: "06", t: "Deliver", d: "Spreadsheet & data-toolkit exports, event webhooks to workflows." },
] as const;

const kpis = [
  ["Documents refined (24h)", "184,302", "+6.2%"],
  ["Median ingest → ready", "3m 41s", "−22s"],
  ["Parsing accuracy", "98.4%", "+0.3pt"],
  ["Search nDCG@10", "0.812", "+0.024"],
  ["HITL straight-through", "96.1%", "+1.1pt"],
  ["Agent tool calls (24h)", "1.27M", "+18%"],
];

function Overview() {
  const flow = [62, 71, 58, 80, 77, 90, 85, 94, 88, 99, 104, 97, 110, 118];
  const max = Math.max(...flow);
  return (
    <>
      <PageHeader eyebrow="Platform overview" title="Document Refinery — end-to-end lifecycle" desc="Unstructured financial content becomes governed, machine-ready intelligence: sourced with lineage, refined with layout awareness, curated by stewards, and delivered to search, agents and workflows." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map(([l, v, d]) => (
          <div key={l} className="rounded-lg border bg-card p-3">
            <div className="text-[11px] text-muted-foreground">{l}</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{v}</div>
            <div className="text-[11px] text-success">{d}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data lifecycle — click any stage to walk through</h2>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stages.map((s) => (
          <Link key={s.to} to={s.to} className="group relative rounded-lg border bg-card p-4 transition hover:border-primary hover:shadow-sm">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
            </div>
            <div className="mt-3 text-sm font-semibold">{s.t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
            <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Ingestion throughput (k docs / hour)" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-1.5">
            {flow.map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${(v / max) * 100}%` }} title={`${v}k`} />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>-14h</span><span>now</span></div>
        </Panel>
        <Panel title="Live pipeline state">
          <ul className="space-y-2 text-sm">
            {(["Refined", "Parsing", "In Review", "Queued"] as const).map((s) => (
              <li key={s} className="flex justify-between"><span className="text-muted-foreground">{s}</span><span className="font-mono">{docs.filter((d) => d.status === s).length}</span></li>
            ))}
            <li className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Open exceptions</span><Link to="/curation" className="font-mono text-primary">{exceptions.length}</Link></li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
