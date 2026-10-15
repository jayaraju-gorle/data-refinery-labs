# Data Refinery Labs

Build an enterprise document intelligence and refinery platform prototype with a neutral, professional enterprise product design (do not copy or imitate any specific corporate branding).

Focus strictly on demonstrating the platform capabilities and end-to-end data lifecycle:

1. Sourcing & Multi-Format Ingestion:
- Ingest both structured and unstructured financial documents (e.g. SEC 10-K/10-Q filings, earnings call audio transcripts, tabular financial statements, broker research, and press releases).
- Display document metadata: source lineage, ingestion timestamp, point-in-time validity, document format, and entity tags (tickers, CUSIP/SEDOL).

2. Data Refinery & Processing Engine:
- Layout-aware parsing: visual comparison between raw document and extracted layout (text blocks, key-value metrics, structured tables).
- Intelligent chunking & enrichment: semantic + lexical chunking with embedded metadata.
- Machine-ready JSON contract: an interactive schema view showing normalized, validated JSON output ready for downstream consumers.
- Human-in-the-Loop (HITL) Curation Workbench: an exception queue showing low-confidence extractions (<85% confidence, ambiguous table headers, OCR discrepancies) with steward review, inline correction, and approval audit log.

3. Downstream AI & Consumption Delivery:
- Hybrid Search & Traceability: BM25 lexical + dense vector search with re-ranking scores and citation/bounding-box source traceability.
- Model Context Protocol (MCP) & Agent Endpoints: view exposed agentic tools (e.g., fetch_document_chunk, extract_tabular_data) demonstrating how downstream LLMs and autonomous agents consume the refinery.
- Downstream Workflow Delivery: export clean tabular data to spreadsheet/data-toolkit formats and trigger downstream event webhooks.

Make the interface interactive, modular, and clear for executive and technical product leadership walkthroughs.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://data-refinery-labs.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/491ecf66-2037-4618-96fa-527912563628).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
