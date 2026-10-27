/* ============================================================
   EcoBites — Client portal (mobile surface, inside the iOS frame)

   The website assumes a desktop and a quiet half hour. Most people who
   need food relief have neither: the phone is the only machine they own.
   So the same app the drivers use carries a client side, reached through
   its own log-in, and it does the four things that actually matter —
   see what is near, reserve it, choose how to get it, follow it.
   ============================================================ */
import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Logo, LogoMedallion } from '../components/Logo'
import { DPAD, useStatusInk } from '../components/PhoneFrame'
import { Badge, MapView, Tile } from '../components/ui'
import {
  CATEGORIES, CLIENT, DRIVER, LISTINGS, ORDER_STAGES, PHOTO,
  listingPhoto, plural, provider,
} from '../lib/data'
import type { ClientPhoneName, ClientPhoneRoute, GoClientPhone } from '../lib/nav'
import { useStore } from '../lib/store'
import type { Fulfillment, Listing, Order } from '../lib/types'
import { DHeader } from '../driver/DriverApp'

/* sign-in and the confirmation open on cream; the rest open on a header band
   or a photograph */
const LIGHT_TOP: ReadonlySet<ClientPhoneName> = new Set(['login', 'confirm'])

export function ClientPhoneApp({ route, go }: { route: ClientPhoneRoute; go: GoClientPhone }) {
  const { orders } = useStore()
  const order = orders.find((o) => o.id === route.orderId) ?? orders.find((o) => !o.ambient)
  useStatusInk(LIGHT_TOP.has(route.name) ? 'dark' : 'light')

  const screens: Record<ClientPhoneName, React.ReactNode> = {
    login:   <CPLogin go={go} />,
    browse:  <CPBrowse go={go} />,
    detail:  <CPDetail go={go} id={route.id} />,
    confirm: <CPConfirm go={go} order={order} />,
    track:   <CPTrack go={go} order={order} />,
    orders:  <CPOrders go={go} />,
  }

  return (
    <div className="eb-body eb-ground" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div key={route.name} className="eb-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {screens[route.name]}
      </div>
      {(route.name === 'browse' || route.name === 'orders') && <CPTabBar screen={route.name} go={go} />}
    </div>
  )
}

/* ---------- which half of the service are you here for ---------- */

export function PhoneGate({ onDriver, onClient }: { onDriver: () => void; onClient: () => void }) {
  useStatusInk('light')
  return (
    <div className="eb-body" style={{
      height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
      padding: `${DPAD + 26}px 26px 34px`, background: 'var(--green-deep)', overflow: 'hidden',
    }}>
      <img src={PHOTO.communityTable} alt="" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,36,18,0.42) 0%, rgba(28,34,18,0.70) 46%, rgba(22,28,15,0.96) 100%)' }} />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <Logo size={58} color="var(--on-green)" style={{ marginBottom: 18 }} />
        <div className="eb-display" style={{ fontSize: 31, color: 'var(--on-green)', lineHeight: 1.12 }}>
          Good food,<br />already nearby.
        </div>
        <p style={{ color: 'oklch(0.90 0.04 145)', fontSize: 15.5, lineHeight: 1.5, margin: '12px 0 26px' }}>
          One app, both sides of the same trip. Tell us which one you’re here for.
        </p>
        <GateChoice
          demo="p-gate-client" icon="box" onClick={onClient}
          title="I need food" note="Reserve a box near you — always free"
        />
        <GateChoice
          demo="p-gate-driver" icon="truck" onClick={onDriver}
          title="I’m driving today" note="Pick up a route and bring it to a neighbor"
        />
      </div>
    </div>
  )
}

function GateChoice({ icon, title, note, onClick, demo }: {
  icon: string; title: string; note: string; onClick: () => void; demo: string
}) {
  return (
    <button onClick={onClick} data-demo={demo} className="eb-glass-dark" style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%', marginBottom: 11,
      padding: '15px 17px', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
    }}>
      <span style={{
        width: 42, height: 42, borderRadius: 99, flexShrink: 0, background: 'oklch(1 0 0 / .18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={21} stroke="var(--on-green)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 16.5, color: 'var(--on-green)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'oklch(0.89 0.035 145)', marginTop: 1 }}>{note}</span>
      </span>
      <Icon name="chevR" size={19} stroke="var(--on-green)" />
    </button>
  )
}

/* ---------- log in ---------- */

function CPLogin({ go }: { go: GoClientPhone }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: `${DPAD + 16}px 26px 30px`, background: 'var(--surface)',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <LogoMedallion size={92} tone="green" style={{ marginBottom: 20 }} />
        <div className="eb-display" style={{ fontSize: 29, lineHeight: 1.12 }}>Welcome back</div>
        <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.5, margin: '10px 0 26px' }}>
          Your reservations and your deliveries, on the phone you already carry.
        </p>
        <input className="eb-input" placeholder="Phone number" style={{ marginBottom: 11 }} />
        <input className="eb-input" placeholder="Password" type="password" style={{ marginBottom: 20 }} />
        <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="p-login" onClick={() => go('browse')} style={{ padding: 15 }}>
          Log in
        </button>
        <button onClick={() => go('browse')} data-demo="p-login-guest" style={{
          marginTop: 16, background: 'none', border: 'none', color: 'var(--green-deep)',
          fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
        }}>
          Just looking? Browse without an account
        </button>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5, margin: '22px 0 0', textAlign: 'center' }}>
          No eligibility check, no paperwork, no payment — ever.
        </p>
      </div>
    </div>
  )
}

/* ---------- browse ---------- */

function CPBrowse({ go }: { go: GoClientPhone }) {
  const [cat, setCat] = useState('all')
  const list = useMemo(
    () => LISTINGS.filter((l) => (cat === 'all' ? true : l.category === cat)),
    [cat],
  )
  return (
    <>
      <DHeader title="Near you" sub={CLIENT.zip} right={<CPAvatar />} />
      <div className="eb-scroll" style={{ flex: 1, padding: '14px 18px 18px' }}>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 13, marginBottom: 4 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id} className="eb-chip" data-active={cat === c.id} data-demo={`p-cat-${c.id}`}
              onClick={() => setCat(c.id)} style={{ fontSize: 13, flexShrink: 0 }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 12 }}>
          {list.length} available right now
        </div>
        {list.map((l) => <CPListingCard key={l.id} listing={l} go={go} />)}
      </div>
    </>
  )
}

function CPListingCard({ listing, go }: { listing: Listing; go: GoClientPhone }) {
  const prov = provider(listing.provider)
  const low = listing.qtyLeft <= 3
  return (
    <button
      onClick={() => go('detail', { id: listing.id })}
      data-demo={`p-listing-${listing.id}`}
      className="eb-card eb-card-hover"
      style={{ width: '100%', padding: 12, marginBottom: 11, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 12 }}
    >
      <Tile photo={listingPhoto(listing)} category={listing.category} style={{ width: 76, height: 76, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{listing.name}</span>
          {low && <Badge tone="clay" style={{ flexShrink: 0 }}>{listing.qtyLeft} left</Badge>}
        </span>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-3)', margin: '3px 0 7px' }}>{prov.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: 'var(--ink-2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon name="pin" size={12} stroke="var(--ink-3)" /> {prov.dist} mi
          </span>
          {prov.fulfillment.map((f) => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 3, textTransform: 'capitalize' }}>
              <Icon name={f === 'delivery' ? 'truck' : 'bag'} size={12} stroke="var(--ink-3)" /> {f}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}

/* ---------- one listing, and the fork ---------- */

function CPDetail({ go, id }: { go: GoClientPhone; id?: string }) {
  const store = useStore()
  const l = LISTINGS.find((x) => x.id === id) ?? LISTINGS[0]
  const prov = provider(l.provider)
  const [method, setMethod] = useState<Fulfillment | null>(null)
  const pct = Math.round((l.qtyLeft / l.qtyTotal) * 100)

  const place = () => {
    store.setCartQty(l.id, 1)
    const order = store.placeOrder({
      method: method ?? 'delivery',
      address: '142 Halsey St, Apt 3B, Newark NJ',
      window: 'Today · 4:00–6:00 PM',
      name: CLIENT.name,
    })
    go('confirm', { orderId: order.id })
  }

  return (
    <>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Tile photo={listingPhoto(l)} category={l.category} radius={0} style={{ height: 212 }} />
        <button onClick={() => go('browse')} aria-label="Back" style={{
          position: 'absolute', left: 16, top: DPAD, width: 38, height: 38, borderRadius: 99,
          background: 'oklch(1 0 0 / .92)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="arrowLeft" size={19} />
        </button>
      </div>

      <div className="eb-scroll" style={{ flex: 1, padding: '16px 20px 18px' }}>
        <div className="eb-display" style={{ fontSize: 23, lineHeight: 1.2 }}>{l.name}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '4px 0 12px' }}>
          {prov.name} · {prov.dist} mi away
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 16px' }}>{l.desc}</p>

        {/* scarcity is the real constraint, so it is stated before the button */}
        <div className="eb-card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}>
            <b>{l.qtyLeft} {plural(l.qtyLeft, l.unit)} left today</b>
            <span style={{ color: 'var(--ink-3)' }}>of {l.qtyTotal}</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pct < 35 ? 'var(--clay)' : 'var(--green)' }} />
          </div>
          {l.waitlist > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8 }}>
              {l.waitlist} {l.waitlist === 1 ? 'person is' : 'people are'} waiting on more
            </div>
          )}
        </div>

        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 9 }}>How would you like it?</div>
        {prov.fulfillment.map((f) => (
          <button
            key={f} onClick={() => setMethod(f)} data-demo={`p-method-${f}`}
            className="eb-card" style={{
              width: '100%', padding: '13px 15px', marginBottom: 9, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              borderColor: method === f ? 'var(--green)' : undefined,
              background: method === f ? 'var(--green-tint)' : undefined,
            }}
          >
            <Icon name={f === 'delivery' ? 'truck' : 'bag'} size={20} stroke={method === f ? 'var(--green-deep)' : 'var(--ink-2)'} />
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, textTransform: 'capitalize' }}>{f}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>
                {f === 'delivery' ? 'A volunteer brings it — today, 4–6 PM' : `${prov.addr} · open until 6 PM`}
              </span>
            </span>
            <span style={{
              width: 20, height: 20, borderRadius: 99, flexShrink: 0,
              border: `2px solid ${method === f ? 'var(--green)' : 'var(--border-2)'}`,
              background: method === f ? 'var(--green)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {method === f && <Icon name="check" size={12} stroke="#fff" sw={3} />}
            </span>
          </button>
        ))}
      </div>

      <div className="eb-glass" style={{ padding: '12px 20px 26px', borderTop: '1px solid var(--edge)', flexShrink: 0, zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Total</span>
          <span className="eb-display" style={{ fontSize: 21, color: 'var(--green-deep)' }}>$0.00</span>
        </div>
        <button
          className="eb-btn eb-btn-primary eb-btn-block" data-demo="p-reserve"
          onClick={place} disabled={!method} style={{ padding: 15, opacity: method ? 1 : 0.5 }}
        >
          {method ? `Reserve for ${method}` : 'Choose delivery or pickup'}
        </button>
      </div>
    </>
  )
}

/* ---------- confirmation ---------- */

function CPConfirm({ go, order }: { go: GoClientPhone; order?: Order }) {
  if (!order) return <CPEmpty go={go} title="Nothing reserved yet" note="Pick something nearby and it will show up here." />
  const prov = provider(order.providerId)
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `${DPAD + 14}px 24px 28px`, overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <LogoMedallion size={118} tone="green" style={{ margin: '0 auto 18px' }} />
        <div className="eb-display" style={{ fontSize: 26, lineHeight: 1.15 }}>You’re all set, {order.name}!</div>
        <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.5, margin: '10px 0 20px' }}>
          Order {order.code} is confirmed — {order.method === 'delivery'
            ? 'we’re finding a volunteer to bring it.'
            : 'it’ll be waiting for you.'}
        </p>
        <div className="eb-card" style={{ padding: 15, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 11 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 99, background: 'var(--green-soft)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={order.method === 'delivery' ? 'truck' : 'bag'} size={18} stroke="var(--green-deep)" />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, textTransform: 'capitalize' }}>{order.method}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{order.window}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
            <span>{order.items.map((i) => `${i.qty}× ${i.listing.name}`).join(', ')}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 5 }}>{prov.name}</div>
        </div>
      </div>
      <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="p-track" onClick={() => go('track', { orderId: order.id })} style={{ padding: 15 }}>
        Track my order <Icon name="arrowRight" size={18} />
      </button>
      <button onClick={() => go('browse')} style={{
        marginTop: 12, background: 'none', border: 'none', color: 'var(--ink-2)',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>Back to browsing</button>
    </div>
  )
}

/* ---------- the tracker ---------- */

function CPTrack({ go, order }: { go: GoClientPhone; order?: Order }) {
  if (!order) return <CPEmpty go={go} title="Nothing on its way yet" note="Once you’ve reserved something, you can follow it right here." />

  /* pickup never has a driver leg, so the timeline drops the stages that
     can no longer happen rather than greying them out */
  const stages = order.method === 'delivery'
    ? ORDER_STAGES
    : ORDER_STAGES.filter((s) => ['reserved', 'preparing', 'pickup', 'delivered'].includes(s.key))
  const i = Math.max(0, stages.findIndex((s) => s.key === order.stage))
  const done = order.stage === 'delivered'

  return (
    <>
      <DHeader
        title={stages[i].client}
        sub={`Order ${order.code} · ${done ? 'delivered just now' : order.method === 'delivery' ? `ETA ~${order.eta} min` : 'ready soon'}`}
        onBack={() => go('browse')}
        right={<Badge tone={done ? 'green' : 'clay'}>{done ? 'Delivered' : 'Live'}</Badge>}
      />
      <div className="eb-scroll" style={{ flex: 1, padding: '14px 20px 20px' }}>
        <MapView height={150} route={order.method === 'delivery'} style={{ marginBottom: 16 }} />

        {order.method === 'delivery' && (order.driverAccepted ? (
          <div className="eb-card eb-fade" style={{ padding: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>{DRIVER.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{DRIVER.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={12} stroke="var(--gold)" fill="var(--gold)" /> {DRIVER.rating} · {DRIVER.vehicle}
              </div>
            </div>
            <button className="eb-btn eb-btn-soft" style={{ padding: '9px 13px' }} aria-label="Call driver">
              <Icon name="phone" size={16} />
            </button>
          </div>
        ) : (
          <div className="eb-card" style={{ padding: 14, marginBottom: 16, textAlign: 'center', color: 'var(--ink-2)', fontSize: 13.5 }}>
            <Icon name="clock" size={19} stroke="var(--clay)" />
            <div style={{ marginTop: 5 }}>
              Finding someone nearby to bring it…<br />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>The route is live for drivers now.</span>
            </div>
          </div>
        ))}

        {stages.map((s, k) => {
          const past = k < i
          const now = k === i
          return (
            <div key={s.key} style={{ display: 'flex', gap: 14, paddingBottom: k < stages.length - 1 ? 20 : 0, position: 'relative' }}>
              {k < stages.length - 1 && (
                <div style={{ position: 'absolute', left: 12, top: 26, bottom: 0, width: 2, background: past ? 'var(--green)' : 'var(--border)' }} />
              )}
              <div style={{
                width: 26, height: 26, borderRadius: 99, flexShrink: 0, zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: past || now ? 'var(--green)' : 'var(--surface)',
                border: `2px solid ${past || now ? 'var(--green)' : 'var(--border-2)'}`,
                boxShadow: now ? '0 0 0 5px var(--green-tint)' : 'none',
              }}>
                {past ? <Icon name="check" size={14} stroke="#fff" sw={3} />
                  : now ? <span style={{ width: 7, height: 7, borderRadius: 99, background: '#fff' }} /> : null}
              </div>
              <div style={{ paddingTop: 1 }}>
                <div style={{ fontWeight: now ? 700 : 600, fontSize: 14.5, color: past || now ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</div>
                {now && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{s.client}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ---------- my orders ---------- */

function CPOrders({ go }: { go: GoClientPhone }) {
  const { orders } = useStore()
  const mine = orders.filter((o) => !o.ambient)
  return (
    <>
      <DHeader title="My orders" sub={mine.length ? `${mine.length} in the last week` : 'Nothing yet'} right={<CPAvatar />} />
      <div className="eb-scroll" style={{ flex: 1, padding: '16px 18px' }}>
        {mine.length === 0 ? (
          <div className="eb-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
            <LogoMedallion size={108} tone="gold" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: 16 }}>No orders yet</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '6px 0 14px', lineHeight: 1.5 }}>
              Everything you reserve will keep its place here, with where it is right now.
            </p>
            <button className="eb-btn eb-btn-primary" data-demo="p-empty-browse" onClick={() => go('browse')}>
              See what’s near you <Icon name="arrowRight" size={17} />
            </button>
          </div>
        ) : mine.map((o) => {
          const stage = ORDER_STAGES.find((s) => s.key === o.stage)
          const done = o.stage === 'delivered'
          return (
            <button
              key={o.id} onClick={() => go('track', { orderId: o.id })} data-demo={`p-order-${o.id}`}
              className="eb-card eb-card-hover"
              style={{ width: '100%', padding: 13, marginBottom: 11, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <Tile photo={listingPhoto(o.items[0]?.listing)} category={o.items[0]?.listing.category} style={{ width: 52, height: 52, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>{o.items[0]?.listing.name}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{o.code} · {provider(o.providerId).name}</span>
              </span>
              <Badge tone={done ? 'green' : 'clay'}>{stage?.label}</Badge>
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ---------- small shared pieces ---------- */

function CPEmpty({ go, title, note }: { go: GoClientPhone; title: string; note: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
      <LogoMedallion size={120} tone="gold" style={{ margin: '0 auto 16px' }} />
      <div className="eb-display" style={{ fontSize: 21 }}>{title}</div>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, margin: '8px 0 18px' }}>{note}</p>
      <button className="eb-btn eb-btn-primary" data-demo="p-empty-browse" onClick={() => go('browse')} style={{ alignSelf: 'center' }}>
        Browse food <Icon name="arrowRight" size={17} />
      </button>
    </div>
  )
}

function CPAvatar() {
  return (
    <div className="eb-glass-dark" style={{
      width: 40, height: 40, borderRadius: 99, color: 'var(--on-green)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
    }}>{CLIENT.initial}</div>
  )
}

function CPTabBar({ screen, go }: { screen: ClientPhoneName; go: GoClientPhone }) {
  const tabs: [ClientPhoneName, string, string][] = [['browse', 'bag', 'Food'], ['orders', 'route', 'Orders']]
  return (
    <div className="eb-glass" style={{
      display: 'flex', padding: '8px 24px 26px',
      borderTop: '1px solid var(--edge)', flexShrink: 0, justifyContent: 'space-around', zIndex: 5,
    }}>
      {tabs.map(([k, ic, label]) => (
        <button key={k} onClick={() => go(k)} data-demo={`p-tab-${k}`} style={{
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
