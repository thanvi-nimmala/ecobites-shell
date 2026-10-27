/* ============================================================
   EcoBites — the directory

   Not everyone wants to reserve a box online, and not everyone can.
   Some people would rather walk in, and some are looking on behalf of
   someone else. The directory is the service stated as a list of real
   places, with the thing people actually need to know first: what they
   will be asked for at the door. The answer is always "nothing", and
   saying so in print is the whole point.
   ============================================================ */
import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Badge } from '../components/ui'
import { CheckerBand } from '../components/CheckerBand'
import { DAYS, PROVIDERS, PROVIDER_KINDS, TODAY } from '../lib/data'
import type { GoClient } from '../lib/nav'
import type { Provider, ProviderKind } from '../lib/types'

type KindFilter = 'all' | ProviderKind

export function CDirectory({ go }: { go: GoClient }) {
  const [kind, setKind] = useState<KindFilter>('all')
  const [openNow, setOpenNow] = useState(false)
  const [delivers, setDelivers] = useState(false)

  const results = useMemo(() => PROVIDERS.filter((p) => {
    if (kind !== 'all' && p.kind !== kind) return false
    if (openNow && !p.open) return false
    if (delivers && !p.fulfillment.includes('delivery')) return false
    return true
  }).sort((a, b) => a.dist - b.dist), [kind, openNow, delivers])

  return (
    <div>
      <div style={{ padding: '36px 32px 26px', maxWidth: 1040, margin: '0 auto' }}>
        <div className="mono-label" style={{ color: 'var(--clay-deep)' }}>THE DIRECTORY</div>
        <h1 className="eb-display" style={{ fontSize: 34, margin: '10px 0 10px' }}>
          Every place near you that gives out food.
        </h1>
        <p style={{ fontSize: 16.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0, maxWidth: 680 }}>
          Whether or not you ever reserve anything here. Addresses, hours, phone numbers, and what
          each place will ask you for when you arrive — which, at all of them, is nothing.
        </p>
      </div>

      <CheckerBand tone="green" />

      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gap: 28, padding: '28px 32px 56px', maxWidth: 1040, margin: '0 auto', alignItems: 'start' }}>
        <aside className="eb-card" style={{ padding: 20, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Icon name="filter" size={17} stroke="var(--green-deep)" />
            <span className="eb-display" style={{ fontSize: 17 }}>Narrow it down</span>
          </div>

          <DirGroup title="Kind of place">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(['all', ...PROVIDER_KINDS] as KindFilter[]).map((k) => (
                <button key={k} onClick={() => setKind(k)} data-demo={`c-dir-kind-${k.replace(/\s+/g, '-')}`} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14,
                  background: kind === k ? 'var(--green-tint)' : 'transparent',
                  color: kind === k ? 'var(--green-deep)' : 'var(--ink-2)',
                  fontWeight: kind === k ? 600 : 500,
                }}>
                  {k === 'all' ? 'All places' : k}
                </button>
              ))}
            </div>
          </DirGroup>

          <DirGroup title="Right now">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              <button className="eb-chip" data-active={openNow} data-demo="c-dir-open"
                onClick={() => setOpenNow((v) => !v)}>Open now</button>
              <button className="eb-chip" data-active={delivers} data-demo="c-dir-delivers"
                onClick={() => setDelivers((v) => !v)}>Delivers</button>
            </div>
          </DirGroup>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--edge)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Something out of date? Tell us and we’ll check it —
            <button onClick={() => go('about')} style={{
              background: 'none', border: 'none', padding: 0, marginLeft: 4, cursor: 'pointer',
              color: 'var(--green-deep)', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
            }}>how this list is kept</button>.
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="eb-display" style={{ fontSize: 21, margin: 0 }}>
              {results.length} {results.length === 1 ? 'place' : 'places'} in Essex County
            </h2>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Nearest first · {DAYS[TODAY]}</span>
          </div>

          {results.length === 0 ? (
            <div className="eb-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Icon name="pin" size={26} stroke="var(--clay)" />
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 10 }}>Nothing matches all of that</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '6px 0 14px', lineHeight: 1.5 }}>
                Try dropping a filter — every place on this list is free and open to anyone.
              </p>
              <button className="eb-btn eb-btn-primary" data-demo="c-dir-clear"
                onClick={() => { setKind('all'); setOpenNow(false); setDelivers(false) }}>
                Show every place
              </button>
            </div>
          ) : results.map((p) => <DirectoryCard key={p.id} p={p} go={go} />)}
        </div>
      </div>
    </div>
  )
}

function DirGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="mono-label" style={{ color: 'var(--ink-3)', marginBottom: 9 }}>{title.toUpperCase()}</div>
      {children}
    </div>
  )
}

function DirectoryCard({ p, go }: { p: Provider; go: GoClient }) {
  const today = p.hours[TODAY]
  return (
    <div className="eb-card" data-demo={`c-dir-${p.id}`} style={{ padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span className="eb-display" style={{ fontSize: 19 }}>{p.name}</span>
            <Badge tone="ghost">{p.kind}</Badge>
            {p.open
              ? <Badge tone="green">Open now</Badge>
              : <Badge tone="clay">Closed now</Badge>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 6, fontSize: 13.5, color: 'var(--ink-2)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="pin" size={14} stroke="var(--ink-3)" /> {p.addr}
            </span>
            <span>{p.dist} mi</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="phone" size={14} stroke="var(--ink-3)" /> {p.phone}
            </span>
          </div>
        </div>
      </div>

      {/* The line that decides whether someone comes. It leads. */}
      <div style={{
        display: 'flex', gap: 11, alignItems: 'flex-start', padding: '12px 14px', marginBottom: 14,
        borderRadius: 'var(--radius-sm)', background: 'var(--green-tint)',
        border: '1px solid color-mix(in oklch, var(--green) 20%, transparent)',
      }}>
        <Icon name="checkCircle" size={18} stroke="var(--green-deep)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--green-deep)' }}>What to bring</div>
          <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 2 }}>{p.bring}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div className="mono-label" style={{ color: 'var(--ink-3)', marginBottom: 7 }}>HOURS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {p.hours.map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13,
                color: h ? (i === TODAY ? 'var(--ink)' : 'var(--ink-2)') : 'var(--ink-3)',
                fontWeight: i === TODAY ? 700 : 400,
              }}>
                <span>{DAYS[i].slice(0, 3)}</span>
                <span>{h ?? 'Closed'}</span>
              </div>
            ))}
          </div>
          {today && (
            <div style={{ fontSize: 12.5, color: 'var(--green-deep)', marginTop: 8, fontWeight: 600 }}>
              Today: {today}
            </div>
          )}
        </div>

        <div>
          <div className="mono-label" style={{ color: 'var(--ink-3)', marginBottom: 7 }}>WHAT THEY HAVE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {p.services.map((s) => (
              <span key={s} className="eb-badge" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--edge)' }}>{s}</span>
            ))}
          </div>

          <div className="mono-label" style={{ color: 'var(--ink-3)', marginBottom: 7 }}>GETTING THERE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={p.stepFree ? 'check' : 'info'} size={14} stroke={p.stepFree ? 'var(--green)' : 'var(--clay)'} />
              {p.stepFree ? 'Step-free entrance' : 'Steps at the entrance — call ahead'}
            </span>
            {p.transit && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="nav" size={14} stroke="var(--ink-3)" /> {p.transit}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="user" size={14} stroke="var(--ink-3)" /> {p.languages.join(' · ')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--edge)' }}>
        {p.fulfillment.includes('delivery') && (
          <button className="eb-btn eb-btn-primary" data-demo={`c-dir-reserve-${p.id}`}
            onClick={() => go('browse')} style={{ padding: '10px 18px', fontSize: 14 }}>
            See what they have <Icon name="arrowRight" size={16} />
          </button>
        )}
        <button className="eb-btn eb-btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          <Icon name="nav" size={16} /> Directions
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-3)' }}>
          {p.fulfillment.includes('delivery') ? 'Pickup or delivery' : 'Pickup only'}
        </span>
      </div>
    </div>
  )
}
