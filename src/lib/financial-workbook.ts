import { getModel } from "@/lib/financial";

export async function buildWorkbook(asOf: string, approvedOnly = true) {
  const model = getModel(asOf, approvedOnly);
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "Data Toolkit for Sheets";
  workbook.description = "Fictional sample financial model, not investment advice or licensed data.";
  const inputs = workbook.addWorksheet("Inputs");
  inputs.addRow(["NWND • FICTIONAL SAMPLE • USD millions", "FY2025", "FY2024"]);
  inputs.addRow(["Metric", "Current", "Prior"]);
  for (const f of model.facts) inputs.addRow([f.label, f.value, f.prior]);
  const sheet = workbook.addWorksheet("Model");
  sheet.addRow(["NWND financial model • sample", "FY2025", "FY2024", "YoY %"]);
  model.facts.forEach((f, i) => {
    const row = i + 3;
    sheet.addRow([f.label, { formula: `Inputs!B${row}`, result: f.value }, { formula: `Inputs!C${row}`, result: f.prior }, { formula: `IFERROR((B${i + 2}-C${i + 2})/ABS(C${i + 2}),0)`, result: (f.value - f.prior) / Math.abs(f.prior) }]);
    sheet.getCell(`D${i + 2}`).numFmt = "0.0%";
  });
  const revenueIndex = model.facts.findIndex((f) => f.key === "revenue");
  const operatingIndex = model.facts.findIndex((f) => f.key === "operating_income");
  if (revenueIndex >= 0 && operatingIndex >= 0) {
    const revenue = model.facts[revenueIndex];
    const operating = model.facts[operatingIndex];
    const margin = sheet.addRow(["Operating margin", { formula: `B${operatingIndex + 2}/B${revenueIndex + 2}`, result: operating.value / revenue.value }, { formula: `C${operatingIndex + 2}/C${revenueIndex + 2}`, result: operating.prior / revenue.prior }]);
    margin.getCell(2).numFmt = "0.0%";
    margin.getCell(3).numFmt = "0.0%";
  }
  const audit = workbook.addWorksheet("Provenance");
  audit.addRow(["Fictional sample data — reconstructed source, not an SEC filing"]);
  audit.addRow(["Cutoff UTC", asOf, "Version", model.version]);
  audit.addRow(["Metric", "Document", "Page", "BBox (pt)", "Filed UTC", "Available UTC", "Confidence", "Review status"]);
  model.facts.forEach((f) => audit.addRow([f.label, f.citation.document_id, f.citation.page, f.citation.bbox.join(","), f.filed_at, f.available_at, f.confidence, "Approved sample"]));
  audit.addRow(["Excluded pending facts", 4 - model.facts.length]);
  for (const tab of workbook.worksheets) {
    tab.views = [{ state: "frozen", ySplit: tab === inputs ? 2 : tab === audit ? 3 : 1 }];
    tab.getRow(1).font = { bold: true };
    tab.columns.forEach((column, i) => { column.width = i === 0 ? 38 : tab === audit ? 28 : 18; });
  }
  return workbook;
}
export function saveFile(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function modelCsv(asOf: string, approvedOnly = true) {
  const model = getModel(asOf, approvedOnly);
  const rows = [["Metric", "FY2025 USD m", "FY2024 USD m", "YoY %", "Document", "Page", "Available UTC", "Confidence"], ...model.facts.map((f) => [f.label, f.value, f.prior, ((f.value - f.prior) / Math.abs(f.prior) * 100).toFixed(2), f.citation.document_id, f.citation.page, f.available_at, f.confidence])];
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}