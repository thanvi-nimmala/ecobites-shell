/* The circular stamp from the reference. It carries the promise that the rest
   of the UI keeps repeating in prose — free, no paperwork, no queue — so the
   page can say it once in words and let the mark hold it everywhere else. */
import type { CSSProperties } from 'react'
import { Logo } from './Logo'

export function Stamp({ size = 112, text = 'ALWAYS FREE · NO PAPERWORK · NO QUEUE · ', style }: {
  size?: number
  text?: string
  style?: CSSProperties
}) {
  const id = 'stampPath'
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block', ...style }}
      role="img" aria-label="Always free, no paperwork, no queue">
      <defs>
        <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="var(--gold)" />
      <circle cx="60" cy="60" r="48.5" fill="none" stroke="var(--green-deep)" strokeWidth="1.4" opacity=".55" />
      <g className="eb-stamp-spin" style={{ transformOrigin: '60px 60px' }}>
        <text style={{
          font: `600 10.2px var(--font-body)`, letterSpacing: '0.17em', fill: 'var(--green-deep)',
        }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </g>
      {/* the mark itself at the centre, so the stamp and the logo are one system */}
      <g transform="translate(60 60) scale(0.72) translate(-32 -32)">
        <Logo size={64} color="var(--green-deep)" />
      </g>
    </svg>
  )
}
