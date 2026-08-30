/* Warm browser chrome — the client surface is a website, and the
   prototype should never let you forget which surface you are on. */
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function BrowserFrame({ url, children, bare = false, flush = false }: {
  url: string; children: ReactNode; bare?: boolean; flush?: boolean
}) {
  if (bare) return <div style={{ height: '100%', overflow: 'hidden', background: 'var(--surface)' }}>{children}</div>
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      borderRadius: flush ? 0 : 14, background: 'var(--surface)',
      boxShadow: flush ? 'none' : 'var(--shadow-lg)',
      border: flush ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{
        height: 46, background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#e26d5c', '#e8b04b', '#5fa463'].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, maxWidth: 420, margin: '0 auto', height: 28, borderRadius: 99,
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '0 14px', color: 'var(--ink-3)', fontSize: 12.5,
        }}>
          <Icon name="leaf" size={13} stroke="var(--green)" /> {url}
        </div>
        <div style={{ width: 54 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}
