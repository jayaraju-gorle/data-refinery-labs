import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, FileAudio, FileSpreadsheet, FileCode, Globe, Upload, GitBranch } from "lucide-react";
import { PageHeader, Panel, Pill, Conf } from "@/components/AppShell";
import { docs as seed, type Doc } from "@/lib/data";

export const Route = createFileRoute("/ingestion")({
  head: () => ({
    meta: [
      { title: "Sourcing & Ingestion — Insight Refinery" },
      { name: "description", content: "Multi-format ingestion of filings, transcripts, statements, research and press releases with lineage." },
      { property: "og:title", content: "Sourcing & Ingestion — Insight Refinery" },
      { property: "og:description", content: "Document inventory with lineage, point-in-time validity and entity tags." },
    ],
  }),
  component: Ingestion,
});

const icon = { PDF: FileText, HTML: Globe, XBRL: FileCode, Audio: FileAudio, XLSX: FileSpreadsheet, TXT: FileText };
const statusTone = { Refined: "success", Parsing: "primary", "In Review": "warning", Queued: "muted" } as const;

function Ingestion() {
  const [docs, setDocs] = useState<Doc[]>(seed);
  const [sel, setSel] = useState(seed[0].id);
  const [fmt, setFmt] = useState("All");
  const [pit, setPit] = useState("2026-10-15");
  const list = useMemo(
    () => docs.filter((d) => (fmt === "All" || d.format === fmt) && d.validFrom <= pit && (!d.validTo || d.validTo > pit)),
    [docs, fmt, pit],
  );
  const d = docs.find((x) => x.id === sel)!;

  const simulate = () => {
    const n: Doc = { ...seed[4], id: `DOC-BR-${4400 + docs.length}`, title: "Simulated upload — Broker note (PDF)", ingestedAt: new Date().toISOString(), status: "Queued", confidence: 0, validFrom: pit };
    setDocs([n, ...docs]);
    setSel(n.id);
    setTimeout(() => setDocs((ds) => ds.map((x) => (x.id === n.id ? { ...x, status: "Parsing" } : x))), 1200);
    setTimeout(() => setDocs((ds) => ds.map((x) => (x.id === n.id ? { ...x, status: "Refined", confidence: 0.91 } : x))), 3200);
  };

  return (
    <>
      <PageHeader eyebrow="Stage 1 · Source" title="Sourcing & Multi-Format Ingestion" desc="Structured and unstructured content acquired across channels, fingerprinted, versioned and stamped with point-in-time validity before refinement."
        actions={<button onClick={simulate} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Upload className="h-4 w-4" />Simulate ingest</button>} />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[["SEC EDGAR API", "12.4k/h"], ["SFTP partner drops", "38 feeds"], ["RSS / IR webcasts", "2.1k/h"], ["Web & newswire", "41k/h"], ["Licensed research", "9 vendors"]].map(([a, b]) => (
          <div key={a} className="rounded-lg border bg-card px-3 py-2"><div className="text-xs text-muted-foreground">{a}</div><div className="font-mono text-sm">{b}</div></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title={`Document inventory (${list.length})`} className="lg:col-span-3"
          right={<div className="flex items-center gap-2 text-xs">
            <label className="text-muted-foreground">As of</label>
            <input type="date" value={pit} onChange={(e) => setPit(e.target.value)} className="rounded border bg-background px-1.5 py-0.5" />
            <select value={fmt} onChange={(e) => setFmt(e.target.value)} className="rounded border bg-background px-1.5 py-0.5">
              {["All", "PDF", "HTML", "XBRL", "Audio", "XLSX", "TXT"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>}>
          <div className="-m-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Document</th><th>Format</th><th>Entities</th><th>Status</th><th className="pr-4">Conf.</th></tr></thead>
              <tbody>
                {list.map((x) => {
                  const I = icon[x.format];
                  return (
                    <tr key={x.id} onClick={() => setSel(x.id)} className={`cursor-pointer border-t hover:bg-muted/40 ${sel === x.id ? "bg-accent/60" : ""}`}>
                      <td className="px-4 py-2.5"><div className="flex items-start gap-2"><I className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><div><div className="font-medium leading-tight">{x.title}</div><div className="font-mono text-[11px] text-muted-foreground">{x.id} · {x.type}</div></div></div></td>
                      <td><Pill>{x.format}</Pill></td>
                      <td className="space-x-1">{x.tickers.map((t) => <Pill key={t} tone="primary">{t}</Pill>)}</td>
                      <td><Pill tone={statusTone[x.status]}>{x.status}</Pill></td>
                      <td className="pr-4"><Conf v={x.confidence} /></td>
                    </tr>
                  );
                })}
                {!list.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No documents valid at this point in time.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Document metadata" className="lg:col-span-2">
          <div className="font-mono text-xs text-muted-foreground">{d.id}</div>
          <div className="mt-1 font-semibold">{d.title}</div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[["Format", d.format], ["Pages / segments", d.pages], ["Source", d.source], ["Ingested", new Date(d.ingestedAt).toUTCString().slice(5, 22) + " UTC"], ["Valid from", d.validFrom], ["Valid to", d.validTo ?? "current"], ["CUSIP", d.cusip], ["SEDOL", d.sedol]].map(([k, v]) => (
              <div key={k as string}><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="font-mono text-xs">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-4"><div className="text-[11px] uppercase tracking-wide text-muted-foreground">Entity tags</div><div className="mt-1 flex flex-wrap gap-1">{d.tickers.map((t) => <Pill key={t} tone="primary">{t}</Pill>)}<Pill>CUSIP {d.cusip}</Pill><Pill>SEDOL {d.sedol}</Pill></div></div>
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"><GitBranch className="h-3.5 w-3.5" />Source lineage</div>
            <ol className="relative ml-2 border-l pl-4">
              {d.lineage.map((l, i) => (
                <li key={l} className="mb-3 text-sm"><span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" /><span className="font-mono text-[10px] text-muted-foreground">step {i + 1}</span><div>{l}</div></li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>
    </>
  );
}
