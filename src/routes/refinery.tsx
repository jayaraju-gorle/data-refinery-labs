import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/refinery")({
  head: () => ({
    meta: [
      { title: "Enterprise Data Refinery — Data Toolkit for Sheets" },
      { name: "description", content: "Turn filings, transcripts and statements into validated, machine-ready data for Google Sheets and AI agents." },
      { property: "og:title", content: "Enterprise Data Refinery — Data Toolkit for Sheets" },
      { property: "og:description", content: "Ingest, parse, curate, search, serve to agents and export to Sheets." },
    ],
  }),
  component: RefineryLayout,
});

const stages = [
  { to: "/refinery", label: "Overview", exact: true },
  { to: "/refinery/ingestion", label: "1 · Sourcing & Ingestion" },
  { to: "/refinery/processing", label: "2 · Parsing & JSON" },
  { to: "/refinery/curation", label: "3 · HITL Curation" },
  { to: "/refinery/search", label: "4 · Hybrid Retrieval" },
  { to: "/refinery/agents", label: "5 · MCP & Agents" },
  { to: "/refinery/delivery", label: "6 · Delivery" },
] as const;

function RefineryLayout() {
  return (
    <>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-card p-1">
        {stages.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            activeOptions={{ exact: "exact" in s }}
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </>
  );
}
