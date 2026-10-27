/* ============================================================
   EcoBites — driver screens: route detail, the active flow,
   completion, and impact
   ============================================================ */
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { LogoMedallion } from '../components/Logo'
import { Badge, MapView, Tile } from '../components/ui'
import { DPAD } from '../components/PhoneFrame'
import { DAvatar, DHeader } from './DriverApp'
import { DRIVER, listingPhoto, provider } from '../lib/data'
import type { GoDriver } from '../lib/nav'
import { useStore } from '../lib/store'
import type { Order, Provider } from '../lib/types'

/* the screen scrolls behind this, which is the one place on the phone where
   a blur is doing real work rather than tinting a flat fill */
const footer: React.CSSProperties = {
  padding: '12px 18px 30px', borderTop: '1px solid var(--edge)', flexShrink: 0, zIndex: 5,
}
const FOOTER_CLASS = 'eb-glass'

/* ---------- route detail (pre-accept) ---------- */
export function DDetail({ go, order }: { go: GoDriver; order?: Order }) {
  const { acceptRoute } = useStore()
  if (!order) return <DHeader title="Route" onBack={() => go('routes')} />
  const prov = provider(order.providerId)
  const items = order.items.reduce((n, i) => n + i.qty, 0)

  return (
    <>
      <DHeader title="Route details" sub={order.code} onBack={() => go('routes')} />
      <div className="eb-scroll" style={{ flex: 1 }}>
        <MapView height={180} route radius={0} />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            {[[`${prov.dist} mi`, 'distance'], [`~${order.eta}m`, 'est. time'], [`${items}`, items > 1 ? 'boxes' : 'box']].map(([n, l]) => (
              <div key={l} className="eb-card" style={{ flex: 1, padding: 13, textAlign: 'center' }}>
                <div className="eb-display" style={{ fontSize: 21, color: 'var(--green-deep)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{l}</div>
              </div>
            ))}
          </div>
          <DStopList order={order} prov={prov} />
          <div className="eb-card" style={{ padding: 14, marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Cargo</div>
            {order.items.map((it) => (
              <div key={it.listingId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Tile photo={listingPhoto(it.listing)} category={it.listing.category} style={{ width: 34, height: 34 }} />
                <span style={{ fontSize: 14, flex: 1 }}>{it.listing.name}</span>
                <Badge tone="ghost">{it.qty}×</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={FOOTER_CLASS} style={footer}>
        <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="d-accept" style={{ padding: 16 }}
          onClick={() => { acceptRoute(order.id); go('active', order.id) }}>
          Accept route — {prov.dist} mi
        </button>
      </div>
    </>
  )
}

function DStopList({ order, prov, activeStop }: { order: Order; prov: Provider; activeStop?: number }) {
  return (
    <div className="eb-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{
          width: 16, height: 16, borderRadius: 99, flexShrink: 0, marginTop: 2,
          background: activeStop === 1 ? 'var(--clay)' : 'var(--green)', border: '3px solid var(--green-soft)',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>PICKUP</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{prov.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{prov.addr}</div>
        </div>
      </div>
      <div style={{ width: 2, height: 20, background: 'var(--border-2)', margin: '6px 0 6px 7px' }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--clay)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>DROP OFF</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{order.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{order.address}</div>
          <div style={{ fontSize: 12.5, color: 'var(--clay-deep)', marginTop: 3, fontWeight: 600 }}>{order.window}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- active flow ---------- */
export function DActive({ go, order }: { go: GoDriver; order?: Order }) {
  const { driverPicked, driverEnroute, driverDelivered } = useStore()
  const [arrived, setArrived] = useState(false)
  const [checks, setChecks] = useState<Record<number, boolean>>({})

  if (!order) return <DHeader title="Route" onBack={() => go('routes')} />
  const prov = provider(order.providerId)
  const allChecked = order.items.every((_, i) => checks[i])

  /* ── at the pantry ── */
  if (order.stage === 'assigned') {
    return (
      <>
        <DHeader title="Head to pickup" sub={`${prov.dist} mi away`} onBack={() => go('routes')} />
        <div className="eb-scroll" style={{ flex: 1 }}>
          <MapView height={170} route radius={0} />
          <div style={{ padding: '18px 20px' }}>
            <div className="eb-card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>PICK UP FROM</div>
              <div className="eb-display" style={{ fontSize: 19, margin: '2px 0' }}>{prov.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{prov.addr}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>
              Verify items ({order.items.reduce((n, i) => n + i.qty, 0)})
            </div>
            {order.items.map((it, i) => (
              <button key={it.listingId} onClick={() => setChecks((c) => ({ ...c, [i]: !c[i] }))} data-demo={`d-check-${i}`}
                className="eb-card" style={{
                  width: '100%', padding: 13, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', textAlign: 'left', borderColor: checks[i] ? 'var(--green)' : 'var(--border)',
                }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  border: `2px solid ${checks[i] ? 'var(--green)' : 'var(--border-2)'}`,
                  background: checks[i] ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checks[i] && <Icon name="check" size={15} stroke="#fff" sw={3} />}
                </span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{it.qty}× {it.listing.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={FOOTER_CLASS} style={footer}>
          <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="d-confirm-pickup" style={{ padding: 16 }}
            disabled={!allChecked} onClick={() => driverPicked(order.id)}>
            {allChecked ? 'Confirm pickup' : `Check all items (${Object.values(checks).filter(Boolean).length}/${order.items.length})`}
          </button>
        </div>
      </>
    )
  }

  /* ── on the road ── */
  if (order.stage === 'pickup' || order.stage === 'enroute') {
    if (arrived || order.stage === 'enroute') {
      return (
        <>
          <DHeader title={arrived ? 'Confirm delivery' : 'Out for delivery'} sub={order.name} onBack={() => go('routes')} />
          <div className="eb-scroll" style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {!arrived ? (
              /* a driver on the road wants the map, not a card on a field of cream */
              <div style={{ position: 'absolute', inset: 0 }}>
                <MapView height="100%" route tall radius={0} />
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                  <div className="eb-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow)' }}>
                    <Badge tone="green" style={{ fontSize: 15, padding: '8px 12px' }}>{order.eta} min</Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{order.address.split(',')[0]}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{order.window}</div>
                    </div>
                    <button className="eb-btn eb-btn-soft" style={{ padding: '10px 14px' }} aria-label="Call client">
                      <Icon name="phone" size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 20px 0' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Proof of delivery</div>
                <button className="eb-card" style={{
                  width: '100%', padding: 0, overflow: 'hidden', cursor: 'pointer',
                  border: '1.5px dashed var(--border-2)', background: 'var(--surface-2)',
                }}>
                  <div style={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-3)' }}>
                    <Icon name="camera" size={34} stroke="var(--green-deep)" />
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>Tap to add a photo at the door</span>
                  </div>
                </button>
                <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
                  {['Left at door', 'Handed to client', 'With neighbor'].map((t, i) => (
                    <button key={t} className="eb-chip" data-active={i === 1} style={{ fontSize: 12.5, flex: 1, justifyContent: 'center' }}>{t}</button>
                  ))}
                </div>
                <input className="eb-input" placeholder="Add a note (optional)" />
              </div>
            )}
          </div>
          <div className={FOOTER_CLASS} style={footer}>
            {!arrived ? (
              <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="d-arrived" style={{ padding: 16 }} onClick={() => setArrived(true)}>
                <Icon name="pin" size={18} /> I’ve arrived
              </button>
            ) : (
              <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="d-complete" style={{ padding: 16 }}
                onClick={() => { driverDelivered(order.id); go('done', order.id) }}>
                Complete delivery
              </button>
            )}
          </div>
        </>
      )
    }

    /* just picked up */
    return (
      <>
        <DHeader title="Picked up" sub="Ready to deliver" onBack={() => go('routes')} />
        <div className="eb-scroll" style={{ flex: 1 }}>
          <div style={{ padding: '20px 20px 0' }}>
            <div className="eb-card eb-pop" style={{
              padding: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 13,
              background: 'var(--green-tint)', borderColor: 'var(--green-soft)',
            }}>
              <span style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={24} stroke="#fff" sw={2.6} />
              </span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--green-deep)' }}>Cargo confirmed</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  {order.items.reduce((n, i) => n + i.qty, 0)} boxes from {prov.name}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 20px' }}>
            <DStopList order={order} prov={prov} activeStop={1} />
            <MapView height={150} route style={{ marginTop: 14 }} />
          </div>
        </div>
        <div className={FOOTER_CLASS} style={footer}>
          <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="d-start" style={{ padding: 16 }} onClick={() => driverEnroute(order.id)}>
            <Icon name="nav" size={18} /> Start delivery to {order.name.split(' ')[0]}
          </button>
        </div>
      </>
    )
  }

  return <DDone go={go} order={order} />
}

/* ---------- done ---------- */
export function DDone({ go, order }: { go: GoDriver; order?: Order }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `${DPAD + 10}px 26px 34px`, background: 'var(--green-deep)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="eb-pop" style={{ marginBottom: 16 }}>
          <LogoMedallion size={140} tone="gold" />
        </div>
        <div className="eb-display" style={{ fontSize: 30, color: 'var(--on-green)' }}>Delivery complete!</div>
        <p style={{ color: 'oklch(0.90 0.04 145)', fontSize: 15.5, margin: '10px 0 26px', lineHeight: 1.5 }}>
          You just helped a neighbor get fresh food. {order ? `${order.name} has` : 'They have'} been notified.
        </p>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <div style={{ flex: 1, background: 'oklch(0.46 0.07 150)', borderRadius: 16, padding: '16px 12px' }}>
            <div className="eb-display" style={{ fontSize: 26, color: 'var(--on-green)' }}>+1</div>
            <div style={{ fontSize: 12.5, color: 'oklch(0.88 0.04 145)' }}>delivery today</div>
          </div>
          <div style={{ flex: 1, background: 'oklch(0.46 0.07 150)', borderRadius: 16, padding: '16px 12px' }}>
            <div className="eb-display" style={{ fontSize: 26, color: 'var(--gold)' }}>+50</div>
            <div style={{ fontSize: 12.5, color: 'oklch(0.88 0.04 145)' }}>impact points</div>
          </div>
        </div>
      </div>
      <button className="eb-btn eb-btn-clay eb-btn-block" style={{ padding: 16 }} onClick={() => go('routes')}>Find another route</button>
      <button onClick={() => go('impact')} data-demo="d-impact" style={{
        marginTop: 12, background: 'none', border: 'none', color: 'var(--on-green)',
        fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
      }}>View my impact</button>
    </div>
  )
}

/* ---------- impact ---------- */
export function DImpact() {
  const { orders } = useStore()
  const delivered = orders.filter((o) => o.stage === 'delivered')
  const done = delivered.length
  return (
    <>
      <DHeader title="My impact" sub={DRIVER.name} right={<DAvatar />} />
      <div className="eb-scroll" style={{ flex: 1, padding: 18 }}>
        <div className="eb-card" style={{ padding: 22, marginBottom: 14, background: 'var(--green-deep)', border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'oklch(0.88 0.04 145)', marginBottom: 4 }}>Meals delivered this week</div>
          <div className="eb-display" style={{ fontSize: 46, color: 'var(--on-green)' }}>{18 + done * 3}</div>
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--gold)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            <Icon name="heart" size={14} stroke="var(--gold)" fill="var(--gold)" /> {done} delivered today
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {[[DRIVER.trips + done, 'total trips'], [DRIVER.rating, 'rating'], ['98%', 'on-time']].map(([n, l]) => (
            <div key={l} className="eb-card" style={{ flex: 1, padding: 14, textAlign: 'center' }}>
              <div className="eb-display" style={{ fontSize: 22, color: 'var(--green-deep)' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="eb-card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>Recent deliveries</div>
          {delivered.slice(0, 4).map((o) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={16} stroke="var(--green-deep)" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name} · {o.code}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{o.items.reduce((n, i) => n + i.qty, 0)} boxes · delivered</div>
              </div>
              <Icon name="star" size={15} stroke="var(--gold)" fill="var(--gold)" />
            </div>
          ))}
          {done === 0 && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', padding: '8px 0' }}>Complete a delivery to see it here.</div>}
        </div>
      </div>
    </>
  )
}
