/* ============================================================
   Card cover — the deterministic timeline.

   Every visual value is a pure function of t, so a frame renderer
   can ask for any instant and get exactly what the live animation
   would show. The loop is seamless by construction: the state at
   t = DUR is identical to the state at t = 0 (rail grey, dots grey,
   "Reserved" at full opacity with no check drawn, no token in flight).
   ============================================================ */

export const DUR = 5.3

const TRAVEL_OUT: [number, number] = [1.40, 2.30]
const TRAVEL_BACK: [number, number] = [3.10, 3.70]
const LEFT_DOT: [number, number] = [0.15, 0.55]
const RIGHT_DOT: [number, number] = [2.16, 2.52]
/* ends on the LAST rendered frame (158/30 = 5.2667), not at DUR — so the wrap is
   pixel-identical to t=0 rather than one dissolve-step short of it */
const DISSOLVE: [number, number] = [4.9667, 5.2667]

interface Seg { from: number; label: string; drawFrom: number; drawTo: number; fades: boolean }

/* the trailing "Reserved" is what makes the loop invisible: it restores the
   opening state before the clock wraps */
const SEGS: Seg[] = [
  { from: 0.00, label: 'Reserved',        drawFrom: 0.30, drawTo: 0.95, fades: false },
  { from: 2.32, label: 'Driver accepted', drawFrom: 2.46, drawTo: 2.98, fades: true },
  { from: 3.72, label: 'Delivered',       drawFrom: 3.86, drawTo: 4.38, fades: true },
  { from: 5.02, label: 'Reserved',        drawFrom: 99,   drawTo: 99,   fades: true },
]

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

export interface CardState {
  railProgress: number      // 0..1 of the rail painted accent
  leftDot: number           // 0..1 fill
  rightDot: number
  token: { p: number } | null   // position along the rail, 0..1
  status: string
  statusOpacity: number
  statusRise: number        // px of upward travel left to go
  checkDraw: number         // 0..1 of the tick stroke
}

export function cardState(tRaw: number): CardState {
  const t = ((tRaw % DUR) + DUR) % DUR

  const out = ramp(t, TRAVEL_OUT[0], TRAVEL_OUT[1])
  const back = ramp(t, TRAVEL_BACK[0], TRAVEL_BACK[1])
  const dissolve = ramp(t, DISSOLVE[0], DISSOLVE[1])

  // the rail paints as the order travels out, and un-paints only in the dissolve
  const railProgress = easeInOut(out) * (1 - dissolve)

  let token: { p: number } | null = null
  if (out > 0 && out < 1) token = { p: easeInOut(out) }
  else if (back > 0 && back < 1) token = { p: 1 - easeInOut(back) }

  // which status is showing, and how far through its entrance
  let i = 0
  for (let k = 0; k < SEGS.length; k++) if (t >= SEGS[k].from) i = k
  const seg = SEGS[i]
  const next = SEGS[i + 1]

  const entering = seg.fades ? ramp(t, seg.from, seg.from + 0.16) : 1
  const leaving = next ? 1 - ramp(t, next.from - 0.10, next.from) : 1
  const statusOpacity = Math.min(entering, leaving)
  const statusRise = (1 - easeOut(entering)) * 7

  return {
    railProgress,
    leftDot: easeOut(ramp(t, LEFT_DOT[0], LEFT_DOT[1])) * (1 - dissolve),
    rightDot: easeOut(ramp(t, RIGHT_DOT[0], RIGHT_DOT[1])) * (1 - dissolve),
    token,
    status: seg.label,
    statusOpacity,
    statusRise,
    checkDraw: easeOut(ramp(t, seg.drawFrom, seg.drawTo)) * (1 - dissolve),
  }
}

/* the frame the poster comes from, and what reduced-motion shows */
export const RESOLVED_T = 4.40
