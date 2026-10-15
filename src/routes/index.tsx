import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Trophy, Layers } from "lucide-react";
import { posts } from "@/lib/blog";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Data Toolkit for Sheets - Advanced Data Tools for Spreadsheets" },
      { name: "description", content: "Your all-in-one data & cricket hub: API tool, cricket stats and the new Enterprise Data Refinery for Google Sheets." },
      { property: "og:title", content: "Data Toolkit for Sheets - Your All-in-One Data & Cricket Hub" },
      { property: "og:description", content: "API tool, cricket stats and an Enterprise Data Refinery for Google Sheets." },
    ],
  }),
  component: Home,
});

const solutions = [
  { icon: Send, t: "API Integration Tool", d: "Instantly test, connect, and explore APIs. Paste a cURL, see results, and export data effortlessly.", to: "/try" },
  { icon: Trophy, t: "Cricket Data Central", d: "Get live scores, schedules, and in-depth stats for all major cricket series and tournaments.", to: "/cricket-data" },
  { icon: Layers, t: "Enterprise Data Refinery", d: "Turn 10-K filings, earnings transcripts and statements into validated, machine-ready tables for Sheets and AI agents.", to: "/refinery", isNew: true },
] as const;

function Home() {
  return (
    <>
      <section className="rounded-xl bg-gradient-to-br from-brand-from to-brand-to px-8 py-14 text-center text-brand-foreground">
        <h1 className="text-3xl font-bold md:text-4xl">Your All-in-One Data & Cricket Hub</h1>
        <p className="mx-auto mt-3 max-w-2xl opacity-90">Powerful tools for data analysis, API testing, and a comprehensive resource for cricket fans with live scores, schedules, and news.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/try" className="rounded-md bg-brand-foreground px-5 py-2.5 text-sm font-semibold text-primary hover:opacity-90">Explore Tools</Link>
          <Link to="/cricket-data" className="rounded-md border border-brand-foreground px-5 py-2.5 text-sm font-semibold hover:bg-brand-foreground/15">View Cricket Data</Link>
        </div>
      </section>

      <h2 className="mb-5 mt-12 text-center text-2xl font-semibold">Data Solutions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((s) => (
          <Link key={s.t} to={s.to} className="relative rounded-lg border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md">
            {"isNew" in s && <span className="absolute right-3 top-3 rounded bg-primary px-1.5 text-[10px] font-bold uppercase text-primary-foreground">New</span>}
            <s.icon className="mx-auto h-9 w-9 text-primary" />
            <h3 className="mt-3 font-semibold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </Link>
        ))}
      </div>

      <div className="mb-5 mt-12 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Latest From Our Blog</h2>
        <Link to="/blog" className="text-sm font-medium text-primary">View All Posts →</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[posts[0], posts[1], posts[2]].map((p) => <PostCard key={p.title} p={p} />)}
      </div>

      <section className="mt-12 rounded-xl border bg-card px-8 py-10 text-center">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">Explore our tools and see how they can help you work with data more effectively.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/try" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Explore Our Free Tools</Link>
        </div>
      </section>
    </>
  );
}
