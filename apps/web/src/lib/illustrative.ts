/**
 * Seeded "illustrative shape" series used until real data is wired.
 * Every chart that uses these must be labelled "ILLUSTRATIVE SHAPE — NOT DATA".
 */
export type Bump = [at: number, amp: number, width: number];

export function illustrativeSeries(seed: number, n: number, bumps: Bump[] = [], pad = 0.1): number[] {
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let v = 0;
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    v = v * 0.96 + (rand() - 0.5) * 0.35;
    let y = v;
    for (const [at, amp, w] of bumps) {
      const d = (i / (n - 1) - at) / w;
      y += amp * Math.exp(-d * d);
    }
    raw.push(y);
  }
  const lo = Math.min(...raw);
  const hi = Math.max(...raw);
  return raw.map((y) => pad + (1 - 2 * pad) * ((y - lo) / (hi - lo || 1)));
}

/** Normalised values (0..1, 1 = top) to an SVG points string. */
export function toPoints(vals: number[], w: number, h: number): string {
  return vals.map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${((1 - v) * h).toFixed(1)}`).join(" ");
}

export function hashSeed(id: string): number {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h + 11;
}
