import { describe, expect, it } from "vitest";
import { dispatchRpc, executeFinancialTool, getFacts, getModel, getSnapshot, getVersion, versions } from "@/lib/financial";
import { buildWorkbook, modelCsv } from "@/lib/financial-workbook";

describe("Financial showcase rules", () => {
  it("never exposes a filing before platform acquisition", () => {
    expect(getVersion("2026-02-22T07:00:59Z")).toBeUndefined();
    expect(getVersion("2026-02-22T07:01:00Z")?.id).toBe("NWND-2025-10K");
  });
  it("does not leak the amendment between filing and availability", () => {
    expect(getSnapshot("2026-10-15T08:02:59Z")?.facts[0].value).toBe(8420);
    expect(getSnapshot("2026-10-15T08:03:00Z")?.facts[0].value).toBe(8510);
  });
  it("preserves the original filing when requested", () => {
    expect(getSnapshot("2026-10-16T12:00Z", "original")?.facts[0].value).toBe(8420);
  });
  it("routes facts below 85% confidence away from approved exports", () => {
    const facts = getFacts(versions[1]);
    expect(facts.find((f) => f.key === "free_cash_flow")?.confidence).toBe(0.82);
    expect(getModel("2026-10-16T12:00Z").facts.map((f) => f.key)).toEqual(["revenue", "cost_of_revenue", "operating_income"]);
    expect(() => getModel("2026-10-16T12:00Z", false)).toThrow("Unreviewed facts cannot be exported");
    expect(getFacts({ ...versions[1], confidence: [0.85, 0.85, 0.85, 0.85] }).every((f) => f.approved)).toBe(true);
  });
  it("validates ticker, UTC cutoff and unknown arguments", () => {
    expect(() => executeFinancialTool("get_financial_facts", { ticker: "INVALID", as_of: "2026-10-16T12:00Z" })).toThrow();
    expect(() => executeFinancialTool("get_financial_facts", { ticker: "NWND", as_of: "yesterday" })).toThrow();
    expect(() => executeFinancialTool("get_financial_facts", { ticker: "NWND", as_of: "2026-10-16T12:00Z", secret: true })).toThrow();
  });
  it("keeps citations attached to financial source excerpts", () => {
    const result = executeFinancialTool("fetch_document_chunk", { ticker: "NWND", as_of: "2026-10-16T12:00Z", metric: "revenue" });
    expect(result).toMatchObject({ citation: { document_id: "NWND-2025-10KA", page: 41, bbox: [72, 180, 540, 216] }, confidence: 0.99 });
  });
  it("reports parse errors rather than accepting invalid JSON-RPC", () => {
    expect(dispatchRpc("{")).toMatchObject({ error: { code: -32700 } });
    expect(dispatchRpc(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "bad" }))).toMatchObject({ error: { code: -32601 } });
  });
  it("exports a workbook with real formulas, values and provenance", async () => {
    const workbook = await buildWorkbook("2026-10-16T12:00Z");
    expect(workbook.worksheets.map((s) => s.name)).toEqual(["Inputs", "Model", "Provenance"]);
    expect(workbook.getWorksheet("Inputs")?.getCell("B3").value).toBe(8510);
    expect(workbook.getWorksheet("Model")?.getCell("B2").value).toEqual({ formula: "Inputs!B3", result: 8510 });
    expect(workbook.getWorksheet("Model")?.getCell("D2").value).toMatchObject({ formula: "IFERROR((B2-C2)/ABS(C2),0)", result: (8510 - 7558) / 7558 });
    expect(workbook.getWorksheet("Provenance")?.getCell("B4").value).toBe("NWND-2025-10KA");
    expect(modelCsv("2026-10-16T12:00Z")).not.toContain("Free cash flow");
  });
});