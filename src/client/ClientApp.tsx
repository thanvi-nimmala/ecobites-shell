/* ============================================================
   EcoBites — Client website (desktop surface)
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { Badge, Tile } from '../components/ui'
import { CheckerBand } from '../components/CheckerBand'
import { Stamp } from '../components/Stamp'
import { CATEGORIES, CLIENT, LISTINGS, PHOTO, listingPhoto, provider } from '../lib/data'
import type { ClientRoute, GoClient } from '../lib/nav'
import type { Listing } from '../lib/types'
import { useStore } from '../lib/store'
import { CAbout, CBrowse, CCheckout, CConfirm, CDetail, CTrack } from './screens'
import { CDirectory } from './directory'
import { CSignup } from './signup'
import { DirectoryNotice, DirectoryPrinted, type DirStyle } from './directory-styles'

/* ?style=printed|notice swaps the directory for a visual-direction mockup,
   built on the same data so the comparison is honest */
const DIR_STYLE = new URLSearchParams(location.search).get('style') as DirStyle | null

export function ClientApp({ route, go }: { route: ClientRoute; go: GoClient }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { scrollRef.current?.scrollTo(0, 0) }, [route.name, route.id])

  const screens: Record<ClientRoute['name'], React.ReactNode> = {
    onboard:  <COnboard go={go} />,
    signup:   <CSignup go={go} />,
    home:     <CHome go={go} />,
    about:    <CAbout go={go} />,
    directory: DIR_STYLE === 'printed' ? <DirectoryPrinted />
      : DIR_STYLE === 'notice' ? <DirectoryNotice />
      : <CDirectory go={go} />,
    browse:   <CBrowse go={go} cat={route.cat} />,
    detail:   <CDetail go={go} id={route.id} />,
    checkout: <CCheckout go={go} />,
    confirm:  <CConfirm go={go} orderId={route.orderId} />,
    track:    <CTrack go={go} orderId={route.orderId} />,
  }

  const chromed = route.name !== 'onboard'
  return (
    <div className="eb-body eb-ground" style={{ height: '100%', position: 'relative' }}>
      <div ref={scrollRef} className="eb-scroll" style={{ height: '100%' }}>
        {/* the nav floats over this, so the first screenful needs clearance */}
        {chromed && <div style={{ height: NAV_H }} aria-hidden />}
        <div key={route.name} className="eb-fade">{screens[route.name]}</div>
      </div>
      {chromed && <CNav go={go} route={route} />}
    </div>
  )
}

/* ---------- nav ---------- */
const NAV_H = 68  /* mirrored as --nav-h for sticky children */

function CNav({ go, route }: { go: GoClient; route: ClientRoute }) {
  const { cartCount } = useStore()
  const links: [ClientRoute['name'], string][] = [['home', 'Home'], ['browse', 'Browse food'], ['directory', 'Directory'], ['about', 'About'], ['track', 'My orders']]
  return (
    <header className="eb-glass" style={{
      display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', height: NAV_H, whiteSpace: 'nowrap',
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottom: '1px solid var(--edge)',
    }}>
      <button onClick={() => go('home')} data-demo="c-logo"
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Logo size={34} />
        <span className="eb-display" style={{ fontSize: 21 }}>EcoBites</span>
      </button>
      <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
        {links.map(([k, label]) => (
          <button key={k} onClick={() => go(k)} data-demo={`c-nav-${k}`} style={{
            background: route.name === k ? 'var(--green-tint)' : 'none', border: 'none', cursor: 'pointer',
            fontSize: 14.5, fontWeight: 600, padding: '8px 12px', borderRadius: 99, whiteSpace: 'nowrap',
            color: route.name === k ? 'var(--green-deep)' : 'var(--ink-2)',
          }}>{label}</button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink-2)', fontSize: 14, fontWeight: 500 }}>
        <Icon name="pin" size={17} stroke="var(--green)" /> {CLIENT.zip}
      </div>
      <button onClick={() => go('checkout')} data-demo="c-cart" aria-label="Basket" style={{
        position: 'relative', width: 42, height: 42, borderRadius: 99, border: '1px solid var(--edge-2)',
        background: 'linear-gradient(180deg, var(--surface), color-mix(in oklch, var(--surface) 88%, var(--sand)))',
        boxShadow: 'inset 0 1px 0 var(--hairline), var(--shadow-sm)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1fr', position: 'relative' }}>
      <div style={{ padding: '64px 64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 40 }}>
          <Logo size={44} />
          <span className="eb-display" style={{ fontSize: 23 }}>EcoBites</span>
        </div>
        <Badge tone="clay" style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
          <Icon name="handHeart" size={14} /> Food relief, made accessible
        </Badge>
        <h1 className="eb-display" style={{ fontSize: 52, margin: '0 0 18px' }}>Good food finds<br />its way home.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 32px', maxWidth: 470 }}>
          EcoBites connects you with surplus food from nearby pantries and food banks. Reserve a box,
          choose pickup or delivery, and we’ll take it from there. It’s free, and it always will be.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <input className="eb-input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="eb-input" placeholder="ZIP code" value={zip} onChange={(e) => setZip(e.target.value)} style={{ flex: 1 }} />
            <button className="eb-btn eb-btn-primary" data-demo="c-find" onClick={() => go('signup')} style={{ flexShrink: 0 }}>
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
          {/* the statewide figure, not the national one: Feeding America's
              Map the Meal Gap estimate for New Jersey, 2024 */}
          {[['1.2M', 'neighbors in NJ'], ['120+', 'partner pantries'], ['$0', 'always free']].map(([n, l]) => (
            <div key={l}>
              <div className="eb-display" style={{ fontSize: 26, color: 'var(--green-deep)' }}>{n}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Stamp size={116} style={{
        position: 'absolute', left: 'calc(51.2% - 58px)', top: 92, zIndex: 3,
        filter: 'drop-shadow(0 8px 18px rgba(22,30,15,0.26))',
      }} />
      <div style={{ position: 'relative', background: 'var(--green-tint)', overflow: 'hidden' }}>
        <Tile photo={PHOTO.communityTable} overlay="linear-gradient(180deg, rgba(42,46,30,0.14), rgba(42,46,30,0.30))"
          style={{ position: 'absolute', inset: 0 }} radius={0} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div className="eb-card" style={{ width: 320, padding: 22, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Tile photo={PHOTO.produceCrate} category="produce" style={{ width: 54, height: 54 }} />
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
        <Tile photo={PHOTO.marketStall} radius={0}
          overlay="linear-gradient(95deg, rgba(34,40,24,0.90) 30%, rgba(34,40,24,0.52) 75%, rgba(34,40,24,0.34))"
          style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'relative', padding: '52px 48px', maxWidth: 640 }}>
          <h1 className="eb-display" style={{ fontSize: 40, color: 'var(--on-green)', margin: '0 0 14px' }}>
            Fresh food, reserved in seconds.
          </h1>
          <p style={{ fontSize: 17, color: 'oklch(0.93 0.03 145)', margin: '0 0 26px', lineHeight: 1.5 }}>
            Here’s what the pantries and food banks near you have on the shelf today. Take what you need.
          </p>
          {/* sitting on the photograph, so this is glass rather than a white pill */}
          <div className="eb-glass-dark" style={{
            display: 'flex', gap: 10, maxWidth: 520, padding: 7, borderRadius: 99,
            boxShadow: 'inset 0 1px 0 oklch(1 0 0 / .22), 0 10px 30px oklch(0.18 0.03 70 / .35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 14px' }}>
              <Icon name="search" size={20} stroke="oklch(0.90 0.03 145)" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search food or pantries…"
                className="eb-hero-search"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 15.5, color: 'var(--on-green)' }} />
            </div>
            <button className="eb-btn eb-btn-primary" data-demo="c-search" onClick={() => go('browse', { q })}>Search</button>
          </div>
        </div>
      </div>

      <CheckerBand tone="green" style={{ margin: '36px 0 0' }} />

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

      <CheckerBand tone="sand" style={{ margin: '48px 0 0' }} />

      {/* how it works — the instructional beat */}
      <div style={{ padding: '44px 32px 0' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink-3)', marginBottom: 10 }}>
          HOW IT WORKS
        </div>
        <h2 className="eb-display" style={{ fontSize: 30, margin: '0 0 8px', maxWidth: '22ch' }}>
          Three steps, no paperwork, no payment.
        </h2>
        <p style={{ fontSize: 15.5, color: 'var(--ink-2)', margin: '0 0 28px', maxWidth: '58ch', lineHeight: 1.6 }}>
          Everything here is free. You do not prove anything, you do not join a queue, and you can
          stop after step two if pickup suits you better.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {([
            ['01', 'search', 'Find food nearby',
             'Browse real-time surplus from pantries and food banks around you, filtered by what you can actually eat.',
             'You see only what is on the shelf right now.'],
            ['02', 'cart', 'Reserve your box',
             'Pick a quantity, then choose pickup or free delivery. No account wall, no payment, no eligibility form.',
             'The food is held in your name.'],
            ['03', 'truck', 'Track it to your door',
             'A nearby volunteer claims the route. Every step they take lands on your tracker as it happens.',
             'You always know where your food is.'],
          ] as const).map(([n, ic, title, body, outcome]) => (
            <div key={n} className="eb-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="eb-ichip"><Icon name={ic} size={17} stroke="var(--green-deep)" /></span>
                <span className="eb-display" style={{ fontSize: 15, color: 'var(--ink-3)' }}>{n}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
              <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, flex: 1 }}>{body}</div>
              <div style={{
                marginTop: 2, paddingTop: 12,
                borderTop: '1.5px dashed color-mix(in oklch, var(--green) 30%, transparent)',
                fontSize: 13.5, fontWeight: 600, color: 'var(--green-deep)',
                display: 'flex', gap: 7, alignItems: 'flex-start',
              }}>
                <Icon name="arrowRight" size={15} stroke="var(--green-deep)" style={{ flexShrink: 0, marginTop: 2 }} />
                {outcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CheckerBand tone="gold" style={{ margin: '48px 0 0' }} />
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
