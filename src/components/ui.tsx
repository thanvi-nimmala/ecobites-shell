/* ============================================================
   EcoBites — shared UI primitives used by both surfaces
   ============================================================ */
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react'
import { Icon } from './Icon'
import type { Imagery } from '../lib/theme'

/* Imagery is a design control, so the tile has to ask rather than assume. */
export const ImageryCtx = createContext<Imagery>('photo')
export const useImagery = () => useContext(ImageryCtx)

const TILE_TINTS: Record<string, [string, string]> = {
  produce:  ['color-mix(in oklch, var(--green) 18%, var(--surface))', 'var(--green-deep)'],
  bakery:   ['oklch(0.92 0.06 70)',  'var(--clay-deep)'],
  pantry:   ['oklch(0.92 0.045 55)', 'oklch(0.50 0.10 45)'],
  dairy:    ['oklch(0.93 0.03 95)',  'oklch(0.55 0.06 95)'],
  prepared: ['oklch(0.91 0.055 30)', 'var(--berry)'],
  default:  ['var(--green-tint)',    'var(--green-deep)'],
}

interface TileProps {
  category?: string
  icon?: string
  label?: string
  radius?: number | string
  style?: CSSProperties & { iconSize?: number }
  children?: ReactNode
  photo?: string
  pos?: string
  overlay?: string
}

export function Tile({ category = 'default', icon, label, radius = 'var(--radius-sm)', style, children, photo, pos, overlay }: TileProps) {
  const imagery = useImagery()
  const [bg, fg] = TILE_TINTS[category] ?? TILE_TINTS.default
  const { iconSize, ...rest } = style ?? {}

  if (photo && imagery === 'photo') {
    return (
      <div className="eb-tile" style={{ background: bg, borderRadius: radius, ...rest }}>
        <img
          src={photo} alt={label ?? ''} loading="lazy" draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ?? 'center', display: 'block' }}
        />
        {overlay && <div style={{ position: 'absolute', inset: 0, background: overlay }} />}
        {icon && (
          <Icon name={icon} size={iconSize ?? 38} stroke="#fff" sw={1.6}
            style={{ position: 'relative', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.4))' }} />
        )}
        {children}
      </div>
    )
  }

  return (
    <div className="eb-tile" style={{ background: bg, borderRadius: radius, ...rest }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: `repeating-linear-gradient(135deg, ${fg} 0 1px, transparent 1px 13px)`,
        WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,.25), transparent 60%)',
        maskImage: 'linear-gradient(135deg, rgba(0,0,0,.25), transparent 60%)',
      }} />
      {overlay && <div style={{ position: 'absolute', inset: 0, background: overlay }} />}
      {icon && <Icon name={icon} size={iconSize ?? 38} stroke={fg} sw={1.5} style={{ position: 'relative', opacity: 0.9 }} />}
      {children}
    </div>
  )
}

export type BadgeTone = 'green' | 'clay' | 'gold' | 'ink' | 'ghost'

export function Badge({ children, tone = 'green', style }: { children: ReactNode; tone?: BadgeTone; style?: CSSProperties }) {
  const tones: Record<BadgeTone, CSSProperties> = {
    green: { background: 'var(--green-soft)', color: 'var(--green-deep)' },
    clay:  { background: 'var(--clay-soft)', color: 'var(--clay-deep)' },
    gold:  { background: 'var(--gold-soft)', color: 'oklch(0.50 0.09 70)' },
    ink:   { background: 'var(--ink)', color: 'var(--bg)' },
    ghost: { background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--border)' },
  }
  return <span className="eb-badge" style={{ ...tones[tone], ...style }}>{children}</span>
}

export function Stepper({ value, onChange, min = 0, max = 9 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  const btn = (dim: boolean): CSSProperties => ({
    width: 30, height: 30, borderRadius: 99, border: 'none', cursor: dim ? 'default' : 'pointer',
    background: dim ? 'transparent' : 'var(--green-tint)', color: dim ? 'var(--ink-3)' : 'var(--green-deep)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.5 : 1,
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1.5px solid var(--border-2)', borderRadius: 99, padding: 3 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={btn(value <= min)} aria-label="Decrease">
        <Icon name="minus" size={16} />
      </button>
      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} style={btn(value >= max)} aria-label="Increase">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

/** A warm, abstract map — enough to read as "a map" without pretending to be one.
    `tall` swaps in portrait geometry: a 320x200 viewBox sliced into a phone-shaped
    hole zooms so far that the route stops reading as a route. */
export function MapView({ height = 160, radius = 16, dot = true, route = false, tall = false, style }: {
  height?: number | string; radius?: number; dot?: boolean; route?: boolean; tall?: boolean; style?: CSSProperties
}) {
  return (
    <div style={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', background: 'oklch(0.945 0.018 140)', ...style }}>
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        viewBox={tall ? '0 0 320 620' : '0 0 320 200'} style={{ position: 'absolute', inset: 0 }}>
        <rect width="320" height={tall ? 620 : 200} fill="oklch(0.95 0.016 135)" />
        {tall ? (
          <>
            <g stroke="oklch(0.90 0.02 130)" strokeWidth="11" fill="none">
              <path d="M-10 120 H330" /><path d="M-10 320 H330" /><path d="M-10 500 H330" />
              <path d="M78 -10 V630" /><path d="M232 -10 V630" />
            </g>
            <g fill="oklch(0.915 0.03 145)">
              <rect x="96" y="140" width="120" height="160" rx="4" />
              <rect x="248" y="30" width="80" height="70" rx="4" />
              <rect x="10" y="340" width="52" height="140" rx="4" />
              <rect x="250" y="345" width="78" height="130" rx="4" />
            </g>
            {route && (
              <>
                <path d="M56 540 C 120 470, 96 380, 168 320 S 244 210, 250 118"
                  stroke="var(--green)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="2 11" />
                <circle cx="56" cy="540" r="8" fill="var(--clay)" stroke="#fff" strokeWidth="3" />
              </>
            )}
            {dot && (
              <g>
                <circle cx={route ? 250 : 160} cy={route ? 118 : 310} r="13" fill="var(--green)" opacity="0.2" />
                <circle cx={route ? 250 : 160} cy={route ? 118 : 310} r="7" fill="var(--green)" stroke="#fff" strokeWidth="2.5" />
              </g>
            )}
          </>
        ) : (
          <>
            <g stroke="oklch(0.90 0.02 130)" strokeWidth="9" fill="none">
              <path d="M-10 60 H330" /><path d="M-10 140 H330" /><path d="M70 -10 V210" /><path d="M210 -10 V210" />
            </g>
            <g fill="oklch(0.915 0.03 145)">
              <rect x="80" y="70" width="120" height="60" rx="3" />
              <rect x="220" y="10" width="90" height="40" rx="3" />
              <rect x="10" y="150" width="50" height="44" rx="3" />
            </g>
            {route && (
              <>
                <path d="M40 170 C 120 150, 120 90, 210 70 S 290 40, 285 25" stroke="var(--green)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 9" />
                <circle cx="40" cy="170" r="6" fill="var(--clay)" stroke="#fff" strokeWidth="2.5" />
              </>
            )}
            {dot && (
              <g>
                <circle cx={route ? 285 : 160} cy={route ? 25 : 100} r="9" fill="var(--green)" opacity="0.2" />
                <circle cx={route ? 285 : 160} cy={route ? 25 : 100} r="5" fill="var(--green)" stroke="#fff" strokeWidth="2" />
              </g>
            )}
          </>
        )}
      </svg>
    </div>
  )
}
