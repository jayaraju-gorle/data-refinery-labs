import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { chunks, sampleContract } from "@/lib/data";

export const Route = createFileRoute("/refinery")({
  head: () => ({
    meta: [
      { title: "Refinery Engine — Data Toolkit for Sheets" },
      { name: "description", content: "Layout-aware parsing, intelligent chunking and machine-ready JSON contracts." },
      { property: "og:title", content: "Refinery Engine — Data Toolkit for Sheets" },
      { property: "og:description", content: "Visual layout extraction, semantic and lexical chunking, validated JSON output." },
    ],
  }),
  component: Refinery,
});

type Block = { id: string; kind: "text" | "kv" | "table" | "heading"; y: number; h: number; label: string };
const blocks: Block[] = [
  { id: "b1", kind: "heading", y: 6, h: 6, label: "Item 7. Management's Discussion & Analysis" },
  { id: "b2", kind: "text", y: 14, h: 16, label: "Text block · Results of operations narrative" },
  { id: "b3", kind: "kv", y: 32, h: 10, label: "Key-value · Total revenue = $8.42B (FY2025)" },
  { id: "b4", kind: "table", y: 44, h: 32, label: "Table · Consolidated statement of income (18×4)" },
  { id: "b5", kind: "text", y: 79, h: 14, label: "Text block · Liquidity & capital resources" },
];
const kindStyle = { heading: "border-chart-4 bg-chart-4/10", text: "border-chart-1 bg-chart-1/10", kv: "border-chart-3 bg-chart-3/15", table: "border-chart-2 bg-chart-2/15" };

function Refinery() {
  const [tab, setTab] = useState<"layout" | "chunk" | "json">("layout");
  return (
    <>
      <PageHeader eyebrow="Stage 2 · Refine" title="Data Refinery & Processing Engine" desc="Every document is decomposed by visual layout, enriched with entities and metadata, chunked for retrieval and emitted as a schema-validated JSON contract." />
      <div className="mb-4 inline-flex rounded-md border bg-card p-1 text-sm">
        {([["layout", "Layout-aware parsing"], ["chunk", "Chunking & enrichment"], ["json", "JSON contract"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded px-3 py-1.5 ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>
      {tab === "layout" && <Layout />}
      {tab === "chunk" && <Chunking />}
      {tab === "json" && <Contract />}
    </>
  );
}

function Layout() {
  const [hover, setHover] = useState<string | null>("b3");
  const Page = ({ overlay }: { overlay: boolean }) => (
    <div className="relative mx-auto aspect-[8.5/11] w-full max-w-sm rounded border bg-card shadow-sm">
      <div className="absolute inset-0 space-y-2 p-6">
        {Array.from({ length: 34 }).map((_, i) => (
          <div key={i} className="h-1.5 rounded bg-muted" style={{ width: `${55 + ((i * 37) % 45)}%`, opacity: i > 12 && i < 25 ? 0.4 : 1 }} />
        ))}
      </div>
      {overlay && blocks.map((b) => (
        <div key={b.id} onMouseEnter={() => setHover(b.id)} className={`absolute left-[6%] right-[6%] cursor-pointer rounded-sm border-2 transition ${kindStyle[b.kind]} ${hover === b.id ? "ring-2 ring-ring" : "opacity-70"}`} style={{ top: `${b.y}%`, height: `${b.h}%` }}>
          <span className="absolute -top-2 left-1 rounded bg-card px-1 font-mono text-[9px] uppercase">{b.kind}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Raw document · DOC-10K-8841 p.41"><Page overlay={false} /></Panel>
      <Panel title="Extracted layout"><Page overlay /></Panel>
      <Panel title="Detected elements">
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li key={b.id} onMouseEnter={() => setHover(b.id)} className={`cursor-pointer rounded border-l-4 px-3 py-2 text-sm ${kindStyle[b.kind]} ${hover === b.id ? "ring-1 ring-ring" : ""}`}>{b.label}</li>
          ))}
        </ul>
        {hover === "b4" && (
          <table className="mt-4 w-full text-xs">
            <thead><tr className="text-left text-muted-foreground"><th>Line item</th><th>FY25</th><th>FY24</th></tr></thead>
            <tbody className="font-mono">{[["Revenue", "8,420", "7,558"], ["Gross profit", "3,115", "2,722"], ["Operating income", "1,465", "1,247"]].map((r) => <tr key={r[0]} className="border-t"><td className="font-sans">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
          </table>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-muted p-2"><div className="font-mono text-base">98.7%</div>text F1</div>
          <div className="rounded bg-muted p-2"><div className="font-mono text-base">96.2%</div>table cell acc.</div>
          <div className="rounded bg-muted p-2"><div className="font-mono text-base">1.8s</div>/ page</div>
        </div>
      </Panel>
    </div>
  );
}

function Chunking() {
  const [strategy, setStrategy] = useState<"all" | "semantic" | "lexical" | "table">("all");
  const [size, setSize] = useState(384);
  const list = chunks.filter((c) => strategy === "all" || c.strategy === strategy);
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Panel title="Chunking policy">
        <label className="text-xs text-muted-foreground">Strategy</label>
        <select value={strategy} onChange={(e) => setStrategy(e.target.value as typeof strategy)} className="mt-1 w-full rounded border bg-background px-2 py-1.5 text-sm">
          <option value="all">Hybrid (all)</option><option value="semantic">Semantic boundaries</option><option value="lexical">Lexical / fixed window</option><option value="table">Table-preserving</option>
        </select>
        <label className="mt-4 block text-xs text-muted-foreground">Target size: <span className="font-mono">{size}</span> tokens</label>
        <input type="range" min={128} max={1024} step={64} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full accent-[var(--primary)]" />
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <div>Overlap: <span className="font-mono text-foreground">{Math.round(size * 0.12)}</span> tokens</div>
          <div>Embedding: <span className="font-mono text-foreground">embed-v2 · 3072d</span></div>
          <div>Est. chunks / 10-K: <span className="font-mono text-foreground">{Math.round(186000 / size)}</span></div>
        </div>
        <div className="mt-4 text-xs font-semibold">Enrichment applied</div>
        <ul className="mt-1 space-y-1 text-xs">{["Entity resolution (ticker, CUSIP, SEDOL)", "Section & page lineage", "Point-in-time stamp", "Fiscal period normalization", "Entitlement tags"].map((x) => <li key={x} className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{x}</li>)}</ul>
      </Panel>
      <div className="space-y-3 lg:col-span-3">
        {list.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-medium">{c.id}</span>
              <Pill tone={c.strategy === "semantic" ? "primary" : c.strategy === "table" ? "success" : "muted"}>{c.strategy}</Pill>
              <span className="text-muted-foreground">{c.docId} · p.{c.page} · {c.section}</span>
              <span className="ml-auto font-mono text-muted-foreground">{Math.min(c.tokens, size)} tok</span>
            </div>
            <p className="mt-2 text-sm">{c.text}</p>
            <div className="mt-2 flex flex-wrap gap-1">{c.entities.map((e) => <Pill key={e}>{e}</Pill>)}<span className="ml-auto font-mono text-[10px] text-muted-foreground">bbox [{c.bbox.join(", ")}]</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonNode({ k, v, depth = 0 }: { k?: string; v: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = v !== null && typeof v === "object";
  const keyEl = k !== undefined && <span className="text-primary">"{k}"</span>;
  if (!isObj) {
    const col = typeof v === "string" ? "text-success" : typeof v === "number" ? "text-chart-5" : "text-muted-foreground";
    return <div style={{ paddingLeft: depth * 14 }}>{keyEl}{k !== undefined && ": "}<span className={col}>{JSON.stringify(v)}</span></div>;
  }
  const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x] as const) : Object.entries(v as object);
  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <button onClick={() => setOpen(!open)} className="hover:bg-muted">{open ? "▾" : "▸"} {keyEl}{k !== undefined && ": "}<span className="text-muted-foreground">{Array.isArray(v) ? `[${entries.length}]` : `{${entries.length}}`}</span></button>
      {open && entries.map(([ck, cv]) => <JsonNode key={ck} k={Array.isArray(v) ? undefined : ck} v={cv} depth={1} />)}
    </div>
  );
}

function Contract() {
  const fields = [["document_id", "string", "required"], ["issuer.cusip", "string · ^[0-9A-Z]{9}$", "required"], ["point_in_time.valid_from", "datetime (ISO 8601)", "required"], ["metrics[].value", "number", "required"], ["metrics[].unit", "enum USD|ratio|shares", "required"], ["metrics[].confidence", "number 0–1", "required"], ["metrics[].citation.bbox", "number[4]", "required"], ["validation.schema_valid", "boolean", "computed"]];
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel title="Normalized output · document/v2" className="lg:col-span-3" right={<Pill tone="success">Schema valid · 42/42 checks</Pill>}>
        <div className="max-h-[560px] overflow-auto rounded bg-muted/50 p-3 font-mono text-xs leading-relaxed"><JsonNode v={sampleContract} /></div>
      </Panel>
      <Panel title="Contract definition" className="lg:col-span-2">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground"><tr><th className="pb-2">Field</th><th>Type</th><th /></tr></thead>
          <tbody>{fields.map(([f, t, r]) => <tr key={f} className="border-t"><td className="py-1.5 font-mono">{f}</td><td className="text-muted-foreground">{t}</td><td><Pill tone={r === "required" ? "primary" : "muted"}>{r}</Pill></td></tr>)}</tbody>
        </table>
        <div className="mt-4 rounded border border-dashed p-3 text-xs text-muted-foreground">Consumers: search index, agent tools (MCP), spreadsheet exports, event bus. Breaking changes require a new major version; v1 remains served for 180 days.</div>
      </Panel>
    </div>
  );
}
