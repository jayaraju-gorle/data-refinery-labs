import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Inbox, Layers, ShieldCheck, Search, Bot, Send, Hexagon,
} from "lucide-react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, group: "Platform" },
  { to: "/ingestion", label: "Sourcing & Ingestion", icon: Inbox, group: "1 · Source" },
  { to: "/refinery", label: "Refinery Engine", icon: Layers, group: "2 · Refine" },
  { to: "/curation", label: "Curation Workbench", icon: ShieldCheck, group: "2 · Refine" },
  { to: "/search", label: "Hybrid Search", icon: Search, group: "3 · Deliver" },
  { to: "/agents", label: "MCP & Agent Endpoints", icon: Bot, group: "3 · Deliver" },
  { to: "/delivery", label: "Workflow Delivery", icon: Send, group: "3 · Deliver" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  let lastGroup = "";
  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
          <Hexagon className="h-6 w-6 text-sidebar-primary" />
          <div>
            <div className="text-sm font-semibold text-sidebar-accent-foreground">Insight Refinery</div>
            <div className="text-[11px] uppercase tracking-wider opacity-60">Document Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((n) => {
            const header = n.group !== lastGroup ? n.group : null;
            lastGroup = n.group;
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <div key={n.to}>
                {header && <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest opacity-50 first:mt-0">{header}</div>}
                <Link
                  to={n.to}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"}`}
                >
                  <n.icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                  {n.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-3 text-[11px] opacity-60">Prototype · mock data · v0.4</div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="whitespace-nowrap rounded px-2 py-1 text-xs" activeProps={{ className: "bg-accent text-accent-foreground" }} activeOptions={{ exact: n.to === "/" }}>{n.label}</Link>
          ))}
        </div>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{desc}</p>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, right, children, className = "" }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border bg-card ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "success" | "warning" | "destructive" }) {
  const t = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${t}`}>{children}</span>;
}

export function Conf({ v }: { v: number }) {
  if (!v) return <Pill>—</Pill>;
  const tone = v >= 0.9 ? "success" : v >= 0.85 ? "primary" : "warning";
  return <Pill tone={tone}>{(v * 100).toFixed(0)}%</Pill>;
}
