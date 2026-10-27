/* ============================================================
   Two visual directions for the directory, built on the same data so
   the comparison is honest. Reached with ?shot=directory&style=printed
   or &style=notice.

   PRINTED MATTER — the service as a grocery flyer or market handbill.
   Paper, a two-ink palette, rules instead of cards, the checker band
   doing structural work. It argues that this is a physical, local,
   neighbourhood thing.

   PUBLIC NOTICE — the service as a posted civic notice. Heavy rules,
   numbered entries, a tabular spine, almost no colour. It argues
   competence and permanence: this list is maintained and it is correct.
   ============================================================ */
import { useMemo, useState } from 'react'
import { Logo } from '../components/Logo'
import { DAYS, PROVIDERS, PROVIDER_KINDS, TODAY } from '../lib/data'
import type { Provider, ProviderKind } from '../lib/types'

export type DirStyle = 'printed' | 'notice'
type KindFilter = 'all' | ProviderKind

function useResults(kind: KindFilter) {
  return useMemo(
    () => PROVIDERS.filter((p) => kind === 'all' || p.kind === kind).sort((a, b) => a.dist - b.dist),
    [kind],
  )
}

/* ═══════════════════════ PRINTED MATTER ═══════════════════════ */

const PAPER = '#f1ebdc'
const INK = '#2b2a24'
const GREEN = '#3f6b3d'
const CLAY = '#b35f32'

export function DirectoryPrinted() {
  const [kind, setKind] = useState<KindFilter>('all')
  const results = useResults(kind)

  return (
    <div style={{
      minHeight: '100%', background: PAPER, color: INK,
      fontFamily: 'var(--font-body)',
      /* the tooth of uncoated stock, just enough to stop it reading as a screen */
      backgroundImage: 'radial-gradient(oklch(0.45 0.03 70 / .055) 0.5px, transparent 0.6px)',
      backgroundSize: '3px 3px',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 34px 60px' }}>

        {/* masthead */}
        <div style={{ borderBottom: `3px solid ${INK}`, paddingTop: 34, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Logo size={40} color={GREEN} />
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40,
                letterSpacing: '-0.035em', lineHeight: 0.95,
              }}>
                FOOD NEAR YOU
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
              textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.7, paddingBottom: 3,
            }}>
              Essex County edition<br />{DAYS[TODAY]} · free · take one
            </div>
          </div>
        </div>
        <div style={{ borderBottom: `1px solid ${INK}`, marginTop: 3 }} />

        {/* standfirst, set like a flyer deck */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 34, padding: '20px 0 22px' }}>
          <div style={{ fontSize: 19, lineHeight: 1.42, fontWeight: 500 }}>
            Every pantry, food bank, mobile market and kitchen within five miles — what they
            have, when they open, and what they will ask you for at the door.
          </div>
          <div style={{
            borderLeft: `2px solid ${CLAY}`, paddingLeft: 16, fontSize: 15, lineHeight: 1.5,
            display: 'flex', alignItems: 'center', color: CLAY, fontWeight: 700,
          }}>
            At every single one of them, the answer is nothing.
          </div>
        </div>

        <PrintedChecker />

        {/* filter row, set as a run-in index */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
          padding: '16px 0 14px', borderBottom: `1px solid ${INK}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
            textTransform: 'uppercase', marginRight: 4,
          }}>Index</span>
          {(['all', ...PROVIDER_KINDS] as KindFilter[]).map((k, i) => (
            <button key={k} onClick={() => setKind(k)} style={{
              background: kind === k ? INK : 'transparent',
              color: kind === k ? PAPER : INK,
              border: 'none', cursor: 'pointer', padding: '3px 8px',
              fontFamily: 'var(--font-body)', fontWeight: kind === k ? 700 : 500, fontSize: 14.5,
            }}>
              {i === 0 ? 'Everything' : k}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {String(results.length).padStart(2, '0')} listings
          </span>
        </div>

        {results.map((p, i) => <PrintedEntry key={p.id} p={p} n={i + 1} />)}

        <PrintedChecker />
        <div style={{
          textAlign: 'center', padding: '20px 0 0', fontFamily: 'var(--font-mono)',
          fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          Nothing on this page is means-tested · ecobites.org
        </div>
      </div>
    </div>
  )
}

function PrintedChecker() {
  return (
    <div aria-hidden style={{
      height: 18, margin: '2px 0',
      backgroundImage:
        `linear-gradient(45deg, ${GREEN} 25%, transparent 25% 75%, ${GREEN} 75%),`
        + `linear-gradient(45deg, ${GREEN} 25%, transparent 25% 75%, ${GREEN} 75%)`,
      backgroundSize: '18px 18px',
      backgroundPosition: '0 0, 9px 9px',
    }} />
  )
}

function PrintedEntry({ p, n }: { p: Provider; n: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16, padding: '18px 0', borderBottom: `1px solid ${INK}33` }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30,
        color: CLAY, lineHeight: 0.9, letterSpacing: '-0.04em',
      }}>
        {String(n).padStart(2, '0')}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.025em' }}>
            {p.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', border: `1px solid ${INK}`, padding: '2px 6px',
          }}>{p.kind}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: p.open ? GREEN : CLAY, color: PAPER, padding: '3px 7px',
          }}>{p.open ? 'Open now' : 'Closed now'}</span>
        </div>

        <div style={{ fontSize: 14.5, marginTop: 5, lineHeight: 1.45 }}>
          {p.addr} · {p.dist} mi · {p.phone}
        </div>

        {/* the promise, set as a stamped line rather than a panel */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, margin: '11px 0',
          borderTop: `2px solid ${GREEN}`, borderBottom: `2px solid ${GREEN}`, padding: '6px 0',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: GREEN, fontWeight: 700,
          }}>Bring</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{p.bring}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 0.9fr', gap: 22, marginTop: 4 }}>
          <PrintedCol label="Hours">
            {p.hours.map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 8,
                fontWeight: i === TODAY ? 700 : 400,
                color: h ? INK : `${INK}77`,
                borderBottom: i === TODAY ? `1.5px solid ${CLAY}` : 'none',
              }}>
                <span>{DAYS[i].slice(0, 3)}</span><span>{h ?? '—'}</span>
              </div>
            ))}
          </PrintedCol>

          <PrintedCol label="They have">
            {p.services.map((s) => <div key={s}>· {s}</div>)}
          </PrintedCol>

          <PrintedCol label="Getting there">
            <div>{p.stepFree ? 'Step-free' : 'Steps at door'}</div>
            {p.transit && <div>{p.transit}</div>}
            <div>{p.languages.join(', ')}</div>
          </PrintedCol>
        </div>
      </div>
    </div>
  )
}

function PrintedCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.16em',
        textTransform: 'uppercase', borderBottom: `1px solid ${INK}`, paddingBottom: 3, marginBottom: 6,
      }}>{label}</div>
      <div style={{ fontSize: 13, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

/* ═══════════════════════ PUBLIC NOTICE ═══════════════════════ */

const N_PAPER = '#fcfcfa'
const N_INK = '#17171a'
const N_RULE = '#17171a'
const N_GREEN = '#1f5c36'

export function DirectoryNotice() {
  const [kind, setKind] = useState<KindFilter>('all')
  const results = useResults(kind)

  return (
    <div style={{ minHeight: '100%', background: N_PAPER, color: N_INK, fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '0 40px 64px' }}>

        <div style={{ borderTop: `9px solid ${N_RULE}`, paddingTop: 16 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            EcoBites · Essex County · Updated {DAYS[TODAY]}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 46,
            letterSpacing: '-0.035em', lineHeight: 1.0, margin: '0 0 16px', maxWidth: 780,
          }}>
            Where to get food in Essex County, and what you need to bring.
          </h1>
          <div style={{ fontSize: 17.5, lineHeight: 1.5, maxWidth: 680, color: '#3c3c40' }}>
            This list covers every food bank, pantry, mobile market and kitchen within five miles.
            None of them is means-tested. None of them will ask you to prove anything.
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${N_RULE}`, marginTop: 24 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', padding: '0' }}>
          {(['all', ...PROVIDER_KINDS] as KindFilter[]).map((k, i) => (
            <button key={k} onClick={() => setKind(k)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '13px 16px 11px', marginRight: 2,
              fontFamily: 'var(--font-body)', fontSize: 14.5,
              fontWeight: kind === k ? 700 : 500,
              color: kind === k ? N_INK : '#6a6a70',
              borderBottom: kind === k ? `3px solid ${N_INK}` : '3px solid transparent',
            }}>
              {i === 0 ? 'All' : k}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
            {results.length} ENTRIES
          </span>
        </div>
        <div style={{ borderTop: `2px solid ${N_RULE}` }} />

        {results.map((p, i) => <NoticeEntry key={p.id} p={p} n={i + 1} />)}

        <div style={{
          borderTop: `9px solid ${N_RULE}`, marginTop: 10, paddingTop: 14,
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          Corrections: ecobites.org/directory
        </div>
      </div>
    </div>
  )
}

function NoticeEntry({ p, n }: { p: Provider; n: number }) {
  return (
    <div style={{ borderBottom: `1px solid #d7d7d2`, padding: '22px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 230px', gap: 20, alignItems: 'start' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, paddingTop: 5, color: '#8a8a90' }}>
          {String(n).padStart(2, '0')}
        </div>

        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 25,
            letterSpacing: '-0.028em', margin: '0 0 3px',
          }}>{p.name}</h2>
          <div style={{ fontSize: 14, color: '#5c5c62', marginBottom: 12 }}>
            {p.kind} · {p.addr} · {p.dist} mi · {p.phone}
          </div>

          {/* one line of colour on the page, spent on the thing that matters */}
          <div style={{ display: 'flex', gap: 9, alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: N_GREEN, fontWeight: 700, whiteSpace: 'nowrap',
            }}>Bring</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: N_GREEN }}>{p.bring}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, fontSize: 13.5, lineHeight: 1.6, color: '#3c3c40' }}>
            <div>
              <NoticeLabel>Services</NoticeLabel>
              {p.services.join(', ')}
              <div style={{ height: 8 }} />
              <NoticeLabel>Languages</NoticeLabel>
              {p.languages.join(', ')}
            </div>
            <div>
              <NoticeLabel>Access</NoticeLabel>
              {p.stepFree ? 'Step-free entrance' : 'Steps at the entrance — call ahead'}
              {p.transit && <><br />{p.transit}</>}
              <div style={{ height: 8 }} />
              <NoticeLabel>Collection</NoticeLabel>
              {p.fulfillment.includes('delivery') ? 'Pickup or delivery' : 'Pickup only'}
            </div>
          </div>
        </div>

        {/* hours as a ruled table — the spine of the layout */}
        <div style={{ border: `1px solid ${N_RULE}` }}>
          <div style={{
            background: N_INK, color: N_PAPER, padding: '6px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Hours</span><span>{p.open ? 'Open now' : 'Closed'}</span>
          </div>
          {p.hours.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: '5px 10px', fontSize: 12.5,
              borderTop: i ? '1px solid #e2e2dd' : 'none',
              background: i === TODAY ? '#f0f0ea' : 'transparent',
              fontWeight: i === TODAY ? 700 : 400,
              color: h ? N_INK : '#9a9aa0',
            }}>
              <span>{DAYS[i].slice(0, 3)}</span><span>{h ?? 'Closed'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NoticeLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: '#8a8a90', marginBottom: 2,
    }}>{children}</div>
  )
}
