/* The section divider from the reference: a two-row checkerboard that breaks
   the page into movements. Tones stay inside the EcoBites palette — green for
   the structural breaks, sand and gold for the quieter ones. */
import type { CSSProperties } from 'react'

export type CheckerTone = 'green' | 'sand' | 'gold' | 'clay'

const TONE: Record<CheckerTone, string> = {
  green: 'var(--green)',
  /* --sand-deep is too close to the ground to register as a divider */
  sand:  'color-mix(in oklch, var(--clay) 42%, var(--sand-deep))',
  gold:  'var(--gold)',
  clay:  'var(--clay)',
}

export function CheckerBand({ tone = 'green', square = 11, style }: {
  tone?: CheckerTone
  /** half the band height — the band is always two squares tall */
  square?: number
  style?: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className="eb-checker"
      style={{ ['--checker' as string]: TONE[tone], ['--sq' as string]: `${square}px`, ...style }}
    />
  )
}
