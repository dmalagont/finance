"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

export function RetryButton({ label = "RETRY" }: { label?: string }) {
  const router = useRouter();
  return (
    <Button variant="danger" onClick={() => router.refresh()}>
      {label}
    </Button>
  );
}
