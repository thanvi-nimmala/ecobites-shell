/* ============================================================
   EcoBites — client screens: browse, detail, checkout,
   confirmation, tracking
   ============================================================ */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { LogoMedallion } from '../components/Logo'
import { Badge, MapView, Stepper, Tile } from '../components/ui'
import { CListingCard } from './ClientApp'
import { CheckerBand } from '../components/CheckerBand'
import {
  CATEGORIES, DIETS, DRIVER, LISTINGS, ORDER_STAGES, PHOTO, PROVIDERS,
  listing as findListing, listingGallery, listingPhoto, plural, provider,
} from '../lib/data'
import type { GoClient } from '../lib/nav'
import { DELIVERY_LIMIT, useStore, type NeedSignals } from '../lib/store'
import type { Fulfillment, Listing } from '../lib/types'

/* Defined at module scope on purpose: a component declared inside another
   component is a new type on every render, so React unmounts and rebuilds its
   whole subtree — which silently breaks anything holding a node reference
   (the demo runner did exactly that) as well as focus and transitions. */
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

/* ---------- availability table ----------
   Scarcity is the real constraint in food relief, so the list view leads with a
   stock bar rather than a photo: how much is left, out of what the provider
   started with, and whether a waitlist has formed behind it. */
function stockState(l: Listing) {
  const frac = l.qtyTotal > 0 ? l.qtyLeft / l.qtyTotal : 0
  if (frac > 0.5) return { frac, label: 'Available',   tone: 'green' as const, bar: 'var(--green)' }
  if (frac > 0.2) return { frac, label: 'Running low', tone: 'gold'  as const, bar: 'var(--gold)' }
  return            { frac, label: 'Almost gone', tone: 'clay'  as const, bar: 'var(--clay)' }
}

const TCOLS = 'minmax(0,2.1fr) minmax(0,1.1fr) minmax(0,1.25fr) auto 24px'

function CAvailabilityTable({ rows, go }: { rows: Listing[]; go: GoClient }) {
  const head: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase',
  }
  return (
    <div className="eb-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: TCOLS, gap: 16, padding: '13px 18px',
        borderBottom: '1.5px solid color-mix(in oklch, var(--green) 20%, var(--border))' }}>
        <span style={head}>Food</span><span style={head}>Provider</span>
        <span style={head}>Left today</span><span style={head}>Status</span><span />
      </div>
      {rows.map((l, i) => {
        const prov = provider(l.provider)
        const st = stockState(l)
        return (
          <button key={l.id} onClick={() => go('detail', { id: l.id })} data-demo={`c-row-${l.id}`}
            style={{
              display: 'grid', gridTemplateColumns: TCOLS, gap: 16, alignItems: 'center', width: '100%',
              padding: '12px 18px', background: i % 2 ? 'var(--surface-2)' : 'transparent',
              border: 'none', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'var(--ink)',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <Tile photo={listingPhoto(l)} category={l.category} style={{ width: 36, height: 36 }} radius={9} />
              <span style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</span>
            </span>
            <span style={{ fontSize: 13.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prov.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, height: 7, borderRadius: 99, background: 'var(--sand)', overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${Math.max(4, st.frac * 100)}%`, height: '100%', background: st.bar }} />
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{l.qtyLeft}/{l.qtyTotal}</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
              <Badge tone={st.tone}>{st.label}</Badge>
              {l.waitlist > 0 && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{l.waitlist} waiting</span>}
            </span>
            <Icon name="chevR" size={17} stroke="var(--ink-3)" />
          </button>
        )
      })}
    </div>
  )
}

/* ---------- browse ---------- */
export function CBrowse({ go, cat: initialCat }: { go: GoClient; cat?: string }) {
  const [cat, setCat] = useState(initialCat ?? 'all')
  const [diets, setDiets] = useState<string[]>([])
  const [maxDist, setMaxDist] = useState(5)
  const [fulfill, setFulfill] = useState<'any' | Fulfillment>('any')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const toggleDiet = (d: string) => setDiets((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))

  const results = useMemo(() => LISTINGS.filter((l) => {
    const prov = provider(l.provider)
    if (cat !== 'all' && l.category !== cat) return false
    if (diets.length && !diets.every((d) => l.diet.includes(d))) return false
    if (prov.dist > maxDist) return false
    if (fulfill !== 'any' && !prov.fulfillment.includes(fulfill)) return false
    return true
  }), [cat, diets, maxDist, fulfill])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '258px 1fr', gap: 28, padding: '28px 32px 56px', alignItems: 'start' }}>
      <aside className="eb-card" style={{ padding: 22, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Icon name="filter" size={18} stroke="var(--green-deep)" />
          <span className="eb-display" style={{ fontSize: 18 }}>Filters</span>
        </div>
        <FilterGroup title="Category">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} data-demo={`c-filter-${c.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10,
                border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14.5,
                background: cat === c.id ? 'var(--green-tint)' : 'transparent',
                color: cat === c.id ? 'var(--green-deep)' : 'var(--ink-2)',
                fontWeight: cat === c.id ? 600 : 500,
              }}>
                <Icon name={c.icon} size={17} /> {c.label}
              </button>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Dietary">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {DIETS.map((d) => (
              <button key={d} className="eb-chip" data-active={diets.includes(d)} data-demo={`c-diet-${d}`}
                onClick={() => toggleDiet(d)} style={{ fontSize: 13 }}>{d}</button>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title={`Distance — within ${maxDist} mi`}>
          <input type="range" min={1} max={5} step={0.5} value={maxDist}
            onChange={(e) => setMaxDist(+e.target.value)} style={{ width: '100%', accentColor: 'var(--green)' }} />
        </FilterGroup>
        <FilterGroup title="Fulfillment">
          <div style={{ display: 'flex', gap: 7 }}>
            {([['any', 'Any'], ['pickup', 'Pickup'], ['delivery', 'Delivery']] as const).map(([k, l]) => (
              <button key={k} className="eb-chip" data-active={fulfill === k} data-demo={`c-fulfil-${k}`}
                onClick={() => setFulfill(k)} style={{ fontSize: 13, flex: 1, justifyContent: 'center' }}>{l}</button>
            ))}
          </div>
        </FilterGroup>
      </aside>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h1 className="eb-display" style={{ fontSize: 26, margin: 0 }}>
            {cat === 'all' ? 'All food' : CATEGORIES.find((c) => c.id === cat)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ color: 'var(--ink-3)', fontSize: 14.5 }}>{results.length} available nearby</span>
            <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 99, background: 'var(--surface-2)', border: '1.5px solid var(--border)' }}>
              {([['grid', 'grid'], ['list', 'list']] as const).map(([k, ic]) => (
                <button key={k} onClick={() => setView(k)} data-demo={`c-view-${k}`} aria-label={k} style={{
                  width: 32, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: view === k ? 'var(--surface)' : 'transparent',
                  boxShadow: view === k ? 'var(--shadow-sm)' : 'none',
                }}>
                  <Icon name={ic} size={15} stroke={view === k ? 'var(--green-deep)' : 'var(--ink-3)'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="eb-card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            <Icon name="search" size={32} stroke="var(--ink-3)" />
            <p style={{ marginTop: 12 }}>No matches — try widening your filters.</p>
          </div>
        ) : view === 'list' ? (
          <CAvailabilityTable rows={results} go={go} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {results.map((l) => <CListingCard key={l.id} listing={l} go={go} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- detail ---------- */
export function CDetail({ go, id }: { go: GoClient; id?: string }) {
  const listing = (id && findListing(id)) || LISTINGS[0]
  const prov = provider(listing.provider)
  const { setCartQty, cartQty } = useStore()
  const [qty, setQty] = useState(Math.max(1, cartQty(listing.id)))
  const gallery = listingGallery(listing)

  return (
    <div style={{ padding: '24px 32px 56px', maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={() => go('browse')} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-2)', fontSize: 14.5, cursor: 'pointer', marginBottom: 18, fontWeight: 600,
      }}>
        <Icon name="arrowLeft" size={17} /> Back to browse
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
        <div>
          <Tile photo={gallery[0]} category={listing.category} style={{ height: 320 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 10 }}>
            {gallery.map((p, i) => <Tile key={i} photo={p} category={listing.category} style={{ height: 78 }} />)}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Badge>{CATEGORIES.find((c) => c.id === listing.category)?.label}</Badge>
            {prov.open
              ? <Badge tone="green"><span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--green)' }} /> Open now</Badge>
              : <Badge tone="ghost">Opens 9am</Badge>}
          </div>
          <h1 className="eb-display" style={{ fontSize: 34, margin: '0 0 8px' }}>{listing.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink-2)', fontSize: 15, marginBottom: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={16} stroke="var(--green)" /> {prov.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="star" size={15} stroke="var(--gold)" fill="var(--gold)" /> {prov.rating}</span>
            <span>{prov.dist} mi</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 20px' }}>{listing.desc}</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            {listing.diet.map((d) => <Badge key={d} tone="ghost"><Icon name="check" size={12} /> {d}</Badge>)}
          </div>
          <div className="eb-card" style={{ padding: 18, marginBottom: 18, background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="clock" size={20} stroke="var(--green-deep)" />
              <div style={{ fontSize: 14.5, color: 'var(--green-deep)' }}>
                <b>{listing.qtyLeft} {plural(listing.qtyLeft, listing.unit)} available</b>{' '}
                {listing.waitlist > 0 ? `· ${listing.waitlist} people on the waitlist ahead of you` : '· no waitlist — reserve instantly'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Stepper value={qty} onChange={setQty} min={1} max={Math.min(5, listing.qtyLeft)} />
            <button className="eb-btn eb-btn-primary" data-demo="c-reserve" style={{ flex: 1 }}
              onClick={() => { setCartQty(listing.id, qty); go('checkout') }}>
              <Icon name="cart" size={19} /> Reserve {qty} {plural(qty, listing.unit)} — Free
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12, textAlign: 'center' }}>
            Always free, and nobody will ask you to prove anything. You’ll pick how to get it next.
          </p>
        </div>
      </div>
    </div>
  )
}

function MethodCard({ k, icon, title, sub, method, onPick }: {
  k: Fulfillment; icon: string; title: string; sub: string
  method: Fulfillment; onPick: (k: Fulfillment) => void
}) {
  const on = method === k
  return (
    <button onClick={() => onPick(k)} data-demo={`c-method-${k}`} className="eb-card" style={{
      flex: 1, padding: 18, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 13, alignItems: 'flex-start',
      borderColor: on ? 'var(--green)' : 'var(--border)', borderWidth: 2,
      background: on ? 'var(--green-tint)' : 'var(--surface)',
    }}>
      <span style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? 'var(--green)' : 'var(--surface-2)',
      }}>
        <Icon name={icon} size={22} stroke={on ? 'var(--on-green)' : 'var(--ink-2)'} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{sub}</div>
      </div>
      <span style={{
        marginLeft: 'auto', width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        border: `2px solid ${on ? 'var(--green)' : 'var(--border-2)'}`,
        background: on ? 'var(--green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {on && <Icon name="check" size={13} stroke="#fff" sw={3} />}
      </span>
    </button>
  )
}

/* ---------- checkout ---------- */
export function CCheckout({ go }: { go: GoClient }) {
  const { cart, setCartQty, placeOrder, household, setHousehold, deliveriesLeft } = useStore()
  const [method, setMethod] = useState<Fulfillment>('delivery')
  const [address, setAddress] = useState('142 Halsey St, Apt 3B, Newark NJ')
  const [win, setWin] = useState('Today · 4:00–6:00 PM')
  const items = cart.map((c) => ({ ...c, listing: findListing(c.listingId) }))

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <LogoMedallion size={132} tone="clay" style={{ margin: '0 auto 16px' }} />
        <h1 className="eb-display" style={{ fontSize: 26, margin: '0 0 8px' }}>Nothing in your basket yet</h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 22px' }}>Whenever you’re ready, there’s food waiting nearby.</p>
        <button className="eb-btn eb-btn-primary" data-demo="c-empty-basket" onClick={() => go('browse')}>Browse food <Icon name="arrowRight" size={18} /></button>
      </div>
    )
  }

  const place = () => {
    const o = placeOrder({
      method,
      address: method === 'delivery' ? address : provider(items[0].listing.provider).addr,
      window: win,
      name: 'Amara',
    })
    go('confirm', { orderId: o.id })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, padding: '28px 32px 56px', maxWidth: 1120, margin: '0 auto', alignItems: 'start' }}>
      <div>
        <h1 className="eb-display" style={{ fontSize: 28, margin: '0 0 22px' }}>Checkout</h1>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>How would you like to receive it?</div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
          <MethodCard k="pickup" icon="bag" title="Pickup" sub="Collect free from the pantry" method={method} onPick={setMethod} />
          <MethodCard k="delivery" icon="truck" title="Delivery" sub="A volunteer driver brings it" method={method} onPick={setMethod} />
        </div>
        {method === 'delivery' ? (
          <div className="eb-fade">
            <FairShare left={deliveriesLeft} />
            <NeedTriage needs={household.needs} onChange={(needs) => setHousehold({ needs })} />
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Delivery details</div>
            <label style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600 }}>Delivery address</label>
            <input className="eb-input" value={address} onChange={(e) => setAddress(e.target.value)} style={{ margin: '6px 0 14px' }} />
            <label style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600 }}>Preferred time window</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['Today · 4:00–6:00 PM', 'Today · 6:00–8:00 PM', 'Tomorrow · 10–12'].map((w) => (
                <button key={w} className="eb-chip" data-active={win === w} onClick={() => setWin(w)} style={{ fontSize: 13 }}>{w}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="eb-fade">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Pickup location</div>
            <div className="eb-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Icon name="pin" size={22} stroke="var(--green)" />
              <div>
                <div style={{ fontWeight: 600 }}>{provider(items[0].listing.provider).name}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{provider(items[0].listing.provider).addr}</div>
              </div>
            </div>
            <MapView height={150} style={{ marginTop: 12 }} />
          </div>
        )}
      </div>

      <aside className="eb-card" style={{ padding: 22, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
        <div className="eb-display" style={{ fontSize: 18, marginBottom: 16 }}>Your basket</div>
        {items.map((it) => (
          <div key={it.listingId} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <Tile photo={listingPhoto(it.listing)} category={it.listing.category} style={{ width: 48, height: 48 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.listing.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{provider(it.listing.provider).name}</div>
            </div>
            <Stepper value={it.qty} onChange={(q) => setCartQty(it.listingId, q)} min={0} max={5} />
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', paddingTop: 16 }}>
          {[['Items', `${items.reduce((n, i) => n + i.qty, 0)} free`], [method === 'delivery' ? 'Delivery' : 'Pickup', 'Free'], ['Service fee', '$0.00']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, fontSize: 14.5, color: 'var(--ink-2)', marginBottom: 8 }}>
              <span style={{ whiteSpace: 'nowrap' }}>{l}</span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 18, fontWeight: 700, marginTop: 6 }}>
            <span>Total</span><span style={{ color: 'var(--green-deep)' }}>$0.00</span>
          </div>
        </div>
        <button className="eb-btn eb-btn-primary eb-btn-block" data-demo="c-place" onClick={place}>
          Place order <Icon name="arrowRight" size={18} />
        </button>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 10 }}>Funded by CFBNJ &amp; community donors</p>
      </aside>
    </div>
  )
}

/* ---------- confirmation ---------- */
/* The allowance is printed where the choice is made, not discovered at the
   end. It is a statement about supply, not a judgement about the person —
   so it says what pickup still offers in the same breath. */
function FairShare({ left }: { left: number }) {
  const none = left <= 0
  return (
    <div style={{
      display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 15px', marginBottom: 18,
      borderRadius: 'var(--radius-sm)',
      background: none ? 'var(--clay-soft)' : 'var(--green-tint)',
      border: `1px solid color-mix(in oklch, ${none ? 'var(--clay)' : 'var(--green)'} 22%, transparent)`,
    }}>
      <Icon name={none ? 'clock' : 'truck'} size={18} stroke={none ? 'var(--clay-deep)' : 'var(--green-deep)'}
        style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
        <b>
          {none
            ? 'You’ve used both deliveries this week'
            : `${left} of ${DELIVERY_LIMIT} deliveries left this week`}
        </b>
        <div style={{ color: 'var(--ink-2)', marginTop: 2 }}>
          {none
            ? 'Pickup is still open to you, as often as you need it — nothing is capped there.'
            : 'Drivers are volunteers, so deliveries are shared out. Pickup is never limited.'}
        </div>
      </div>
    </div>
  )
}

/* Nothing here is verified and nothing here can disqualify anyone — it only
   decides who a short night of drivers reaches first. */
const NEED_OPTIONS: [Extract<keyof NeedSignals, string>, string][] = [
  ['noCar', 'No car'],
  ['noTransit', 'No bus route nearby'],
  ['mobility', 'Hard for me to carry'],
  ['children', 'Young children at home'],
]

function NeedTriage({ needs, onChange }: { needs: NeedSignals; onChange: (n: NeedSignals) => void }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Anything that makes pickup hard?</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 10, lineHeight: 1.5 }}>
        Optional, never checked, and it cannot disqualify you. On a night with few drivers, it
        decides who we reach first.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {NEED_OPTIONS.map(([k, label]) => (
          <button key={k} className="eb-chip" data-active={needs[k]} data-demo={`c-need-${k}`}
            onClick={() => onChange({ ...needs, [k]: !needs[k] })} style={{ fontSize: 13 }}>
            {needs[k] && <Icon name="check" size={13} />} {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CConfirm({ go, orderId }: { go: GoClient; orderId?: string }) {
  const { orders } = useStore()
  const order = orders.find((o) => o.id === orderId) ?? orders[0]
  if (!order) return null
  return (
    <div style={{ padding: '60px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <div className="eb-pop" style={{ display: 'inline-block', marginBottom: 10 }}>
        <LogoMedallion size={148} tone="green" style={{ margin: '0 auto' }} />
      </div>
      <h1 className="eb-display" style={{ fontSize: 34, margin: '0 0 10px' }}>You’re all set, Amara!</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 8px', lineHeight: 1.5 }}>
        Order <b style={{ color: 'var(--ink)' }}>{order.code}</b> is confirmed
        {order.method === 'delivery' ? ' — we’re finding you a driver now.' : ' for pickup.'}
      </p>
      <div className="eb-card" style={{ padding: 20, margin: '26px 0', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={order.method === 'delivery' ? 'truck' : 'bag'} size={21} stroke="var(--green-deep)" />
          </span>
          <div>
            <div style={{ fontWeight: 700 }}>{order.method === 'delivery' ? 'Delivery' : 'Pickup'}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{order.window}</div>
          </div>
        </div>
        {order.items.map((it) => (
          <div key={it.listingId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, color: 'var(--ink-2)', marginBottom: 6 }}>
            <span>{it.qty}× {it.listing.name}</span>
            <span>{provider(it.listing.provider).name}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="eb-btn eb-btn-ghost" onClick={() => go('home')}>Back to home</button>
        <button className="eb-btn eb-btn-primary" data-demo="c-track" onClick={() => go('track', { orderId: order.id })}>
          Track my order <Icon name="arrowRight" size={18} />
        </button>
      </div>
      {order.method === 'delivery' && (
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 20 }}>
          Tip: <b>drivers nearby</b> can see this route already — the moment one accepts, your tracking goes live.
        </p>
      )}
    </div>
  )
}

/* ---------- tracking ---------- */
export function CTrack({ go, orderId }: { go: GoClient; orderId?: string }) {
  const { orders } = useStore()
  const order = orders.find((o) => o.id === orderId) ?? orders.find((o) => o.method === 'delivery') ?? orders[0]

  if (!order) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <LogoMedallion size={132} tone="gold" style={{ margin: '0 auto 16px' }} />
        <h1 className="eb-display" style={{ fontSize: 26, margin: '0 0 8px' }}>Nothing on its way yet</h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 22px' }}>Once you’ve reserved something, you can follow it right here.</p>
        <button className="eb-btn eb-btn-primary" data-demo="c-empty-track" onClick={() => go('browse')}>Browse food <Icon name="arrowRight" size={18} /></button>
      </div>
    )
  }

  const stages = order.method === 'delivery'
    ? ORDER_STAGES
    : ORDER_STAGES.filter((s) => ['reserved', 'preparing', 'pickup', 'delivered'].includes(s.key))
  const curIdx = stages.findIndex((s) => s.key === order.stage)
  const idx = curIdx < 0 ? 0 : curIdx

  const backBtn: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
    color: 'var(--ink-2)', fontSize: 14.5, cursor: 'pointer', marginBottom: 16, fontWeight: 600,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, padding: '28px 32px 56px', maxWidth: 1040, margin: '0 auto', alignItems: 'start' }}>
      <div>
        <button onClick={() => go('home')} style={backBtn}><Icon name="arrowLeft" size={17} /> Home</button>
        <Badge tone={order.stage === 'delivered' ? 'green' : 'clay'} style={{ marginBottom: 12 }}>
          {order.stage === 'delivered' ? 'Delivered' : 'In progress'}
        </Badge>
        <h1 className="eb-display" style={{ fontSize: 30, margin: '0 0 6px' }}>{stages[idx].client}</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 15.5, margin: '0 0 24px' }}>
          Order {order.code} · {order.stage === 'delivered'
            ? 'Delivered just now'
            : order.method === 'delivery' ? `ETA ~${order.eta} min` : 'we’ll have it ready for you soon'}
        </p>
        <div style={{ position: 'relative' }}>
          {stages.map((s, i) => {
            const done = i < idx
            const active = i === idx
            return (
              <div key={s.key} style={{ display: 'flex', gap: 16, paddingBottom: i < stages.length - 1 ? 24 : 0, position: 'relative' }}>
                {i < stages.length - 1 && (
                  <div style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 2, background: done ? 'var(--green)' : 'var(--border)' }} />
                )}
                <div style={{
                  width: 28, height: 28, borderRadius: 99, flexShrink: 0, zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done || active ? 'var(--green)' : 'var(--surface)',
                  border: `2px solid ${done || active ? 'var(--green)' : 'var(--border-2)'}`,
                  boxShadow: active ? '0 0 0 5px var(--green-tint)' : 'none',
                  transition: 'background .3s, border-color .3s, box-shadow .3s',
                }}>
                  {done ? <Icon name="check" size={15} stroke="#fff" sw={3} />
                    : active ? <span style={{ width: 8, height: 8, borderRadius: 99, background: '#fff' }} /> : null}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontWeight: active ? 700 : 600, fontSize: 16, color: done || active ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</div>
                  {active && <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 2 }}>{s.client}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
        <MapView height={260} route={order.method === 'delivery'} />
        {order.method === 'delivery' && order.driverAccepted && (
          <div className="eb-card eb-fade" style={{ padding: 16, marginTop: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18,
            }}>{DRIVER.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{DRIVER.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={12} stroke="var(--gold)" fill="var(--gold)" /> {DRIVER.rating} · {DRIVER.vehicle}
              </div>
            </div>
            <button className="eb-btn eb-btn-soft" style={{ padding: '10px 16px' }} aria-label="Call driver"><Icon name="phone" size={17} /></button>
          </div>
        )}
        {order.method === 'delivery' && !order.driverAccepted && (
          <div className="eb-card" style={{ padding: 16, marginTop: 14, textAlign: 'center', color: 'var(--ink-2)', fontSize: 14 }}>
            <Icon name="clock" size={20} stroke="var(--clay)" />
            <div style={{ marginTop: 6 }}>
              Finding someone nearby to bring it…<br />
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>The route is live for drivers now.</span>
            </div>
          </div>
        )}
        {order.stage === 'delivered' && (
          <button className="eb-btn eb-btn-primary eb-btn-block" style={{ marginTop: 14 }} onClick={() => go('browse')}>Reserve more food</button>
        )}
      </div>
    </div>
  )
}

/* ---------- about ---------- */
export function CAbout({ go }: { go: GoClient }) {
  const stat = (n: string, l: string) => (
    <div key={l} className="eb-card" style={{ padding: '18px 20px' }}>
      <div className="eb-display" style={{ fontSize: 30, color: 'var(--green-deep)' }}>{n}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 4 }}>{l}</div>
    </div>
  )
  const pillar = (icon: string, title: string, body: string) => (
    <div key={title} className="eb-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 11 }}>
      <span className="eb-ichip"><Icon name={icon} size={17} stroke="var(--green-deep)" /></span>
      <div style={{ fontWeight: 700, fontSize: 16.5 }}>{title}</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{body}</div>
    </div>
  )

  return (
    <div style={{ padding: '0 0 56px' }}>
      {/* opening statement */}
      <div style={{ padding: '48px 32px 0', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink-3)', marginBottom: 12 }}>
          ABOUT ECOBITES
        </div>
        <h1 className="eb-display" style={{ fontSize: 44, margin: '0 0 18px', maxWidth: '20ch' }}>
          The food already exists. We move it.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0, maxWidth: '62ch' }}>
          New Jersey’s pantries, food banks and kitchens hold more than enough to feed the people who
          need it. What is missing is the connective tissue — a way to see what is on the shelf right
          now, claim it without proving anything, and get it the last few miles home.
        </p>
      </div>

      <CheckerBand tone="green" style={{ margin: '44px 0 0' }} />

      {/* what we actually are */}
      <div style={{ padding: '40px 32px 0', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          <div>
            <h2 className="eb-display" style={{ fontSize: 26, margin: '0 0 14px' }}>What the service is</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--ink-2)', margin: '0 0 14px' }}>
              EcoBites is a free, two-sided service. Neighbours reserve surplus food from partner
              providers near them. Volunteer drivers claim those reservations as routes and deliver
              them. One order, visible to both sides as it moves.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
              Nothing here is means-tested and nothing is paid for. If the food is on the shelf, it
              is yours to claim.
            </p>
          </div>
          <Tile photo={PHOTO.communityTable} category="produce" style={{ height: 260 }} />
        </div>
      </div>

      {/* pillars */}
      <div style={{ padding: '36px 32px 0', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {pillar('handHeart', 'Dignity first',
            'No eligibility forms, no queue to join, no explaining yourself. Every screen is written to reassure rather than gatekeep.')}
          {pillar('sprout', 'Nothing wasted',
            'Providers list what would otherwise be thrown out at the end of the day. Surplus becomes supply instead of landfill.')}
          {pillar('route', 'Moved by neighbors',
            'Volunteer drivers cover the last mile. Routes are short, local, and claimed by whoever is nearby and free.')}
        </div>
      </div>

      <CheckerBand tone="sand" style={{ margin: '44px 0 0' }} />

      {/* the network */}
      <div style={{ padding: '40px 32px 0', maxWidth: 1040, margin: '0 auto' }}>
        <h2 className="eb-display" style={{ fontSize: 26, margin: '0 0 6px' }}>The network today</h2>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: '0 0 20px', maxWidth: '58ch' }}>
          Built with the Community Food Bank of New Jersey, alongside neighborhood pantries,
          mobile markets and meal programs across Essex County.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stat('1.2M', 'New Jerseyans facing food insecurity')}
          {stat('120+', 'partner pantries and food banks')}
          {stat('$0', 'cost to the person receiving food')}
          {stat('2', 'surfaces sharing one live order')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {PROVIDERS.map((p) => (
            <div key={p.id} className="eb-card" style={{ padding: 16, display: 'flex', gap: 13, alignItems: 'center' }}>
              <span className="eb-ichip"><Icon name="pin" size={16} stroke="var(--green-deep)" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.kind} · {p.addr}</div>
              </div>
              <Badge tone="ghost">{p.dist} mi</Badge>
            </div>
          ))}
        </div>
      </div>

      <CheckerBand tone="gold" style={{ margin: '44px 0 0' }} />

      {/* close */}
      <div style={{ padding: '40px 32px 0', maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
        <LogoMedallion size={116} tone="green" style={{ margin: '0 auto 16px' }} />
        <h2 className="eb-display" style={{ fontSize: 28, margin: '0 0 10px' }}>Good food finds its way home.</h2>
        <p style={{ fontSize: 15.5, color: 'var(--ink-2)', margin: '0 0 22px' }}>
          See what is available near you right now.
        </p>
        <button className="eb-btn eb-btn-primary" data-demo="c-about-browse" onClick={() => go('browse')}>
          Browse food <Icon name="arrowRight" size={18} />
        </button>
      </div>
    </div>
  )
}
