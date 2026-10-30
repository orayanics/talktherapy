import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/* ---------- types ---------- */
export type CheckIn = 'independent' | 'helped' | 'again'
export interface WordResult {
  word: string
  stars: 0 | 1 | 2 | 3 // recording, finished playback, optional check-in
  attempts: number
  replayed: boolean
  checkIn: CheckIn | null
  skipped: boolean
}

/* ---------- motion preference ---------- */
export function useCalmMotion(userCalm: boolean): boolean {
  const [os, setOs] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setOs(q.matches)
    on()
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return os || userCalm
}

/* ---------- styles (scoped by .tt-) ---------- */
const CSS = `@media(prefers-reduced-motion:reduce){.tt-root *, .tt-root *::after{animation:none!important;transition:none!important}}
.tt-calm *, .tt-calm *::after{animation:none!important;transition:none!important}
.tt-path{overflow-x:auto}.tt-card li{flex-wrap:wrap}.tt-root button:disabled{opacity:.6;cursor:default}
.tt-root{--ink:#1d2b3a;--paper:#fffaf0;--leaf:#2fa36b;--leaf-d:#1f7a4f;--sun:#ffc23d;--sun-d:#d89a12;
--berry:#e2455f;--berry-d:#b02e45;--sky:#2f7fe0;--sky-d:#1f5cac;--plum:#7a4fd6;--plum-d:#5a37a8;--line:#e3d9c3;
font-family:"Baloo 2","Nunito","Trebuchet MS",system-ui,sans-serif;color:var(--ink)}
.tt-root *{box-sizing:border-box}
.tt-btn{min-height:48px;min-width:48px;padding:10px 20px;border:0;border-radius:16px;font:inherit;font-weight:800;font-size:1.05rem;
color:#fff;background:var(--leaf-d);box-shadow:0 5px 0 var(--leaf-d);cursor:pointer;transition:transform .08s,box-shadow .08s}
.tt-btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--leaf-d)}
.tt-btn.alt{background:#fff;color:var(--ink);box-shadow:0 5px 0 var(--line);border:2px solid var(--line)}
.tt-btn.alt:active{box-shadow:0 1px 0 var(--line)}
.tt-root :focus-visible{outline:4px solid var(--ink);outline-offset:3px}
.tt-calm .tt-btn{transition:none}
.tt-calm .tt-btn:active,.tt-calm .tt-key:active{transform:none}
@media(prefers-reduced-motion:reduce){.tt-btn:active,.tt-key:active{transform:none}}
.tt-bar{height:18px;border-radius:99px;background:#eadfc6;overflow:hidden}
.tt-bar>i{display:block;height:100%;background:var(--leaf);border-radius:99px;transition:width .4s ease;position:relative}
.tt-bar>i::after{content:"";position:absolute;left:8px;right:8px;top:4px;height:4px;border-radius:4px;background:rgba(255,255,255,.35)}
.tt-calm .tt-bar>i{transition:none}
.tt-path{display:flex;align-items:center;list-style:none;margin:0;padding:0;gap:0}
.tt-path li{display:flex;align-items:center;flex:1}
.tt-path li:last-child{flex:0}
.tt-node{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-weight:800;border:3px solid var(--line);background:#fff;flex:none}
.tt-node.done{background:var(--sun);border-color:var(--sun-d)}
.tt-node.skip{background:#f1ece0;border-style:dashed}
.tt-node.now{background:var(--leaf);border-color:var(--leaf-d);color:#fff;box-shadow:0 0 0 5px rgba(47,163,107,.25)}
.tt-link{flex:1;height:6px;background:var(--line);margin:0 4px;border-radius:4px}
.tt-link.on{background:var(--sun-d)}
.tt-stars{display:inline-flex;gap:4px}
.tt-star{width:34px;height:34px}
.tt-star path{fill:#eadfc6;stroke:#d5c9ae;stroke-width:2;stroke-linejoin:round}
.tt-star.on path{fill:var(--sun);stroke:var(--sun-d)}
.tt-star.pop{animation:tt-pop .45s ease}
.tt-calm .tt-star.pop{animation:none}
@keyframes tt-pop{0%{transform:scale(.6)}60%{transform:scale(1.25) rotate(-8deg)}100%{transform:scale(1)}}
.tt-keys{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:480px){.tt-keys{grid-template-columns:1fr}}
.tt-key{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 16px;border:0;border-radius:14px;color:#fff;
font:inherit;font-weight:800;font-size:1.1rem;text-align:left;cursor:pointer;transition:transform .08s,box-shadow .08s}
.tt-key svg{width:30px;height:30px;flex:none;fill:#fff}
.tt-key[aria-pressed=true]{outline:4px solid var(--ink);outline-offset:2px}
.tt-key:active{transform:translateY(4px)}
.tt-k1{background:var(--berry-d);box-shadow:0 5px 0 #882237}.tt-k1:active{box-shadow:0 1px 0 var(--berry-d)}
.tt-k2{background:var(--sky-d);box-shadow:0 5px 0 #174680}.tt-k2:active{box-shadow:0 1px 0 var(--sky-d)}
.tt-k3{background:var(--sun);color:var(--ink);box-shadow:0 5px 0 var(--sun-d)}.tt-k3 svg{fill:var(--ink)}.tt-k3:active{box-shadow:0 1px 0 var(--sun-d)}
.tt-k4{background:var(--plum);box-shadow:0 5px 0 var(--plum-d)}.tt-k4:active{box-shadow:0 1px 0 var(--plum-d)}
.tt-ready{display:grid;place-items:center;gap:12px;text-align:center;padding:32px 16px;border-radius:24px;background:var(--plum);color:#fff}
.tt-count{font-size:6rem;line-height:1;font-weight:800}
.tt-count.tick{animation:tt-tick .9s ease both}
.tt-calm .tt-count.tick{animation:none}
@keyframes tt-tick{0%{transform:scale(1.6);opacity:0}25%{opacity:1}100%{transform:scale(1)}}
.tt-pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;margin:16px 0}
.tt-pod>div{flex:1;max-width:140px;text-align:center}
.tt-block{border-radius:14px 14px 0 0;display:grid;place-items:start center;padding-top:8px;font-size:1.8rem;font-weight:800;color:#fff;
transform-origin:bottom;animation:tt-rise .6s ease both}
.tt-calm .tt-block{animation:none}
@keyframes tt-rise{from{transform:scaleY(.1)}to{transform:scaleY(1)}}
.tt-gold{background:var(--sun-d);color:var(--ink)}.tt-silver{background:#8e9aa8;color:var(--ink)}.tt-bronze{background:#985b32}
.tt-card{background:var(--paper);border:2px solid var(--line);border-radius:24px;padding:20px}
.tt-conf{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.tt-conf i{position:absolute;top:-12px;width:10px;height:16px;border-radius:3px;animation:tt-fall 2.4s ease-in forwards}
@keyframes tt-fall{to{transform:translateY(420px) rotate(540deg);opacity:0}}
.tt-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`

export function RewardStyles() {
  return (
    <>
      <style>{CSS}</style>
      {/* consumers wrap the round in <div className={`tt-root ${calm ? "tt-calm" : ""}`}> */}
    </>
  )
}

export function Root({
  calm,
  children,
}: {
  calm: boolean
  children: ReactNode
}) {
  return (
    <div className={`tt-root${calm ? ' tt-calm' : ''}`}>
      <RewardStyles />
      {children}
    </div>
  )
}

/* ---------- Tala the star companion (original art) ---------- */
export function Tala({
  mood = 'idle',
  size = 72,
}: {
  mood?: 'idle' | 'cheer' | 'rest'
  size?: number
}) {
  const mouth =
    mood === 'cheer'
      ? 'M32 52 Q40 62 48 52 Z'
      : mood === 'rest'
        ? 'M34 55 H46'
        : 'M33 53 Q40 59 47 53'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      role="img"
      aria-label="Tala, your star helper"
    >
      <path
        d="M40 6 L49 28 L73 30 L55 46 L61 70 L40 57 L19 70 L25 46 L7 30 L31 28 Z"
        fill="#ffc23d"
        stroke="#d89a12"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="40" r="3.5" fill="#1d2b3a" />
      <circle cx="48" cy="40" r="3.5" fill="#1d2b3a" />
      <path
        d={mouth}
        fill={mood === 'cheer' ? '#1d2b3a' : 'none'}
        stroke="#1d2b3a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---------- three-slot star meter (practice stars) ---------- */
export function StarMeter({
  stars,
  justEarned,
}: {
  stars: number
  justEarned?: number
}) {
  return (
    <span
      className="tt-stars"
      role="img"
      aria-label={`${stars} of 3 practice stars`}
    >
      {[1, 2, 3].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`tt-star${n <= stars ? ' on' : ''}${n === justEarned ? ' pop' : ''}`}
          aria-hidden="true"
        >
          <path d="M12 2l3 6.6 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.2l1.5-7L2 9.4l7-.8z" />
        </svg>
      ))}
    </span>
  )
}

/* ---------- Duolingo-style path + progress ---------- */
export function RoundPath({
  results,
  current,
  total = 5,
}: {
  results: (WordResult | undefined)[]
  current: number
  total?: number
}) {
  const pct =
    total > 0 ? Math.round((results.filter(Boolean).length / total) * 100) : 0
  return (
    <div>
      <div
        className="tt-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(results.filter(Boolean).length, total)}
        aria-label="Round progress (words visited)"
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      <ol
        className="tt-path"
        style={{ marginTop: 12 }}
        aria-label="Words in this round"
      >
        {Array.from({ length: total }, (_, i) => {
          const r = results[i]
          const state = r
            ? r.skipped
              ? 'skip'
              : 'done'
            : i === current
              ? 'now'
              : ''
          return (
            <li key={i}>
              <span
                className={`tt-node ${state}`}
                aria-current={i === current ? 'step' : undefined}
                aria-label={`Word ${i + 1}: ${state === 'done' ? 'tried' : state === 'skip' ? 'skipped' : state === 'now' ? 'current' : 'not yet'}`}
              >
                {state === 'done' ? '★' : state === 'skip' ? '–' : i + 1}
                <span className="tt-vh">
                  {state === 'done'
                    ? ' done'
                    : state === 'skip'
                      ? ' skipped'
                      : state === 'now'
                        ? ' current'
                        : ' not yet'}
                </span>
              </span>
              {i < total - 1 && <span className={`tt-link${r ? ' on' : ''}`} />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- Kahoot-style shape keys for the self/helper check-in ---------- */
const SHAPES: Record<string, ReactNode> = {
  tri: <path d="M12 3 22 21H2z" />,
  dia: <path d="M12 2 22 12 12 22 2 12z" />,
  cir: <circle cx="12" cy="12" r="10" />,
  sq: <rect x="3" y="3" width="18" height="18" rx="2" />,
}
const KEYS: {
  id: CheckIn | 'skip'
  label: string
  hint: string
  cls: string
  shape: keyof typeof SHAPES
}[] = [
  {
    id: 'independent',
    label: 'I said it',
    hint: 'on my own',
    cls: 'tt-k1',
    shape: 'tri',
  },
  {
    id: 'helped',
    label: 'We said it',
    hint: 'with help',
    cls: 'tt-k2',
    shape: 'dia',
  },
  {
    id: 'again',
    label: 'Another go',
    hint: 'try once more',
    cls: 'tt-k3',
    shape: 'cir',
  },
  {
    id: 'skip',
    label: 'Skip this one',
    hint: 'no stars lost',
    cls: 'tt-k4',
    shape: 'sq',
  },
]
export function CheckInKeys({
  value,
  onPick,
  disabled = false,
}: {
  value: CheckIn | 'skip' | null
  onPick: (v: CheckIn | 'skip') => void
  disabled?: boolean
}) {
  return (
    <div
      role="group"
      onKeyDown={(event) => {
        const key = KEYS.find((_, index) => String(index + 1) === event.key)
        if (
          key &&
          !disabled &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          event.preventDefault()
          onPick(key.id)
        }
      }}
      aria-label="How did that go? This is your own report, not a score."
    >
      <div className="tt-keys">
        {KEYS.map((k, i) => (
          <button
            key={k.id}
            type="button"
            disabled={disabled}
            className={`tt-key ${k.cls}`}
            aria-pressed={value === k.id}
            aria-keyshortcuts={String(i + 1)}
            onClick={() => onPick(k.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {SHAPES[k.shape]}
            </svg>
            <span>
              {k.label}
              <small
                style={{ display: 'block', fontWeight: 600, opacity: 0.9 }}
              >
                {k.hint}
              </small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Kahoot-style "Ready?" lobby (optional, skippable, never penalises) ---------- */
export function ReadyCountdown({
  calm,
  onGo,
  from = 3,
}: {
  calm: boolean
  onGo: () => void
  from?: number
}) {
  const [n, setN] = useState(from)
  const done = useRef(false)
  useEffect(() => {
    if (calm || done.current) return // calm mode: no auto-advance, child taps Go
    if (n <= 0) {
      done.current = true
      onGo()
      return
    }
    const t = setTimeout(() => setN((x) => x - 1), 900)
    return () => clearTimeout(t)
  }, [n, calm, onGo])
  return (
    <section className="tt-ready" aria-live="polite" aria-label="Get ready">
      <Tala mood="cheer" size={84} />
      <p style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem' }}>
        Ready for your words?
      </p>
      {!calm && n > 0 && (
        <div key={n} className="tt-count tick" aria-hidden="true">
          {n}
        </div>
      )}
      <button
        type="button"
        className="tt-btn"
        style={{
          background: '#fff',
          color: 'var(--plum-d)',
          boxShadow: '0 5px 0 #d9ccf5',
        }}
        onClick={() => {
          if (!done.current) {
            done.current = true
            onGo()
          }
        }}
      >
        {calm ? 'Start' : 'Start now'}
      </button>
    </section>
  )
}

/* ---------- confetti (disabled when calm) ---------- */
export function Confetti({ calm }: { calm: boolean }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 7) * 0.12,
        color: ['#ffc23d', '#e2455f', '#2f7fe0', '#2fa36b', '#7a4fd6'][i % 5],
      })),
    [],
  )
  if (calm) return null
  return (
    <div className="tt-conf" aria-hidden="true">
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            left: `${b.left}%`,
            background: b.color,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ---------- end-of-round: personal podium of practice badges + recap ---------- */
export function RoundRecap({
  results,
  calm,
  onRetryWord,
  onAgain,
  onDone,
}: {
  results: WordResult[]
  calm: boolean
  onRetryWord: (index: number) => void
  onAgain: () => void
  onDone: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  const totalStars = results.reduce((s, r) => s + r.stars, 0)
  const tried = results.filter((r) => r.attempts > 0).length
  const listened = results.filter((r) => r.replayed).length
  const shared = results.filter((r) => r.checkIn !== null).length

  // A podium of YOUR three activities, ranked by count. Not a ranking of people, not a skill ranking.
  const podium = [
    { label: 'Words tried', n: tried },
    { label: 'Listened back', n: listened },
    { label: 'Check-ins shared', n: shared },
  ].sort((a, b) => b.n - a.n)
  const order = [podium[1], podium[0], podium[2]] // silver, gold, bronze
  const cls = ['tt-silver', 'tt-gold', 'tt-bronze']
  const medal = ['2', '1', '3']
  const height = (n: number) => 60 + n * 22

  return (
    <section
      className="tt-card"
      style={{ position: 'relative' }}
      aria-labelledby="tt-recap-h"
    >
      <Confetti calm={calm} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Tala mood="cheer" />
        <div>
          <h2
            ref={heading}
            id="tt-recap-h"
            style={{ margin: 0, fontSize: '1.6rem' }}
            tabIndex={-1}
          >
            Round complete!
          </h2>
          <p style={{ margin: 0 }}>
            You collected <strong>{totalStars}</strong> practice{' '}
            {totalStars === 1 ? 'star' : 'stars'}.
          </p>
        </div>
      </div>

      <div
        className="tt-pod"
        role="img"
        aria-label={`Your practice podium: ${podium.map((p) => `${p.label} ${p.n}`).join(', ')}`}
      >
        {order.map((p, i) => (
          <div key={p.label}>
            <div style={{ fontWeight: 700, fontSize: '.9rem', minHeight: 40 }}>
              {p.label}
            </div>
            <div
              className={`tt-block ${cls[i]}`}
              style={{ height: height(p.n), animationDelay: `${i * 0.12}s` }}
            >
              {p.n}
              <span className="tt-vh"> (place {medal[i]})</span>
            </div>
          </div>
        ))}
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: '0 0 16px',
          padding: 0,
          display: 'grid',
          gap: 8,
        }}
      >
        {results.map((r, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: '#fff',
              borderRadius: 14,
              border: '2px solid var(--line)',
            }}
          >
            <strong style={{ flex: 1 }}>{r.word}</strong>
            {r.skipped ? <em>Skipped</em> : <StarMeter stars={r.stars} />}
            <button
              type="button"
              className="tt-btn alt"
              style={{ padding: '6px 14px' }}
              onClick={() => onRetryWord(i)}
              aria-label={`Try ${r.word} again`}
            >
              Again
            </button>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '.9rem', margin: '0 0 16px' }}>
        Stars show practice you did. They are not a speech score. Ask your
        helper or therapist how it went.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" className="tt-btn" onClick={onAgain}>
          New round
        </button>
        <button type="button" className="tt-btn alt" onClick={onDone}>
          Take a break
        </button>
      </div>
    </section>
  )
}
