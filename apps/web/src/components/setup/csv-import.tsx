"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { IMPORT_FIELDS, guessField, parseCsv, type ImportField } from "@/lib/csv";

const REQUIRED: ImportField[] = ["Date", "Security", "Quantity", "Amount"];
const STORAGE_KEY = "cockpit.import.pending.v1";

export function CsvImport() {
  const [file, setFile] = useState<{ name: string; header: string[]; rows: string[][] } | null>(null);
  const [map, setMap] = useState<ImportField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    setDone(false);
    try {
      const buf = await f.arrayBuffer();
      // Some broker exports are UTF-16 with a BOM.
      const bytes = new Uint8Array(buf);
      const enc = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : "utf-8";
      const text = new TextDecoder(enc).decode(buf);
      const parsed = parseCsv(text);
      if (parsed.header.length < 2) throw new Error("Couldn't find columns in this file.");
      setFile({ name: f.name, ...parsed });
      setMap(parsed.header.map(guessField));
    } catch (e) {
      setFile(null);
      setError(e instanceof Error ? e.message : "Couldn't read this file.");
    }
  };

  const missing = REQUIRED.filter((r) => !map.includes(r));
  const step = !file ? 1 : done ? 3 : 2;

  const confirm = () => {
    if (!file || missing.length) return;
    const records = file.rows.map((r) => Object.fromEntries(map.map((m, i) => [m, r[i] ?? ""]).filter(([m]) => m !== "Ignore")));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ file: file.name, importedAt: new Date().toISOString(), records }));
    } catch {
      /* storage unavailable */
    }
    setDone(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-3 md:px-8">
        <h1 className="m-0 font-display text-[28px] uppercase leading-none md:text-[32px]">Import portfolio</h1>
        <span className="text-[10.5px] font-semibold tracking-[0.08em] text-muted md:ml-auto">
          {["01 FILE", "02 MAP COLUMNS", "03 CONFIRM"].map((s, i) => (
            <span key={s} className={i + 1 === step ? "text-ink" : ""}>
              {i ? " · " : ""}
              {s}
            </span>
          ))}
        </span>
      </div>
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[260px_minmax(0,1fr)] md:px-5">
        <div className="flex flex-col gap-9">
          <label className="flex cursor-pointer flex-col items-start gap-[6px] border border-dashed border-border-strong bg-panel p-[18px] hover:bg-hover">
            <span className="text-[12px] font-semibold">{file ? file.name : "Choose a CSV file"}</span>
            <span className="text-[10.5px] text-muted">{file ? `${file.rows.length} rows · ${file.header.length} columns` : "Read in your browser · nothing is uploaded"}</span>
            <span className="mt-[6px] border border-border bg-raised px-[10px] py-[6px] text-[10px] font-semibold tracking-[0.08em] text-ink">
              {file ? "REPLACE FILE" : "BROWSE"}
            </span>
            <input type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {error && (
            <div className="border-l-[3px] border-down bg-raised px-3 py-2 text-[11px] text-down" role="alert">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-[6px]">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-muted">ACCEPTED FROM</span>
            <span className="font-sans text-[13px] leading-[1.5] text-ink-2">
              Nordnet · DNB · Sbanken · generic CSV. Account type (ASK, IPS, regular) is kept for tax notes. Export your transactions, not just today&apos;s holdings, so
              cost basis can be rebuilt.
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <SectionHeader
            index="02"
            label="Map columns"
            meta={
              file ? (
                missing.length ? (
                  <span className="text-watch">◆ {missing.length} NEEDS ATTENTION</span>
                ) : (
                  <span className="text-up">▼ READY</span>
                )
              ) : undefined
            }
            className="mb-[6px]"
          />
          {!file && <p className="font-sans text-[13px] text-muted">Choose a file to map its columns.</p>}
          {file?.header.map((col, i) => (
            <div key={`${col}-${i}`} className="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-center gap-[10px] border-b border-raised py-[7px] md:grid-cols-[160px_20px_180px_minmax(0,1fr)]">
              <span className="truncate text-[11.5px] font-medium text-ink-2">{col || `[column ${i + 1}]`}</span>
              <span className="text-muted">→</span>
              <select
                value={map[i]}
                onChange={(e) => setMap((m) => m.map((v, j) => (j === i ? (e.target.value as ImportField) : v)))}
                aria-label={`Field for column ${col}`}
                className="border border-border bg-raised px-2 py-1 text-[11px] font-semibold text-ink"
              >
                {IMPORT_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <span className="hidden truncate text-[10.5px] text-muted md:inline">{file.rows[0]?.[i] ?? ""}</span>
            </div>
          ))}
          {file && missing.length > 0 && <p className="mt-2 text-[10.5px] text-watch">Map these fields to continue: {missing.join(", ")}.</p>}

          {file && (
            <>
              <span className="mt-3 text-[10px] font-semibold tracking-[0.08em] text-muted">PREVIEW · FIRST 3 ROWS</span>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[11px] font-medium text-ink-2">
                  <thead>
                    <tr className="text-[10px] text-muted">
                      {map.map((m, i) =>
                        m === "Ignore" ? null : (
                          <th key={i} className="whitespace-nowrap py-1 pr-3 text-left font-semibold">
                            {m}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {file.rows.slice(0, 3).map((r, ri) => (
                      <tr key={ri} className="border-b border-raised">
                        {map.map((m, i) =>
                          m === "Ignore" ? null : (
                            <td key={i} className="whitespace-nowrap py-[6px] pr-3">
                              {r[i]}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {done ? (
            <div className="mt-4 flex flex-col gap-2 border-l-[3px] border-up bg-raised p-3" role="status">
              <span className="text-[11.5px] font-semibold text-up">▼ {file?.rows.length} ROWS READY</span>
              <span className="font-sans text-[13px] text-ink-2">
                Kept in this browser for now. They will be written to your private database once it is connected; nothing has been sent anywhere.
              </span>
              <ButtonLink href="/portfolio" variant="secondary" className="self-start">
                Back to portfolio
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-auto flex justify-end gap-2 pt-[10px]">
              <ButtonLink href="/portfolio" variant="secondary">
                Back
              </ButtonLink>
              <Button onClick={confirm} disabled={!file || missing.length > 0}>
                Confirm import
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
