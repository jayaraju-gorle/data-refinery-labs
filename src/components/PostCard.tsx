import { SITE, type Post } from "@/lib/blog";

export function PostCard({ p }: { p: Post }) {
  return (
    <a href={`${SITE}${p.url}`} target="_blank" rel="noreferrer" className="flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`rounded px-1.5 py-0.5 font-medium ${p.tag === "Cricket" ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"}`}>{p.tag}</span>
        {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
      <h3 className="mt-2 font-semibold leading-snug">{p.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>
      <span className="mt-3 text-sm font-medium text-primary">Read More →</span>
    </a>
  );
}
