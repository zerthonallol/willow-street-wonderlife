/** Progress is independent of render rate; reversing a lid starts from its current position. */
export function panelProgress(current: number, open: boolean, dt: number) {
  const target = open ? 1 : 0;
  const next = target + (current - target) * Math.exp(-3.8 * Math.max(0, dt));
  return Math.abs(target - next) < 0.002 ? target : next;
}

/** Both lids lift upward: the bonnet extends toward -Z, the boot toward +Z. */
export function panelAngle(panel: "hood" | "trunk", progress: number) {
  return Math.max(0, Math.min(1, progress)) * (panel === "hood" ? 1.15 : -1.1);
}

export const TRIANGLE_DISTANCE = 16;