import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { posts } from "@/lib/blog";
import { PostCard } from "@/components/PostCard";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Data Toolkit for Sheets" },
      { name: "description", content: "Guides on automating API calls in Google Sheets plus cricket series coverage and match reports." },
      { property: "og:title", content: "Blog — Data Toolkit for Sheets" },
      { property: "og:description", content: "API automation guides and cricket coverage." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const [tag, setTag] = useState<"All" | "API Tool" | "Cricket">("All");
  const list = posts.filter((p) => tag === "All" || p.tag === tag);
  return (
    <>
      <PageHeader eyebrow="Blog" title="Latest posts" desc="API automation guides for Google Sheets and cricket series coverage." />
      <div className="mb-5 flex gap-2">
        {(["All", "API Tool", "Cricket"] as const).map((t) => (
          <button key={t} onClick={() => setTag(t)} className={`rounded-full border px-3 py-1 text-sm ${tag === t ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{t}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">{list.map((p) => <PostCard key={p.title + p.date} p={p} />)}</div>
    </>
  );
}
