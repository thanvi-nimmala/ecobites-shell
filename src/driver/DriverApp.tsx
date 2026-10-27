/* ============================================================
   EcoBites — Driver app (mobile surface, inside the iOS frame)
   ============================================================ */
import { useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { Logo, LogoMedallion } from '../components/Logo'
import { Badge, Tile } from '../components/ui'
import { DPAD, useStatusInk } from '../components/PhoneFrame'
import { DRIVER, ORDER_STAGES, PHOTO, listingPhoto, provider } from '../lib/data'
import type { DriverRoute, DriverScreenName, GoDriver } from '../lib/nav'
import { useStore } from '../lib/store'
import type { Order } from '../lib/types'
import { DActive, DDetail, DDone, DImpact } from './screens'

/* every driver screen opens on something dark — the sign-in photograph, or
   the header band — so the phone's status bar runs light throughout */
export function DriverApp({ route, go }: { route: DriverRoute; go: GoDriver }) {
  const { orders } = useStore()
  const active = orders.find((o) => o.id === route.orderId)
  useStatusInk('light')

  const screens: Record<DriverScreenName, ReactNode> = {
    login:  <DLogin go={go} />,
    routes: <DRoutes go={go} />,
    detail: <DDetail go={go} order={active} />,
    active: <DActive go={go} order={active} />,
    done:   <DDone go={go} order={active} />,
    impact: <DImpact />,
  }

  return (
    <div className="eb-body eb-ground" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div key={route.name} className="eb-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {screens[route.name]}
      </div>
      {(route.name === 'routes' || route.name === 'impact') && <DTabBar screen={route.name} go={go} />}
    </div>
  )
}

export function DHeader({ title, sub, onBack, right }: {
  title: string; sub?: string; onBack?: () => void; right?: ReactNode
}) {
  return (
    <div style={{
      padding: `${DPAD}px 20px 16px`, flexShrink: 0, zIndex: 5, position: 'relative',
      /* A deep, lit band at the top. The app was uniformly cream, which gave it
         no contrast to work with and nothing for the glass below to sit against. */
      background:
        'radial-gradient(120% 140% at 88% -30%, color-mix(in oklch, var(--green) 52%, transparent) 0%, transparent 62%),'
        + 'linear-gradient(168deg, var(--green-deep) 0%, color-mix(in oklch, var(--green-deep) 78%, black) 100%)',
      boxShadow: '0 1px 0 oklch(1 0 0 / .10) inset, 0 8px 22px oklch(0.25 0.04 140 / .22)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="eb-glass-dark" style={{
            width: 38, height: 38, borderRadius: 99, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name="arrowLeft" size={19} stroke="var(--on-green)" />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eb-display" style={{ fontSize: 22, color: 'var(--on-green)' }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: 'oklch(0.88 0.04 145)', marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}

export function DAvatar() {
  return (
    <div className="eb-glass-dark" style={{
      width: 40, height: 40, borderRadius: 99, color: 'var(--on-green)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
    }}>{DRIVER.initials}</div>
  )
}

function DTabBar({ screen, go }: { screen: DriverScreenName; go: GoDriver }) {
  const tabs: [DriverScreenName, string, string][] = [['routes', 'route', 'Routes'], ['impact', 'wallet', 'Impact']]
  return (
    <div className="eb-glass" style={{
      display: 'flex', padding: '8px 24px 26px',
      borderTop: '1px solid var(--edge)', flexShrink: 0, justifyContent: 'space-around', zIndex: 5,
    }}>
      {tabs.map(([k, ic, label]) => (
        <button key={k} onClick={() => go(k)} data-demo={`d-tab-${k}`} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 11.5,
          color: screen === k ? 'var(--green-deep)' : 'var(--ink-3)',
        }}>
          <Icon name={ic} size={23} /> {label}
        </button>
      ))}
    </div>
  )
}

/* ---------- login ---------- */
function DLogin({ go }: { go: GoDriver }) {
  return (
    <div style={{
      flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
      padding: `${DPAD + 20}px 26px 30px`, background: 'var(--green-deep)', overflow: 'hidden',
    }}>
      <img src={PHOTO.crateWarehouse} alt="" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,36,18,0.40) 0%, rgba(28,34,18,0.66) 50%, rgba(24,30,16,0.93) 100%)' }} />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Logo size={62} color="var(--on-green)" style={{ marginBottom: 16 }} />
        <div className="eb-display" style={{ fontSize: 32, color: 'var(--on-green)', lineHeight: 1.1 }}>EcoBites<br />Driver</div>
        <p style={{ color: 'oklch(0.90 0.04 145)', fontSize: 15.5, lineHeight: 1.5, margin: '12px 0 30px' }}>
          Bring good food to neighbors near you. Drive when it suits you, skip when it doesn’t.
        </p>
        <input className="eb-input" placeholder="Phone number" style={{ marginBottom: 11 }} />
        <input className="eb-input" placeholder="Password" type="password" style={{ marginBottom: 20 }} />
        <button className="eb-btn eb-btn-clay eb-btn-block" data-demo="d-login" onClick={() => go('routes')} style={{ padding: 15 }}>Log in</button>
        <button onClick={() => go('routes')} style={{
          marginTop: 14, background: 'none', border: 'none', color: 'var(--on-green)',
          fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
        }}>New here? Become a driver</button>
      </div>
    </div>
  )
}

/* ---------- routes list ---------- */
function DRoutes({ go }: { go: GoDriver }) {
  const { availableRoutes, myRoutes } = useStore()
  const [filter, setFilter] = useState('nearby')
  return (
    <>
      <DHeader title="Available routes" sub={`${availableRoutes.length} nearby · Newark`} right={<DAvatar />} />
      <div className="eb-scroll" style={{ flex: 1, padding: '16px 18px' }}>
        <div className="eb-card" style={{
          padding: '13px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11,
          background: 'var(--green-tint)', borderColor: 'var(--green-soft)',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--green)', boxShadow: '0 0 0 4px var(--green-soft)' }} />
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: 'var(--green-deep)' }}>You’re online</div>
          <div style={{ width: 44, height: 26, borderRadius: 99, background: 'var(--green)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 99, background: '#fff' }} />
          </div>
        </div>

        {myRoutes.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--clay-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Your active route
            </div>
            {myRoutes.map((o) => <DRouteCard key={o.id} order={o} go={go} active />)}
          </div>
        )}

        <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
          {[['nearby', 'Nearby'], ['soon', 'Soonest'], ['high', 'Top miles']].map(([k, l]) => (
            <button key={k} className="eb-chip" data-active={filter === k} onClick={() => setFilter(k)} style={{ fontSize: 13 }}>{l}</button>
          ))}
        </div>

        {availableRoutes.length === 0 ? (
          <div className="eb-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
            <LogoMedallion size={112} tone="gold" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Nothing to run just yet</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '6px 0 0', lineHeight: 1.5 }}>
              The moment someone nearby asks for a delivery, it’ll turn up here.
            </p>
          </div>
        ) : availableRoutes.map((o, i) => <DRouteCard key={o.id} order={o} go={go} first={i === 0} />)}
      </div>
    </>
  )
}

function DRouteCard({ order, go, active, first }: { order: Order; go: GoDriver; active?: boolean; first?: boolean }) {
  const prov = provider(order.providerId)
  const items = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <button
      onClick={() => go(active ? 'active' : 'detail', order.id)}
      data-demo={active ? 'd-route-active' : first ? 'd-route-first' : undefined}
      className="eb-card eb-card-hover"
      style={{ width: '100%', padding: 16, marginBottom: 12, textAlign: 'left', cursor: 'pointer', border: active ? '2px solid var(--clay)' : undefined }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tile photo={listingPhoto(order.items[0]?.listing)} category={order.items[0]?.listing.category} style={{ width: 40, height: 40 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{items} {items > 1 ? 'boxes' : 'box'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{order.code}</div>
          </div>
        </div>
        {active
          ? <Badge tone="clay">{ORDER_STAGES.find((s) => s.key === order.stage)?.label}</Badge>
          : <Badge tone="gold">{order.eta} min</Badge>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 13, height: 13, borderRadius: 99, background: 'var(--green)', marginTop: 2, flexShrink: 0, border: '2px solid var(--green-soft)' }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.3 }}>
            <span style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>PICK UP</span><br /><b>{prov.name}</b>
          </div>
        </div>
        <div style={{ width: 2, height: 12, background: 'var(--border-2)', marginLeft: 5.5 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--clay)', marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.3 }}>
            <span style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>DROP OFF</span><br />
            <b>{order.name}</b> · {order.address.split(',')[0]}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="route" size={15} stroke="var(--ink-3)" /> {prov.dist} mi · ~{order.eta} min
        </span>
        <span style={{ color: 'var(--green-deep)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 3 }}>
          {active ? 'Continue' : 'View'} <Icon name="chevR" size={16} />
        </span>
      </div>
    </button>
  )
}
