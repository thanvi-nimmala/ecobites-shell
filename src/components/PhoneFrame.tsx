/* An iPhone-sized stage for both sides of the phone app. */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export const PHONE_W = 402
export const PHONE_H = 874
/** every driver screen pads its header past the status bar by this much */
export const DPAD = 54

/* The status bar is drawn by the phone, above whatever screen is showing, so
   it cannot read a CSS variable the screen sets — a screen is its descendant,
   not its ancestor. Screens declare their top tone through this instead. */
export type StatusInk = 'dark' | 'light'
const StatusInkCtx = createContext<(ink: StatusInk) => void>(() => {})

/** Call from a screen whose top edge is dark (a header band, a photo). */
export function useStatusInk(ink: StatusInk) {
  const set = useContext(StatusInkCtx)
  useEffect(() => { set(ink) }, [set, ink])
}

function StatusBar({ ink }: { ink: StatusInk }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 30px', pointerEvents: 'none',
      color: ink === 'light' ? 'var(--on-green)' : 'var(--ink)',
      transition: 'color .25s ease',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15.5, letterSpacing: '0.01em',
    }}>
      <span style={{ marginTop: 6 }}>9:41</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - i * 2.6} width="3.2" height={3 + i * 2.6} rx="1" fill="currentColor" />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
          <path d="M8 10.4 1.2 4.2a10 10 0 0 1 13.6 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
          <rect x="2.4" y="2.4" width="15" height="7.2" rx="2" fill="currentColor" />
          <path d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  )
}

export function PhoneFrame({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const [ink, setInk] = useState<StatusInk>('dark')
  const screen = (
    <div style={{
      position: 'relative', width: PHONE_W, height: PHONE_H, overflow: 'hidden',
      borderRadius: bare ? 0 : 54, background: 'var(--bg)', isolation: 'isolate',
    }}>
      <StatusInkCtx.Provider value={setInk}>{children}</StatusInkCtx.Provider>
      <StatusBar ink={ink} />
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 124, height: 35, borderRadius: 99, background: '#0d0d0f', zIndex: 70, pointerEvents: 'none',
      }} />
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)',
        width: 140, height: 5, borderRadius: 99, background: 'oklch(0.3 0.02 75 / 0.35)', zIndex: 70, pointerEvents: 'none',
      }} />
    </div>
  )

  if (bare) return screen

  return (
    <div style={{
      width: PHONE_W + 22, height: PHONE_H + 22, padding: 11, borderRadius: 65,
      background: 'linear-gradient(150deg, oklch(0.62 0.014 80), oklch(0.40 0.014 78) 32%, oklch(0.30 0.012 76) 62%, oklch(0.58 0.014 80))',
      boxShadow: '0 2px 3px oklch(0 0 0 / .5) inset, 0 30px 70px oklch(0.2 0.03 70 / .38), 0 6px 18px oklch(0.2 0.03 70 / .22)',
      flexShrink: 0,
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 55, background: '#000', padding: 1.5 }}>
        {screen}
      </div>
    </div>
  )
}
