import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { ACCENTS, DISPLAY_FONTS, PRIMARIES, type DisplayFont, type Imagery, type Theme } from '../lib/theme'
import type { View } from './scenes'

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mono-label" style={{ marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({ value, options, onChange, id }: {
  value: T; options: readonly T[]; onChange: (v: T) => void; id: string
}) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 11, background: 'oklch(0 0 0 / .26)', border: '1px solid var(--stage-line-2)' }}>
      {options.map((o) => {
        const on = value === o
        return (
          <button key={o} onClick={() => onChange(o)} data-demo={`tok-${id}-${o}`} style={{
            position: 'relative', flex: 1, border: 'none', background: 'none', cursor: 'pointer',
            padding: '6px 4px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
            color: on ? 'var(--stage-text)' : 'var(--stage-faint)', transition: 'color .2s',
          }}>
            {on && (
              <motion.span layoutId={`seg-${id}`} transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'oklch(1 0 0 / .10)' }} />
            )}
            <span style={{ position: 'relative' }}>{o}</span>
          </button>
        )
      })}
    </div>
  )
}

interface Props {
  theme: Theme
  set: <K extends keyof Theme>(k: K, v: Theme[K]) => void
  view: View
  onView: (v: View) => void
  onReset: () => void
}

export function TokensPanel({ theme, set, view, onView, onReset }: Props) {
  return (
    <aside className="scroll" style={{
      width: 252, flexShrink: 0, height: '100%', padding: '26px 18px 74px',
      display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--stage-text)',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Design controls</div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--stage-faint)', margin: '5px 0 0' }}>
          Every control writes a CSS custom property. Both surfaces read the same ones — nothing is hard-coded downstream.
        </p>
      </div>

      <Group label="Stage">
        <Segmented id="view" value={view} options={['split', 'client', 'driver'] as View[]} onChange={onView} />
      </Group>

      <Group label="Primary">
        <div style={{ display: 'flex', gap: 6 }}>
          {PRIMARIES.map((p) => {
            const on = theme.primary === p.value
            return (
              <button key={p.value} onClick={() => set('primary', p.value)} title={p.name} aria-label={p.name}
                data-demo={`tok-primary-${p.value.slice(1)}`} className="press" style={{
                  flex: 1, height: 30, borderRadius: 9, cursor: 'pointer', background: p.value,
                  border: `2px solid ${on ? 'var(--stage-text)' : 'transparent'}`,
                  boxShadow: on ? `0 0 14px ${p.value}` : 'inset 0 1px 0 oklch(1 0 0 / .22)',
                  transition: 'box-shadow .25s, border-color .2s',
                }} />
            )
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--stage-faint)', marginTop: 7 }}>
          --green: {theme.primary}
        </div>
      </Group>

      <Group label="Accent">
        <div style={{ display: 'flex', gap: 6 }}>
          {ACCENTS.map((a) => {
            const on = theme.accent === a.value
            return (
              <button key={a.value} onClick={() => set('accent', a.value)} title={a.name} aria-label={a.name} className="press" style={{
                flex: 1, height: 30, borderRadius: 9, cursor: 'pointer', background: a.value,
                border: `2px solid ${on ? 'var(--stage-text)' : 'transparent'}`,
                boxShadow: on ? `0 0 14px ${a.value}` : 'inset 0 1px 0 oklch(1 0 0 / .22)',
                transition: 'box-shadow .25s, border-color .2s',
              }} />
            )
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--stage-faint)', marginTop: 7 }}>
          --clay: {theme.accent}
        </div>
      </Group>

      <Group label="Display type">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(Object.keys(DISPLAY_FONTS) as DisplayFont[]).map((f) => {
            const on = theme.display === f
            return (
              <button key={f} onClick={() => set('display', f)} data-demo={`tok-font-${f.split(' ')[0]}`} className="press" style={{
                textAlign: 'left', padding: '7px 11px', borderRadius: 9, cursor: 'pointer',
                fontFamily: DISPLAY_FONTS[f], fontSize: 14.5, fontWeight: 600,
                background: on ? 'oklch(1 0 0 / .10)' : 'oklch(0 0 0 / .2)',
                border: `1px solid ${on ? 'var(--stage-line)' : 'var(--stage-line-2)'}`,
                color: on ? 'var(--stage-text)' : 'var(--stage-dim)',
              }}>{f}</button>
            )
          })}
        </div>
      </Group>

      <Group label={`Corner radius — ${theme.radius}px`}>
        <input type="range" min={6} max={28} step={1} value={theme.radius}
          onChange={(e) => set('radius', +e.target.value)}
          style={{ width: '100%', accentColor: 'var(--green)' }} />
      </Group>

      <Group label="Imagery">
        <Segmented id="img" value={theme.imagery} options={['photo', 'pattern'] as Imagery[]} onChange={(v) => set('imagery', v)} />
        <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--stage-faint)', margin: '8px 0 0' }}>
          {theme.imagery === 'photo'
            ? 'Photography sells the food — but every pantry would have to shoot it.'
            : 'The tinted fallback keeps a listing legible when no one photographed the box.'}
        </p>
      </Group>

      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--stage-line-2)' }}>
        <button className="press" onClick={onReset} data-demo="reset" style={resetBtn}>
          <Icon name="refresh" size={14} /> Reset demo data
        </button>
      </div>
    </aside>
  )
}

const resetBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
  padding: '9px 11px', borderRadius: 10, cursor: 'pointer',
  background: 'oklch(1 0 0 / .05)', border: '1px solid var(--stage-line-2)',
  fontSize: 12.5, fontWeight: 500, color: 'var(--stage-dim)',
}
