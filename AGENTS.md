<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Site mirrors datatoolkitforsheets.com: top header nav + footer in AppShell (no sidebar); the Data Refinery module lives under /refinery as a layout with stage child routes — keeps the original site structure intact.
- Keep showcase financial facts, UTC availability filtering, agent validation, and export eligibility in a shared browser-safe domain module so all three views agree on the same sample data.
- Use a refinery-scoped React provider for the session cutoff so navigating between facts, agents, and delivery preserves the research context without implying persistent storage.
- Keep the agent playground local and label it as a simulator; do not advertise hosted MCP, live Sheets writes, or real licensed data without implementing those integrations.
- Generate financial XLSX workbooks with ExcelJS loaded on demand, including formula results and a provenance sheet so exports remain auditable and the initial page stays lightweight.
