import type { Metadata } from "next";
import { Library } from "@/components/learn/library";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return <Library />;
}
