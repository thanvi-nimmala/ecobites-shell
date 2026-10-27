import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { BrowserFrame } from './components/BrowserFrame'
import { PHONE_H, PHONE_W, PhoneFrame } from './components/PhoneFrame'
import { ImageryCtx } from './components/ui'
import { Icon } from './components/Icon'

import { ClientApp } from './client/ClientApp'
import { ClientPhoneApp, PhoneGate } from './client/ClientPhoneApp'
import { DriverApp } from './driver/DriverApp'

import { StoreProvider, useStore } from './lib/store'
import { DEFAULT_THEME, applyTheme, type Theme } from './lib/theme'
import type { ClientPhoneRoute, ClientRoute, DriverRoute, PhoneSide } from './lib/nav'
import type { Order, StageKey } from './lib/types'

import { DemoBar } from './stage/DemoBar'
import { SceneRail } from './stage/SceneRail'
import { TokensPanel } from './stage/TokensPanel'
import { Toasts } from './stage/Toasts'
import { SCENES, sceneById, type OrderLevel, type SceneId, type View } from './stage/scenes'

import { DemoCursor } from './demo/DemoCursor'
import { CardCover, CardCoverLive } from './card/CardCover'
import { useDemoRunner } from './demo/useDemoRunner'
import { COVER, COVER_SIZE, REEL_ID, REEL_SHOT, hasCaption } from './demo/capture'
import { PHOTO } from './lib/data'

/* ?card renders the portfolio card cover alone. ?card&t=<seconds> freezes it at one
   instant, which is how the frame renderer walks the loop. */
const CARD = new URLSearchParams(location.search).has('card')
const CARD_T = new URLSearchParams(location.search).get('t')

/** ?shot=<sceneId> renders one surface alone, unchromed, for still capture */
const SHOT = new URLSearchParams(location.search).get('shot') as SceneId | null
const SHOT_SCENE = SHOT ? SCENES.find((s) => s.id === SHOT) : undefined
if (SHOT_SCENE) document.documentElement.dataset.shot = '1'
if (CARD) document.documentElement.dataset.card = '1'

/* the still sizes the portfolio and the deck expect */
const SHOT_WEB = { w: 920, h: 720 }
/* ?h=<px> overrides the artboard height, for reviewing a whole long page */
const SHOT_H = Number(new URLSearchParams(location.search).get('h')) || 0
/* every photo the reels can reach, warmed before capture so no frame is
   rendered against a half-decoded image */
if (REEL_SHOT) {
  window.__preloadImages = () =>
    Promise.all(
      Object.values(PHOTO).map(
        (src) =>
          new Promise<void>((res) => {
            const img = new Image()
            img.onload = img.onerror = () => res()
            img.src = src
          }),
      ),
    ).then((a) => a.length)
}

/* ?plate=1 puts the device on a 16:10 field, for frames that crop to landscape */
const PLATE = new URLSearchParams(location.search).get('plate') !== null
const SHOT_PLATE = { w: 1600, h: 1000 }

/* how far along the demo order is, and how far a scene needs it to be */
const STAGE_RANK: Record<StageKey, number> = {
  reserved: 0, preparing: 0, assigned: 1, pickup: 2, enroute: 3, delivered: 4,
}
const LEVEL_RANK: Record<OrderLevel, number> = {
  none: -1, placed: 0, accepted: 1, picked: 2, enroute: 3, delivered: 4,
}

export default function App() {
  /* before anything else: the cover is its own artefact and must not boot the
     store, the stage, or the reel runner */
  if (CARD) {
    return CARD_T !== null
      ? <CardCover t={parseFloat(CARD_T)} />
      : <CardCoverLive />
  }
  return <Stage />
}

function Stage() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  useEffect(() => { applyTheme(theme) }, [theme])
  const set = useCallback(<K extends keyof Theme>(k: K, v: Theme[K]) => setTheme((t) => ({ ...t, [k]: v })), [])

  return (
    <ImageryCtx.Provider value={theme.imagery}>
      <StoreProvider>
        <Shell theme={theme} set={set} />
      </StoreProvider>
    </ImageryCtx.Provider>
  )
}

function Shell({ theme, set }: { theme: Theme; set: <K extends keyof Theme>(k: K, v: Theme[K]) => void }) {
  const store = useStore()
  const [view, setView] = useState<View>(REEL_SHOT?.view ?? SHOT_SCENE?.view ?? 'split')
  const [clientRoute, setClientRoute] = useState<ClientRoute>(SHOT_SCENE?.client ?? { name: 'onboard' })
  const [driverRoute, setDriverRoute] = useState<DriverRoute>(SHOT_SCENE?.driver ?? { name: 'login' })
  /* the phone is one app with two front doors; `side` says which is open */
  const [side, setSide] = useState<PhoneSide>(SHOT_SCENE?.side ?? 'driver')
  const [phoneRoute, setPhoneRoute] = useState<ClientPhoneRoute>(SHOT_SCENE?.phone ?? { name: 'login' })
  const [recording, setRecording] = useState(false)

  const orderRef = useRef<string | null>(null)
  const seedRef = useRef<Order | null>(null)
  const shotReady = useRef(false)
  const storeRef = useRef(store)
  storeRef.current = store

  /* Scenes deeper in the flow only read correctly if an order already
     exists at the right stage — so fabricate exactly as much history as
     the scene needs, and no more. */
  const ensureOrder = useCallback((need: OrderLevel): string => {
    const s = storeRef.current
    /* the seeded order may not have committed to state yet (a second rail click
       in the same tick, or StrictMode's double effect) — the mirror covers that */
    const existing =
      s.orders.find((o) => o.id === orderRef.current) ??
      (seedRef.current?.id === orderRef.current ? seedRef.current : undefined) ??
      s.orders.find((o) => o.method === 'delivery' && !o.ambient)
    let id: string
    let cur: number
    if (existing) { id = existing.id; cur = STAGE_RANK[existing.stage] }
    else { const o = s.seedRoute(); seedRef.current = o; id = o.id; cur = 0 }
    orderRef.current = id

    const target = LEVEL_RANK[need]
    if (cur < 1 && target >= 1) s.acceptRoute(id)
    if (cur < 2 && target >= 2) s.driverPicked(id)
    if (cur < 3 && target >= 3) s.driverEnroute(id)
    if (cur < 4 && target >= 4) s.driverDelivered(id)
    return id
  }, [])

  /* a checkout with an empty basket is a different screen — fill it first */
  const ensureCart = useCallback(() => {
    const s = storeRef.current
    if (s.cart.length === 0) s.setCartQty('l1', 1)
  }, [])

  const goto = useCallback((id: SceneId) => {
    const s = sceneById(id)
    const oid = s.needs && s.needs !== 'none' ? ensureOrder(s.needs) : undefined
    if (s.cart) ensureCart()
    setView(s.view)
    setSide(s.side ?? (s.view === 'driver' ? 'driver' : side))
    if (s.client) setClientRoute({ ...s.client, orderId: s.client.orderId ?? oid })
    if (s.driver) setDriverRoute({ ...s.driver, orderId: s.driver.orderId ?? oid })
    if (s.phone) setPhoneRoute({ ...s.phone, orderId: s.phone.orderId ?? oid })
  }, [ensureOrder, ensureCart, side])

  const goClient = useCallback<(name: ClientRoute['name'], params?: Omit<ClientRoute, 'name'>) => void>(
    (name, params) => setClientRoute({ name, ...params }), [])
  const goDriver = useCallback<(name: DriverRoute['name'], orderId?: string) => void>(
    (name, orderId) => { setSide('driver'); setDriverRoute((r) => ({ name, orderId: orderId ?? r.orderId })) }, [])
  const goPhone = useCallback<(name: ClientPhoneRoute['name'], params?: Omit<ClientPhoneRoute, 'name'>) => void>(
    (name, params) => { setSide('client'); setPhoneRoute((r) => ({ name, orderId: r.orderId, ...params })) }, [])

  const reset = useCallback(() => {
    store.resetDemo()
    orderRef.current = null
    seedRef.current = null
    setClientRoute({ name: 'onboard' })
    setDriverRoute({ name: 'login' })
    setSide('driver')
    setPhoneRoute({ name: 'login' })
  }, [store])

  /* which rail entry is lit is derived from where the two apps actually
     are — clicking inside the product must never desync the index */
  const scene: SceneId = useMemo(() => {
    const order = store.orders.find((o) => o.id === driverRoute.orderId) ?? store.orders[0]
    if (view === 'split') return clientRoute.name === 'track' ? 'tracked' : 'handoff'
    if (view === 'driver') {
      if (side === 'gate') return 'pGate'
      if (side === 'client') {
        switch (phoneRoute.name) {
          case 'login': return 'pLogin'
          case 'browse': return 'pBrowse'
          case 'places': return 'pPlaces'
          case 'detail': return 'pDetail'
          case 'confirm': return 'pConfirm'
          case 'track': return 'pTrack'
          case 'orders': return 'pOrders'
        }
      }
      switch (driverRoute.name) {
        case 'login': return 'dLogin'
        case 'routes': return 'dRoutes'
        case 'detail': return 'dDetail'
        case 'done': return 'dDone'
        case 'impact': return 'dImpact'
        case 'active': return order && STAGE_RANK[order.stage] >= 3 ? 'dDeliver' : 'dPickup'
      }
    }
    switch (clientRoute.name) {
      case 'onboard': return 'landing'
      case 'signup': return 'signup'
      case 'home': return 'home'
      case 'about': return 'about'
      case 'directory': return 'directory'
      case 'browse': return 'browse'
      case 'detail': return 'detail'
      case 'checkout': return 'checkout'
      case 'confirm': return 'confirm'
      case 'track': return 'track'
    }
  }, [view, clientRoute, driverRoute, side, phoneRoute, store.orders])

  const demo = useDemoRunner({
    scene: goto, client: goClient, driver: goDriver, phone: goPhone, side: setSide,
    view: setView, set, reset,
  })

  /* Reel capture hands control to the frame renderer: nothing plays until
     __startReel() is called, and __reelDone flips once the reel has run out.
     Autoplaying here instead would burn reel time during the page's boot. */
  const reelStarted = useRef(false)
  useEffect(() => {
    if (!REEL_ID || !REEL_SHOT) return
    const id = REEL_ID
    window.__startReel = () => { window.__reelDone = false; demo.play(id) }
    window.__reelReady = true
  }, [demo.play])
  useEffect(() => {
    if (!REEL_SHOT) return
    if (demo.activeId) reelStarted.current = true
    else if (reelStarted.current) window.__reelDone = true
  }, [demo.activeId])

  /* the surfaces have fixed layout boxes — scale them to whatever room
     the stage column actually has rather than guessing with breakpoints */
  const mainRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(1)
  const design = view === 'split' ? { w: 1420, h: 900 } : view === 'client' ? { w: 1280, h: 820 } : { w: PHONE_W + 22, h: PHONE_H + 22 }
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const fit = () => {
      const { width, height } = main.getBoundingClientRect()
      setScale(Math.max(0.3, Math.min((width - 28) / design.w, (height - 96) / design.h, 1)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(main)
    return () => ro.disconnect()
  }, [design.w, design.h])

  /* shot mode still needs its order history built once */
  useEffect(() => {
    if (!SHOT_SCENE || shotReady.current) return
    shotReady.current = true
    if (SHOT_SCENE.cart) ensureCart()
    if (SHOT_SCENE.needs && SHOT_SCENE.needs !== 'none') {
      const oid = ensureOrder(SHOT_SCENE.needs)
      setClientRoute((r) => ({ ...r, orderId: oid }))
      setDriverRoute((r) => ({ ...r, orderId: oid }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      if (k === 'c') { setRecording((v) => !v); return }
      if (e.key === 'Escape' && demo.activeId) { demo.stop(); return }
      if (demo.activeId) return  // a reel is driving; keep hands off
      if (k === 'r') { reset(); return }
      if (e.key === '1') { setView('split'); return }
      if (e.key === '2') { setView('client'); return }
      if (e.key === '3') { setView('driver'); return }
      const i = SCENES.findIndex((s) => s.id === scene)
      if (e.key === 'ArrowRight') goto(SCENES[(i + 1) % SCENES.length].id)
      else if (e.key === 'ArrowLeft') goto(SCENES[(i - 1 + SCENES.length) % SCENES.length].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scene, goto, demo, reset])

  const client = <ClientApp route={clientRoute} go={goClient} />
  const driver =
    side === 'gate' ? <PhoneGate onDriver={() => goDriver('login')} onClient={() => goPhone('login')} />
    : side === 'client' ? <ClientPhoneApp route={phoneRoute} go={goPhone} />
    : <DriverApp route={driverRoute} go={goDriver} />

  /* ── still capture ─────────────────────────────────────── */
  if (SHOT_SCENE) {
    if (SHOT_SCENE.view === 'driver') {
      if (PLATE) {
        const s = (SHOT_PLATE.h - 80) / (PHONE_H + 22)
        return (
          <div style={{
            width: SHOT_PLATE.w, height: SHOT_PLATE.h, overflow: 'hidden',
            display: 'grid', placeItems: 'center',
            background: 'radial-gradient(120% 90% at 50% 0%, var(--surface), var(--sand) 90%)',
          }}>
            <div style={{ transform: `scale(${s})` }}><PhoneFrame>{driver}</PhoneFrame></div>
          </div>
        )
      }
      return (
        <div style={{ width: PHONE_W, height: PHONE_H, overflow: 'hidden' }}>
          <PhoneFrame bare>{driver}</PhoneFrame>
        </div>
      )
    }
    return (
      <div style={{ width: SHOT_WEB.w, height: SHOT_H || SHOT_WEB.h, overflow: 'hidden' }}>
        <BrowserFrame url="ecobites.org" flush>{client}</BrowserFrame>
      </div>
    )
  }

  /* ── thumbnail plate ───────────────────────────────────
     Both surfaces on a 16:10 field, overlapping, so the card reads as a
     service with two front doors at the size a gallery tile allows. */
  if (COVER) {
    const WEB = 0.62
    const PHONE = 0.52
    return (
      <div style={{
        position: 'relative', width: COVER_SIZE.w, height: COVER_SIZE.h, overflow: 'hidden',
        background: 'radial-gradient(120% 110% at 26% 10%, #fbf9f1, #f1eee0 72%)',
      }}>
        <div style={{ position: 'absolute', left: 58, top: 56, width: 1280 * WEB, height: 820 * WEB }}>
          <div style={{ width: 1280, height: 820, transform: `scale(${WEB})`, transformOrigin: 'top left' }}>
            <BrowserFrame url="ecobites.org">
              <ClientApp route={{ name: 'onboard' }} go={goClient} />
            </BrowserFrame>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 56, bottom: -58, width: 424 * PHONE, height: 896 * PHONE }}>
          <div style={{ width: 424, height: 896, transform: `scale(${PHONE})`, transformOrigin: 'top left' }}>
            <PhoneFrame>
              <PhoneGate onDriver={() => {}} onClient={() => {}} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    )
  }

  /* ── reel capture ──────────────────────────────────────
     The same surfaces on a fixed artboard, with the rail, the token panel
     and the demo bar gone. Only the caption and the pointer survive. */
  if (REEL_SHOT) {
    return (
      <div style={{
        position: 'relative', width: REEL_SHOT.w, height: REEL_SHOT.h, overflow: 'hidden',
        background: '#fff', padding: '26px 30px 0', boxSizing: 'border-box',
      }}>
        <div style={{ width: design.w, height: design.h }}>
          <Surfaces view={view} client={client} driver={driver} />
        </div>
        {hasCaption(REEL_SHOT.view) && (
          <div style={{
            height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: demo.caption ? 1 : 0, transition: 'opacity .3s',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 21, letterSpacing: '.02em',
              color: 'rgba(0,0,0,.42)', textAlign: 'center',
            }}>
              {demo.caption}
            </span>
          </div>
        )}
        {/* a toast floats at the top of the viewport, which on a phone artboard
            means straight across the device's own status bar */}
        {REEL_SHOT.view !== 'driver' && <Toasts />}
        <DemoCursor pos={demo.cursor} tapKey={demo.tapKey} />
        {/* Keeps one repaint always pending — see eb-reel-tick in index.css.
            Without it the headless capture blocks on any frame that is
            identical to the one before it. */}
        <div id="__tick" aria-hidden style={{ position: 'fixed', right: 0, bottom: 0, width: 2, height: 2, background: '#fff' }} />
      </div>
    )
  }

  const activeScene = sceneById(scene)

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>
      <StageBackdrop />

      <div className={`stage${recording ? ' recording' : ''}`} style={{ position: 'relative', height: '100%', display: 'flex' }}>
        <div className="rail"><SceneRail active={scene} onPick={goto} /></div>

        <main ref={mainRef} style={{
          flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 10px 12px',
        }}>
          {!recording && (
            <div style={{ textAlign: 'center', color: 'var(--stage-text)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
                {activeScene.label}
              </div>
              <div className="mono-label" style={{ marginTop: 2 }}>{activeScene.note}</div>
            </div>
          )}

          <div style={{ width: design.w * scale, height: design.h * scale, flexShrink: 0 }}>
            <div style={{ width: design.w, height: design.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <Surfaces view={view} client={client} driver={driver} />
            </div>
          </div>

          {/* reel narration — the one bit of chrome that survives record mode */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center', opacity: demo.caption ? 1 : 0, transition: 'opacity .3s' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.05em', color: 'var(--stage-dim)', textAlign: 'center' }}>
              {demo.caption}
            </span>
          </div>
        </main>

        <div className="panel">
          <TokensPanel theme={theme} set={set} view={view} onView={setView} onReset={reset} />
        </div>
      </div>

      <Toasts />
      <DemoBar
        reels={demo.reels}
        activeId={demo.activeId}
        progress={demo.progress}
        recording={recording}
        onPlay={demo.play}
        onStop={demo.stop}
        onToggleRecording={() => setRecording((v) => !v)}
      />
      <DemoCursor pos={demo.cursor} tapKey={demo.tapKey} />
    </div>
  )
}

/* Whichever surfaces the current view calls for, at their design size.
   Shared by the stage and by reel capture so a recording cannot drift
   from what the stage shows. */
function Surfaces({ view, client, driver }: { view: View; client: React.ReactNode; driver: React.ReactNode }) {
  if (view === 'split') return <SplitStage client={client} driver={driver} />
  if (view === 'client') return <BrowserFrame url="ecobites.org">{client}</BrowserFrame>
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PhoneFrame>{driver}</PhoneFrame>
    </div>
  )
}

function StageBackdrop() {
  return (
    <>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(1100px 640px at 50% 34%, color-mix(in oklch, var(--green) 22%, transparent), transparent 70%),' +
          'radial-gradient(820px 480px at 14% 92%, color-mix(in oklch, var(--clay) 14%, transparent), transparent 68%),' +
          'var(--stage-deep)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.55,
        backgroundImage: 'radial-gradient(oklch(1 0 0 / .05) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
        maskImage: 'radial-gradient(closest-side at 50% 45%, transparent 30%, black 88%)',
        WebkitMaskImage: 'radial-gradient(closest-side at 50% 45%, transparent 30%, black 88%)',
      }} />
    </>
  )
}

/* Both surfaces at once. The split is the argument: an order placed on
   the left becomes work on the right, and the right moves the left. */
function SplitStage({ client, driver }: { client: React.ReactNode; driver: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', gap: 34, alignItems: 'stretch' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <SurfaceLabel icon="monitor" label="Client website" note="browse, reserve & track" />
        <div style={{ flex: 1, minHeight: 0 }}>
          <BrowserFrame url="ecobites.org">{client}</BrowserFrame>
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <SurfaceLabel icon="truck" label="Driver app" note="accept, pick up & deliver" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <PhoneFrame>{driver}</PhoneFrame>
        </div>
      </div>
    </div>
  )
}

function SurfaceLabel({ icon, label, note }: { icon: string; label: string; note: string }) {
  /* stage furniture, and lit for a dark stage — a reel is cropped to the
     surfaces themselves, so it carries no labels */
  if (REEL_SHOT) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12, paddingLeft: 4, color: 'var(--stage-text)' }}>
      <Icon name={icon} size={17} stroke="var(--green)" />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.01em' }}>{label}</span>
      <span className="mono-label">{note}</span>
    </div>
  )
}
