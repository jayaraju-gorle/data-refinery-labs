import { z } from "zod";

// Intentionally fictional demonstration data.
export const DEFAULT_AS_OF = "2026-10-16T12:00";
export const REVIEW_THRESHOLD = 0.85;
export const factKeys = ["revenue", "cost_of_revenue", "operating_income", "free_cash_flow"] as const;
export type FactKey = (typeof factKeys)[number];
export const factLabels: Record<FactKey, string> = { revenue: "Revenue", cost_of_revenue: "Cost of revenue", operating_income: "Operating income", free_cash_flow: "Free cash flow" };
export const versions = [
  { id: "NWND-2025-10K", label: "Original 10-K", filedAt: "2026-02-21T21:04:00Z", availableAt: "2026-02-22T07:01:00Z", values: [8420, 5305, 1465, 1130], confidence: [0.98, 0.97, 0.96, 0.96] },
  { id: "NWND-2025-10KA", label: "Amended 10-K/A", filedAt: "2026-10-15T08:00:00Z", availableAt: "2026-10-15T08:03:00Z", values: [8510, 5350, 1508, 1168], confidence: [0.99, 0.97, 0.96, 0.82] },
];
export type FilingVersion = (typeof versions)[number];
const prior = [7558, 4836, 1247, 940];

export function getVersion(asOf: string, mode: "latest" | "original" = "latest") {
  const cutoff = Date.parse(asOf.endsWith("Z") ? asOf : `${asOf}Z`);
  const available = versions.filter((v) => Date.parse(v.filedAt) <= cutoff && Date.parse(v.availableAt) <= cutoff);
  return mode === "original" ? available[0] : available.at(-1);
}
export function getFacts(version: FilingVersion) {
  return factKeys.map((key, i) => ({
    key, label: factLabels[key], value: version.values[i], prior: prior[i], unit: "USD millions", period: "FY2025", confidence: version.confidence[i],
    approved: version.confidence[i] >= REVIEW_THRESHOLD,
    citation: { document_id: version.id, page: key === "free_cash_flow" ? 47 : 41, bbox: [72, 180 + i * 36, 540, 216 + i * 36], coordinate_space: "612 × 792 pt", source_kind: "fictional reconstructed filing" },
    filed_at: version.filedAt, available_at: version.availableAt,
  }));
}
export function getSnapshot(asOf: string, mode: "latest" | "original" = "latest") {
  const version = getVersion(asOf, mode);
  return version ? { schema: "financial-facts/v1", sample_data: true, ticker: "NWND", as_of: asOf, version: version.id, facts: getFacts(version) } : null;
}
export function getModel(asOf: string, approvedOnly = true) {
  const snapshot = getSnapshot(asOf);
  if (!snapshot) throw new Error("No filing was available at this cutoff.");
  if (!approvedOnly && snapshot.facts.some((f) => !f.approved)) throw new Error("Unreviewed facts cannot be exported. Use approved facts only.");
  return { ...snapshot, facts: snapshot.facts.filter((f) => !approvedOnly || f.approved) };
}
const asOfSchema = z.string().refine((s) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(s) && !Number.isNaN(Date.parse(s.endsWith("Z") ? s : `${s}Z`)), "Use an ISO UTC timestamp");
const base = { ticker: z.literal("NWND"), as_of: asOfSchema };
export const financialTools = [
  { name: "get_financial_facts", description: "Return available financial facts with confidence and citations at a UTC cutoff.", schema: z.object({ ...base, basis: z.enum(["latest", "original"]).default("latest") }).strict(), sample: { ticker: "NWND", as_of: "2026-10-16T12:00:00Z", basis: "latest" } },
  { name: "fetch_document_chunk", description: "Read the cited source excerpt for a metric available at the UTC cutoff.", schema: z.object({ ...base, metric: z.enum(factKeys) }).strict(), sample: { ticker: "NWND", as_of: "2026-10-16T12:00:00Z", metric: "revenue" } },
  { name: "compare_filing_versions", description: "Compare original and amended facts, excluding versions not yet available.", schema: z.object(base).strict(), sample: { ticker: "NWND", as_of: "2026-10-16T12:00:00Z" } },
  { name: "build_financial_model", description: "Return approved model inputs with prior periods and source lineage.", schema: z.object({ ...base, approved_only: z.boolean().default(true) }).strict(), sample: { ticker: "NWND", as_of: "2026-10-16T12:00:00Z", approved_only: true } },
];
export function executeFinancialTool(name: string, args: unknown): unknown {
  const tool = financialTools.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  const parsed = tool.schema.parse(args);
  const snapshot = getSnapshot(parsed.as_of, "basis" in parsed && parsed.basis === "original" ? "original" : "latest");
  if (!snapshot) throw new Error("No filing was available at this cutoff.");
  if (name === "build_financial_model") return getModel(parsed.as_of, !("approved_only" in parsed) || parsed.approved_only !== false);
  if (name === "fetch_document_chunk" && "metric" in parsed) {
    const fact = snapshot.facts.find((f) => f.key === parsed.metric);
    if (!fact) throw new Error("Metric not found.");
    return { sample_data: true, text: `${fact.label}: ${fact.value} USD millions (FY2025); ${fact.prior} (FY2024).`, citation: fact.citation, available_at: fact.available_at, confidence: fact.confidence };
  }
  if (name === "compare_filing_versions") {
    const original = getSnapshot(parsed.as_of, "original");
    return { sample_data: true, original: original?.version, current: snapshot.version, amended: original?.version !== snapshot.version, changes: snapshot.facts.map((f) => ({ metric: f.key, original: original?.facts.find((o) => o.key === f.key)?.value, current: f.value, delta: f.value - (original?.facts.find((o) => o.key === f.key)?.value ?? f.value), citation: f.citation })) };
  }
  return snapshot;
}
export function dispatchRpc(raw: string) {
  let request: unknown;
  try { request = JSON.parse(raw); } catch { return { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Invalid JSON" } }; }
  const envelope = z.object({ jsonrpc: z.literal("2.0"), id: z.union([z.string(), z.number()]), method: z.string(), params: z.unknown().optional() }).strict().safeParse(request);
  if (!envelope.success) return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid JSON-RPC request" } };
  const { id, method, params } = envelope.data;
  if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: financialTools.map((t) => ({ name: t.name, description: t.description, required: Object.keys(t.sample), additionalProperties: false })) } };
  if (method !== "tools/call") return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
  const call = z.object({ name: z.string(), arguments: z.unknown() }).strict().safeParse(params);
  if (!call.success) return { jsonrpc: "2.0", id, error: { code: -32602, message: "Expected tool name and arguments" } };
  try { return { jsonrpc: "2.0", id, result: { structuredContent: executeFinancialTool(call.data.name, call.data.arguments) } }; }
  catch (error) { return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Tool failed" }] } }; }
}