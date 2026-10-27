/* ============================================================
   EcoBites mark — two hands cradling an ear of grain.

   Two things the drawing depends on: the ear must clear the
   fingertips entirely, or the silhouette collapses into one bush;
   and the kernels must be elongated and steeply angled, or they
   read as a pinecone.
   ============================================================ */
import type { CSSProperties } from 'react'

const HAND = (
  <>
    <path d="M32 55.5 C41.4 55.4 49.2 51.4 53.1 44.8 C55 41.6 52.3 38.6 49.2 40.2
             L35.5 47.2 C33.2 48.4 32.1 50.5 32 53.2 Z" />
    <path d="M50.4 42.2 C53.6 36.4 55.8 32.4 57 30 C58.3 27.4 61.3 28.8 60.4 31.4
             C59.4 34.3 57.3 38.6 54.4 44 Z" />
    <path d="M43.9 45.6 C45.7 39.4 46.9 35.2 47.7 32.3 C48.4 29.6 51.5 30.3 51.1 33
             C50.6 36.2 49.6 40.6 48.3 46 Z" />
    <path d="M37.3 48.6 C37.9 42.6 38.4 38.4 38.8 35.7 C39.2 33 42.3 33.2 42.3 35.9
             C42.3 39 41.9 43.2 41.3 48.4 Z" />
  </>
)

const EAR_ROWS: [number, number, number][] = [
  [34.5, 9.0, 40], [28.6, 8.4, 37], [23.0, 7.6, 34], [17.8, 6.6, 31],
]

export function Logo({ size = 40, color = 'var(--green)', style, title = 'EcoBites' }: {
  size?: number
  color?: string
  style?: CSSProperties
  title?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block', color, ...style }}
      role="img" aria-label={title}>
      <g fill="currentColor">
        <path d="M32 50 V14" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none" />
        {EAR_ROWS.map(([y, len, ang]) => {
          const rx = len * 0.28, ry = len * 0.56, dx = len * 0.40
          return (
            <g key={y}>
              <ellipse rx={rx} ry={ry} transform={`translate(${32 - dx} ${y}) rotate(${-ang})`} />
              <ellipse rx={rx} ry={ry} transform={`translate(${32 + dx} ${y}) rotate(${ang})`} />
            </g>
          )
        })}
        <ellipse cx="32" cy="10.6" rx="2.9" ry="6" />
        {HAND}
        <g transform="translate(64,0) scale(-1,1)">{HAND}</g>
      </g>
    </svg>
  )
}

/** The mark given room to be a moment: empty states, confirmations, the end of a run. */
export function LogoMedallion({ size = 150, tone = 'green', style }: {
  size?: number
  tone?: 'green' | 'gold' | 'clay'
  style?: CSSProperties
}) {
  const bg = tone === 'gold' ? 'var(--gold-soft)' : tone === 'clay' ? 'var(--clay-soft)' : 'var(--green-tint)'
  const fg = tone === 'gold' ? 'oklch(0.50 0.09 70)' : tone === 'clay' ? 'var(--clay-deep)' : 'var(--green-deep)'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      border: `1.5px solid color-mix(in oklch, ${fg} 22%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <Logo size={size * 0.62} color={fg} />
    </div>
  )
}
