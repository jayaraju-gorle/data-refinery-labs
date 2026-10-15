import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Radio, Search, History, CalendarDays, Trophy, RefreshCw, Send, MapPin } from "lucide-react";

export const Route = createFileRoute("/cricket-data")({
  head: () => ({
    meta: [
      { title: "Cricket Data Central — Data Toolkit for Sheets" },
      { name: "description", content: "Live matches, match search, recent results, scheduled fixtures and live series — each one available as an API you can open in the API Tool." },
      { property: "og:title", content: "Cricket Data Central — Data Toolkit for Sheets" },
      { property: "og:description", content: "Live cricket matches, results, fixtures and series data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cricket,
});

const API = "https://cricket-api-17265728893.asia-south1.run.app";
type Team = { short_name: string; score: string | null };
type Match = { series?: string; match_detail?: string; title?: string; status?: string; venue?: string | null; scorecard_url?: string | null; teams?: Team[] };
type Series = { series_name: string; date_range: string; schedule_url?: string; points_table_url?: string };

const tabs = [
  { id: "live", label: "Live Matches", icon: Radio },
  { id: "search", label: "Search Matches", icon: Search },
  { id: "recent", label: "Recent Matches", icon: History },
  { id: "scheduled", label: "Scheduled Matches", icon: CalendarDays },
  { id: "series", label: "Live Series", icon: Trophy },
] as const;
type Tab = (typeof tabs)[number]["id"];

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(API + path);
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error((body && body.error) || `HTTP error! Status: ${r.status}`);
  return body as T;
}

function statusTone(s = "") {
  const x = s.toLowerCase();
  if (x.includes("need") || x.includes("target")) return "bg-warning text-foreground";
  if (x.includes("won") || x.includes("completed")) return "bg-success text-primary-foreground";
  if (x.includes("abandon") || x.includes("no result")) return "bg-destructive text-destructive-foreground";
  return "bg-primary text-primary-foreground";
}

function TryApi({ path, label = "Try in API Tool" }: { path: string; label?: string }) {
  return (
    <Link to="/try" search={{ url: API + path }} className="inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground">
      <Send className="h-3.5 w-3.5" />{label}
    </Link>
  );
}

function Section({ title, path, onRefresh, loading, children }: { title: string; path: string; onRefresh?: () => void; loading?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <h2 className="text-2xl font-medium">{title}</h2>
        <div className="flex gap-2">
          {onRefresh && <button onClick={onRefresh} aria-label="Refresh" className="rounded-md border px-3 py-1.5 hover:bg-muted"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>}
          <TryApi path={path} />
        </div>
      </div>
      {children}
    </section>
  );
}

function Status({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" }) {
  return <div className={`rounded-md px-4 py-3 text-sm ${tone === "error" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>{children}</div>;
}

function MatchCard({ m }: { m: Match }) {
  const [t1, t2] = m.teams ?? [];
  return (
    <div className="flex flex-col rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-1 text-sm font-medium text-primary underline">{m.series || "N/A"}</div>
      {m.match_detail && <div className="mb-2 rounded border bg-muted py-1.5 text-center text-sm font-semibold">{m.match_detail}</div>}
      <h3 className="mb-2 text-lg font-medium">{m.title || "Match"}</h3>
      {t1 && t2 && (
        <div className="mb-3 flex items-center justify-between text-sm">
          <span><b className="capitalize">{t1.short_name}</b> {t1.score || "-"}</span>
          <span className="text-muted-foreground">vs</span>
          <span><b className="capitalize">{t2.short_name}</b> {t2.score || "-"}</span>
        </div>
      )}
      {m.status && <div className={`mb-2 rounded py-1.5 text-center text-sm font-semibold ${statusTone(m.status)}`}>{m.status}</div>}
      {m.venue && <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{m.venue}</div>}
      {m.scorecard_url && <div className="mt-auto pt-2"><TryApi path={m.scorecard_url} label="Scorecard API" /></div>}
    </div>
  );
}

function MatchList({ title, path }: { title: string; path: string }) {
  const q = useQuery({ queryKey: ["cricket", path], queryFn: () => getJson<Match[]>(path) });
  return (
    <Section title={title} path={path} onRefresh={() => q.refetch()} loading={q.isFetching}>
      {q.isLoading ? <Status>Loading {title.toLowerCase()}…</Status>
        : q.error ? <Status tone="error">Error: {(q.error as Error).message}</Status>
        : !q.data?.length ? <Status>No matches at the moment.</Status>
        : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{q.data.map((m, i) => <MatchCard key={i} m={m} />)}</div>}
    </Section>
  );
}

function SearchMatches() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const path = `/search-match?query=${encodeURIComponent(query)}`;
  const q = useQuery({ queryKey: ["cricket-search", query], queryFn: () => getJson<Record<string, unknown>>(path), enabled: !!query, retry: false });
  return (
    <Section title="Search Matches" path={query ? path : "/search-match?query=india%20vs%20england"}>
      <form onSubmit={(e) => { e.preventDefault(); setQuery(input.trim()); }} className="mb-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. India vs England 5th Test 2025" className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Search className="h-4 w-4" />Search</button>
      </form>
      {!query ? <Status>Enter a match to look up its scorecard.</Status>
        : q.isLoading ? <Status>Searching…</Status>
        : q.error ? <Status tone="error">No match found for the given search query. ({(q.error as Error).message})</Status>
        : <pre className="max-h-[480px] overflow-auto rounded-md bg-muted p-4 font-mono text-xs">{JSON.stringify(q.data, null, 2)}</pre>}
    </Section>
  );
}

function LiveSeries() {
  const [filter, setFilter] = useState("");
  const q = useQuery({ queryKey: ["cricket", "/live-series"], queryFn: () => getJson<Series[]>("/live-series") });
  const list = (q.data ?? []).filter((s) => s.series_name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <Section title="Live Series" path="/live-series" onRefresh={() => q.refetch()} loading={q.isFetching}>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter series…" className="mb-4 w-full rounded-md border bg-background px-3 py-2 text-sm" />
      {q.isLoading ? <Status>Loading live series…</Status>
        : q.error ? <Status tone="error">Error: {(q.error as Error).message}</Status>
        : !list.length ? <Status>{filter ? "No series found matching your search." : "No live series found."}</Status>
        : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((s) => (
            <div key={s.series_name} className="flex flex-col rounded-lg border p-4">
              <h3 className="font-medium">{s.series_name}</h3>
              <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{s.date_range}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                {s.schedule_url && <TryApi path={s.schedule_url} label="Schedule API" />}
                {s.points_table_url && <TryApi path={s.points_table_url} label="Points Table API" />}
              </div>
            </div>
          ))}</div>}
    </Section>
  );
}

function Cricket() {
  const [tab, setTab] = useState<Tab>("live");
  return (
    <div className="rounded-2xl bg-muted/40 p-6">
      <h1 className="text-4xl font-medium">Cricket Data Central</h1>
      <p className="mt-3 max-w-4xl text-lg text-muted-foreground">Access real-time cricket data, historical match results, and upcoming schedules. Explore comprehensive statistics and insights for your favorite teams and players.</p>
      <div className="my-6 flex flex-wrap gap-1 rounded-xl border bg-card p-2 shadow-sm" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>
      {tab === "live" && <MatchList title="Live Matches" path="/live" />}
      {tab === "search" && <SearchMatches />}
      {tab === "recent" && <MatchList title="Recent Matches" path="/recent-matches" />}
      {tab === "scheduled" && <MatchList title="Scheduled Matches" path="/future-matches" />}
      {tab === "series" && <LiveSeries />}
    </div>
  );
}
