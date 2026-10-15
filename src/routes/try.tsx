import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Send, Plus, Trash2 } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "Data Tools — Data Toolkit for Sheets" },
      { name: "description", content: "Test, format and schedule API calls straight into Google Sheets." },
      { property: "og:title", content: "API Tool — Data Toolkit for Sheets" },
      { property: "og:description", content: "Test, format and schedule API calls to Google Sheets." },
    ],
  }),
  component: ApiTool,
});

type Row = Record<string, string | number | boolean | null>;

function flatten(o: unknown, prefix = "", out: Row = {}): Row {
  if (o !== null && typeof o === "object" && !Array.isArray(o)) {
    for (const [k, v] of Object.entries(o)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else out[prefix] = Array.isArray(o) ? JSON.stringify(o) : (o as Row[string]);
  return out;
}

function pick(o: unknown, path: string): unknown {
  return path ? path.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), o) : o;
}

function ApiTool() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/users");
  const [headers, setHeaders] = useState([{ k: "Accept", v: "application/json" }]);
  const [path, setPath] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState("Sheet1!A1");
  const [mode, setMode] = useState("Overwrite");
  const [schedule, setSchedule] = useState("Manual");
  const [sent, setSent] = useState<string[]>([]);

  const run = async () => {
    setLoading(true); setStatus("");
    const t = performance.now();
    try {
      const r = await fetch(url, { method, headers: Object.fromEntries(headers.filter((h) => h.k).map((h) => [h.k, h.v])) });
      const data = await r.json();
      const sel = pick(data, path);
      const arr = Array.isArray(sel) ? sel : [sel];
      setRows(arr.map((x) => flatten(x)));
      setStatus(`${r.status} ${r.statusText || "OK"} · ${Math.round(performance.now() - t)} ms · ${arr.length} rows`);
    } catch (e) {
      setRows([]); setStatus(`Request failed: ${(e as Error).message}`);
    } finally { setLoading(false); }
  };
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r)))).slice(0, 12);

  return (
    <>
      <PageHeader eyebrow="Core feature" title="API Tool" desc="Test any REST endpoint, flatten the JSON into columns, and send it to a sheet — once or on a schedule." />
      <Panel title="Request">
        <div className="flex gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded border bg-background px-2 font-mono text-sm">{["GET", "POST"].map((m) => <option key={m}>{m}</option>)}</select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 rounded border bg-background px-3 py-2 font-mono text-sm" />
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"><Play className="h-4 w-4" />{loading ? "Running…" : "Send"}</button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">Headers <button onClick={() => setHeaders([...headers, { k: "", v: "" }])} className="inline-flex items-center gap-1 hover:text-foreground"><Plus className="h-3 w-3" />Add</button></div>
            {headers.map((h, i) => (
              <div key={i} className="mb-1 flex gap-1">
                <input value={h.k} placeholder="Key" onChange={(e) => setHeaders(headers.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} className="w-1/3 rounded border bg-background px-2 py-1 font-mono text-xs" />
                <input value={h.v} placeholder="Value" onChange={(e) => setHeaders(headers.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} className="flex-1 rounded border bg-background px-2 py-1 font-mono text-xs" />
                <button onClick={() => setHeaders(headers.filter((_, j) => j !== i))} className="px-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Data path (e.g. <span className="font-mono">data.items</span>; blank = root)</label>
            <input value={path} onChange={(e) => setPath(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1 font-mono text-xs" />
          </div>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <Panel title="Preview (flattened)" className="lg:col-span-3" right={status && <Pill tone={status.startsWith("Request") ? "destructive" : "success"}>{status}</Pill>}>
          {rows.length ? (
            <div className="-m-4 max-h-96 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted text-left"><tr>{cols.map((c) => <th key={c} className="whitespace-nowrap px-3 py-2 font-mono font-medium">{c}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 50).map((r, i) => <tr key={i} className="border-t">{cols.map((c) => <td key={c} className="max-w-[200px] truncate px-3 py-1.5">{String(r[c] ?? "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ) : <div className="py-10 text-center text-sm text-muted-foreground">Send a request to preview rows.</div>}
        </Panel>
        <Panel title="Send to Google Sheets">
          <label className="text-xs text-muted-foreground">Destination range</label>
          <input value={sheet} onChange={(e) => setSheet(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1 font-mono text-xs" />
          <label className="mt-3 block text-xs text-muted-foreground">Write mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1 text-sm">{["Overwrite", "Append", "Upsert by key"].map((m) => <option key={m}>{m}</option>)}</select>
          <label className="mt-3 block text-xs text-muted-foreground">Schedule</label>
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="mt-1 w-full rounded border bg-background px-2 py-1 text-sm">{["Manual", "Hourly", "Daily 08:00", "Weekly Mon"].map((m) => <option key={m}>{m}</option>)}</select>
          <button disabled={!rows.length} onClick={() => setSent([`${new Date().toTimeString().slice(0, 8)} · ${rows.length} rows → ${sheet} (${mode}, ${schedule})`, ...sent])} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Send className="h-4 w-4" />Send to Sheets</button>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">{sent.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Preview demo — the add-on performs the actual write inside Google Sheets.</p>
        </Panel>
      </div>
    </>
  );
}
