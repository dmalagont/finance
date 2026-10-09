import type { Metadata } from "next";
import { CsvImport } from "@/components/setup/csv-import";

export const metadata: Metadata = { title: "Import portfolio" };

export default function ImportPage() {
  return <CsvImport />;
}
