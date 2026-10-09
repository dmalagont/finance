/** Minimal CSV parsing for broker exports (comma, semicolon or tab; quoted fields). */
export function detectDelimiter(firstLine: string): string {
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

export function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delim = detectDelimiter(firstLine);
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((c) => c.trim() !== "")) out.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) out.push(row);
  const [header = [], ...rows] = out;
  return { header: header.map((h) => h.trim()), rows };
}

export const IMPORT_FIELDS = ["Date", "Account", "Account type", "Transaction type", "Security", "ISIN", "Quantity", "Price", "Amount", "Currency", "Ignore"] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

/** Guess the app field for a broker column (English and Norwegian headers). */
export function guessField(col: string): ImportField {
  const c = col.toLowerCase();
  const rules: [RegExp, ImportField][] = [
    [/(handelsdag|bokf|dato|date|trade day)/, "Date"],
    [/(kontotype|account type)/, "Account type"],
    [/(portef|konto|account|depot)/, "Account"],
    [/(transaksjonstype|transaction type|type)/, "Transaction type"],
    [/isin/, "ISIN"],
    [/(verdipapir|security|instrument|navn|name|fund|fond)/, "Security"],
    [/(antall|quantity|units|andeler)/, "Quantity"],
    [/(kurs|price)/, "Price"],
    [/(beløp|belop|amount|verdi|value)/, "Amount"],
    [/(valuta|currency)/, "Currency"],
  ];
  return rules.find(([re]) => re.test(c))?.[1] ?? "Ignore";
}
