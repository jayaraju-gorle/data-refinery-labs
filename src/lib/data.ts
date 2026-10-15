export type DocFormat = "PDF" | "HTML" | "XBRL" | "Audio" | "XLSX" | "TXT";

export interface Doc {
  id: string;
  title: string;
  type: string;
  format: DocFormat;
  source: string;
  lineage: string[];
  ingestedAt: string;
  validFrom: string;
  validTo: string | null;
  tickers: string[];
  cusip: string;
  sedol: string;
  pages: number;
  status: "Refined" | "Parsing" | "In Review" | "Queued";
  confidence: number;
}

export const docs: Doc[] = [
  { id: "DOC-10K-8841", title: "Northwind Industries — Annual Report (10-K) FY2025", type: "SEC 10-K", format: "HTML", source: "SEC EDGAR (API)", lineage: ["EDGAR full-text feed", "Acquisition svc v3.2", "Object store /raw/edgar/2026/02", "Layout parser v5.1"], ingestedAt: "2026-10-15T06:12:44Z", validFrom: "2026-02-21", validTo: null, tickers: ["NWND"], cusip: "66987V109", sedol: "B1YW440", pages: 142, status: "Refined", confidence: 0.97 },
  { id: "DOC-10Q-3307", title: "Halcyon Bio — Quarterly Report (10-Q) Q3 2026", type: "SEC 10-Q", format: "XBRL", source: "SEC EDGAR (API)", lineage: ["EDGAR XBRL feed", "Acquisition svc v3.2", "XBRL normalizer v2.0"], ingestedAt: "2026-10-15T05:48:02Z", validFrom: "2026-10-14", validTo: null, tickers: ["HLCB"], cusip: "40637H104", sedol: "BMG7Q21", pages: 58, status: "In Review", confidence: 0.82 },
  { id: "DOC-ECT-1190", title: "Northwind Industries — Q3 2026 Earnings Call", type: "Earnings call transcript", format: "Audio", source: "IR webcast (RSS)", lineage: ["IR RSS poller", "ASR speech-to-text v4", "Speaker diarization", "Transcript normalizer"], ingestedAt: "2026-10-15T04:31:19Z", validFrom: "2026-10-14", validTo: null, tickers: ["NWND"], cusip: "66987V109", sedol: "B1YW440", pages: 24, status: "Refined", confidence: 0.93 },
  { id: "DOC-FS-7752", title: "Meridian Capital — Consolidated Financial Statements", type: "Tabular financial statement", format: "XLSX", source: "Partner SFTP drop", lineage: ["SFTP watcher", "Spreadsheet extractor v1.4", "Table normalizer"], ingestedAt: "2026-10-15T03:05:51Z", validFrom: "2026-09-30", validTo: null, tickers: ["MRDN"], cusip: "58955Q102", sedol: "BK5XW93", pages: 12, status: "In Review", confidence: 0.79 },
  { id: "DOC-BR-4410", title: "Sector Initiation: Specialty Pharma (Broker Research)", type: "Broker research", format: "PDF", source: "Licensed research feed (FTP)", lineage: ["FTP ingest", "OCR engine v6", "Layout parser v5.1", "Entitlements tagger"], ingestedAt: "2026-10-14T22:40:10Z", validFrom: "2026-10-14", validTo: null, tickers: ["HLCB", "VRDX", "PLMR"], cusip: "40637H104", sedol: "BMG7Q21", pages: 36, status: "In Review", confidence: 0.84 },
  { id: "DOC-PR-0921", title: "Northwind Announces $500M Share Repurchase", type: "Press release", format: "HTML", source: "Newswire (Web)", lineage: ["Newswire crawler", "Boilerplate stripper", "Entity resolver"], ingestedAt: "2026-10-14T20:15:33Z", validFrom: "2026-10-14", validTo: null, tickers: ["NWND"], cusip: "66987V109", sedol: "B1YW440", pages: 2, status: "Refined", confidence: 0.99 },
  { id: "DOC-10K-8790", title: "Northwind Industries — Annual Report (10-K) FY2024", type: "SEC 10-K", format: "HTML", source: "SEC EDGAR (API)", lineage: ["EDGAR full-text feed", "Acquisition svc v3.1", "Layout parser v5.0"], ingestedAt: "2025-02-22T07:01:00Z", validFrom: "2025-02-20", validTo: "2026-02-21", tickers: ["NWND"], cusip: "66987V109", sedol: "B1YW440", pages: 138, status: "Refined", confidence: 0.96 },
  { id: "DOC-PR-0933", title: "Halcyon Bio Receives FDA Breakthrough Designation", type: "Press release", format: "TXT", source: "Newswire (Web)", lineage: ["Newswire crawler", "Entity resolver"], ingestedAt: "2026-10-15T07:58:12Z", validFrom: "2026-10-15", validTo: null, tickers: ["HLCB"], cusip: "40637H104", sedol: "BMG7Q21", pages: 1, status: "Parsing", confidence: 0 },
];

export interface Chunk {
  id: string;
  docId: string;
  section: string;
  page: number;
  bbox: [number, number, number, number];
  text: string;
  strategy: "semantic" | "lexical" | "table";
  tokens: number;
  entities: string[];
}

export const chunks: Chunk[] = [
  { id: "CH-001", docId: "DOC-10K-8841", section: "Item 7. MD&A — Results of Operations", page: 41, bbox: [72, 140, 540, 260], strategy: "semantic", tokens: 312, entities: ["NWND", "Revenue", "FY2025"], text: "Total revenue increased 11.4% to $8.42 billion in fiscal 2025, driven primarily by volume growth in the Industrial Automation segment and favorable pricing across North America." },
  { id: "CH-002", docId: "DOC-10K-8841", section: "Item 7. MD&A — Liquidity", page: 47, bbox: [72, 300, 540, 420], strategy: "semantic", tokens: 276, entities: ["NWND", "Free cash flow"], text: "Free cash flow was $1.13 billion, up from $0.94 billion in the prior year, reflecting higher operating income and disciplined capital expenditure." },
  { id: "CH-003", docId: "DOC-10K-8841", section: "Item 1A. Risk Factors", page: 18, bbox: [72, 90, 540, 230], strategy: "lexical", tokens: 401, entities: ["NWND", "Supply chain", "Tariffs"], text: "Changes in tariffs and trade policy could increase the cost of components sourced from Asia and adversely affect our gross margin and supply chain resilience." },
  { id: "CH-004", docId: "DOC-ECT-1190", section: "Q&A — CFO remarks", page: 9, bbox: [60, 210, 552, 330], strategy: "semantic", tokens: 188, entities: ["NWND", "Guidance", "Margin"], text: "CFO: We are raising full-year operating margin guidance to 18.5%, as pricing actions and cost programs are tracking ahead of plan. Revenue growth guidance remains high single digits." },
  { id: "CH-005", docId: "DOC-PR-0921", section: "Body", page: 1, bbox: [50, 120, 560, 240], strategy: "lexical", tokens: 142, entities: ["NWND", "Buyback"], text: "Northwind's Board of Directors authorized a new share repurchase program of up to $500 million, reflecting confidence in sustained free cash flow generation." },
  { id: "CH-006", docId: "DOC-BR-4410", section: "Investment thesis", page: 3, bbox: [72, 160, 540, 300], strategy: "semantic", tokens: 355, entities: ["HLCB", "VRDX", "Pipeline"], text: "We initiate Halcyon Bio at Overweight; the lead oncology asset carries the sector's most attractive risk-adjusted revenue opportunity, with peak sales potential above $2.1 billion." },
  { id: "CH-007", docId: "DOC-10Q-3307", section: "Condensed Statements of Operations", page: 4, bbox: [60, 180, 560, 470], strategy: "table", tokens: 520, entities: ["HLCB", "R&D expense", "Q3 2026"], text: "Research and development expense: $214.6M (Q3 2026) vs $171.2M (Q3 2025). Net loss: $(98.3)M vs $(121.7)M. Revenue: $142.0M vs $88.5M." },
  { id: "CH-008", docId: "DOC-ECT-1190", section: "Prepared remarks — CEO", page: 2, bbox: [60, 90, 552, 220], strategy: "semantic", tokens: 240, entities: ["NWND", "Automation", "Backlog"], text: "CEO: Backlog reached a record $5.6 billion, with industrial automation orders up 14% year over year and strong demand for our robotics integration services." },
];

export interface Exception {
  id: string;
  docId: string;
  field: string;
  extracted: string;
  confidence: number;
  reason: "Low confidence" | "Ambiguous table header" | "OCR discrepancy";
  context: string;
  page: number;
}

export const exceptions: Exception[] = [
  { id: "EX-2041", docId: "DOC-10Q-3307", field: "income_statement.rd_expense.q3_2026", extracted: "$2l4.6M", confidence: 0.71, reason: "OCR discrepancy", context: "Research and development … 2l4.6 … 171.2", page: 4 },
  { id: "EX-2042", docId: "DOC-FS-7752", field: "balance_sheet.header[3]", extracted: "FY25 / Restated?", confidence: 0.64, reason: "Ambiguous table header", context: "Column header spans two periods: 'Sep-25 (restated)' and 'Sep-25'", page: 3 },
  { id: "EX-2043", docId: "DOC-BR-4410", field: "price_target.VRDX", extracted: "$48.00", confidence: 0.81, reason: "Low confidence", context: "Target price table split across page break (p. 7–8)", page: 7 },
  { id: "EX-2044", docId: "DOC-FS-7752", field: "cash_flow.capex.fy2025", extracted: "(312.4)", confidence: 0.78, reason: "Low confidence", context: "Units ambiguous: thousands vs millions (header states '$000s')", page: 6 },
  { id: "EX-2045", docId: "DOC-10Q-3307", field: "eps.diluted.q3_2026", extracted: "$(0.8l)", confidence: 0.69, reason: "OCR discrepancy", context: "Net loss per share — diluted … (0.8l) … (1.04)", page: 5 },
];

export const sampleContract = {
  $schema: "https://refinery.example/schemas/document/v2.json",
  document_id: "DOC-10K-8841",
  document_type: "sec_10k",
  issuer: { name: "Northwind Industries Inc.", ticker: "NWND", cusip: "66987V109", sedol: "B1YW440", cik: "0000912345" },
  point_in_time: { as_of: "2026-02-21", valid_from: "2026-02-21T21:04:00Z", valid_to: null, supersedes: "DOC-10K-8790" },
  provenance: { source: "sec_edgar", acquired_at: "2026-10-15T06:12:44Z", parser: "layout-parser@5.1.0", checksum_sha256: "9f2c…a71e" },
  metrics: [
    { key: "total_revenue", value: 8420000000, unit: "USD", period: "FY2025", confidence: 0.98, citation: { page: 41, bbox: [72, 140, 540, 260] } },
    { key: "free_cash_flow", value: 1130000000, unit: "USD", period: "FY2025", confidence: 0.96, citation: { page: 47, bbox: [72, 300, 540, 420] } },
    { key: "operating_margin", value: 0.174, unit: "ratio", period: "FY2025", confidence: 0.95, citation: { page: 43, bbox: [72, 510, 540, 560] } },
  ],
  tables: [{ id: "tbl_income_statement", rows: 18, columns: 4, headers: ["Line item", "FY2025", "FY2024", "FY2023"] }],
  chunks: { count: 486, strategy: "hybrid_semantic_lexical", embedding_model: "embed-v2 (3072d)" },
  validation: { schema_valid: true, checks_passed: 42, checks_failed: 0 },
};

export const mcpTools = [
  { name: "search_documents", description: "Hybrid BM25 + dense vector search across refined documents with point-in-time filtering.", params: { query: "string", tickers: "string[]?", as_of: "date?", top_k: "int = 10" }, sample: { query: "free cash flow guidance", tickers: ["NWND"], top_k: 3 } },
  { name: "fetch_document_chunk", description: "Return a chunk's text, metadata and source citation (page + bounding box).", params: { chunk_id: "string" }, sample: { chunk_id: "CH-002" } },
  { name: "extract_tabular_data", description: "Return a normalized table from a document as typed rows with units and periods.", params: { document_id: "string", table_id: "string" }, sample: { document_id: "DOC-10Q-3307", table_id: "tbl_statements_of_operations" } },
  { name: "get_document_lineage", description: "Return acquisition and processing lineage for audit and traceability.", params: { document_id: "string" }, sample: { document_id: "DOC-ECT-1190" } },
  { name: "subscribe_event", description: "Register a webhook for refinery events (document.refined, metric.changed).", params: { event: "string", url: "string" }, sample: { event: "document.refined", url: "https://consumer.example/hooks/refinery" } },
];

export const incomeTable = {
  headers: ["Line item", "Q3 2026", "Q3 2025", "YoY %"],
  rows: [
    ["Revenue", 142.0, 88.5],
    ["Cost of revenue", 31.2, 22.9],
    ["Research and development", 214.6, 171.2],
    ["Selling, general & administrative", 61.8, 54.3],
    ["Operating loss", -165.6, -159.9],
    ["Net loss", -98.3, -121.7],
  ] as [string, number, number][],
};

export function docById(id: string) {
  return docs.find((d) => d.id === id);
}
