// S3 — "تطير": pull-back from the hero (match-cut from the window) to the whole night field.
// One bright hero, ~70 dim fireflies that go out one by one (decelerating wave), hero left alone.
// Grammar: depth-layer parallax (far/mid/near move at different rates) + tension pull-back.
import React from 'react';
import { C } from '../tokens';
import { EASE, mix, ramp, mulberry32, noise1 } from '../lib/anim';
import { FireflyBug, Glow, Mote } from '../lib/fx';

export const NIGHT_DUR = 90;
export const HEART_AT = [62, 74]; // local frames of the hero's two failing heartbeats (picture + sound)

export const nightZoom = (f: number) => mix(2.6, 1.0, ramp(f, 0, 58, EASE.smooth)) * (1 + 0.07 * ramp(f, 58, 32, EASE.smooth));

type Fly = { x: number; y: number; d: number; ph: number; w: number; die: number; r: number; dx: number; dy: number };
export const FLIES: Fly[] = (() => {
  const r = mulberry32(2024);
  const n = 72;
  const arr: Fly[] = Array.from({ length: n }, () => ({
    x: -60 + r() * 1200, y: 420 + r() * 1100, d: r(), ph: r() * 6.28, w: 0.07 + r() * 0.08,
    die: 0, r: r(), dx: 18 + r() * 40, dy: 14 + r() * 30,
  }));
  // death times: ease-out density -> a few go early, then faster and faster, last ones linger
  arr.forEach((a, i) => { a.die = 22 + 52 * (1 - Math.pow(1 - i / (n - 1), 1.8)) + a.r * 2; });
  // shuffle which firefly gets which slot (deterministic)
  const idx = arr.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const dies = arr.map((a) => a.die);
  idx.forEach((to, i) => { arr[to].die = dies[i]; });
  return arr;
})();

export const Night: React.FC<{ f: number }> = ({ f }) => {
  const z = nightZoom(f);
  const sc = (d: number) => Math.pow(z, 0.55 + 0.75 * d);
  const cx = 540, cy = 960;
  const place = (x: number, y: number, d: number) => ({ x: cx + (x - cx) * sc(d), y: cy + (y - cy) * sc(d) });

  // hero: sits where the window exit left it (screen centre), then drifts a little left/up
  const hx = mix(540, 470, ramp(f, 20, 60, EASE.smooth));
  const hy = mix(960, 900, ramp(f, 20, 60, EASE.smooth));
  const heroD = 0.55;
  const hp = place(hx, hy, heroD);
  // the hero dims late: strong, then a failing heartbeat
  const fade = ramp(f, 60, 26, EASE.smooth);
  // heartbeat visuals are driven by the SAME frames the sound is pinned to (HEART_AT)
  const pulse = HEART_AT.reduce((acc, b, i) => acc + (f < b ? 0 : Math.exp(-(f - b) / 5) * (i === 0 ? 1 : 0.7)), 0);
  const heroLit = (1 - 0.8 * fade) * (0.74 + 0.3 * Math.min(1.2, pulse) + 0.06 * Math.sin(f * 0.11));
  const heroS = 1.05 * sc(heroD) * 0.95;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.night0 }}>
      {/* sky */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #14234f 0%, #0f1b40 32%, #0a1230 58%, #060a1c 100%)' }} />
      {(() => {
        const m = place(800, 380, 0.05);
        return (
          <>
            <Glow x={m.x} y={m.y} r={420 * sc(0.05)} color={C.moon} a={0.4} />
            <div style={{ position: 'absolute', left: m.x - 75 * sc(0.05), top: m.y - 75 * sc(0.05), width: 150 * sc(0.05), height: 150 * sc(0.05), borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%, #f6f8ff, #c9d6ff 60%, #9db4ff)', boxShadow: '0 0 90px rgba(157,180,255,0.8)' }} />
          </>
        );
      })()}
      {Array.from({ length: 70 }, (_, i) => {
        const r = mulberry32(i * 13 + 9);
        const p = place(r() * 1080, r() * 900, 0.02);
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f * 0.06 + r() * 6));
        return <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, width: 2.2, height: 2.2, borderRadius: '50%', background: '#dfe8ff', opacity: 0.55 * tw * (0.4 + r() * 0.6) }} />;
      })}
      {/* far hills (slowest) */}
      {(() => {
        const o = place(540, 1330, 0.1);
        return (
          <svg width={1500} height={700} style={{ position: 'absolute', left: o.x - 750, top: o.y - 350, opacity: 0.95, transform: `scale(${sc(0.1)})`, transformOrigin: '50% 50%' }}>
            <path d="M0 330 C 160 250 300 300 460 240 C 640 170 760 280 960 230 C 1160 180 1320 280 1500 250 L1500 700 L0 700Z" fill="#0b1431" />
          </svg>
        );
      })()}
      {/* mid tree line */}
      {(() => {
        const o = place(540, 1450, 0.35);
        return (
          <svg width={1700} height={760} style={{ position: 'absolute', left: o.x - 850, top: o.y - 380, transform: `scale(${sc(0.35)})`, transformOrigin: '50% 50%' }}>
            <path d="M0 330 C 40 250 60 120 120 150 C 180 180 170 80 230 90 C 300 100 290 250 360 240 C 440 230 430 100 510 130 C 580 160 560 260 640 270 C 720 280 720 130 800 120 C 880 110 870 250 950 260 C 1030 270 1020 160 1100 150 C 1180 140 1170 260 1250 250 C 1330 240 1340 110 1420 130 C 1500 150 1500 260 1580 250 L1700 260 L1700 760 L0 760Z" fill="#050918" />
          </svg>
        );
      })()}
      {/* the dim field (they go out one by one) */}
      {FLIES.map((a, i) => {
        const sway = { x: Math.sin(f * 0.02 + a.ph) * a.dx + (noise1(f * 0.03 + i) - 0.5) * 20, y: Math.cos(f * 0.017 + a.ph) * a.dy };
        const p = place(a.x + sway.x, a.y + sway.y, a.d);
        // blink + death: two stuttering flickers, then out for good
        const alive = f < a.die ? 1 : f < a.die + 3 ? 0.2 : f < a.die + 5 ? 0.9 : f < a.die + 7 ? 0.1 : 0;
        const flick = f < a.die - 6 ? 1 : f < a.die ? 0.55 + 0.45 * Math.sin(f * 2.6 + a.ph) : 1;
        const pulse = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(f * a.w + a.ph), 2);
        const lit = alive * flick * pulse;
        if (lit < 0.02) return null;
        const size = (1.6 + 3.6 * a.d) * Math.min(1.5, sc(a.d) * 0.8);
        if (a.d > 0.86) {
          return <div key={i} style={{ filter: 'blur(3px)', opacity: 0.9 }}><FireflyBug x={p.x} y={p.y} s={0.5 * sc(a.d) * 0.7} rot={-8 + Math.sin(f * 0.05 + a.ph) * 14} f={f} lit={lit} flap={1.3} phase={a.ph} flip={a.r > 0.5} /></div>;
        }
        return <Mote key={i} x={p.x} y={p.y} r={size} a={lit * (0.45 + 0.55 * a.d)} halo={a.d > 0.5 ? 5 : 4} />;
      })}
      {/* hero (the only bright one) */}
      <Glow x={hp.x} y={hp.y} r={430 * heroS / 1.4} color={C.amber} a={0.22 * heroLit} />
      <FireflyBug x={hp.x} y={hp.y} s={heroS} rot={-6 + Math.sin(f * 0.05) * 4} f={f} lit={heroLit} flap={1.7 - fade * 0.7} />
      {/* near grass (fastest) */}
      {(() => {
        const o = place(540, 1920, 1);
        return (
          <svg width={1500} height={520} style={{ position: 'absolute', left: o.x - 750, top: o.y - 440, transform: `scale(${sc(1)})`, transformOrigin: '50% 100%', filter: 'blur(1.5px)' }}>
            {Array.from({ length: 46 }, (_, i) => {
              const r = mulberry32(i * 7 + 1);
              const x = i * 33 + r() * 14, h = 170 + r() * 260, lean = (r() - 0.5) * 80 + Math.sin(f * 0.04 + i) * 12;
              return <path key={i} d={`M${x} 520 C ${x + lean * 0.2} ${520 - h * 0.5} ${x + lean * 0.7} ${520 - h * 0.85} ${x + lean} ${520 - h} C ${x + lean * 0.7 + 14} ${520 - h * 0.8} ${x + 18} ${520 - h * 0.4} ${x + 16} 520Z`} fill="#03050c" />;
            })}
            <rect x={0} y={500} width={1500} height={40} fill="#03050c" />
          </svg>
        );
      })()}
    </div>
  );
};
