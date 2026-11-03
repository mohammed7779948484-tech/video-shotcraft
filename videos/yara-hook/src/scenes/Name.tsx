// S6 — "النور يكتب": the signature motion. Adapted from stroke-segment-build (assembly-by-suspense):
// the name is lit in DISCONNECTED fragments, out of order; >60% of the time it cannot be read;
// the last three key fragments (two dots + the hook of the ع) land on a 7f/6f beat, and the moment
// the last one lands the whole word surges 0.58 -> 1 -> 1.25 -> 1 and the room lights up.
// Material change vs the card (neon tube -> firefly light): ignition curve keeps the card's
// "on-off-on-half-on-on" 7f strike and the 0.58 hold; fragments are soft ellipses masked into the
// Kufi letterforms; each fragment is delivered by a firefly flying out of a note card (dissolve).
import React from 'react';
import { C, FONT } from '../tokens';
import { EASE, bez3, mix, ramp, rgba, Pt } from '../lib/anim';
import { Glow, Mote, Caption, Trail } from '../lib/fx';
import { AppUI, CARD_H, slotY } from './Cards';

export const NAME_DUR = 159;
const DY = -72; // word block lifted so the lock-up is optically centred
const PAD = 340; // the masked box is padded so blur/bloom is never clipped by the mask box (review: hard glow edge on reveal)
const WORD = { x: 540, y: 818 };

type Patch = { cx: number; cy: number; rx: number; ry: number };
const P: Patch[] = [
  { cx: 478, cy: 700, rx: 60, ry: 140 }, // 0 alif upper
  { cx: 478, cy: 860, rx: 60, ry: 110 }, // 1 alif mid
  { cx: 500, cy: 1010, rx: 75, ry: 80 }, // 2 alif foot + hook
  { cx: 250, cy: 945, rx: 62, ry: 72 }, // 3 ع head-left
  { cx: 350, cy: 1030, rx: 70, ry: 50 }, // 4 ع spike
  { cx: 290, cy: 1125, rx: 100, ry: 75 }, // 5 ع bowl
  { cx: 385, cy: 1165, rx: 55, ry: 38 }, // 6 ع tail
  { cx: 838, cy: 930, rx: 62, ry: 95 }, // 7 ي right tooth
  { cx: 655, cy: 925, rx: 62, ry: 80 }, // 8 ي left tooth
  { cx: 745, cy: 1030, rx: 95, ry: 50 }, // 9 ي bar
  { cx: 655, cy: 1090, rx: 50, ry: 70 }, // 10 ر stem
  { cx: 590, cy: 1165, rx: 90, ry: 40 }, // 11 ر curve
  { cx: 840, cy: 1050, rx: 50, ry: 35 }, // 12 ي foot
  { cx: 755, cy: 1160, rx: 50, ry: 50 }, // 13 KEY dot
  { cx: 859, cy: 1160, rx: 50, ry: 50 }, // 14 KEY dot
  { cx: 338, cy: 905, rx: 52, ry: 42 }, // 15 KEY ع hook
];
// scrambled: front 13 jump across letters, keys last (identity fragments held back)
export const ORDER = [8, 2, 5, 0, 11, 7, 3, 10, 4, 6, 1, 9, 12, 15, 13, 14];
export const FIRST = 14, SPAN = 57; // spacing shrinks 7f -> 2.5f (card text says 9f->3f; the demo's own easing is ~20f->0f; see DESIGN)
export const KEY_AT = [86, 93, 99];
const STRIKE = 7;
export const REVEAL = 105;
export const startOf = (rank: number) => (rank < 13 ? FIRST + Array.from({ length: rank }, (_, j) => 7 - j * (4.5 / 11)).reduce((a, b) => a + b, 0) : KEY_AT[rank - 13]);
const strike = (f: number, s: number) =>
  f < s ? 0 : f >= s + STRIKE ? 0.58 : [0, 1, 0.12, 0.95, 0.4, 1, 0.58].reduce((acc, _, i, a) => acc, 0) || interpolate7(f - s);
function interpolate7(t: number) {
  const xs = [0, 1, 2, 3, 4, 5, 7], ys = [0, 1, 0.12, 0.95, 0.4, 1, 0.58];
  for (let i = 0; i < xs.length - 1; i++) if (t <= xs[i + 1]) return mix(ys[i], ys[i + 1], (t - xs[i]) / (xs[i + 1] - xs[i]));
  return 0.58;
}
const hum = (f: number, i: number) => 1 + 0.035 * Math.sin(f * 0.9 + i * 2.3) * Math.sin(f * 0.37 + i);

const wordStyle: React.CSSProperties = {
  position: 'absolute', left: 0, right: 0, top: 560 + DY - PAD, paddingTop: PAD, boxSizing: 'border-box', textAlign: 'center', direction: 'rtl',
  fontFamily: FONT.brand, fontWeight: 700, fontSize: 600, lineHeight: 1, whiteSpace: 'nowrap', height: 1000 + 2 * PAD,
};

const sources: Pt[] = Array.from({ length: 5 }, (_, k) => ({ x: 540, y: slotY(k) + CARD_H / 2 }));

export const Name: React.FC<{ f: number }> = ({ f }) => {
  const levels = P.map((_, i) => {
    const rank = ORDER.indexOf(i);
    const s = startOf(rank);
    if (f < s) return 0;
    const settled = f >= s + STRIKE;
    return (settled ? 0.58 : strike(f, s)) * (settled ? hum(f, i) : 1);
  });
  const lit = levels.filter((l) => l > 0.01).length;
  const reveal = ramp(f, REVEAL, 8, EASE.snappy);
  const surge = f < REVEAL ? 0 : mix(0, 1, ramp(f, REVEAL, 3, EASE.out)) * (1 - ramp(f, REVEAL + 3, 22, EASE.out));
  const full = reveal >= 0.999;

  const SHRINK = 0.74; // fragments stay small: >60% of the time the word must NOT be readable
  const maskLayers = P.map((p, i) => ({ p: { ...p, rx: p.rx * SHRINK, ry: p.ry * SHRINK }, l: Math.min(1, levels[i]) })).filter((x) => x.l > 0.01)
    .map(({ p, l }) => `radial-gradient(ellipse ${p.rx}px ${p.ry}px at ${p.cx}px ${p.cy - 560 + PAD}px, rgba(0,0,0,${l.toFixed(3)}) 0%, rgba(0,0,0,${l.toFixed(3)}) 52%, rgba(0,0,0,0) 100%)`);
  if (reveal > 0) maskLayers.push(`linear-gradient(rgba(0,0,0,${reveal.toFixed(3)}), rgba(0,0,0,${reveal.toFixed(3)}))`);
  const mask = maskLayers.length ? maskLayers.join(',') : 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))';
  const maskStyle: React.CSSProperties = full ? {} : { WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '1080px 1920px', maskSize: '1080px 1920px', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' };
  const bright = 1 + 0.25 * surge;
  const ambient = 0.1 + 0.4 * (lit / P.length) + 0.4 * reveal + 0.3 * surge;
  const push = 1 + 0.035 * ramp(f, 0, NAME_DUR, EASE.smooth);
  const dissolve = ramp(f, 0, 14, EASE.swift);

  // flights: one firefly per fragment, out of the note cards, arriving on the ignition frame
  const flights = P.map((p, i) => {
    const rank = ORDER.indexOf(i);
    const arrive = startOf(rank);
    const dur = rank >= 13 ? 18 : 14;
    const start = Math.max(1, arrive - dur);
    if (f < start || f > arrive + 12) return null;
    const src = sources[i % 5];
    const dst = { x: p.cx, y: p.cy + DY };
    const t = ramp(f, start, arrive - start, EASE.swift);
    const c1 = { x: src.x + (i % 2 ? 260 : -260), y: src.y - 220 };
    const c2 = { x: dst.x + (dst.x < 540 ? -170 : 170), y: dst.y - 120 };
    const pos = bez3(src, c1, c2, dst, t);
    const trail = Array.from({ length: 9 }, (_, k) => bez3(src, c1, c2, dst, Math.max(0, t - k * 0.02)));
    const key = rank >= 13;
    const out = f < arrive ? 1 : 1 - ramp(f, arrive, 3, EASE.linear);
    const ring = f >= arrive ? ramp(f, arrive, 14, EASE.snappy) : 0;
    return (
      <React.Fragment key={i}>
        {out > 0.01 && (
          <>
            <Trail pts={trail} w={key ? 6 : 4} a={out} />
            <Mote x={pos.x} y={pos.y} r={key ? 10 : 7} a={out} halo={6} />
          </>
        )}
        {ring > 0 && ring < 1 && (
          <div style={{ position: 'absolute', left: dst.x - 70 * ring, top: dst.y - 70 * ring, width: 140 * ring, height: 140 * ring, borderRadius: '50%', border: `2px solid ${rgba(C.amberHot, 0.8 * (1 - ring))}`, boxSizing: 'border-box' }} />
        )}
      </React.Fragment>
    );
  });

  const mark = ramp(f, REVEAL + 6, 18, EASE.out);
  const tag = ramp(f, REVEAL + 8, 18, EASE.out);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.night0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #070b1a 0%, #090f24 55%, #0a1230 100%)' }} />
      {/* the app dissolving into fireflies */}
      {dissolve < 1 && <div style={{ position: 'absolute', inset: 0, opacity: 1 }}><AppUI f={96} dissolve={dissolve} /><Caption text="تكلّم… ويراع يرتّبها." f={96 + f} start={44} y={1470} size={78} accent={[1]} scrim={false} out={96} /></div>}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: `540px ${WORD.y}px` }}>
        {/* the room fills with the light of the word */}
        <Glow x={WORD.x} y={WORD.y + 40} r={760} color={C.amber} a={Math.min(1, ambient) * 0.5} sx={1.1} />
        {/* wide bloom */}
        <div style={{ ...wordStyle, ...maskStyle, filter: 'blur(36px)', color: C.amberDeep, opacity: Math.min(1, 0.55 * (lit / P.length) + 0.5 * surge + 0.3 * reveal) }}>يراع</div>
        {/* body */}
        <div style={{ ...wordStyle, ...maskStyle, filter: `brightness(${bright.toFixed(3)}) drop-shadow(0 0 ${16 + 30 * surge}px ${rgba(C.amber, 0.55)})` }}>
          <span style={{ background: `linear-gradient(180deg, ${C.amberHot} 0%, ${C.amber} 48%, ${C.amberDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>يراع</span>
        </div>
        {flights}
      </div>

      {/* lock-up: mark, tagline, soon */}
      {mark > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: mark, transform: `translateY(${(1 - mark) * 24}px)` }}>
          <svg width={150} height={190} viewBox="-90 -110 180 220" style={{ overflow: 'visible' }}>
            <path d="M -45 -70 L 45 -70 L 45 -52 C 45 -40 66 -38 66 -18 L 66 62 Q 66 82 46 82 L -46 82 Q -66 82 -66 62 L -66 -18 C -66 -38 -45 -40 -45 -52 Z" fill="rgba(160,185,255,0.07)" stroke="rgba(214,226,255,0.6)" strokeWidth={3.5} />
            <rect x={-52} y={-92} width={104} height={20} rx={5} fill="#b8935a" />
            <circle cx={0} cy={26} r={26} fill="url(#lm)" />
            <defs><radialGradient id="lm"><stop offset="0" stopColor="#fff" /><stop offset="0.3" stopColor={C.amberHot} /><stop offset="1" stopColor={C.amber} stopOpacity={0} /></radialGradient></defs>
          </svg>
        </div>
      )}
      <Caption text="امسك الفكرة قبل أن تطير." f={f} start={REVEAL + 8} y={1190} size={76} accent={[1]} scrim={false} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1350, display: 'flex', justifyContent: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 18}px)`, direction: 'rtl' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, height: 84, padding: '0 40px', borderRadius: 42, fontFamily: FONT.ui, fontSize: 40, fontWeight: 500, color: C.ink, boxShadow: `inset 0 0 0 1.5px ${rgba(C.amber, 0.55)}`, background: rgba(C.amber, 0.07) }}>
          <span>قريبًا</span>
          <span style={{ width: 1.5, height: 34, background: C.hair }} />
          <span style={{ letterSpacing: '0.14em', fontSize: 34, color: C.ink2, direction: 'ltr' }}>YARA'</span>
        </div>
      </div>
    </div>
  );
};
