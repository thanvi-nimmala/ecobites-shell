/* Cross-surface signals. When one app changes the order, the other
   one is told — the toast is that message made visible. */
import { Icon } from '../components/Icon'
import { useStore } from '../lib/store'

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div style={{
      position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 8500,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} className="eb-fade-up" style={{
          display: 'flex', alignItems: 'center', gap: 11,
          background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: 99,
          boxShadow: 'var(--shadow-lg)', fontSize: 14.5, fontWeight: 500, maxWidth: 460,
        }}>
          <span style={{
            width: 26, height: 26, borderRadius: 99, flexShrink: 0,
            background: t.action === 'driver' ? 'var(--clay)' : 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={t.icon ?? 'check'} size={15} stroke="#fff" />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
