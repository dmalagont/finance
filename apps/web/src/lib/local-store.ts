"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for per-browser data (journal entries) until the
 * database is connected. Safe during SSR: the server snapshot is the fallback.
 */
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    value = fallback;
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocalStore<T>(key: string, fallback: T): [T, (next: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [value, set];
}
