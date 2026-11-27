import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/AppShell";
import { getFacts, getVersion, versions, factLabels, type FactKey } from "@/lib/financial";
import { CutoffControl, useFinancial } from "./FinancialContext";

export function FinancialFacts() {
  const { asOf, setAsOf } = useFinancial();
  const [basis, setBasis] = useState<"latest" | "original">("latest");
  const [metric, setMetric] = useState<FactKey>("revenue");
  const version = getVersion(asOf, basis);
  const facts = version ? getFacts(version) : [];
  const selected = facts.find((f) => f.key === metric);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><CutoffControl /><div className="flex flex-wrap gap-1">{(["latest", "original"] as const).map((b) => <Button key={b} size="sm" variant={basis === b ? "default" : "outline"} onClick={() => setBasis(b)}>{b === "latest" ? "Latest available" : "As originally filed"}</Button>)}</div></div>
    <div className="flex flex-wrap items-center gap-2"><Pill tone="warning">Fictional sample · NWND</Pill><Pill>{version?.label ?? "No available filing"}</Pill><Button variant="ghost" size="sm" onClick={() => setAsOf("2026-03-01T12:00")}>Before amendment</Button><Button variant="ghost" size="sm" onClick={() => setAsOf("2026-10-16T12:00")}>After amendment</Button></div>
    {!version ? <div className="border border-dashed p-10 text-center text-muted-foreground">No filing was available at this cutoff.</div> : <div className="grid gap-6 lg:grid-cols-2">
      <section className="min-w-0"><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-success" />Normalized financial facts</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2">Metric · USD m</th><th className="text-right">FY2025</th><th className="text-right">Confidence</th><th className="text-right">Source</th></tr></thead><tbody>{facts.map((f) => <tr key={f.key} className={`border-t ${metric === f.key ? "bg-accent/50" : ""}`}><td className="py-3 pr-2">{f.label}<div className="mt-1"><Pill tone={f.approved ? "success" : "warning"}>{f.approved ? "Approved sample" : "Review required"}</Pill></div></td><td className="text-right font-mono">{f.value.toLocaleString("en-US")}</td><td className="text-right font-mono">{(f.confidence * 100).toFixed(0)}%</td><td className="text-right"><Button aria-label={`Cite ${f.label}`} size="sm" variant="ghost" onClick={() => setMetric(f.key)}><FileText />p.{f.citation.page}</Button></td></tr>)}</tbody></table></div>
        <dl className="mt-5 grid gap-3 border-t pt-4 text-xs"><div><dt className="text-muted-foreground">Filed (UTC)</dt><dd className="font-mono">{version.filedAt}</dd></div><div><dt className="text-muted-foreground">Available to platform (UTC)</dt><dd className="font-mono">{version.availableAt}</dd></div><div><dt className="text-muted-foreground">Version lineage</dt><dd className="break-all font-mono">{version.id === versions[0].id ? "Original filing" : `${versions[0].id} → ${version.id}`}</dd></div></dl>
        <div className="mt-5 flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/refinery/agents">Agent tools<ArrowRight /></Link></Button><Button asChild><Link to="/refinery/delivery">Financial model<ArrowRight /></Link></Button></div>
      </section>
      <section className="min-w-0"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Source citation</h2><Pill>Reconstructed sample</Pill></div><div className="border bg-card p-5 shadow-sm"><div className="border-b pb-4 text-center font-serif"><h3 className="text-lg font-semibold">NORTHWIND INDUSTRIES</h3><p className="mt-1 text-xs">{version.label} · Fiscal year ended December 31, 2025</p><p className="mt-3 text-sm">{metric === "free_cash_flow" ? "Liquidity & capital resources" : "Consolidated statements of operations"}</p><p className="mt-1 text-xs text-muted-foreground">USD millions · fictional illustration</p></div><div className="mt-4 space-y-1">{facts.filter((f) => metric === "free_cash_flow" ? f.key === "free_cash_flow" : f.key !== "free_cash_flow").map((f) => <div key={f.key} className={`flex items-center justify-between gap-3 px-2 py-4 font-serif text-sm ${metric === f.key ? "bg-warning/15 outline outline-2 outline-primary" : "border-b"}`}><span>{factLabels[f.key]}</span><span className="font-mono">{f.value.toLocaleString("en-US")}</span></div>)}</div><p className="mt-6 text-xs leading-relaxed text-muted-foreground">{version.id === versions[0].id ? "Results reflect the originally filed annual report." : "Amendment: revenue and expense recognition updated; prior-period comparatives unchanged."}</p><div className="mt-8 text-right font-mono text-xs">Page {selected?.citation.page}</div></div>
        <pre className="mt-3 overflow-x-auto rounded border bg-muted/40 p-3 text-[11px]">{JSON.stringify(selected?.citation, null, 2)}</pre>
      </section>
    </div>}
  </div>;
}