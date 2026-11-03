// S4 — "قُلها فقط": the voice wakes the field. Fireflies bend along bezier arcs into a glass jar;
// every arrival frame is shared by the jar-glow surge, the ripple at the mouth and the glass "tink"
// (orb-flyline-relay resonance: atmosphere and event on the SAME frame). Voice pill follows the
// voice-waveform-live grammar (64 bars, scroll from the right, speak/pause envelope).
import React from 'react';
import { C, FONT } from '../tokens';
import { EASE, bez3, mix, ramp, rgba, mulberry32, noise1, Pt } from '../lib/anim';
import { FireflyBug, Glow, Mote } from '../lib/fx';

export const JAR_DUR = 90;
export const JAR_C: Pt = { x: 540, y: 850 };
export const K = 1.32; // jar scale
const MOUTH: Pt = { x: 540, y: JAR_C.y - 192 * K };

// arrival frames (accelerating, local to S4) — shared with the sound pins
export const ARRIVALS = [30, 38, 44, 49, 53, 57, 60, 63, 66, 69];
export const HERO_ARRIVAL = 72;

const BODY = 'M -125 -250 L 125 -250 L 125 -205 C 125 -170 180 -165 180 -110 L 180 200 Q 180 250 130 250 L -130 250 Q -180 250 -180 200 L -180 -110 C -180 -165 -125 -170 -125 -205 Z';

const rest = (() => {
  const r = mulberry32(88);
  return Array.from({ length: ARRIVALS.length + 1 }, () => ({ x: -130 + r() * 260, y: -60 + r() * 250, ph: r() * 6.28 }));
})();
const starts = [
  { x: -120, y: 520 }, { x: 1200, y: 700 }, { x: -80, y: 1180 }, { x: 1180, y: 1300 }, { x: 160, y: 300 },
  { x: 940, y: 240 }, { x: -140, y: 860 }, { x: 1220, y: 980 }, { x: 420, y: 1500 }, { x: 760, y: 1520 }, { x: 540, y: 200 },
];

const surge = (f: number, at: number) => (f < at ? 0 : f <= at + 5 ? ramp(f, at, 5, EASE.out) : 1 - ramp(f, at + 5, 15, EASE.swift));

const envelope = (t: number) => {
  const seg = (a: number, b: number) => ramp(t, a, 5, EASE.out) * (1 - ramp(t, b - 7, 7, EASE.out));
  const talk = Math.max(seg(16, 44), seg(50, 70));
  return talk * (0.55 + 0.45 * noise1(t / 4.5 + 200));
};

export const JarWords = ['فكرة:', 'إعلان', 'المرطبان', 'السحري'];
const WORD_AT = [18, 30, 52, 60];

export const Jar: React.FC<{ f: number }> = ({ f }) => {
  const fill = ARRIVALS.filter((a) => f >= a).length + (f >= HERO_ARRIVAL ? 2 : 0);
  const fillLevel = Math.min(1, fill / (ARRIVALS.length + 2));
  const surges = [...ARRIVALS, HERO_ARRIVAL].reduce((m, a) => Math.max(m, surge(f, a)), 0);
  const push = 1 + 0.05 * ramp(f, 0, 76, EASE.smooth);
  const z = push * mix(1, 7.5, ramp(f, 78, 12, EASE.exit)); // last 12f: plunge into the glass
  const jarIn = ramp(f, 4, 24, EASE.out);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.night0 }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${JAR_C.x}px ${JAR_C.y}px`, transform: `scale(${z})` }}>
        {/* dim garden behind (out of focus) */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0b1230 0%, #081027 55%, #04060f 100%)', opacity: 0.4 + 0.6 * ramp(f, 0, 20, EASE.out) }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, filter: 'blur(10px)', opacity: 0.8 * jarIn }}>
          <path d="M0 1140 C 150 1040 300 1090 470 1030 C 650 960 820 1090 1080 1010 L1080 1920 L0 1920Z" fill="#050918" />
        </svg>
        {/* ledge the jar stands on, moon rim on its far edge */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: JAR_C.y + 250 * K, bottom: 0, background: 'linear-gradient(180deg, #131a30 0%, #0a0e1d 18%, #04060d 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: JAR_C.y + 250 * K - 1, height: 2, background: 'linear-gradient(90deg, transparent, rgba(157,180,255,0.55), transparent)' }} />
        {/* light the jar throws on the ledge + air */}
        <Glow x={JAR_C.x} y={JAR_C.y + 250 * K + 12} r={520} color={C.amber} a={(0.1 + 0.45 * fillLevel + 0.3 * surges) * jarIn} sx={1.15} />
        <Glow x={JAR_C.x} y={JAR_C.y} r={640} color={C.amber} a={(0.05 + 0.3 * fillLevel + 0.3 * surges) * jarIn} />

        {/* jar */}
        <div style={{ position: 'absolute', left: JAR_C.x - 180, top: JAR_C.y - 270, width: 360, height: 520, opacity: jarIn, transform: `translateY(${(1 - jarIn) * 24}px) scale(${K})` }}>
          <div style={{ position: 'absolute', inset: 0, clipPath: `path('M 55 20 L 305 20 L 305 65 C 305 100 360 105 360 160 L 360 470 Q 360 520 310 520 L 50 520 Q 0 520 0 470 L 0 160 C 0 105 55 100 55 65 Z')` }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(150,175,255,0.10), rgba(150,175,255,0.03) 40%, rgba(150,175,255,0.08))' }} />
            {/* the light inside */}
            <Glow x={180} y={330} r={260} color={C.amber} a={0.1 + 0.8 * fillLevel + 0.4 * surges} />
            {[...ARRIVALS.map((a) => a), HERO_ARRIVAL].map((a, i) => {
              const p = ramp(f, a + 6, 18, EASE.out);
              if (f < a + 3) return null;
              const rp = rest[i];
              const x = 180 + mix(0, rp.x, p) + Math.sin(f * 0.05 + rp.ph) * 12;
              const y = 20 + mix(30, 270 + rp.y * 0.6, p) + Math.cos(f * 0.04 + rp.ph) * 10;
              const l = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(f * 0.09 + rp.ph), 2);
              return <Mote key={i} x={x} y={y} r={i === ARRIVALS.length ? 7 : 5} a={l} halo={6} />;
            })}
          </div>
          <svg width={360} height={520} viewBox="-180 -270 360 520" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <path d={BODY} fill="none" stroke="rgba(214,226,255,0.55)" strokeWidth={3} />
            <path d="M -150 -90 C -152 0 -152 120 -148 190" stroke="rgba(255,255,255,0.42)" strokeWidth={9} strokeLinecap="round" fill="none" />
            <path d="M 150 -80 C 152 0 152 100 150 170" stroke="rgba(255,255,255,0.14)" strokeWidth={5} strokeLinecap="round" fill="none" />
            <ellipse cx={0} cy={-250} rx={125} ry={9} fill="rgba(214,226,255,0.14)" stroke="rgba(214,226,255,0.4)" strokeWidth={2} />
            {/* brass lid, slightly ajar */}
            <g transform="translate(0 -266) rotate(-7 130 30)">
              <rect x={-142} y={-30} width={284} height={56} rx={10} fill="#8a6a35" />
              <rect x={-142} y={-30} width={284} height={18} rx={10} fill="#d8b779" opacity={0.65} />
              {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-120 + i * 30} y1={-8} x2={-120 + i * 30} y2={22} stroke="rgba(40,24,6,0.45)" strokeWidth={3} />)}
            </g>
          </svg>
        </div>

        {/* arrivals: bezier arcs into the mouth, ripple + tink share the arrival frame */}
        {[...ARRIVALS, HERO_ARRIVAL].map((a, i) => {
          const isHero = i === ARRIVALS.length;
          const dur = isHero ? 30 : 24;
          const start = a - dur;
          if (f < start || f > a + 14) return null;
          const t = ramp(f, start, dur, EASE.smooth);
          const s0 = starts[i % starts.length];
          const p1 = { x: s0.x + (MOUTH.x - s0.x) * 0.25, y: Math.min(s0.y, MOUTH.y) - 200 };
          const p2 = { x: MOUTH.x + (s0.x < 540 ? -170 : 170), y: MOUTH.y - 260 };
          const p = bez3(s0, p1, p2, MOUTH, t);
          const pb = bez3(s0, p1, p2, MOUTH, Math.max(0, t - 0.06));
          const ang = (Math.atan2(p.y - pb.y, p.x - pb.x) * 180) / Math.PI;
          const out = 1 - ramp(f, a, 4, EASE.linear);
          const trail = Array.from({ length: 10 }, (_, k) => bez3(s0, p1, p2, MOUTH, Math.max(0, t - k * 0.018)));
          const ring = ramp(f, a, 18, EASE.snappy);
          return (
            <React.Fragment key={i}>
              {out > 0 && (
                <>
                  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                    <polyline points={trail.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill="none" stroke={rgba(C.amberHot, 0.5 * out)} strokeWidth={isHero ? 8 : 4} strokeLinecap="round" />
                  </svg>
                  {isHero ? (
                    <FireflyBug x={p.x} y={p.y} s={1.15} rot={ang} f={f} lit={1} flap={1.9} opacity={out} />
                  ) : (
                    <FireflyBug x={p.x} y={p.y} s={0.62} rot={ang} f={f} lit={0.95} flap={1.8} phase={i} opacity={out} />
                  )}
                </>
              )}
              {ring > 0 && ring < 1 && (
                <div style={{ position: 'absolute', left: MOUTH.x - 150 * K * ring, top: MOUTH.y - 38 * K * ring, width: 300 * K * ring, height: 76 * K * ring, borderRadius: '50%', border: `2px solid ${rgba('#E9F2FF', 0.7 * (1 - ring))}`, boxSizing: 'border-box' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// voice pill + transcript live in screen space (they don't zoom with the jar)
export const VoiceUI: React.FC<{ f: number }> = ({ f }) => {
  const inT = ramp(f, 4, 16, EASE.snappy);
  const out = ramp(f, 74, 10, EASE.swift);
  const N = 40;
  const bars = Array.from({ length: N }, (_, i) => {
    const t = f - (N - 1 - i) * 1.6;
    const env = t < 0 ? 0 : envelope(t);
    const center = Math.pow(Math.sin((i / (N - 1)) * Math.PI), 0.8);
    const jitter = 0.35 + 0.65 * noise1(t * 1.7 + i * 0.13);
    return Math.max(6, env * center * jitter * 120);
  });
  const level = bars.slice(-10).reduce((a, b) => a + b, 0) / 10 / 120;
  const lastAt = WORD_AT.filter((w) => f >= w).pop() ?? -99;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - out, pointerEvents: 'none' }}>
      {/* transcript: each word lands on its syllable, newest word amber then settles to ink */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center', direction: 'rtl', gap: 22, fontFamily: FONT.ui, fontWeight: 700, fontSize: 66 }}>
        {JarWords.map((w, i) => {
          const p = ramp(f, WORD_AT[i], 9, EASE.snappy);
          const fresh = 1 - ramp(f, WORD_AT[i] + 3, 8, EASE.linear);
          return (
            <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, color: fresh > 0.4 ? C.amber : C.ink, textShadow: '0 2px 22px rgba(0,0,0,0.6)' }}>
              {w}
              {lastAt === WORD_AT[i] && f < 74 && (f % 16 < 9 || level > 0.05) ? <span style={{ display: 'inline-block', width: 5, height: 52, marginRight: 8, borderRadius: 3, background: C.amber, verticalAlign: '-6px' }} /> : null}
            </span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 1500, height: 168, borderRadius: 84, opacity: inT, transform: `translateY(${(1 - inT) * 50}px)`, background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))', boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.10), 0 30px 70px rgba(0,0,0,0.5), 0 0 ${40 + 60 * level}px ${rgba(C.amber, 0.08 + 0.3 * level)}`, backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 26, direction: 'ltr' }}>
        <div style={{ width: 104, height: 104, borderRadius: '50%', background: `linear-gradient(160deg, ${C.amber}, ${C.amberDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${24 + 34 * level}px ${rgba(C.amber, 0.45 + 0.4 * level)}`, flex: 'none', order: 3 }}>
          <svg width={50} height={50} viewBox="0 0 24 24" fill="none"><rect x={8.5} y={3} width={7} height={12} rx={3.5} fill="#1a1206" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" stroke="#1a1206" strokeWidth={1.9} strokeLinecap="round" /></svg>
        </div>
        <div style={{ flex: 1, height: 130, display: 'flex', alignItems: 'center', gap: 5, order: 1, WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 16%, #000 100%)' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: h, borderRadius: 99, background: h <= 7 ? 'rgba(237,232,222,0.4)' : `linear-gradient(180deg, ${C.amberHot}, ${C.amber} 50%, ${C.amberDeep})`, boxShadow: i === N - 1 && h > 7 ? `0 0 14px ${rgba(C.amber, 0.6)}` : undefined }} />
          ))}
        </div>
      </div>
    </div>
  );
};
