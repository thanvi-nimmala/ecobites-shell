/* ============================================================
   The EcoBites burger crew.
   Drawn natively rather than shipped as a PNG so the mascot
   re-colours with the brand tokens like everything else does.
   ============================================================ */
import type { CSSProperties } from 'react'

export type MascotVariant = 'green' | 'clay' | 'berry' | 'ochre'

const FILLING: Record<MascotVariant, string> = {
  green: 'var(--green)',
  clay:  'var(--clay)',
  berry: 'var(--berry)',
  ochre: 'var(--gold)',
}

interface Props {
  variant?: MascotVariant
  size?: number
  bob?: boolean
  flip?: boolean
  style?: CSSProperties
}

export function Mascot({ variant = 'green', size = 140, bob = true, flip = false, style }: Props) {
  const leaf = FILLING[variant]
  return (
    <svg
      width={size}
      height={size * (130 / 140)}
      viewBox="0 0 140 130"
      className={bob ? 'eb-mascot' : undefined}
      style={{ display: 'block', pointerEvents: 'none', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
      role="img"
      aria-label="EcoBites mascot"
    >
      {/* ground shadow */}
      <ellipse cx="70" cy="122" rx="44" ry="6" fill="oklch(0.3 0.03 70 / 0.16)" />

      {/* bottom bun */}
      <path d="M16 94 L124 94 L124 104 C124 113 112 118 70 118 C28 118 16 113 16 104 Z" fill="#d99f52" />
      <path d="M16 94 L124 94 L124 99 L16 99 Z" fill="#e3ac60" />

      {/* patty */}
      <rect x="13" y="80" width="114" height="15" rx="7.5" fill="#7c4a2b" />

      {/* lettuce */}
      <path
        d="M14 68 L126 68 L126 78 q-8 10 -16 0 q-8 10 -16 0 q-8 10 -16 0 q-8 10 -16 0 q-8 10 -16 0 q-8 10 -16 0 q-8 10 -16 0 Z"
        fill={leaf}
      />

      {/* top bun */}
      <path d="M14 70 C14 34 36 15 70 15 C104 15 126 34 126 70 Z" fill="#eab96f" />
      <path d="M14 70 C14 34 36 15 70 15 C104 15 126 34 126 70 Z" fill="url(#bunGloss)" />

      {/* sesame */}
      <g fill="#fdf3dc">
        <ellipse cx="48" cy="33" rx="4.4" ry="2.3" transform="rotate(-26 48 33)" />
        <ellipse cx="70" cy="27" rx="4.4" ry="2.3" transform="rotate(5 70 27)" />
        <ellipse cx="93" cy="33" rx="4.4" ry="2.3" transform="rotate(26 93 33)" />
        <ellipse cx="34" cy="50" rx="4.4" ry="2.3" transform="rotate(-42 34 50)" />
        <ellipse cx="107" cy="50" rx="4.4" ry="2.3" transform="rotate(42 107 50)" />
      </g>

      {/* face */}
      <ellipse cx="47" cy="56" rx="6.5" ry="4" fill="oklch(0.66 0.14 40 / 0.32)" />
      <ellipse cx="93" cy="56" rx="6.5" ry="4" fill="oklch(0.66 0.14 40 / 0.32)" />
      <ellipse cx="59" cy="47" rx="3.4" ry="4.3" fill="#4d3018" />
      <ellipse cx="81" cy="47" rx="3.4" ry="4.3" fill="#4d3018" />
      <circle cx="60.2" cy="45.4" r="1.2" fill="#fff" opacity="0.85" />
      <circle cx="82.2" cy="45.4" r="1.2" fill="#fff" opacity="0.85" />
      <path d="M62 55 q8 7 16 0" stroke="#4d3018" strokeWidth="2.8" strokeLinecap="round" fill="none" />

      {/* sprig — the "eco" half of the name */}
      <g transform="translate(96 14) rotate(18)">
        <path d="M0 14 C0 6 4 1 10 0 C10 8 6 13 0 14 Z" fill={leaf} />
        <path d="M0 14 C2 9 5 5 9 2" stroke="oklch(0.99 0.01 90 / 0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>

      <defs>
        <linearGradient id="bunGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
