/* ============================================================
   EcoBites — the design controls behind the tokens panel.
   Each field writes CSS custom properties; nothing downstream
   hard-codes a colour, a radius or a family.
   ============================================================ */

export const PRIMARIES = [
  { name: 'Olive forest', value: '#3f6b3d' },
  { name: 'Deep basil',   value: '#3f6b57' },
  { name: 'Field green',  value: '#5a7d3a' },
  { name: 'Sea pine',     value: '#2f7d6b' },
  { name: 'Dry moss',     value: '#6b6f3a' },
] as const

export const ACCENTS = [
  { name: 'Terracotta', value: '#b35f32' },
  { name: 'Tomato',     value: '#cf5b54' },
  { name: 'Harvest',    value: '#d98a3d' },
  { name: 'Clay brick',  value: '#b5683f' },
] as const

/* Deliberately not the Google-trending shelf: Bricolage, Fraunces, Space Grotesk
   and DM Serif all read as a generated template now. These four each argue
   something — civic, editorial, agricultural, industrial. */
export const DISPLAY_FONTS = {
  'Libre Franklin': `'Libre Franklin', system-ui, sans-serif`,
  'Newsreader':     `'Newsreader', Georgia, serif`,
  'Bitter':         `'Bitter', Georgia, serif`,
  'Archivo':        `'Archivo', system-ui, sans-serif`,
} as const

export type DisplayFont = keyof typeof DISPLAY_FONTS
/** Photography is the expensive choice — a pantry without a photographer gets the pattern. */
export type Imagery = 'photo' | 'pattern'

export interface Theme {
  primary: string
  accent: string
  display: DisplayFont
  radius: number
  imagery: Imagery
}

export const DEFAULT_THEME: Theme = {
  primary: PRIMARIES[0].value,
  accent: ACCENTS[0].value,
  display: 'Libre Franklin',
  radius: 16,
  imagery: 'photo',
}

export function applyTheme(t: Theme) {
  const r = document.documentElement.style
  r.setProperty('--green', t.primary)
  r.setProperty('--clay', t.accent)
  r.setProperty('--font-display', DISPLAY_FONTS[t.display])
  r.setProperty('--radius', `${t.radius}px`)
  r.setProperty('--radius-sm', `${Math.round(t.radius * 0.67)}px`)
  r.setProperty('--radius-lg', `${Math.round(t.radius * 1.45)}px`)
}
