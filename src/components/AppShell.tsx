import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Home, Send, Trophy, Newspaper, Layers, Menu, X, Youtube, Instagram } from "lucide-react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/try", label: "Data Tools", icon: Send },
  { to: "/cricket-data", label: "Cricket Data", icon: Trophy },
  { to: "/blog", label: "Blog", icon: Newspaper },
  { to: "/refinery", label: "Data Refinery", icon: Layers, isNew: true },
] as const;

const SITE = "https://www.datatoolkitforsheets.com";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="bg-gradient-to-br from-brand-from to-brand-to py-4 text-brand-foreground shadow-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center" aria-label="Data Toolkit Homepage">
            <img src="/logo.png" alt="Data Toolkit for Sheets Logo" width={50} height={50} className="mr-4 h-[50px] w-[50px]" />
            <div>
              <div className="text-xl font-semibold leading-tight md:text-2xl">Welcome to Data Toolkit for Sheets</div>
              <p className="text-sm opacity-90">Advanced data tools to supercharge your spreadsheet experience</p>
            </div>
          </Link>
          <button className="md:hidden" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <nav className={`mx-auto mt-3 max-w-[1200px] px-5 ${open ? "block" : "hidden"} md:block`}>
          <ul className="flex flex-col gap-1 md:flex-row md:flex-wrap">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: n.to === "/" }}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium opacity-90 hover:bg-brand-foreground/15 hover:opacity-100"
                  activeProps={{ className: "bg-brand-foreground/20 opacity-100" }}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                  {"isNew" in n && <span className="rounded bg-brand-foreground px-1.5 text-[10px] font-bold uppercase text-primary">New</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8">{children}</main>

      <footer className="bg-footer py-8 text-footer-foreground">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-5 text-sm">
          <div className="flex items-center gap-5">
            <img src="/logo.png" alt="Data Toolkit for Sheets Logo" width={60} height={60} className="h-[60px] w-[60px]" />
            <a href="https://www.youtube.com/@DataToolkitForSheets" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-brand-foreground"><Youtube className="h-6 w-6" /></a>
            <a href="https://www.instagram.com/datatoolkitforsheets/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-brand-foreground"><Instagram className="h-6 w-6" /></a>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            <a href={`${SITE}/privacy.html`} className="hover:text-brand-foreground">Privacy Policy</a>
            <a href={`${SITE}/terms.html`} className="hover:text-brand-foreground">Terms of Service</a>
            <a href={`${SITE}/support.html`} className="hover:text-brand-foreground">Support</a>
          </div>
          <div className="text-xs opacity-70">© {new Date().getFullYear()} Data Toolkit for Sheets. All rights reserved.</div>
        </div>
      </footer>
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
