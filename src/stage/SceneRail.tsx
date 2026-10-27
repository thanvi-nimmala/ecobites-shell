import { motion } from 'framer-motion'
import { Logo } from '../components/Logo'
import { GROUPS, SCENES, type SceneId } from './scenes'

export function SceneRail({ active, onPick }: { active: SceneId; onPick: (id: SceneId) => void }) {
  return (
    <aside className="scroll" style={{
      width: 236, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      padding: '26px 18px 74px', gap: 20, color: 'var(--stage-text)',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, letterSpacing: '-0.02em' }}>EcoBites</div>
            <div className="mono-label" style={{ fontSize: 9 }}>frontend shell</div>
          </div>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--stage-dim)', margin: 0 }}>
          Food relief for New Jersey, built as two surfaces on one order: a website neighbors
          reserve from, and a phone volunteers drive with.
        </p>
      </div>

      {GROUPS.map((g) => (
        <div key={g}>
          <div className="mono-label" style={{ marginBottom: 7 }}>{g}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SCENES.filter((s) => s.group === g).map((s) => {
              const on = active === s.id
              return (
                <button key={s.id} onClick={() => onPick(s.id)} aria-current={on} data-demo={`scene-${s.id}`} style={{
                  position: 'relative', textAlign: 'left', border: 'none', background: 'none',
                  cursor: 'pointer', padding: '7px 10px', borderRadius: 10,
                  color: on ? 'var(--stage-text)' : 'var(--stage-dim)',
                }}>
                  {on && (
                    <motion.span layoutId="railPill" transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                      style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'oklch(1 0 0 / .07)', border: '1px solid var(--stage-line-2)' }} />
                  )}
                  <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: on ? 'var(--green)' : 'var(--stage-line)',
                      boxShadow: on ? '0 0 8px var(--green)' : undefined,
                    }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>{s.label}</span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--stage-faint)', marginTop: 1 }}>{s.note}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <div className="mono-label" style={{ marginBottom: 6 }}>Keys</div>
        {[['← →', 'step scenes'], ['1 2 3', 'split / web / phone'], ['C', 'hide chrome'], ['R', 'reset data']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: 9.5, padding: '2px 6px', borderRadius: 5,
              background: 'oklch(1 0 0 / .06)', border: '1px solid var(--stage-line-2)',
              color: 'var(--stage-dim)', minWidth: 34, textAlign: 'center',
            }}>{k}</kbd>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--stage-faint)' }}>{v}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
