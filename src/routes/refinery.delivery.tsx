import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Zap, ArrowLeft } from "lucide-react";
import { PageHeader, Pill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getSnapshot, getModel } from "@/lib/financial";
import { buildWorkbook, modelCsv, saveFile } from "@/lib/financial-workbook";
import { CutoffControl, useFinancial } from "@/components/refinery/FinancialContext";

export const Route = createFileRoute("/refinery/delivery")({
  head: () => ({ meta: [
    { title: "Financial Model Delivery — Data Toolkit for Sheets" },
    { name: "description", content: "Download a formula-driven financial workbook with approved inputs, source citations and point-in-time provenance." },
    { property: "og:title", content: "Financial Model Delivery — Data Toolkit for Sheets" },
    { property: "og:description", content: "Auditable spreadsheet models, CSV and JSON exports from fictional financial filings." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Delivery,
});
function Delivery() {
  const { asOf } = useFinancial();
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [event, setEvent] = useState("document.refined");
  const [url, setUrl] = useState("https://consumer.example/hooks/refinery");
  const [events, setEvents] = useState<{ time: string; event: string; url: string }[]>([]);
  const snapshot = getSnapshot(asOf);
  const pending = snapshot?.facts.filter((f) => !f.approved).length ?? 0;
  const blocked = !snapshot || (!approvedOnly && pending > 0);
  const facts = snapshot?.facts.filter((f) => !approvedOnly || f.approved) ?? [];
  const exportFile = async (format: "xlsx" | "csv" | "json") => {
    setMessage(""); setBusy(true);
    try {
      const filename = `NWND_FY2025_${snapshot?.version}_${asOf.slice(0, 10)}`;
      if (format === "xlsx") {
        const workbook = await buildWorkbook(asOf, approvedOnly);
        const buffer = await workbook.xlsx.writeBuffer();
        saveFile(`${filename}.xlsx`, new Uint8Array(buffer).slice().buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      } else if (format === "csv") saveFile(`${filename}.csv`, modelCsv(asOf, approvedOnly), "text/csv;charset=utf-8");
      else saveFile(`${filename}.json`, JSON.stringify(getModel(asOf, approvedOnly), null, 2), "application/json");
      setMessage(`${format.toUpperCase()} downloaded · ${facts.length} approved facts · ${pending} pending excluded.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  };
  const operating = facts.find((f) => f.key === "operating_income");
  const revenue = facts.find((f) => f.key === "revenue");
  return <>
    <PageHeader eyebrow="Stage 6 · Research workflow" title="Financial Model & Spreadsheet Bridge" desc="Research-ready financial statements with calculated growth, margins and source provenance." />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"><CutoffControl /><Pill tone="primary">NWND · FY2025 · USD millions</Pill></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Financial model preview</h2><Pill>{snapshot?.version ?? "No filing available"}</Pill></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="pb-3 text-left">Line item</th><th className="text-right">FY2025</th><th className="text-right">FY2024</th><th className="text-right">YoY</th></tr></thead><tbody>{facts.map((f) => <tr key={f.key} className="border-t"><td className="py-4 pr-3">{f.label}<div className="mt-1 text-[10px] text-muted-foreground">{f.citation.document_id} · p.{f.citation.page}</div></td><td className="text-right font-mono">{f.value.toLocaleString("en-US")}</td><td className="text-right font-mono">{f.prior.toLocaleString("en-US")}</td><td className="text-right font-mono text-success">{((f.value - f.prior) / Math.abs(f.prior) * 100).toFixed(1)}%</td></tr>)}{operating && revenue && <tr className="border-t bg-muted/40"><td className="py-3">Operating margin</td><td className="text-right font-mono">{(operating.value / revenue.value * 100).toFixed(1)}%</td><td className="text-right font-mono">{(operating.prior / revenue.prior * 100).toFixed(1)}%</td><td className="text-right text-xs text-muted-foreground">Calculated</td></tr>}</tbody></table></div>{!snapshot && <p className="py-8 text-sm text-muted-foreground">No filing was available at this cutoff.</p>}
      <div className="mt-5 flex flex-wrap gap-2"><Button disabled={blocked || busy} onClick={() => exportFile("xlsx")}><Download />{busy ? "Preparing…" : "Download Excel model"}</Button><Button variant="outline" disabled={blocked || busy} onClick={() => exportFile("csv")}><FileSpreadsheet />CSV</Button><Button variant="outline" disabled={blocked || busy} onClick={() => exportFile("json")}><FileJson />JSON</Button></div><p role="status" className="mt-3 text-sm text-success">{message}</p>
      </section>
      <aside className="min-w-0 border-l pl-5"><h2 className="text-sm font-semibold">Export governance</h2><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />Approved facts only</label><div className="mt-3"><Pill tone={pending ? "warning" : "success"}>{pending ? `${pending} fact awaiting review` : "All sample facts approved"}</Pill></div>{blocked && snapshot && <p role="alert" className="mt-3 text-xs text-destructive">Unreviewed facts cannot be exported. Select approved facts only.</p>}<dl className="mt-5 space-y-4 text-xs"><div><dt className="font-medium">Workbook tabs</dt><dd className="mt-1 text-muted-foreground">Inputs · Model · Provenance</dd></div><div><dt className="font-medium">Calculated cells</dt><dd className="mt-1 text-muted-foreground">Linked inputs, YoY growth, operating margin</dd></div><div><dt className="font-medium">Google Sheets</dt><dd className="mt-1 text-muted-foreground">Import the downloaded XLSX or CSV. No direct Sheets connection.</dd></div></dl><Button asChild variant="link" className="mt-4 h-auto whitespace-normal p-0"><Link to="/refinery/processing"><ArrowLeft />Review source facts</Link></Button></aside>
    </div>
    <section className="mt-8 border-t pt-5"><div className="mb-4 flex flex-wrap items-center gap-3"><h2 className="text-sm font-semibold">Downstream event preview</h2><Pill tone="warning">Simulation · no network request</Pill></div><div className="flex flex-wrap items-end gap-3"><label className="text-xs">Event<select aria-label="Event" value={event} onChange={(e) => setEvent(e.target.value)} className="mt-1 block rounded border bg-background p-2">{["document.refined", "metric.changed", "exception.resolved", "filing.superseded"].map((e) => <option key={e}>{e}</option>)}</select></label><label className="min-w-0 flex-1 text-xs">Target URL<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 block w-full rounded border bg-background p-2 font-mono text-xs" /></label><Button variant="outline" onClick={() => setEvents((old) => [{ time: new Date().toISOString(), event, url }, ...old])}><Zap />Simulate event</Button></div><div className="mt-4 space-y-2">{events.map((e, i) => <div key={i} className="break-all border-b py-2 text-xs"><span className="font-mono">{e.time} · {e.event}</span><span className="ml-2 text-muted-foreground">{e.url} · preview only</span></div>)}</div></section>
  </>;
}
