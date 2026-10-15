import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { PageHeader, Panel, Pill, Conf } from "@/components/AppShell";
import { exceptions as seed, docById, type Exception } from "@/lib/data";

export const Route = createFileRoute("/refinery/curation")({
  head: () => ({
    meta: [
      { title: "Curation Workbench — Data Toolkit for Sheets" },
      { name: "description", content: "Human-in-the-loop exception queue with steward review, inline correction and audit log." },
      { property: "og:title", content: "Curation Workbench — Data Toolkit for Sheets" },
      { property: "og:description", content: "Steward review of low-confidence extractions with a full approval audit trail." },
    ],
  }),
  component: Curation,
});

type Audit = { at: string; who: string; action: string; id: string; detail: string };

function Curation() {
  const [queue, setQueue] = useState<Exception[]>(seed);
  const [sel, setSel] = useState(seed[0].id);
  const [value, setValue] = useState(seed[0].extracted);
  const [filter, setFilter] = useState("All");
  const [audit, setAudit] = useState<Audit[]>([
    { at: "07:41:12", who: "a.rao (steward)", action: "Approved", id: "EX-2039", detail: "revenue.q3_2026 = 142.0" },
    { at: "07:22:50", who: "system", action: "Routed", id: "EX-2041", detail: "OCR discrepancy · conf 0.71 < 0.85" },
  ]);
  const ex = queue.find((e) => e.id === sel);
  const shown = queue.filter((e) => filter === "All" || e.reason === filter);

  const pick = (e: Exception) => { setSel(e.id); setValue(e.extracted); };
  const resolve = (action: "Approved" | "Corrected" | "Rejected") => {
    if (!ex) return;
    const detail = action === "Corrected" ? `${ex.field}: "${ex.extracted}" → "${value}"` : `${ex.field} = ${ex.extracted}`;
    setAudit([{ at: new Date().toTimeString().slice(0, 8), who: "you (steward)", action, id: ex.id, detail }, ...audit]);
    const rest = queue.filter((q) => q.id !== ex.id);
    setQueue(rest);
    if (rest[0]) pick(rest[0]);
  };

  return (
    <>
      <PageHeader eyebrow="Stage 2 · Curate" title="Human-in-the-Loop Curation Workbench" desc="Extractions below the 85% confidence threshold, ambiguous table headers and OCR discrepancies are routed to data stewards. Every decision is audited and fed back to improve upstream models." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Open exceptions", queue.length], ["Resolved this session", audit.filter((a) => a.who.startsWith("you")).length], ["Routing threshold", "< 85%"], ["Median time-to-resolve", "1m 52s"]].map(([l, v]) => (
          <div key={l} className="rounded-lg border bg-card p-3"><div className="text-[11px] text-muted-foreground">{l}</div><div className="font-mono text-lg">{v}</div></div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Exception queue" className="lg:col-span-2" right={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border bg-background px-1.5 py-0.5 text-xs">
            {["All", "Low confidence", "Ambiguous table header", "OCR discrepancy"].map((f) => <option key={f}>{f}</option>)}
          </select>}>
          <div className="-m-4 divide-y">
            {shown.map((e) => (
              <button key={e.id} onClick={() => pick(e)} className={`block w-full px-4 py-3 text-left hover:bg-muted/40 ${sel === e.id ? "bg-accent/60" : ""}`}>
                <div className="flex items-center gap-2"><span className="font-mono text-xs font-medium">{e.id}</span><Pill tone={e.reason === "OCR discrepancy" ? "destructive" : "warning"}>{e.reason}</Pill><span className="ml-auto"><Conf v={e.confidence} /></span></div>
                <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{e.field}</div>
              </button>
            ))}
            {!shown.length && <div className="px-4 py-10 text-center text-sm text-muted-foreground">Queue clear. 🎉</div>}
          </div>
        </Panel>

        <Panel title="Steward review" className="lg:col-span-3">
          {ex ? (
            <>
              <div className="text-xs text-muted-foreground">{docById(ex.docId)?.title} · page {ex.page}</div>
              <div className="mt-3 rounded border bg-muted/40 p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Source context (cropped region)</div>
                <div className="mt-2 rounded border-2 border-dashed border-warning bg-card p-3 font-mono text-sm">{ex.context}</div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">Field</div><div className="font-mono text-sm">{ex.field}</div></div>
                <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">Model extraction</div><div className="font-mono text-sm">{ex.extracted} <Conf v={ex.confidence} /></div></div>
              </div>
              <label className="mt-4 block text-[11px] uppercase tracking-wide text-muted-foreground">Corrected value</label>
              <div className="mt-1 flex items-center gap-2 rounded border bg-background px-2"><Pencil className="h-4 w-4 text-muted-foreground" /><input value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-transparent py-2 font-mono text-sm outline-none" /></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => resolve(value === ex.extracted ? "Approved" : "Corrected")} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Check className="h-4 w-4" />{value === ex.extracted ? "Approve as-is" : "Save correction & approve"}</button>
                <button onClick={() => resolve("Rejected")} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-muted"><X className="h-4 w-4" />Reject & re-parse</button>
              </div>
            </>
          ) : <div className="py-10 text-center text-sm text-muted-foreground">All exceptions resolved.</div>}
        </Panel>
      </div>
      <Panel title="Approval audit log" className="mt-4">
        <div className="-m-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Time (UTC)</th><th>Actor</th><th>Action</th><th>Exception</th><th className="pr-4">Detail</th></tr></thead>
            <tbody>{audit.map((a, i) => (
              <tr key={i} className="border-t"><td className="px-4 py-2 font-mono text-xs">{a.at}</td><td>{a.who}</td><td><Pill tone={a.action === "Rejected" ? "destructive" : a.action === "Routed" ? "muted" : "success"}>{a.action}</Pill></td><td className="font-mono text-xs">{a.id}</td><td className="pr-4 font-mono text-xs text-muted-foreground">{a.detail}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
