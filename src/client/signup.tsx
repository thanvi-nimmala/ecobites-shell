/* ============================================================
   EcoBites — sign-up

   The question a stakeholder always asks is "how do you stop the
   wrong people taking it". The answer the field already settled on is
   self-attestation: federal TEFAP has people state their household and
   income on a form and takes them at their word, and some states bar
   agencies from asking for proof at all. A verification gate filters
   hardest against the people with the least paperwork — the unhoused,
   and anyone who avoids scrutiny — which is the opposite of the job.

   So this screen asks three things, takes one declaration, and lets
   you straight in. What is actually scarce is a volunteer willing to
   drive, so the limit lives on deliveries, and it is printed on the
   screen rather than enforced quietly.
   ============================================================ */
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { DELIVERY_LIMIT, useStore } from '../lib/store'
import type { GoClient } from '../lib/nav'

export function CSignup({ go }: { go: GoClient }) {
  const { household, setHousehold } = useStore()
  const [attested, setAttested] = useState(household.attested)

  const submit = () => {
    setHousehold({ attested: true })
    go('home')
  }

  return (
    <div className="eb-ground" style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: '48px 32px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 26 }}>
          <Logo size={38} />
          <span className="eb-display" style={{ fontSize: 21 }}>EcoBites</span>
        </div>

        <h1 className="eb-display" style={{ fontSize: 34, margin: '0 0 10px' }}>
          Three questions, then you’re in.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 26px' }}>
          We take your word for all of it. There is no document to upload, nothing to prove,
          and no waiting to be approved.
        </p>

        <div className="eb-card" style={{ padding: 24 }}>
          <Field label="Your name" hint="Whatever a driver should ask for at the door.">
            <input className="eb-input" value={household.name} data-demo="c-signup-name"
              onChange={(e) => setHousehold({ name: e.target.value })} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14 }}>
            <Field label="ZIP code" hint="To find what is near you.">
              <input className="eb-input" value={household.zip} data-demo="c-signup-zip"
                onChange={(e) => setHousehold({ zip: e.target.value })} />
            </Field>
            <Field label="People in your household" hint="So boxes are the right size.">
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, '5+'].map((n) => {
                  const v = n === '5+' ? 5 : (n as number)
                  const on = household.size === v
                  return (
                    <button key={String(n)} className="eb-chip" data-active={on} data-demo={`c-signup-size-${v}`}
                      onClick={() => setHousehold({ size: v })} style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>
                      {n}
                    </button>
                  )
                })}
              </div>
            </Field>
          </div>

          {/* the declaration — this is the whole eligibility check */}
          <button
            onClick={() => setAttested((v) => !v)} data-demo="c-signup-attest"
            style={{
              display: 'flex', gap: 13, alignItems: 'flex-start', width: '100%', textAlign: 'left',
              marginTop: 8, padding: '15px 16px', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              background: attested ? 'var(--green-tint)' : 'var(--surface-2)',
              border: `1.5px solid ${attested ? 'var(--green)' : 'var(--edge-2)'}`,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
              border: `2px solid ${attested ? 'var(--green)' : 'var(--border-2)'}`,
              background: attested ? 'var(--green)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {attested && <Icon name="check" size={14} stroke="#fff" sw={3} />}
            </span>
            <span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 15.5 }}>
                My household needs food assistance.
              </span>
              <span style={{ display: 'block', fontSize: 13.5, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.5 }}>
                That is the only eligibility check there is. We do not verify it, and nobody will
                ask you about it again.
              </span>
            </span>
          </button>

          <button
            className="eb-btn eb-btn-primary eb-btn-block" data-demo="c-signup-submit"
            onClick={submit} disabled={!attested}
            style={{ marginTop: 18, padding: 15, opacity: attested ? 1 : 0.5 }}
          >
            Start browsing <Icon name="arrowRight" size={18} />
          </button>
        </div>

        {/* what we do instead of a gate, said plainly */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, alignItems: 'flex-start', padding: '0 4px' }}>
          <Icon name="info" size={17} stroke="var(--ink-3)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
            Pickup is never limited — collect as often as you need. What is scarce is a volunteer
            free to drive, so <b>delivery is capped at {DELIVERY_LIMIT} a week per household</b>, and
            when drivers are short we go first to people who told us they have no car or no bus route.
            You can change that any time.
          </p>
        </div>

        <button onClick={() => go('home')} data-demo="c-signup-skip" style={{
          marginTop: 18, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-2)', fontSize: 14.5, fontFamily: 'inherit',
        }}>
          Just looking? <span style={{ color: 'var(--green-deep)', fontWeight: 600 }}>Browse without signing up</span>
        </button>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 7 }}>{hint}</div>
      {children}
    </div>
  )
}
