import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Wrench, List, Trash2 } from "lucide-react";
import { PageHeader, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { dispatchRpc, financialTools } from "@/lib/financial";
import { useFinancial } from "@/components/refinery/FinancialContext";

export const Route = createFileRoute("/refinery/agents")({
  head: () => ({ meta: [
    { title: "Financial Agent Playground — Data Toolkit for Sheets" },
    { name: "description", content: "Explore validated financial agent calls with point-in-time facts, filing comparisons and source citations using fictional data." },
    { property: "og:title", content: "Financial Agent Playground — Data Toolkit for Sheets" },
    { property: "og:description", content: "Interactive financial JSON-RPC simulator with validated inputs and auditable outputs." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Agents,
});
function Agents() {
  const { asOf } = useFinancial();
  const [tool, setTool] = useState(financialTools[0]);
  const sample = (t: (typeof financialTools)[number]) => JSON.stringify({ ...t.sample, as_of: `${asOf}:00Z` }, null, 2);
  const [args, setArgs] = useState(() => sample(financialTools[0]));
  const [log, setLog] = useState<{ req: string; res: string; ms: number }[]>([]);
  const pick = (t: (typeof financialTools)[number]) => { setTool(t); setArgs(sample(t)); };
  const invoke = (list = false) => {
    let parsed: unknown;
    try { parsed = JSON.parse(args); } catch { parsed = null; }
    const req = list ? JSON.stringify({ jsonrpc: "2.0", id: log.length + 1, method: "tools/list" }) : parsed === null ? args : JSON.stringify({ jsonrpc: "2.0", id: log.length + 1, method: "tools/call", params: { name: tool.name, arguments: parsed } });
    const start = performance.now();
    const response = dispatchRpc(req);
    setLog((old) => [{ req, res: JSON.stringify(response, null, 2), ms: +(performance.now() - start).toFixed(2) }, ...old].slice(0, 10));
  };
  return <>
    <PageHeader eyebrow="Stage 5 · Financial agents" title="Financial Agent Playground" desc="Financial facts, filing revisions and research-model inputs with explicit availability timestamps and cited source evidence." />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-3"><div className="flex flex-wrap items-center gap-2"><Pill tone="warning">Local JSON-RPC simulator</Pill><span className="text-xs text-muted-foreground">No hosted MCP endpoint, external agent connection, or authentication.</span></div><Button size="sm" variant="outline" onClick={() => invoke(true)}><List />List tools</Button></div>
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="min-w-0"><h2 className="mb-3 text-sm font-semibold">Financial tool catalog</h2><div className="divide-y border-y">{financialTools.map((t) => <Button key={t.name} variant="ghost" onClick={() => pick(t)} className={`h-auto w-full flex-col items-start whitespace-normal rounded-none px-3 py-4 text-left ${tool.name === t.name ? "bg-accent" : ""}`}><span className="flex items-center gap-2 break-all font-mono text-xs"><Wrench className="text-primary" />{t.name}</span><span className="text-xs font-normal leading-relaxed text-muted-foreground">{t.description}</span></Button>)}</div><div className="mt-4 text-xs text-muted-foreground">NWND · FY2025 · fictional financials</div></section>
      <section className="min-w-0"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">{tool.name}</h2><Button onClick={() => invoke()}><Play />Invoke tool</Button></div><label htmlFor="agent-arguments" className="text-xs text-muted-foreground">Arguments (JSON)</label><textarea id="agent-arguments" value={args} onChange={(e) => setArgs(e.target.value)} rows={8} className="mt-2 w-full rounded border bg-card p-3 font-mono text-xs leading-relaxed" /><div className="mt-2 flex flex-wrap gap-1">{Object.keys(tool.sample).map((key) => <Pill key={key}>{key}</Pill>)}<Pill>Unknown arguments rejected</Pill></div>
      <div className="mb-3 mt-6 flex items-center justify-between"><h2 className="text-sm font-semibold">JSON-RPC exchanges</h2><Button variant="ghost" size="icon" title="Clear exchanges" aria-label="Clear exchanges" disabled={!log.length} onClick={() => setLog([])}><Trash2 /></Button></div>
      {!log.length && <div className="border border-dashed p-8 text-center text-sm text-muted-foreground">No calls this session.</div>}
      {log.map((entry, i) => <div key={i} className="mb-5 min-w-0"><div className="mb-2 text-xs text-muted-foreground">Call {log.length - i} · local execution {entry.ms} ms</div><details><summary className="cursor-pointer text-xs font-medium">Request</summary><pre className="mt-2 max-h-60 overflow-auto rounded border bg-muted/40 p-3 text-[11px]">{entry.req}</pre></details><div className="mb-2 mt-3 text-xs font-medium">Response</div><pre data-testid="agent-response" className="max-h-96 overflow-auto rounded border bg-card p-3 text-[11px] leading-relaxed">{entry.res}</pre></div>)}
      </section>
    </div>
  </>;
}
