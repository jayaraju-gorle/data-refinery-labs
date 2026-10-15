import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Wrench } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { mcpTools, chunks, docById, incomeTable } from "@/lib/data";
import { hybridSearch } from "@/lib/search";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "MCP & Agent Endpoints — Insight Refinery" },
      { name: "description", content: "Agentic tools exposed over Model Context Protocol for LLMs and autonomous agents." },
      { property: "og:title", content: "MCP & Agent Endpoints — Insight Refinery" },
      { property: "og:description", content: "How downstream LLMs and agents consume the refinery via MCP tools." },
    ],
  }),
  component: Agents,
});

function run(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "search_documents":
      return { results: hybridSearch(String(args.query ?? ""), 0.5).slice(0, Number(args.top_k ?? 3)).map((h) => ({ chunk_id: h.chunk.id, document_id: h.chunk.docId, score: +h.rerank.toFixed(3), snippet: h.chunk.text.slice(0, 90) + "…" })) };
    case "fetch_document_chunk": {
      const c = chunks.find((x) => x.id === args.chunk_id);
      if (!c) return { isError: true, message: `chunk ${args.chunk_id} not found` };
      return { ...c, citation: { document_id: c.docId, page: c.page, bbox: c.bbox } };
    }
    case "extract_tabular_data":
      return { document_id: args.document_id, table_id: args.table_id, unit: "USD millions", periods: ["Q3 2026", "Q3 2025"], rows: incomeTable.rows.map(([l, a, b]) => ({ line_item: l, q3_2026: a, q3_2025: b })) };
    case "get_document_lineage": {
      const d = docById(String(args.document_id));
      return d ? { document_id: d.id, source: d.source, steps: d.lineage, ingested_at: d.ingestedAt } : { isError: true, message: "not found" };
    }
    case "subscribe_event":
      return { subscription_id: "sub_" + Math.random().toString(36).slice(2, 10), event: args.event, url: args.url, status: "active" };
  }
  return null;
}

function Agents() {
  const [tool, setTool] = useState(mcpTools[1]);
  const [args, setArgs] = useState(JSON.stringify(mcpTools[1].sample, null, 2));
  const [log, setLog] = useState<{ req: string; res: string; ms: number }[]>([]);

  const pick = (t: (typeof mcpTools)[number]) => { setTool(t); setArgs(JSON.stringify(t.sample, null, 2)); };
  const invoke = () => {
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(args); } catch { setLog([{ req: args, res: '{ "error": "invalid JSON arguments" }', ms: 0 }, ...log]); return; }
    const req = { jsonrpc: "2.0", id: log.length + 1, method: "tools/call", params: { name: tool.name, arguments: parsed } };
    const res = { jsonrpc: "2.0", id: log.length + 1, result: { structuredContent: run(tool.name, parsed) } };
    setLog([{ req: JSON.stringify(req, null, 2), res: JSON.stringify(res, null, 2), ms: 40 + Math.round(Math.random() * 120) }, ...log]);
  };

  return (
    <>
      <PageHeader eyebrow="Stage 3 · Deliver" title="Model Context Protocol & Agent Endpoints" desc="The refinery is exposed as typed MCP tools. Any MCP-capable LLM or autonomous agent can search, cite, extract tables and subscribe to events — with entitlements and point-in-time guarantees enforced server-side." />
      <div className="mb-4 rounded-lg border bg-card px-4 py-3 font-mono text-xs">
        <span className="text-muted-foreground">endpoint</span> https://refinery.example/mcp <span className="ml-4 text-muted-foreground">transport</span> streamable-http <span className="ml-4 text-muted-foreground">auth</span> OAuth 2.1 · scoped entitlements
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title={`Exposed tools (${mcpTools.length})`} className="lg:col-span-2">
          <div className="-m-4 divide-y">
            {mcpTools.map((t) => (
              <button key={t.name} onClick={() => pick(t)} className={`block w-full px-4 py-3 text-left hover:bg-muted/40 ${tool.name === t.name ? "bg-accent/60" : ""}`}>
                <div className="flex items-center gap-2 font-mono text-sm font-medium"><Wrench className="h-3.5 w-3.5 text-primary" />{t.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{Object.entries(t.params).map(([k, v]) => <Pill key={k}>{k}: {v}</Pill>)}</div>
              </button>
            ))}
          </div>
        </Panel>
        <div className="space-y-4 lg:col-span-3">
          <Panel title={`Agent playground · ${tool.name}`} right={<button onClick={invoke} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Play className="h-3.5 w-3.5" />Invoke tool</button>}>
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">arguments (JSON)</label>
            <textarea value={args} onChange={(e) => setArgs(e.target.value)} rows={5} className="mt-1 w-full rounded border bg-muted/40 p-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring" />
          </Panel>
          {log.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Invoke a tool to see the JSON-RPC exchange an agent would perform.</div>}
          {log.map((l, i) => (
            <div key={log.length - i} className="grid gap-2 md:grid-cols-2">
              <div><div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">→ request</div><pre className="max-h-72 overflow-auto rounded border bg-card p-3 font-mono text-[11px]">{l.req}</pre></div>
              <div><div className="mb-1 flex justify-between text-[11px] uppercase tracking-wide text-muted-foreground"><span>← response</span><span className="font-mono normal-case">{l.ms} ms</span></div><pre className="max-h-72 overflow-auto rounded border bg-card p-3 font-mono text-[11px]">{l.res}</pre></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
