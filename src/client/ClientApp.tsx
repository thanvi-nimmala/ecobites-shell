/* ============================================================
   EcoBites — Client website (desktop surface)
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Mascot } from '../components/Mascot'
import { Badge, Tile } from '../components/ui'
import { CATEGORIES, CLIENT, LISTINGS, PHOTO, listingPhoto, provider } from '../lib/data'
import type { ClientRoute, GoClient } from '../lib/nav'
import type { Listing } from '../lib/types'
import { useStore } from '../lib/store'
import { CBrowse, CCheckout, CConfirm, CDetail, CTrack } from './screens'

export function ClientApp({ route, go }: { route: ClientRoute; go: GoClient }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { scrollRef.current?.scrollTo(0, 0) }, [route.name, route.id])

  const screens: Record<ClientRoute['name'], React.ReactNode> = {
    onboard:  <COnboard go={go} />,
    home:     <CHome go={go} />,
    browse:   <CBrowse go={go} cat={route.cat} />,
    detail:   <CDetail go={go} id={route.id} />,
    checkout: <CCheckout go={go} />,
    confirm:  <CConfirm go={go} orderId={route.orderId} />,
    track:    <CTrack go={go} orderId={route.orderId} />,
  }

  return (
    <div className="eb-body" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {route.name !== 'onboard' && <CNav go={go} route={route} />}
      <div ref={scrollRef} className="eb-scroll" style={{ flex: 1, minHeight: 0 }}>
        <div key={route.name} className="eb-fade">{screens[route.name]}</div>
      </div>
    </div>
  )
}

/* ---------- nav ---------- */
function CNav({ go, route }: { go: GoClient; route: ClientRoute }) {
  const { cartCount } = useStore()
  const links: [ClientRoute['name'], string][] = [['home', 'Home'], ['browse', 'Browse food'], ['track', 'My orders']]
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 28, padding: '0 32px', height: 68,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      <button onClick={() => go('home')} data-demo="c-logo"
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Mascot variant="green" size={40} bob={false} />
        <span className="eb-display" style={{ fontSize: 21 }}>EcoBites</span>
      </button>
      <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
        {links.map(([k, label]) => (
          <button key={k} onClick={() => go(k)} data-demo={`c-nav-${k}`} style={{
            background: route.name === k ? 'var(--green-tint)' : 'none', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 600, padding: '8px 14px', borderRadius: 99,
            color: route.name === k ? 'var(--green-deep)' : 'var(--ink-2)',
          }}>{label}</button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink-2)', fontSize: 14, fontWeight: 500 }}>
        <Icon name="pin" size={17} stroke="var(--green)" /> {CLIENT.zip}
      </div>
      <button onClick={() => go('checkout')} data-demo="c-cart" aria-label="Basket" style={{
        position: 'relative', width: 42, height: 42, borderRadius: 99, border: '1.5px solid var(--border-2)',
        background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="cart" size={20} stroke="var(--ink)" />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 99,
            background: 'var(--clay)', color: '#fff', fontSize: 11.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{cartCount}</span>
        )}
      </button>
      <div style={{
        width: 38, height: 38, borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
      }}>{CLIENT.initial}</div>
    </header>
  )
}

/* ---------- onboarding ---------- */
function COnboard({ go }: { go: GoClient }) {
  const [email, setEmail] = useState('')
  const [zip, setZip] = useState('')
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
      <div style={{ padding: '64px 64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 40 }}>
          <Mascot variant="green" size={52} bob={false} />
          <span className="eb-display" style={{ fontSize: 23 }}>EcoBites</span>
        </div>
        <Badge tone="clay" style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
          <Icon name="handHeart" size={14} /> Food relief, made accessible
        </Badge>
        <h1 className="eb-display" style={{ fontSize: 52, margin: '0 0 18px' }}>Good food finds<br />its way home.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 32px', maxWidth: 470 }}>
          EcoBites connects you with surplus food from nearby pantries and food banks. Reserve a box,
          choose pickup or delivery, and we’ll handle the rest — free.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <input className="eb-input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="eb-input" placeholder="ZIP code" value={zip} onChange={(e) => setZip(e.target.value)} style={{ flex: 1 }} />
            <button className="eb-btn eb-btn-primary" data-demo="c-find" onClick={() => go('home')} style={{ flexShrink: 0 }}>
              Find food near me <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
        <button onClick={() => go('home')} style={{
          marginTop: 22, alignSelf: 'flex-start', background: 'none', border: 'none',
          color: 'var(--ink-2)', fontSize: 15, cursor: 'pointer',
        }}>
          Already have an account? <span style={{ color: 'var(--green-deep)', fontWeight: 600 }}>Sign in</span>
        </button>
        <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
          {[['17M+', 'neighbors served'], ['120+', 'partner pantries'], ['$0', 'always free']].map(([n, l]) => (
            <div key={l}>
              <div className="eb-display" style={{ fontSize: 26, color: 'var(--green-deep)' }}>{n}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', background: 'var(--green-tint)', overflow: 'hidden' }}>
        <Tile photo={PHOTO.communityTable} overlay="linear-gradient(180deg, rgba(42,46,30,0.14), rgba(42,46,30,0.30))"
          style={{ position: 'absolute', inset: 0 }} radius={0} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div className="eb-card" style={{ width: 320, padding: 22, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Tile photo={PHOTO.papayaOlive} category="produce" style={{ width: 54, height: 54 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Fresh Produce Box</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Community Food Bank of NJ</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <Badge>1.4 mi</Badge>
              <Badge tone="gold"><Icon name="star" size={12} /> 4.9</Badge>
              <Badge tone="ghost">18 left</Badge>
            </div>
            <div className="eb-btn eb-btn-primary eb-btn-block" style={{ fontSize: 14, padding: 11 }}>Reserve free box</div>
          </div>
        </div>
        <Mascot variant="green" size={176} style={{ position: 'absolute', left: 22, bottom: 0, filter: 'drop-shadow(0 10px 20px rgba(22,30,15,0.32))' }} />
      </div>
    </div>
  )
}

/* ---------- home ---------- */
function CHome({ go }: { go: GoClient }) {
  const [q, setQ] = useState('')
  return (
    <div style={{ padding: '0 0 56px' }}>
      <div style={{ position: 'relative', margin: '24px 32px 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--green-deep)' }}>
        <Tile photo={PHOTO.abundance} radius={0}
          overlay="linear-gradient(95deg, rgba(34,40,24,0.90) 30%, rgba(34,40,24,0.52) 75%, rgba(34,40,24,0.34))"
          style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'relative', padding: '52px 48px', maxWidth: 640 }}>
          <h1 className="eb-display" style={{ fontSize: 40, color: 'var(--on-green)', margin: '0 0 14px' }}>
            Fresh food, reserved in seconds.
          </h1>
          <p style={{ fontSize: 17, color: 'oklch(0.93 0.03 145)', margin: '0 0 26px', lineHeight: 1.5 }}>
            Browse what’s available near you right now, from partner pantries and food banks.
          </p>
          <div style={{ display: 'flex', gap: 10, maxWidth: 520, background: 'var(--surface)', padding: 7, borderRadius: 99, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 14px' }}>
              <Icon name="search" size={20} stroke="var(--ink-3)" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search food or pantries…"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 15.5, color: 'var(--ink)' }} />
            </div>
            <button className="eb-btn eb-btn-primary" data-demo="c-search" onClick={() => go('browse', { q })}>Search</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '36px 32px 0' }}>
        <h2 className="eb-display" style={{ fontSize: 22, margin: '0 0 16px' }}>Browse by category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
            <button key={c.id} onClick={() => go('browse', { cat: c.id })} data-demo={`c-cat-${c.id}`}
              className="eb-card eb-card-hover"
              style={{ padding: '18px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Tile category={c.id} icon={c.icon} style={{ width: 46, height: 46, iconSize: 24 }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="eb-display" style={{ fontSize: 22, margin: 0 }}>Available near you</h2>
          <button onClick={() => go('browse')} style={{
            background: 'none', border: 'none', color: 'var(--green-deep)', fontWeight: 600, fontSize: 14.5,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>See all <Icon name="arrowRight" size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {LISTINGS.slice(0, 3).map((l) => <CListingCard key={l.id} listing={l} go={go} />)}
        </div>
      </div>

      <div style={{ margin: '44px 32px 0', padding: '34px 40px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="eb-display" style={{ fontSize: 22, margin: '0 0 24px' }}>How EcoBites works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
          {([
            ['search', 'Find food nearby', 'Browse real-time surplus from pantries and food banks around you.'],
            ['cart', 'Reserve your box', 'Join the waitlist and choose pickup or free delivery.'],
            ['truck', 'Pick up or get it delivered', 'Track your order live as a volunteer driver brings it to your door.'],
          ] as const).map(([ic, t, d], i) => (
            <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={20} stroke="var(--green-deep)" />
                </span>
                <span className="eb-display" style={{ fontSize: 17, color: 'var(--ink-3)' }}>0{i + 1}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16.5 }}>{t}</div>
              <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- shared listing card ---------- */
export function CListingCard({ listing, go }: { listing: Listing; go: GoClient }) {
  const prov = provider(listing.provider)
  return (
    <button onClick={() => go('detail', { id: listing.id })} data-demo={`c-listing-${listing.id}`}
      className="eb-card eb-card-hover"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
      <Tile photo={listingPhoto(listing)} category={listing.category} style={{ height: 132 }} radius={0} />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 16.5 }}>{listing.name}</span>
          {listing.qtyLeft <= 10 && <Badge tone="clay">{listing.qtyLeft} left</Badge>}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 12 }}>{prov.name}</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <Badge tone="ghost"><Icon name="pin" size={12} /> {prov.dist} mi</Badge>
          {prov.fulfillment.includes('delivery') && <Badge tone="green"><Icon name="truck" size={12} /> Delivery</Badge>}
          <Badge tone="ghost"><Icon name="cart" size={12} /> Pickup</Badge>
        </div>
      </div>
    </button>
  )
}
