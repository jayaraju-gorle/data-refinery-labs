import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Zap, FileSpreadsheet, FileJson, Database } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";
import { incomeTable } from "@/lib/data";

export const Route = createFileRoute("/refinery/delivery")({
  head: () => ({
    meta: [
      { title: "Workflow Delivery — Data Toolkit for Sheets" },
      { name: "description", content: "Export clean tabular data to spreadsheet and data-toolkit formats and trigger event webhooks." },
      { property: "og:title", content: "Workflow Delivery — Data Toolkit for Sheets" },
      { property: "og:description", content: "Spreadsheet exports and downstream event webhooks." },
    ],
  }),
  component: Delivery,
});

const rows = incomeTable.rows.map(([l, a, b]) => ({ l, a, b, yoy: ((a - b) / Math.abs(b)) * 100 }));

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

const events = ["document.refined", "metric.changed", "exception.resolved", "filing.superseded"];

function Delivery() {
  const [hooks, setHooks] = useState<{ t: string; ev: string; url: string; code: number; ms: number }[]>([]);
  const [ev, setEv] = useState(events[0]);
  const [url, setUrl] = useState("https://consumer.example/hooks/refinery");

  const csv = () => download("HLCB_income_statement_Q3_2026.csv", [incomeTable.headers.join(","), ...rows.map((r) => [`"${r.l}"`, r.a, r.b, r.yoy.toFixed(1)].join(","))].join("\n"), "text/csv");
  const json = () => download("HLCB_income_statement_Q3_2026.json", JSON.stringify({ document_id: "DOC-10Q-3307", unit: "USD millions", rows: rows.map((r) => ({ line_item: r.l, q3_2026: r.a, q3_2025: r.b, yoy_pct: +r.yoy.toFixed(1) })) }, null, 2), "application/json");
  const fire = (kind?: string) => setHooks([{ t: new Date().toTimeString().slice(0, 8), ev: kind ?? ev, url: kind ? "Sheets: Halcyon_Q3!A1 (via add-on)" : url, code: Math.random() > 0.15 ? 200 : 503, ms: 60 + Math.round(Math.random() * 200) }, ...hooks]);

  const payload = { event: ev, id: "evt_01J…", occurred_at: "2026-10-15T08:00:00Z", data: { document_id: "DOC-10Q-3307", ticker: "HLCB", contract: "document/v2", changed_fields: ["income_statement.rd_expense.q3_2026"] }, signature: "sha256=…" };

  return (
    <>
      <PageHeader eyebrow="Stage 3 · Deliver" title="Downstream Workflow Delivery" desc="Curated, validated tables flow into analyst spreadsheets and data toolkits, while signed event webhooks trigger downstream models, alerts and research workflows in real time." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Clean table · Halcyon Bio statements of operations (USD m)" className="lg:col-span-3" right={<Pill tone="success">HITL-approved</Pill>}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr>{incomeTable.headers.map((h, i) => <th key={h} className={`pb-2 ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody className="tabular-nums">{rows.map((r) => (
              <tr key={r.l} className="border-t"><td className="py-2">{r.l}</td><td className="text-right font-mono">{r.a.toFixed(1)}</td><td className="text-right font-mono">{r.b.toFixed(1)}</td><td className={`text-right font-mono ${r.yoy >= 0 ? "text-success" : "text-destructive"}`}>{r.yoy.toFixed(1)}%</td></tr>
            ))}</tbody>
          </table>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => fire("sheets.export")} className="inline-flex items-center gap-1.5 rounded-md bg-success px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><FileSpreadsheet className="h-4 w-4" />Send to Google Sheets</button>
            <button onClick={csv} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-muted"><FileSpreadsheet className="h-4 w-4" />Export CSV</button>
            <button onClick={json} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-muted"><FileJson className="h-4 w-4" />Export JSON</button>
            <button onClick={() => download("hlcb_q3_2026.py", "import pandas as pd\n\ndf = pd.read_json('https://refinery.example/v2/tables/DOC-10Q-3307/tbl_statements_of_operations')\nprint(df)\n", "text/x-python")} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-muted"><Database className="h-4 w-4" />Data-toolkit snippet</button>
          </div>
        </Panel>
        <Panel title="Delivery targets" className="lg:col-span-2">
          <ul className="space-y-2 text-sm">
            {[["Google Sheets (Data Toolkit add-on)", "Live ranges · refresh on metric.changed", "success"], ["Lakehouse table (Iceberg)", "Hourly append · partitioned by as_of", "success"], ["Python / notebook SDK", "Typed DataFrames", "success"], ["Event bus (Kafka topic)", "refinery.documents.v2", "primary"], ["Quant model feature store", "Pending onboarding", "muted"]].map(([a, b, t]) => (
              <li key={a} className="flex items-center justify-between rounded border px-3 py-2"><div><div className="font-medium">{a}</div><div className="text-xs text-muted-foreground">{b}</div></div><Pill tone={t as "success"}>{t === "muted" ? "planned" : "live"}</Pill></li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel title="Webhook trigger" className="lg:col-span-2">
          <label className="text-xs text-muted-foreground">Event</label>
          <select value={ev} onChange={(e) => setEv(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1.5 font-mono text-sm">{events.map((e) => <option key={e}>{e}</option>)}</select>
          <label className="mt-3 block text-xs text-muted-foreground">Endpoint URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1.5 font-mono text-xs" />
          <pre className="mt-3 overflow-x-auto rounded bg-muted/60 p-3 font-mono text-[11px]">{JSON.stringify(payload, null, 2)}</pre>
          <button onClick={() => fire()} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Zap className="h-4 w-4" />Send test event</button>
        </Panel>
        <Panel title="Delivery log" className="lg:col-span-3">
          {hooks.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No deliveries yet — send a test event. (Simulated; no network call is made.)</div> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2">Time</th><th>Event</th><th>Target</th><th>Status</th><th className="text-right">Latency</th></tr></thead>
              <tbody>{hooks.map((h, i) => (
                <tr key={i} className="border-t"><td className="py-2 font-mono text-xs">{h.t}</td><td className="font-mono text-xs">{h.ev}</td><td className="max-w-[180px] truncate font-mono text-xs text-muted-foreground">{h.url}</td><td><Pill tone={h.code === 200 ? "success" : "destructive"}>{h.code === 200 ? "200 OK" : "503 · retry queued"}</Pill></td><td className="text-right font-mono text-xs">{h.ms} ms</td></tr>
              ))}</tbody>
            </table>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Download className="h-3.5 w-3.5" />Retries: exponential backoff, 8 attempts, dead-letter after 24h. Payloads HMAC-signed.</div>
        </Panel>
      </div>
    </>
  );
}
