/* ============================================================
   EcoBites — portfolio card cover.

   Plays at 520x335 on a white page, so it is authored at 2x and
   every type size here halves. Nothing is below 26px (13px played).
   The order sits still and stays legible; what moves is its custody.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import { DUR, RESOLVED_T, cardState } from './timeline'

const W = 1040
const H = 670

const ACCENT = '#0d7049'
/* the lightest ground from her reference — warm cream, not a green tint */
const GROUND = '#f5f3e8'
const INK = '#16150f'
const MUTED = '#64736a'
const RAIL = '#cfdbd4'
const CARD_BG = '#ffffff'
const CARD_LINE = '#dde8e2'

const RAIL_Y = 176
const X1 = 170
const X2 = 870
const LABEL_Y = 126

const CARD_X = 240
const CARD_W = 560
const CARD_Y = 286
const CARD_H = 258

const UI = "'Libre Franklin', system-ui, sans-serif"

/** the tick, drawn rather than popped — 26px box at x,y */
function Check({ p, x, y }: { p: number; x: number; y: number }) {
  const len = 34
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="13" cy="13" r="13" fill={ACCENT} opacity={p > 0 ? 1 : 0} />
      <path
        d="M6.5 13.5 L11 18 L19.5 8.5"
        fill="none" stroke="#fff" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - p)}
      />
    </g>
  )
}

export function CardCover({ t }: { t: number }) {
  const s = cardState(t)
  const tokenX = s.token ? X1 + (X2 - X1) * s.token.p : 0

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#0d7049" floodOpacity="0.10" />
        </filter>
      </defs>

      <rect width={W} height={H} fill={GROUND} />

      {/* the two surfaces, named once */}
      <text x={X1} y={LABEL_Y} textAnchor="middle"
        style={{ font: `500 28px ${UI}`, letterSpacing: '0.1em', fill: MUTED }}>CLIENT SITE</text>
      <text x={X2} y={LABEL_Y} textAnchor="middle"
        style={{ font: `500 28px ${UI}`, letterSpacing: '0.1em', fill: MUTED }}>DRIVER APP</text>

      {/* the rail: grey until the order travels it */}
      <line x1={X1} y1={RAIL_Y} x2={X2} y2={RAIL_Y} stroke={RAIL} strokeWidth="3" strokeLinecap="round" />
      {s.railProgress > 0 && (
        <line x1={X1} y1={RAIL_Y} x2={X1 + (X2 - X1) * s.railProgress} y2={RAIL_Y}
          stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* endpoints */}
      <circle cx={X1} cy={RAIL_Y} r="12" fill={RAIL} />
      <circle cx={X1} cy={RAIL_Y} r="12" fill={ACCENT} opacity={s.leftDot} />
      <circle cx={X2} cy={RAIL_Y} r="12" fill={RAIL} />
      <circle cx={X2} cy={RAIL_Y} r="12" fill={ACCENT} opacity={s.rightDot} />

      {/* the order in flight */}
      {s.token && (
        <>
          <circle cx={tokenX} cy={RAIL_Y} r="18" fill={ACCENT} opacity="0.16" />
          <circle cx={tokenX} cy={RAIL_Y} r="9" fill={ACCENT} />
        </>
      )}

      {/* the order itself — never moves, never shrinks */}
      <g filter="url(#cardShadow)">
        <rect x={CARD_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx="22" fill={CARD_BG} stroke={CARD_LINE} />
      </g>
      <text x={CARD_X + 40} y={CARD_Y + 76} style={{ font: `600 46px ${UI}`, fill: INK, letterSpacing: '-0.01em' }}>
        Fresh Produce Box
      </text>
      <text x={CARD_X + 40} y={CARD_Y + 116} style={{ font: `400 28px ${UI}`, fill: MUTED }}>
        2 boxes · Newark
      </text>
      <line x1={CARD_X + 40} y1={CARD_Y + 152} x2={CARD_X + CARD_W - 40} y2={CARD_Y + 152} stroke={CARD_LINE} strokeWidth="1.5" />

      {/* the one line that changes */}
      <g opacity={s.statusOpacity} transform={`translate(0 ${s.statusRise})`}>
        <Check p={s.checkDraw} x={CARD_X + 40} y={CARD_Y + 186} />
        <text x={CARD_X + 82} y={CARD_Y + 208} style={{ font: `600 32px ${UI}`, fill: ACCENT }}>
          {s.status}
        </text>
      </g>
    </svg>
  )
}

/** live mode: loops, unless the visitor asked for less motion */
export function CardCoverLive() {
  const reduced = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [t, setT] = useState(reduced ? RESOLVED_T : 0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduced) return
    const start = performance.now()
    const tick = (now: number) => {
      setT(((now - start) / 1000) % DUR)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [reduced])

  return <CardCover t={t} />
}

export { W as CARD_PX_W, H as CARD_PX_H }
