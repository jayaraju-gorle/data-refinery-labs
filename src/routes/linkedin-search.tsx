import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/linkedin-search")({
  head: () => ({
    meta: [
      { title: "LinkedIn People Search & Export — Data Toolkit for Sheets" },
      { name: "description", content: "Search LinkedIn profiles by title, company and location, then export results to Google Sheets or CSV." },
      { property: "og:title", content: "LinkedIn People Search & Export — Data Toolkit for Sheets" },
      { property: "og:description", content: "Find people and export to Sheets." },
    ],
  }),
  component: Linkedin,
});

const people = [
  { n: "Priya Raman", t: "Head of Data Engineering", c: "Finlytics", l: "Bengaluru, India" },
  { n: "James Whitfield", t: "Data Engineering Manager", c: "Northbank Capital", l: "London, UK" },
  { n: "Ana Souza", t: "Senior Data Analyst", c: "Mercado Data", l: "São Paulo, Brazil" },
  { n: "Rahul Mehta", t: "VP Analytics", c: "Quantix", l: "Mumbai, India" },
  { n: "Emily Chen", t: "Data Product Manager", c: "Cloudhaven", l: "San Francisco, US" },
  { n: "Lukas Weber", t: "Lead Data Scientist", c: "Rheinwerk AI", l: "Berlin, Germany" },
];

function Linkedin() {
  const [q, setQ] = useState("data");
  const [loc, setLoc] = useState("");
  const res = people.filter((p) => (p.t + p.c + p.n).toLowerCase().includes(q.toLowerCase()) && p.l.toLowerCase().includes(loc.toLowerCase()));
  const csv = () => {
    const body = ["Name,Title,Company,Location", ...res.map((p) => [p.n, p.t, p.c, p.l].map((x) => `"${x}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "linkedin-people.csv";
    a.click();
  };
  return (
    <>
      <PageHeader eyebrow="Linkedin Data" title="LinkedIn People Search & Export" desc="Find professionals by keyword and location, then export the list to Google Sheets or CSV. Demo data shown." />
      <Panel>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border px-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, company or name" className="w-full bg-transparent py-2 text-sm outline-none" /></div>
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Location" className="rounded-md border px-3 py-2 text-sm" />
          <button onClick={csv} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Download className="h-4 w-4" />Export CSV</button>
        </div>
        <table className="mt-4 w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Name</th><th>Title</th><th>Company</th><th>Location</th></tr></thead>
          <tbody>{res.map((p) => <tr key={p.n} className="border-t"><td className="py-2 font-medium">{p.n}</td><td>{p.t}</td><td>{p.c}</td><td>{p.l}</td></tr>)}</tbody></table>
        {!res.length && <p className="py-6 text-center text-sm text-muted-foreground">No matches.</p>}
      </Panel>
    </>
  );
}
