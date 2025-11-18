import React, { useState, useMemo } from 'react'

// Unique prefix to avoid leaking styles to host page
const PFX = 'tlc-embed';

const fields = [
  { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com' },
  { id: 'subject', type: 'text', label: 'Subject', placeholder: 'How can we help?' },
  { id: 'message', type: 'textarea', label: 'Message', placeholder: 'Write your message...' },
];

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

export default function TLCContactWidget() {
  const [form, setForm] = useState({ email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [particles, setParticles] = useState([])
  const [burstKey, setBurstKey] = useState(0) // force reflow for repeated bursts

  const bgStyle = useMemo(() => ({
    background: `radial-gradient(1200px 600px at 10% 0%, rgba(39,255,0,0.08), transparent 60%),
                 radial-gradient(1200px 600px at 90% 100%, rgba(68,157,221,0.12), transparent 60%),
                 linear-gradient(135deg, #000052 0%, #00003a 100%)`,
  }), [])

  const triggerBurst = () => {
    // Create an exciting particle burst with gradient accents
    const count = 22
    const colors = ['#27FF00', '#33eebb', '#449ddd', '#e8e8e8']
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6
      const distance = 40 + Math.random() * 80
      const dx = Math.cos(angle) * distance
      const dy = Math.sin(angle) * distance
      const size = 4 + Math.random() * 6
      const dur = 500 + Math.random() * 400
      const delay = Math.random() * 40
      const color = colors[Math.floor(Math.random() * colors.length)]
      const rotate = Math.random() * 360
      return { id: `${Date.now()}-${i}`, dx, dy, size, dur, delay, color, rotate }
    })
    setBurstKey((k) => k + 1)
    setParticles(newParticles)
    // Auto-clear after animations finish
    setTimeout(() => setParticles([]), 1100)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status.state === 'loading') return

    // Fire burst immediately on click
    triggerBurst()
    setStatus({ state: 'loading', message: 'Sending...' })

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to submit')
      setStatus({ state: 'success', message: 'Message sent. We will reply soon.' })
      setForm({ email: '', subject: '', message: '' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Something went wrong' })
    }
  }

  return (
    <div className={`${PFX}-wrap w-full min-h-[100vh] flex items-center justify-center p-6`} style={bgStyle}>
      {/* Scoped styles for the burst animation */}
      <style>{`
        .${PFX}-btn { transform: translateZ(0); }
        .${PFX}-btn:active { transform: translateZ(0) scale(0.98); }
        .${PFX}-burst {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .${PFX}-particle {
          position: absolute;
          left: 0; top: 0;
          border-radius: 9999px;
          will-change: transform, opacity;
          animation: ${PFX}-explode var(--dur) cubic-bezier(.21,1,.29,1) var(--delay) forwards;
          box-shadow: 0 0 12px currentColor;
        }
        @keyframes ${PFX}-explode {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          60% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(180deg) scale(0.7); }
        }
        /* subtle ripples */
        .${PFX}-ripple {
          position: absolute; inset: 0; border-radius: 1rem; pointer-events: none; overflow: hidden;
        }
        .${PFX}-ripple::after {
          content: '';
          position: absolute; inset: -20%; border-radius: inherit;
          background: radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%);
          opacity: 0; animation: ${PFX}-ripple 800ms ease-out var(--delay, 0ms) forwards;
        }
        @keyframes ${PFX}-ripple { 0% { opacity: 0; } 25% { opacity: .6; } 100% { opacity: 0; } }
      `}</style>

      <div className={`${PFX}-card w-full max-w-xl relative overflow-hidden rounded-[1.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]`}>
        <div className={`${PFX}-header relative h-28 flex items-center justify-center`}
             style={{
               background: 'linear-gradient(180deg, rgba(0,0,82,1) 0%, rgba(0,0,82,0.65) 100%)',
             }}>
          <img
            src="https://togetherlearning.com/assets/logo/TLC-Star-White.png"
            alt="Together Learning"
            className="h-10 opacity-90"
          />
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-4" style={{ color: '#000052' }}>
            Contact Together Learning
          </h2>
          <p className="text-slate-600 text-sm mb-6">We usually respond within 1–2 business days.</p>

          {/* Animated inputs */}
          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.id} className={`${PFX}-field group relative`}
                   style={{
                     '--accent': '#27FF00',
                     '--accent2': '#449ddd',
                   }}>
                <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                     style={{
                       background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                       filter: 'blur(10px)',
                     }} />
                <div className="relative rounded-2xl bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-[#27FF00] transition-all">
                  <label htmlFor={`${PFX}-${f.id}`} className="absolute -top-2 left-3 px-2 text-[11px] font-medium"
                         style={{ backgroundColor: '#ffffff', color: '#000052' }}>{f.label}</label>
                  {f.type !== 'textarea' ? (
                    <input
                      id={`${PFX}-${f.id}`}
                      type={f.type}
                      placeholder={f.placeholder}
                      required
                      value={form[f.id]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.id]: e.target.value }))}
                      className="w-full rounded-2xl bg-transparent px-4 py-3 text-slate-900 placeholder-slate-400 outline-none"
                      style={{ fontFamily: 'Leon Sans, system-ui, sans-serif' }}
                    />
                  ) : (
                    <textarea
                      id={`${PFX}-${f.id}`}
                      placeholder={f.placeholder}
                      required
                      rows={5}
                      value={form[f.id]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.id]: e.target.value }))}
                      className="w-full rounded-2xl bg-transparent px-4 py-3 text-slate-900 placeholder-slate-400 outline-none resize-y"
                      style={{ fontFamily: 'Leon Sans, system-ui, sans-serif' }}
                    />
                  )}

                  {/* bottom glow underline */}
                  <div className="pointer-events-none absolute left-4 right-4 bottom-2 h-px opacity-0 group-focus-within:opacity-100 transition-opacity"
                       style={{ background: 'linear-gradient(90deg, #27FF00, #33eebb, #449ddd)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="mt-4 h-6 text-sm">
            {status.state === 'loading' && (
              <span className="text-slate-500">Sending…</span>
            )}
            {status.state === 'success' && (
              <span className="text-green-600">{status.message}</span>
            )}
            {status.state === 'error' && (
              <span className="text-red-600">{status.message}</span>
            )}
          </div>

          {/* Submit */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <img src="https://togetherlearning.com/assets/logo/favicon3.png" alt="TLC" className="h-4 w-4" />
              <span>We send to hello@togetherlearning.com</span>
            </div>
            <button
              type="submit"
              className={`${PFX}-btn relative inline-flex items-center px-5 py-3 rounded-2xl font-semibold text-white shadow-lg overflow-hidden active:scale-[0.98] transition-transform`}
              style={{ background: 'linear-gradient(135deg, #27FF00, #449ddd)' }}
              disabled={status.state === 'loading'}
            >
              {/* Ripples on burst */}
              <span className={`${PFX}-ripple`} style={{ '--delay': '60ms' }} />

              <span className="relative z-10">{status.state === 'loading' ? 'Sending…' : 'Send message'}</span>
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'radial-gradient(60% 220% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)' }} />

              {/* Particle burst layer */}
              <span key={burstKey} className={`${PFX}-burst`} aria-hidden>
                {particles.map((p) => (
                  <span
                    key={p.id}
                    className={`${PFX}-particle`}
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      background: p.color,
                      color: p.color,
                      '--dx': `${p.dx}px`,
                      '--dy': `${p.dy}px`,
                      '--dur': `${p.dur}ms`,
                      '--delay': `${p.delay}ms`,
                      transform: 'translate(-50%, -50%)',
                      rotate: `${p.rotate}deg`,
                    }}
                  />
                ))}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
