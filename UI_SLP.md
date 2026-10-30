/\*\*

- PracticeRewards.tsx — presentational reward / game-feel layer for the TalkTherapy practice round.
- Suggested location: client/src/modules/slp/components/PracticeRewards.tsx
-
- Inspiration (patterns only, no assets): Duolingo — guided path, chunky 3D buttons, progress bar,
- mascot cheer, end-of-lesson recap. Kahoot — four bold colour+shape answer keys, "Ready?" lobby
- countdown, end-of-game podium.
-
- Rules carried over from the plan (do not relax without SLP review):
- - Rewards are for PARTICIPATION only. Nothing here reads a phoneme/accuracy score.
- - No lives, energy, lost streaks, rankings against other people, timers that penalise, or sounds on "miss".
- - Check-ins are self/helper reports, never correctness.
- - Every colour cue is paired with a shape AND a text label. Targets >= 48px. Visible focus.
- - prefers-reduced-motion and an in-app "calm" toggle disable all non-essential animation.
- - State is props-only: nothing is stored, no recordings are referenced.
    \*/
    import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/_ ---------- types ---------- _/
export type CheckIn = "independent" | "helped" | "again";
export interface WordResult {
word: string;
stars: 0 | 1 | 2 | 3; // recording, finished playback, optional check-in
attempts: number;
replayed: boolean;
checkIn: CheckIn | null;
skipped: boolean;
}

/_ ---------- motion preference ---------- _/
export function useCalmMotion(userCalm: boolean): boolean {
const [os, setOs] = useState(false);
useEffect(() => {
const q = window.matchMedia("(prefers-reduced-motion: reduce)");
const on = () => setOs(q.matches);
on();
q.addEventListener("change", on);
return () => q.removeEventListener("change", on);
}, []);
return os || userCalm;
}

/_ ---------- styles (scoped by .tt-) ---------- _/
const CSS = `.tt-root{--ink:#1d2b3a;--paper:#fffaf0;--leaf:#2fa36b;--leaf-d:#1f7a4f;--sun:#ffc23d;--sun-d:#d89a12;
--berry:#e2455f;--berry-d:#b02e45;--sky:#2f7fe0;--sky-d:#1f5cac;--plum:#7a4fd6;--plum-d:#5a37a8;--line:#e3d9c3;
font-family:"Baloo 2","Nunito","Trebuchet MS",system-ui,sans-serif;color:var(--ink)}
.tt-root *{box-sizing:border-box}
.tt-btn{min-height:48px;min-width:48px;padding:10px 20px;border:0;border-radius:16px;font:inherit;font-weight:800;font-size:1.05rem;
color:#fff;background:var(--leaf);box-shadow:0 5px 0 var(--leaf-d);cursor:pointer;transition:transform .08s,box-shadow .08s}
.tt-btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--leaf-d)}
.tt-btn.alt{background:#fff;color:var(--ink);box-shadow:0 5px 0 var(--line);border:2px solid var(--line)}
.tt-btn.alt:active{box-shadow:0 1px 0 var(--line)}
.tt-root :focus-visible{outline:4px solid var(--ink);outline-offset:3px}
.tt-calm .tt-btn{transition:none}
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
.tt-k1{background:var(--berry);box-shadow:0 5px 0 var(--berry-d)}.tt-k1:active{box-shadow:0 1px 0 var(--berry-d)}
.tt-k2{background:var(--sky);box-shadow:0 5px 0 var(--sky-d)}.tt-k2:active{box-shadow:0 1px 0 var(--sky-d)}
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
.tt-gold{background:var(--sun-d)}.tt-silver{background:#8e9aa8}.tt-bronze{background:#b9774a}
.tt-card{background:var(--paper);border:2px solid var(--line);border-radius:24px;padding:20px}
.tt-conf{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.tt-conf i{position:absolute;top:-12px;width:10px;height:16px;border-radius:3px;animation:tt-fall 2.4s ease-in forwards}
@keyframes tt-fall{to{transform:translateY(420px) rotate(540deg);opacity:0}}
.tt-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

export function RewardStyles({ calm }: { calm: boolean }) {
return (
<>
<style>{CSS}</style>
{/_ consumers wrap the round in <div className={`tt-root ${calm ? "tt-calm" : ""}`}> _/}
</>
);
}

export function Root({ calm, children }: { calm: boolean; children: ReactNode }) {
return (
<div className={`tt-root${calm ? " tt-calm" : ""}`}>
<RewardStyles calm={calm} />
{children}
</div>
);
}

/_ ---------- Tala the star companion (original art) ---------- _/
export function Tala({ mood = "idle", size = 72 }: { mood?: "idle" | "cheer" | "rest"; size?: number }) {
const mouth = mood === "cheer" ? "M32 52 Q40 62 48 52 Z" : mood === "rest" ? "M34 55 H46" : "M33 53 Q40 59 47 53";
return (
<svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Tala, your star helper">
<path d="M40 6 L49 28 L73 30 L55 46 L61 70 L40 57 L19 70 L25 46 L7 30 L31 28 Z" fill="#ffc23d" stroke="#d89a12" strokeWidth="3" strokeLinejoin="round" />
<circle cx="32" cy="40" r="3.5" fill="#1d2b3a" />
<circle cx="48" cy="40" r="3.5" fill="#1d2b3a" />
<path d={mouth} fill={mood === "cheer" ? "#1d2b3a" : "none"} stroke="#1d2b3a" strokeWidth="3" strokeLinecap="round" />
</svg>
);
}

/_ ---------- three-slot star meter (practice stars) ---------- _/
export function StarMeter({ stars, justEarned }: { stars: number; justEarned?: number }) {
return (
<span className="tt-stars" role="img" aria-label={`${stars} of 3 practice stars`}>
{[1, 2, 3].map((n) => (
<svg key={n} viewBox="0 0 24 24" className={`tt-star${n <= stars ? " on" : ""}${n === justEarned ? " pop" : ""}`} aria-hidden="true">
<path d="M12 2l3 6.6 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.2l1.5-7L2 9.4l7-.8z" />
</svg>
))}
</span>
);
}

/_ ---------- Duolingo-style path + progress ---------- _/
export function RoundPath({ results, current, total = 5 }: { results: WordResult[]; current: number; total?: number }) {
const pct = Math.round((Math.min(results.length, total) / total) \* 100);
return (
<div>
<div className="tt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(results.length, total)} aria-label="Round progress (words visited)">
<i style={{ width: `${pct}%` }} />
</div>
<ol className="tt-path" style={{ marginTop: 12 }} aria-label="Words in this round">
{Array.from({ length: total }, (\_, i) => {
const r = results[i];
const state = r ? (r.skipped ? "skip" : "done") : i === current ? "now" : "";
return (
<li key={i}>
<span className={`tt-node ${state}`} aria-current={state === "now" ? "step" : undefined}>
{state === "done" ? "★" : state === "skip" ? "–" : i + 1}
<span className="tt-vh">{state === "done" ? " done" : state === "skip" ? " skipped" : state === "now" ? " current" : " not yet"}</span>
</span>
{i < total - 1 && <span className={`tt-link${r ? " on" : ""}`} />}
</li>
);
})}
</ol>
</div>
);
}

/_ ---------- Kahoot-style shape keys for the self/helper check-in ---------- _/
const SHAPES: Record<string, ReactNode> = {
tri: <path d="M12 3 22 21H2z" />,
dia: <path d="M12 2 22 12 12 22 2 12z" />,
cir: <circle cx="12" cy="12" r="10" />,
sq: <rect x="3" y="3" width="18" height="18" rx="2" />,
};
const KEYS: { id: CheckIn | "skip"; label: string; hint: string; cls: string; shape: keyof typeof SHAPES }[] = [
{ id: "independent", label: "I said it", hint: "on my own", cls: "tt-k1", shape: "tri" },
{ id: "helped", label: "We said it", hint: "with help", cls: "tt-k2", shape: "dia" },
{ id: "again", label: "Another go", hint: "try once more", cls: "tt-k3", shape: "cir" },
{ id: "skip", label: "Skip this one", hint: "no stars lost", cls: "tt-k4", shape: "sq" },
];
export function CheckInKeys({ value, onPick }: { value: CheckIn | "skip" | null; onPick: (v: CheckIn | "skip") => void }) {
return (
<div role="group" aria-label="How did that go? This is your own report, not a score.">
<div className="tt-keys">
{KEYS.map((k, i) => (
<button
key={k.id}
type="button"
className={`tt-key ${k.cls}`}
aria-pressed={value === k.id}
aria-keyshortcuts={String(i + 1)}
onClick={() => onPick(k.id)} >
<svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[k.shape]}</svg>
<span>
{k.label}
<small style={{ display: "block", fontWeight: 600, opacity: 0.9 }}>{k.hint}</small>
</span>
</button>
))}
</div>
</div>
);
}

/_ ---------- Kahoot-style "Ready?" lobby (optional, skippable, never penalises) ---------- _/
export function ReadyCountdown({ calm, onGo, from = 3 }: { calm: boolean; onGo: () => void; from?: number }) {
const [n, setN] = useState(from);
const done = useRef(false);
useEffect(() => {
if (calm) return; // calm mode: no auto-advance, child taps Go
if (n <= 0) {
if (!done.current) { done.current = true; onGo(); }
return;
}
const t = setTimeout(() => setN((x) => x - 1), 900);
return () => clearTimeout(t);
}, [n, calm, onGo]);
return (
<section className="tt-ready" aria-live="polite" aria-label="Get ready">
<Tala mood="cheer" size={84} />
<p style={{ margin: 0, fontWeight: 800, fontSize: "1.4rem" }}>Ready for your words?</p>
{!calm && n > 0 && <div key={n} className="tt-count tick" aria-hidden="true">{n}</div>}
<button type="button" className="tt-btn" style={{ background: "#fff", color: "var(--plum-d)", boxShadow: "0 5px 0 #d9ccf5" }} onClick={() => { done.current = true; onGo(); }}>
{calm ? "Start" : "Start now"}
</button>
</section>
);
}

/_ ---------- confetti (disabled when calm) ---------- _/
export function Confetti({ calm }: { calm: boolean }) {
const bits = useMemo(
() => Array.from({ length: 26 }, (\_, i) => ({
left: (i _ 37) % 100, delay: (i % 7) _ 0.12,
color: ["#ffc23d", "#e2455f", "#2f7fe0", "#2fa36b", "#7a4fd6"][i % 5],
})),
[],
);
if (calm) return null;
return (
<div className="tt-conf" aria-hidden="true">
{bits.map((b, i) => (
<i key={i} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s` }} />
))}
</div>
);
}

/_ ---------- end-of-round: personal podium of practice badges + recap ---------- _/
export function RoundRecap({
results, calm, onRetryWord, onAgain, onDone,
}: {
results: WordResult[]; calm: boolean;
onRetryWord: (index: number) => void; onAgain: () => void; onDone: () => void;
}) {
const totalStars = results.reduce((s, r) => s + r.stars, 0);
const tried = results.filter((r) => r.attempts > 0).length;
const listened = results.filter((r) => r.replayed).length;
const shared = results.filter((r) => r.checkIn === "independent" || r.checkIn === "helped").length;

// A podium of YOUR three activities, ranked by count. Not a ranking of people, not a skill ranking.
const podium = [
{ label: "Words tried", n: tried },
{ label: "Listened back", n: listened },
{ label: "Check-ins shared", n: shared },
].sort((a, b) => b.n - a.n);
const order = [podium[1], podium[0], podium[2]]; // silver, gold, bronze
const cls = ["tt-silver", "tt-gold", "tt-bronze"];
const medal = ["2", "1", "3"];
const height = (n: number) => 60 + n \* 22;

return (
<section className="tt-card" style={{ position: "relative" }} aria-labelledby="tt-recap-h">
<Confetti calm={calm} />
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<Tala mood="cheer" />
<div>
<h2 id="tt-recap-h" style={{ margin: 0, fontSize: "1.6rem" }} tabIndex={-1}>Round complete!</h2>
<p style={{ margin: 0 }}>
You collected <strong>{totalStars}</strong> practice {totalStars === 1 ? "star" : "stars"}.
</p>
</div>
</div>

      <div className="tt-pod" role="img" aria-label={`Your practice podium: ${podium.map((p) => `${p.label} ${p.n}`).join(", ")}`}>
        {order.map((p, i) => (
          <div key={p.label}>
            <div style={{ fontWeight: 700, fontSize: ".9rem", minHeight: 40 }}>{p.label}</div>
            <div className={`tt-block ${cls[i]}`} style={{ height: height(p.n), animationDelay: `${i * 0.12}s` }}>
              {p.n}
              <span className="tt-vh"> (place {medal[i]})</span>
            </div>
          </div>
        ))}
      </div>

      <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0, display: "grid", gap: 8 }}>
        {results.map((r, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fff", borderRadius: 14, border: "2px solid var(--line)" }}>
            <strong style={{ flex: 1 }}>{r.word}</strong>
            {r.skipped ? <em>Skipped</em> : <StarMeter stars={r.stars} />}
            <button type="button" className="tt-btn alt" style={{ padding: "6px 14px" }} onClick={() => onRetryWord(i)} aria-label={`Try ${r.word} again`}>
              Again
            </button>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: ".9rem", margin: "0 0 16px" }}>
        Stars show practice you did. They are not a speech score. Ask your helper or therapist how it went.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="tt-btn" onClick={onAgain}>New round</button>
        <button type="button" className="tt-btn alt" onClick={onDone}>Take a break</button>
      </div>
    </section>

);
}

/_ ---------- wiring example (inside your existing round component) ----------
const calm = useCalmMotion(settings.calm);
<Root calm={calm}>
{phase === "lobby" && <ReadyCountdown calm={calm} onGo={() => setPhase("word")} />}
{phase === "word" && (
<>
<RoundPath results={results} current={index} />
<StarMeter stars={word.stars} justEarned={lastEarned} />
...picture + existing recorder...
{phase === "feedback" && <CheckInKeys value={word.checkIn} onPick={handlePick} />}
</>
)}
{phase === "summary" && <RoundRecap results={results} calm={calm} ... />}
</Root>
Keyboard: wire keys 1–4 to CheckInKeys (aria-keyshortcuts is already declared). Move focus to the
feedback heading on arrival and to #tt-recap-h on the summary (both tabIndex={-1}).
------------------------------------------------------------------------- _/

I wrote `PracticeRewards.tsx`, a presentational component layer for the practice round. I haven't run it, typechecked it, or tested it in a browser, so expect small fixes when it meets your real types and state.

**From Duolingo**

- `RoundPath` is a five-node path with a progress bar. It uses done, skipped and current states and labels each node for screen readers.
- Chunky 3D buttons have a press-down effect.
- `StarMeter` shows up to three practice stars: recording, finished playback, and the optional check-in. A newly earned star pops.
- `Tala` is an original star companion with idle, cheer and rest moods.
- `RoundRecap` is a round-complete screen with a per-word recap and an "Again" button for each word.

**From Kahoot**

- `CheckInKeys` is a four-key answer pad: **I said it** (red triangle), **We said it** (blue diamond), **Another go** (yellow circle) and **Skip this one** (purple square). It is a self/helper report, not a correctness answer. Shape, colour and text all carry the meaning, and keys 1–4 are declared as shortcuts.
- `ReadyCountdown` is a "Ready?" lobby with a 3-2-1. Calm mode turns the countdown off and waits for a tap, and Start is always available.
- `RoundRecap` includes a personal podium of your own three activities: words tried, listened back and check-ins shared. It ranks activities, not people or accuracy.
- `Confetti` plays on the recap and is disabled in calm mode.

**Plan constraints I kept**

- Nothing reads a phoneme or accuracy score. Rewards are for participation only.
- There are no lives, energy, lost streaks, leaderboards or penalty sounds. Skipping costs no stars.
- Targets are at least 48px with visible focus. Calm mode comes from either the OS reduced-motion setting or your in-app toggle (`useCalmMotion`).
- Everything is driven by props, so there is no storage and no recording references.
- The recap says plainly that stars are practice, not a speech score.

**Integration**

- Wrap the round in `<Root calm={calm}>`.
- Map your existing round state to `WordResult[]`.
- Feed your current handlers into `onPick`, `onRetryWord` and `onAgain`. The wiring example at the bottom of the file shows the shape.
- Styles are scoped under `.tt-` and injected through `<style>`. I assumed your existing CSS setup doesn't conflict.
- The font stack falls back to Nunito and Trebuchet, so swap in your TalkTherapy theme tokens as needed.

The "Tried / Listened / Shared" podium and the Kahoot-style lobby are interaction hypotheses to try with children and caregivers. Neither is evidence-backed.
