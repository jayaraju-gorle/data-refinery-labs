import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Pill } from "@/components/AppShell";

export const Route = createFileRoute("/cricket-data")({
  head: () => ({
    meta: [
      { title: "Cricket Data Central — Data Toolkit for Sheets" },
      { name: "description", content: "Cricket schedules, points tables and match statistics for major series, exportable to Google Sheets." },
      { property: "og:title", content: "Cricket Data Central — Data Toolkit for Sheets" },
      { property: "og:description", content: "Schedules, points tables and match stats." },
    ],
  }),
  component: Cricket,
});

const schedule = [
  { m: "1st Test", v: "Headingley, Leeds", d: "Jun 20, 2025", r: "England won by 5 wkts" },
  { m: "2nd Test", v: "Edgbaston, Birmingham", d: "Jul 2, 2025", r: "India won by 336 runs" },
  { m: "3rd Test", v: "Lord's, London", d: "Jul 10, 2025", r: "England won by 22 runs" },
  { m: "4th Test", v: "Old Trafford, Manchester", d: "Jul 23, 2025", r: "Match drawn" },
  { m: "5th Test", v: "The Oval, London", d: "Jul 31, 2025", r: "India won by 6 runs" },
];
const table = [
  { t: "Australia", p: 3, w: 3, l: 0, d: 0, pct: 100 },
  { t: "Sri Lanka", p: 2, w: 1, l: 0, d: 1, pct: 66.67 },
  { t: "India", p: 5, w: 2, l: 2, d: 1, pct: 46.67 },
  { t: "England", p: 5, w: 2, l: 2, d: 1, pct: 43.33 },
  { t: "Bangladesh", p: 2, w: 0, l: 1, d: 1, pct: 16.67 },
];
const batters = [
  { n: "Shubman Gill", r: 754, avg: 75.4, hs: 269 },
  { n: "Joe Root", r: 537, avg: 67.12, hs: 150 },
  { n: "KL Rahul", r: 532, avg: 53.2, hs: 137 },
  { n: "Ravindra Jadeja", r: 516, avg: 86.0, hs: 107 },
  { n: "Harry Brook", r: 481, avg: 53.44, hs: 158 },
];

function Cricket() {
  const [tab, setTab] = useState<"Schedule" | "Points Table" | "Stats">("Schedule");
  return (
    <>
      <PageHeader eyebrow="Cricket Data Central" title="India tour of England 2025 — Anderson-Tendulkar Trophy" desc="Schedules, points tables and match statistics. Pull any table straight into Google Sheets with the add-on." />
      <div className="mb-4 flex gap-1 border-b">
        {(["Schedule", "Points Table", "Stats"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "Schedule" && (
        <Panel title="Fixtures & results" right={<Pill tone="success">Series drawn 2-2</Pill>}>
          <table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Match</th><th>Venue</th><th>Date</th><th>Result</th></tr></thead>
            <tbody>{schedule.map((s) => <tr key={s.m} className="border-t"><td className="py-2 font-medium">{s.m}</td><td>{s.v}</td><td>{s.d}</td><td>{s.r}</td></tr>)}</tbody></table>
        </Panel>
      )}
      {tab === "Points Table" && (
        <Panel title="ICC World Test Championship 2025–27">
          <table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>D</th><th>PCT</th></tr></thead>
            <tbody>{table.map((r, i) => <tr key={r.t} className="border-t"><td className="py-2">{i + 1}</td><td className="font-medium">{r.t}</td><td>{r.p}</td><td>{r.w}</td><td>{r.l}</td><td>{r.d}</td><td className="font-mono">{r.pct.toFixed(2)}</td></tr>)}</tbody></table>
        </Panel>
      )}
      {tab === "Stats" && (
        <Panel title="Most runs in the series">
          <div className="space-y-3">{batters.map((b) => (
            <div key={b.n}><div className="flex justify-between text-sm"><span className="font-medium">{b.n}</span><span className="font-mono">{b.r} runs · avg {b.avg} · HS {b.hs}</span></div>
              <div className="mt-1 h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(b.r / 754) * 100}%` }} /></div></div>
          ))}</div>
        </Panel>
      )}
    </>
  );
}
