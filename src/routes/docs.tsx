import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Shield, FileText, LifeBuoy, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation & Support — Data Toolkit for Sheets" },
      { name: "description", content: "Install the Google Workspace add-on, read the docs, and find privacy, terms and support." },
      { property: "og:title", content: "Documentation & Support — Data Toolkit for Sheets" },
      { property: "og:description", content: "Install, documentation, privacy, terms and support." },
    ],
  }),
  component: Docs,
});

const SITE = "https://www.datatoolkitforsheets.com";
const links = [
  { icon: Download, t: "Install the Google Workspace add-on", d: "Get Data Toolkit for Sheets from the Google Workspace Marketplace.", href: "https://workspace.google.com/marketplace/search/data%20toolkit%20for%20sheets" },
  { icon: BookOpen, t: "Documentation", d: "Guides for the API Tool, scheduling and the Enterprise Document Refinery.", href: SITE },
  { icon: Shield, t: "Privacy Policy", d: "How data is handled, stored and never sold.", href: `${SITE}/privacy` },
  { icon: FileText, t: "Terms of Service", d: "Usage terms for the add-on and website.", href: `${SITE}/terms` },
  { icon: LifeBuoy, t: "Support", d: "Questions, bug reports and feature requests.", href: `${SITE}/support` },
];

function Docs() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Documentation & Support" desc="Everything you need to install, configure and get help with Data Toolkit for Sheets." />
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((l) => (
          <a key={l.t} href={l.href} target="_blank" rel="noreferrer" className="group flex gap-4 rounded-lg border bg-card p-5 hover:border-primary">
            <l.icon className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1"><div className="flex items-center gap-1.5 font-semibold">{l.t}<ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{l.d}</p></div>
          </a>
        ))}
      </div>
    </>
  );
}
