import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plug, CalendarClock, Braces, Table2, Layers, Bot } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Data Toolkit for Sheets — APIs and documents into Google Sheets" },
      { name: "description", content: "The bridge between external data APIs, documents, and Google Sheets. Automate API calls and fetch structured data directly into your spreadsheets." },
      { property: "og:title", content: "Data Toolkit for Sheets" },
      { property: "og:description", content: "The bridge between external data APIs, documents, and Google Sheets." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Plug, t: "Connect any API", d: "REST endpoints with headers, auth and query params — no scripting required." },
  { icon: Braces, t: "Flatten JSON automatically", d: "Nested responses become clean rows and columns, with a path selector for the data you need." },
  { icon: CalendarClock, t: "Schedule refreshes", d: "Hourly, daily or weekly pulls keep your sheets current while you sleep." },
  { icon: Table2, t: "Write to any range", d: "Append, overwrite or upsert into a named sheet and range." },
  { icon: Layers, t: "Refine documents", d: "Turn filings, transcripts and statements into validated tables.", to: "/enterprise" },
  { icon: Bot, t: "Feed AI agents", d: "The same clean data is exposed to LLMs and agents via MCP tools.", to: "/agents" },
] as const;

function Home() {
  return (
    <>
      <section className="rounded-xl border bg-card px-8 py-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Google Workspace add-on</div>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight">The bridge between external data APIs, documents, and Google Sheets.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Automate API calls and fetch structured data directly into Google Sheets. Now with an Enterprise Document Refinery that turns unstructured financial content into machine-ready tables.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/api-tool" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Try the API Tool <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/enterprise" className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Explore Enterprise Refinery</Link>
        </div>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {features.map((f) => {
          const body = (<><f.icon className="h-5 w-5 text-primary" /><div className="mt-3 font-semibold">{f.t}</div><p className="mt-1 text-sm text-muted-foreground">{f.d}</p></>);
          return "to" in f
            ? <Link key={f.t} to={f.to} className="rounded-lg border bg-card p-5 hover:border-primary">{body}</Link>
            : <div key={f.t} className="rounded-lg border bg-card p-5">{body}</div>;
        })}
      </div>

      <section className="mt-6 rounded-lg border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
          {["Install the add-on from Google Workspace Marketplace", "Paste an API URL or upload a document", "Preview and map fields to columns", "Send to Sheets — once or on a schedule"].map((s, i) => (
            <li key={s} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-foreground">{i + 1}</span><span className="text-sm">{s}</span></li>
          ))}
        </ol>
      </section>
    </>
  );
}
