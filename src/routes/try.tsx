import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, FileInput, FileOutput, Save, FolderOpen, Settings2, Clock, Layers, Download, Table2, Copy, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/try")({
  validateSearch: (s: Record<string, unknown>) => ({ url: typeof s.url === "string" ? s.url : undefined }),
  head: () => ({
    meta: [
      { title: "Try Our Tools — API Tool | Data Toolkit for Sheets" },
      { name: "description", content: "Build, test and save API requests: import/export cURL, schedule calls, batch test and visualize JSON responses as tables." },
      { property: "og:title", content: "Try Our Tools — API Tool | Data Toolkit for Sheets" },
      { property: "og:description", content: "Test any REST API, then view, visualize and export the response." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApiTool,
});

const popular = [
  { name: "Random Users", d: "Get a list of random user profiles", icon: "👤", url: "https://randomuser.me/api/?results=5" },
  { name: "Cat Facts", d: "Get a random cat fact.", icon: "🐈", url: "https://catfact.ninja/fact" },
  { name: "Random Joke", d: "Get a random joke.", icon: "😂", url: "https://v2.jokeapi.dev/joke/Any" },
  { name: "Bitcoin Price", d: "Current price of Bitcoin in USD.", icon: "₿", url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd" },
  { name: "Random User", d: "Get random user data.", icon: "👤", url: "https://randomuser.me/api/" },
  { name: "JSONPlaceholder Posts", d: "Sample blog posts.", icon: "📝", url: "https://jsonplaceholder.typicode.com/posts" },
  { name: "JSONPlaceholder Todos", d: "Get sample todo items.", icon: "✅", url: "https://jsonplaceholder.typicode.com/todos" },
];

type Saved = { name: string; method: string; url: string; headers: string; body: string };
type Resp = { status: number; statusText: string; ms: number; text: string; headers: [string, string][] };
type Row = Record<string, string>;

function parseHeaders(t: string) {
  return Object.fromEntries(t.split("\n").map((l) => l.split(/:(.*)/s)).filter((p) => p[0]?.trim()).map((p) => [p[0].trim(), (p[1] ?? "").trim()]));
}

export function parseCurl(c: string) {
  const s = c.replace(/\\\n/g, " ");
  const url = s.match(/(?:--location\s+|--url\s+|curl\s+(?:-X\s+\w+\s+)?)['"]?(https?:\/\/[^'"\s]+)/)?.[1] ?? "";
  const method = s.match(/(?:-X|--request)\s+['"]?(\w+)/)?.[1]?.toUpperCase();
  const headers = [...s.matchAll(/(?:-H|--header)\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).join("\n");
  const body = s.match(/(?:-d|--data(?:-raw)?)\s+'([^']*)'/)?.[1] ?? s.match(/(?:-d|--data(?:-raw)?)\s+"([^"]*)"/)?.[1] ?? "";
  return { url, method: method ?? (body ? "POST" : "GET"), headers, body };
}

function flatten(o: unknown, p = "", out: Row = {}): Row {
  if (o && typeof o === "object" && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) flatten(v, p ? `${p}_${k}` : k, out);
  else out[p || "value"] = Array.isArray(o) ? JSON.stringify(o) : String(o ?? "");
  return out;
}
function toRows(text: string): Row[] {
  try {
    const d = JSON.parse(text);
    const arr = Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : Array.isArray(d?.data) ? d.data : [d];
    return arr.map((x: unknown) => flatten(x));
  } catch { return []; }
}

function ToolBtn({ icon: I, label, onClick, tone = "border-border text-foreground", active }: { icon: typeof Send; label: string; onClick: () => void; tone?: string; active?: boolean }) {
  return <button onClick={onClick} className={`flex min-w-[84px] flex-col items-center gap-1 rounded-md border px-3 py-2 text-xs ${active ? "bg-primary text-primary-foreground border-primary" : tone} hover:bg-muted hover:text-foreground`}><I className="h-4 w-4" />{label}</button>;
}

function ApiTool() {
  const search = Route.useSearch();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(search.url ?? "https://api.example.com/");
  const [reqTab, setReqTab] = useState<"Headers" | "Body">("Headers");
  const [headers, setHeaders] = useState("Content-Type: application/json");
  const [body, setBody] = useState("");
  const [panel, setPanel] = useState<null | "import" | "load" | "advanced" | "schedule" | "batch">(null);
  const [curlIn, setCurlIn] = useState("");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [resp, setResp] = useState<Resp | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"Raw" | "Pretty" | "Headers" | "Visualize">("Raw");
  const [interval, setIntervalSec] = useState(60);
  const [scheduled, setScheduled] = useState(false);
  const [runs, setRuns] = useState<string[]>([]);
  const [batchN, setBatchN] = useState(5);
  const [batch, setBatch] = useState<{ ok: number; fail: number; avg: number; min: number; max: number } | null>(null);
  const [params, setParams] = useState<{ k: string; v: string }[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSaved(JSON.parse(localStorage.getItem("dtk-saved-requests") || "[]")); }, []);
  useEffect(() => { if (search.url) setUrl(search.url); }, [search.url]);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const curl = `curl -X ${method} "${url}"${Object.entries(parseHeaders(headers)).map(([k, v]) => ` \\\n  -H "${k}: ${v}"`).join("")}${body && method !== "GET" ? ` \\\n  -d '${body}'` : ""}`;

  const call = async (): Promise<Resp> => {
    const t = performance.now();
    const r = await fetch(url, { method, headers: method === "GET" ? undefined : parseHeaders(headers), body: method === "GET" || !body ? undefined : body });
    const text = await r.text();
    return { status: r.status, statusText: r.statusText, ms: Math.round(performance.now() - t), text, headers: [...r.headers.entries()] };
  };
  const send = async () => {
    setLoading(true); setErr("");
    try { const r = await call(); setResp(r); return r; } catch (e) { setResp(null); setErr((e as Error).message); } finally { setLoading(false); }
  };

  const toggleSchedule = () => {
    if (scheduled) { if (timer.current) clearInterval(timer.current); setScheduled(false); return; }
    const tick = async () => { const r = await send(); setRuns((x) => [`${new Date().toLocaleTimeString()} · ${r ? `${r.status} · ${r.ms} ms` : "failed"}`, ...x].slice(0, 20)); };
    tick(); timer.current = setInterval(tick, Math.max(10, interval) * 1000); setScheduled(true);
  };
  const runBatch = async () => {
    setLoading(true); const times: number[] = []; let fail = 0;
    for (let i = 0; i < batchN; i++) { try { const r = await call(); r.status < 400 ? times.push(r.ms) : fail++; } catch { fail++; } }
    setBatch({ ok: times.length, fail, avg: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0, min: times.length ? Math.min(...times) : 0, max: times.length ? Math.max(...times) : 0 });
    setLoading(false);
  };
  const saveReq = () => {
    const name = window.prompt("Name this request", url.replace(/^https?:\/\//, "").slice(0, 40));
    if (!name) return;
    const next = [{ name, method, url, headers, body }, ...saved.filter((s) => s.name !== name)];
    setSaved(next); localStorage.setItem("dtk-saved-requests", JSON.stringify(next));
  };
  const applyParams = () => {
    try { const u = new URL(url); params.filter((p) => p.k).forEach((p) => u.searchParams.set(p.k, p.v)); setUrl(u.toString()); setPanel(null); } catch { setErr("Enter a valid URL first."); }
  };

  const rows = resp ? toRows(resp.text) : [];
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r)))).slice(0, 15);
  const pretty = (() => { try { return resp ? JSON.stringify(JSON.parse(resp.text), null, 2) : ""; } catch { return resp?.text ?? ""; } })();
  const downloadCsv = () => {
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.map(esc).join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "api-response.csv"; a.click();
  };

  return (
    <>
      <div className="mb-5">
        <h1 className="text-3xl font-semibold">Try Our Tools</h1>
        <p className="text-muted-foreground">Explore our advanced data tools</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card">
          <h2 className="border-b px-4 py-3 font-semibold">Popular Public APIs</h2>
          <div className="max-h-[720px] space-y-3 overflow-auto p-3">
            <p className="border-b border-dashed pb-2 text-sm italic text-muted-foreground">Click 'Try' to auto-fill the request builder</p>
            {popular.map((p) => (
              <div key={p.name} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 font-medium"><span>{p.icon}</span>{p.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
                <div className="mt-2 text-right"><button onClick={() => { setMethod("GET"); setUrl(p.url); setBody(""); }} className="rounded border border-primary px-3 py-1 text-sm text-primary hover:bg-primary hover:text-primary-foreground">Try</button></div>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border bg-card">
          <h2 className="border-b bg-muted/50 px-4 py-3 text-lg font-medium">Request Builder</h2>
          <div className="p-4">
            <div className="flex overflow-hidden rounded-md border">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="border-r bg-background px-3 text-sm">{["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}</select>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className="min-w-0 flex-1 bg-background px-3 py-2 text-sm" aria-label="Request URL" />
              <button onClick={send} disabled={loading} className="inline-flex items-center gap-1.5 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"><Send className="h-4 w-4" />{loading ? "Sending…" : "Send"}</button>
            </div>
            <div className="mt-4 flex gap-1">{(["Headers", "Body"] as const).map((t) => <button key={t} onClick={() => setReqTab(t)} className={`rounded-md px-3 py-1.5 text-sm ${reqTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>)}</div>
            <textarea value={reqTab === "Headers" ? headers : body} onChange={(e) => (reqTab === "Headers" ? setHeaders : setBody)(e.target.value)} placeholder={reqTab === "Headers" ? "Key: Value (one per line)" : '{ "key": "value" }'} rows={5} className="mt-2 w-full rounded-md border bg-background p-3 font-mono text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              <ToolBtn icon={FileInput} label="Import cURL" onClick={() => setPanel(panel === "import" ? null : "import")} active={panel === "import"} />
              <ToolBtn icon={FileOutput} label="Export cURL" onClick={() => navigator.clipboard.writeText(curl)} />
              <ToolBtn icon={Save} label="Save Request" onClick={saveReq} tone="border-primary text-primary" />
              <ToolBtn icon={FolderOpen} label="Load Saved" onClick={() => setPanel(panel === "load" ? null : "load")} tone="border-primary text-primary" active={panel === "load"} />
              <ToolBtn icon={Settings2} label="Advanced Builder" onClick={() => setPanel(panel === "advanced" ? null : "advanced")} active={panel === "advanced"} />
              <ToolBtn icon={Clock} label="Schedule Calls" onClick={() => setPanel(panel === "schedule" ? null : "schedule")} tone="border-primary text-primary" active={panel === "schedule"} />
              <ToolBtn icon={Layers} label="Batch Testing" onClick={() => setPanel(panel === "batch" ? null : "batch")} tone="border-warning text-warning" active={panel === "batch"} />
            </div>

            {panel === "import" && (
              <div className="mt-3 rounded-md border p-3">
                <textarea value={curlIn} onChange={(e) => setCurlIn(e.target.value)} rows={4} placeholder="Paste a cURL command" className="w-full rounded border bg-background p-2 font-mono text-xs" />
                <button onClick={() => { const c = parseCurl(curlIn); if (c.url) { setUrl(c.url); setMethod(c.method); if (c.headers) setHeaders(c.headers); setBody(c.body); setPanel(null); } else setErr("Couldn't find a URL in that cURL command."); }} className="mt-2 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground">Import</button>
              </div>
            )}
            {panel === "load" && (
              <div className="mt-3 rounded-md border p-3 text-sm">
                {!saved.length ? <p className="text-muted-foreground">No saved requests yet.</p> : saved.map((s) => (
                  <div key={s.name} className="flex items-center justify-between border-b py-1.5 last:border-0">
                    <button onClick={() => { setMethod(s.method); setUrl(s.url); setHeaders(s.headers); setBody(s.body); setPanel(null); }} className="truncate text-left"><b className="font-mono text-xs">{s.method}</b> {s.name}</button>
                    <button aria-label="Delete" onClick={() => { const n = saved.filter((x) => x.name !== s.name); setSaved(n); localStorage.setItem("dtk-saved-requests", JSON.stringify(n)); }}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            )}
            {panel === "advanced" && (
              <div className="mt-3 rounded-md border p-3 text-sm">
                <div className="mb-2 flex justify-between font-medium">Query Parameters <button onClick={() => setParams([...params, { k: "", v: "" }])} className="inline-flex items-center gap-1 text-primary"><Plus className="h-3.5 w-3.5" />Add</button></div>
                {params.map((p, i) => (
                  <div key={i} className="mb-1 flex gap-1">
                    <input value={p.k} placeholder="key" onChange={(e) => setParams(params.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} className="w-1/3 rounded border bg-background px-2 py-1 font-mono text-xs" />
                    <input value={p.v} placeholder="value" onChange={(e) => setParams(params.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} className="flex-1 rounded border bg-background px-2 py-1 font-mono text-xs" />
                  </div>
                ))}
                <button onClick={applyParams} className="mt-2 rounded bg-primary px-3 py-1.5 text-primary-foreground">Apply to URL</button>
              </div>
            )}
            {panel === "schedule" && (
              <div className="mt-3 rounded-md border p-3 text-sm">
                <label className="flex items-center gap-2">Run every <input type="number" min={10} value={interval} onChange={(e) => setIntervalSec(+e.target.value)} className="w-20 rounded border bg-background px-2 py-1" /> seconds</label>
                <button onClick={toggleSchedule} className="mt-2 rounded bg-primary px-3 py-1.5 text-primary-foreground">{scheduled ? "Stop schedule" : "Start schedule"}</button>
                <p className="mt-1 text-xs text-muted-foreground">Runs while this page stays open.</p>
                <ul className="mt-2 font-mono text-xs text-muted-foreground">{runs.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {panel === "batch" && (
              <div className="mt-3 rounded-md border p-3 text-sm">
                <label className="flex items-center gap-2">Number of requests <input type="number" min={1} max={50} value={batchN} onChange={(e) => setBatchN(Math.min(50, Math.max(1, +e.target.value)))} className="w-20 rounded border bg-background px-2 py-1" /></label>
                <button onClick={runBatch} disabled={loading} className="mt-2 rounded bg-primary px-3 py-1.5 text-primary-foreground disabled:opacity-60">Run batch</button>
                {batch && <p className="mt-2 font-mono text-xs">{batch.ok} succeeded · {batch.fail} failed · avg {batch.avg} ms · min {batch.min} ms · max {batch.max} ms</p>}
              </div>
            )}
            <div className="mt-3 rounded-md border bg-muted/50 p-3 font-mono text-xs"><div className="mb-2 text-muted-foreground">cURL Preview:</div><pre className="whitespace-pre-wrap break-all">{curl}</pre></div>
          </div>
        </section>

        <section className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
            <h2 className="text-lg font-medium">API Response</h2>
            <span className={`rounded px-2 py-0.5 text-sm ${resp ? (resp.status < 400 ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground") : "bg-muted-foreground text-background"}`}>{resp ? resp.status : "-"}</span>
            <span className="text-sm text-muted-foreground">{resp ? resp.ms : 0} ms</span>
            <div className="ml-auto flex gap-3 text-muted-foreground">
              <button aria-label="Download CSV" title="Download CSV" disabled={!rows.length} onClick={downloadCsv}><Download className="h-4 w-4" /></button>
              <button aria-label="Visualize" title="Visualize" onClick={() => setView("Visualize")}><Table2 className="h-4 w-4" /></button>
              <button aria-label="Copy" title="Copy response" onClick={() => resp && navigator.clipboard.writeText(resp.text)}><Copy className="h-4 w-4" /></button>
              <button aria-label="Clear" title="Clear" onClick={() => { setResp(null); setErr(""); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3 flex gap-1">{(["Raw", "Pretty", "Headers", "Visualize"] as const).map((t) => <button key={t} onClick={() => setView(t)} className={`rounded-md px-3 py-1.5 text-sm ${view === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>)}</div>
            <div className="min-h-[180px] max-h-[560px] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs">
              {err ? <span className="text-destructive">Request failed: {err}</span>
                : !resp ? null
                : view === "Raw" ? <pre className="whitespace-pre-wrap break-all">{resp.text}</pre>
                : view === "Pretty" ? <pre>{pretty}</pre>
                : view === "Headers" ? <table className="w-full">{resp.headers.length ? <tbody>{resp.headers.map(([k, v]) => <tr key={k} className="border-b"><td className="py-1 pr-3 font-semibold">{k}</td><td className="break-all">{v}</td></tr>)}</tbody> : <tbody><tr><td className="text-muted-foreground">No readable headers.</td></tr></tbody>}</table>
                : rows.length ? <table className="w-full font-sans"><thead><tr>{cols.map((c) => <th key={c} className="whitespace-nowrap border-b px-2 py-1 text-left">{c}</th>)}</tr></thead><tbody>{rows.slice(0, 100).map((r, i) => <tr key={i} className="border-b">{cols.map((c) => <td key={c} className="max-w-[180px] truncate px-2 py-1">{r[c]}</td>)}</tr>)}</tbody></table>
                : <span className="text-muted-foreground">Response isn't JSON, so it can't be shown as a table.</span>}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
