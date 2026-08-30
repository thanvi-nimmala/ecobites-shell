import { motion } from 'framer-motion'
import { Icon } from '../components/Icon'
import type { Reel } from '../demo/reels'

interface Props {
  reels: Reel[]
  activeId: string | null
  progress: number
  recording: boolean
  onPlay: (id: string) => void
  onStop: () => void
  onToggleRecording: () => void
}

/**
 * Reel picker. In record mode it collapses and fades while a reel plays,
 * so a screen capture stays clean.
 */
export function DemoBar({ reels, activeId, progress, recording, onPlay, onStop, onToggleRecording }: Props) {
  return (
    <div className="demo-bar" data-playing={activeId !== null} style={{
      position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 8000,
      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 7px',
      borderRadius: 18, border: '1px solid var(--stage-line)',
      background: 'oklch(0.20 0.018 78 / .88)',
      backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      boxShadow: '0 16px 44px oklch(0 0 0 / .5)', color: 'var(--stage-text)',
      maxWidth: 'calc(100vw - 32px)', overflowX: 'auto',
    }}>
      <button onClick={onToggleRecording} className="press"
        title={recording ? 'Show stage chrome' : 'Hide stage chrome for recording'}
        style={{
          width: 34, height: 34, borderRadius: 12, flexShrink: 0, cursor: 'pointer',
          display: 'grid', placeItems: 'center', border: '1px solid var(--stage-line-2)',
          background: recording ? 'var(--clay)' : 'oklch(1 0 0 / .05)',
          color: recording ? '#fff' : 'var(--stage-dim)',
        }}>
        <span style={{ width: 11, height: 11, borderRadius: recording ? 3 : '50%', background: 'currentColor', display: 'block' }} />
      </button>

      <span style={{ width: 1, height: 22, background: 'var(--stage-line-2)', flexShrink: 0 }} />

      {reels.map((r) => {
        const on = activeId === r.id
        return (
          <button key={r.id} onClick={() => (on ? onStop() : onPlay(r.id))} title={r.note} className="press"
            data-demo={`reel-${r.id}`}
            style={{
              position: 'relative', flexShrink: 0, cursor: 'pointer', border: 'none', background: 'none',
              borderRadius: 12, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 7,
              color: on ? 'var(--stage-text)' : 'var(--stage-dim)', transition: 'color .2s',
            }}>
            {on && (
              <>
                <motion.span layoutId="reelPill" transition={{ type: 'spring', stiffness: 480, damping: 40 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'oklch(1 0 0 / .09)', border: '1px solid var(--stage-line-2)' }} />
                <span style={{
                  position: 'absolute', left: 0, bottom: 0, height: 2, borderRadius: 2,
                  width: `${progress * 100}%`, background: 'var(--green)', transition: 'width .3s linear',
                }} />
              </>
            )}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name={on ? 'x' : 'play'} size={13} sw={2.2} style={{ color: on ? 'var(--green)' : undefined }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--stage-faint)' }}>{r.seconds}s</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
