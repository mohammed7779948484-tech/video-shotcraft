// S2 — "الفكرة تُولد": one hero. A glowing idea gathers at the pen nib, condenses into a firefly,
// lifts, hovers (complete arc >= 3s, Q5/R3), then leaves through the window as the camera tilts up.
import React from 'react';
import { C } from '../tokens';
import { EASE, bez3, mix, ramp, rgba, mulberry32, Pt } from '../lib/anim';
import { FireflyBug, Glow, Mote } from '../lib/fx';

export const DESK_DUR = 132;

const NIB: Pt = { x: 596, y: 1372 };
const HOVER: Pt = { x: 790, y: 860 }; // waits by the open window, clear of the caption on the left
const WINDOW_EXIT: Pt = { x: 786, y: 452 };

// camera keyframes: centre of view in world px + zoom, eased between (monotone, no pops)
type Cam = { cx: number; cy: number; z: number };
export const deskCam = (f: number): Cam => {
  const a = ramp(f, 0, 92, EASE.smooth); // slow push-in while the idea is born
  const b = ramp(f, 88, 44, EASE.smooth); // tilt up to the window
  const c0: Cam = { cx: 540, cy: 1010, z: 1.0 };
  const c1: Cam = { cx: 470, cy: 1130, z: 1.14 };
  const c2: Cam = { cx: 786, cy: 452, z: 2.6 };
  const m1: Cam = { cx: mix(c0.cx, c1.cx, a), cy: mix(c0.cy, c1.cy, a), z: mix(c0.z, c1.z, a) };
  return { cx: mix(m1.cx, c2.cx, b), cy: mix(m1.cy, c2.cy, b), z: mix(m1.z, c2.z, b) };
};

export const heroPos = (f: number): { p: Pt; s: number; rot: number; lit: number; flip: boolean; vis: number } => {
  const born = ramp(f, 50, 14, EASE.overshoot); // condense
  const lift = ramp(f, 56, 40, EASE.smooth);
  const exit = ramp(f, 100, 32, EASE.smooth);
  const p1 = bez3(NIB, { x: NIB.x + 40, y: NIB.y - 230 }, { x: 760, y: 1130 }, HOVER, lift);
  const bob = Math.sin(f * 0.11) * 14 * ramp(f, 80, 14, EASE.out) * (1 - exit);
  const p2 = bez3(HOVER, { x: 660, y: 770 }, { x: 610, y: 610 }, WINDOW_EXIT, exit);
  const p = { x: mix(p1.x, p2.x, exit > 0 ? 1 : 0) , y: 0 };
  const pos = exit > 0 ? p2 : p1;
  p.x = pos.x; p.y = pos.y + bob;
  const s = mix(2.1, 1.7, lift) * mix(1, 0.62, exit) * mix(0.3, 1, born);
  const rot = exit > 0 ? -22 * Math.sin(exit * Math.PI) - 8 : mix(-20, -6, lift);
  return { p, s, rot, lit: 0.55 + 0.45 * ramp(f, 54, 18, EASE.out), flip: false, vis: born > 0.02 ? 1 : 0 };
};

export const Desk: React.FC<{ f: number }> = ({ f }) => {
  const cam = deskCam(f);
  const tx = 540 - cam.cx * cam.z, ty = 960 - cam.cy * cam.z;
  const hero = heroPos(f);

  // gathering motes: 30 specks spiral into the nib, then the bloom takes over
  const rnd = mulberry32(41);
  const motes = Array.from({ length: 30 }, (_, i) => ({ a: rnd() * Math.PI * 2, R: 110 + rnd() * 190, t0: 2 + i * 0.7, sz: 2 + rnd() * 3.4, sw: 0.8 + rnd() * 1.1 }));
  const bloom = ramp(f, 18, 38, EASE.swift) * (1 - ramp(f, 62, 22, EASE.out));
  const rim = 0.55 + 0.45 * ramp(f, 40, 30, EASE.out);
  const penBob = Math.sin(f * 0.09) * 3;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.night0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${cam.z})` }}>
        {/* wall */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0c1432 0%, #0a1126 40%, #080c1b 62%, #07091a 100%)' }} />
        {/* window: night sky, moon, tree line */}
        <div style={{ position: 'absolute', left: 548, top: 138, width: 468, height: 650, background: '#070b18', borderRadius: 6, boxShadow: '0 0 0 12px #121a33, 0 0 0 14px rgba(157,180,255,0.18), 0 0 120px rgba(80,110,220,0.25)' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(180deg, #14234f 0%, #0f1b40 45%, #0a1230 100%)' }}>
            <Glow x={250} y={170} r={230} color={C.moon} a={0.5} />
            <div style={{ position: 'absolute', left: 205, top: 125, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%, #f6f8ff, #c9d6ff 60%, #9db4ff)', boxShadow: '0 0 60px rgba(157,180,255,0.8)' }} />
            <svg width={468} height={650} style={{ position: 'absolute', inset: 0 }}>
              <path d="M0 640 L0 470 C 40 430 70 300 110 330 C 150 360 150 250 200 270 C 240 288 252 380 300 360 C 350 340 360 250 410 290 C 440 314 450 400 468 420 L468 650 Z" fill="#050813" />
              <path d="M0 650 L0 560 C 80 520 150 560 240 540 C 330 520 400 560 468 530 L468 650Z" fill="#03050d" />
              {Array.from({ length: 14 }, (_, i) => {
                const r = mulberry32(i * 31 + 5);
                const x = 20 + r() * 430, y = 400 + r() * 200, ph = r() * 6.28;
                const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f * 0.09 + ph));
                return <circle key={i} cx={x} cy={y} r={1.9} fill={C.amber} opacity={0.5 * tw} />;
              })}
            </svg>
            {/* muntins */}
            <div style={{ position: 'absolute', left: 230, top: 0, width: 8, height: '100%', background: '#0b0f1f' }} />
            <div style={{ position: 'absolute', top: 300, left: 0, height: 8, width: '100%', background: '#0b0f1f' }} />
          </div>
          {/* sash swung open to the room (left) */}
          <svg width={140} height={680} style={{ position: 'absolute', left: -120, top: -16, overflow: 'visible' }}>
            <polygon points="116,16 40,60 40,640 116,664" fill="#0e1630" stroke="rgba(157,180,255,0.35)" strokeWidth={2} />
            <polygon points="108,60 54,92 54,600 108,632" fill="rgba(120,150,255,0.10)" />
          </svg>
        </div>
        {/* moonlight spilling on desk + wall */}
        <div style={{ position: 'absolute', left: 520, top: 900, width: 520, height: 900, transform: 'skewX(-18deg)', transformOrigin: '50% 0', background: 'linear-gradient(180deg, rgba(150,175,255,0.10), rgba(150,175,255,0.02) 80%)', filter: 'blur(14px)' }} />
        {/* desk */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 996, bottom: 0, background: 'linear-gradient(180deg, #1c1626 0%, #130f1b 30%, #0a0810 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 994, height: 3, background: `linear-gradient(90deg, rgba(157,180,255,0) 0%, rgba(157,180,255,${0.5 * rim}) 55%, rgba(157,180,255,0.05) 100%)` }} />
        {/* warm pool under the notebook (brightens as the idea glows) */}
        <Glow x={540} y={1440} r={560} color={C.amber} a={0.11 + 0.2 * bloom + 0.07 * hero.lit * (hero.vis)} sx={1.35} />
        {/* notebook */}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="pgL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d9cdb4" /><stop offset="0.8" stopColor="#ece3cf" /><stop offset="1" stopColor="#a99b7e" /></linearGradient>
            <linearGradient id="pgR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#d9cdb4" /><stop offset="0.8" stopColor="#ece3cf" /><stop offset="1" stopColor="#a99b7e" /></linearGradient>
          </defs>
          <ellipse cx={540} cy={1700} rx={470} ry={46} fill="rgba(0,0,0,0.55)" />
          <polygon points="118,1258 540,1230 962,1258 986,1690 540,1664 94,1690" fill="#1f1611" />
          <polygon points="136,1250 540,1224 944,1250 962,1664 540,1640 118,1664" fill="#2b1f17" />
          <polygon points="146,1262 536,1236 536,1632 128,1650" fill="url(#pgL)" />
          <polygon points="544,1236 934,1262 952,1650 544,1632" fill="url(#pgR)" />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} opacity={0.16}>
              <line x1={168} y1={1330 + i * 36 - i * 1.6} x2={520} y2={1306 + i * 36 + i * 0.4} stroke="#6b5a40" strokeWidth={1.4} />
              <line x1={560} y1={1306 + i * 36 + i * 0.4} x2={918} y2={1330 + i * 36 - i * 1.6} stroke="#6b5a40" strokeWidth={1.4} />
            </g>
          ))}
          <rect x={534} y={1236} width={20} height={398} fill="rgba(60,40,20,0.35)" />
        </svg>
        {/* pen (qalam): hovering above the page, shadow on the paper proves the gap */}
        <div style={{ position: 'absolute', left: NIB.x - 70, top: NIB.y + 84 + penBob * 0.4, width: 150, height: 30, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(20,10,0,0.55), rgba(20,10,0,0))' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <g transform={`translate(${NIB.x} ${NIB.y + penBob}) rotate(-39)`}>
            <polygon points="0,0 16,-10 470,-16 470,16 16,10" fill="#15100c" />
            <polygon points="16,-10 470,-16 470,-9 20,-6" fill="rgba(255,255,255,0.12)" />
            <rect x={150} y={-12} width={22} height={24} fill="#b8935a" />
            <rect x={150} y={-12} width={22} height={7} fill="#e6cf9b" opacity={0.6} />
            <polygon points="0,0 22,-9 22,9" fill={mixAmber(bloom)} />
          </g>
        </svg>
        {/* the idea gathering at the nib */}
        {motes.map((m, i) => {
          const p = ramp(f, m.t0, 34, EASE.swift);
          if (p <= 0 || p >= 1) return null;
          const R = m.R * (1 - p) ** 1.6;
          const ang = m.a + p * m.sw * 5;
          const a = Math.min(1, p * 4) * (1 - ramp(p, 0.8, 0.2, EASE.linear));
          return <Mote key={i} x={NIB.x + Math.cos(ang) * R} y={NIB.y - 8 + Math.sin(ang) * R * 0.7} r={m.sz} a={a} halo={4} />;
        })}
        <Glow x={NIB.x} y={NIB.y - 6} r={30 + 190 * bloom} color={C.amberHot} a={0.9 * bloom} />
        <Glow x={NIB.x} y={NIB.y - 6} r={20 + 70 * bloom} color="#ffffff" a={0.7 * bloom} />
        {/* hero firefly + the light it throws on the room */}
        {hero.vis ? (
          <>
            <Glow x={hero.p.x} y={hero.p.y} r={380 * hero.s / 1.7} color={C.amber} a={0.2 * hero.lit} />
            <FireflyBug x={hero.p.x} y={hero.p.y} s={hero.s} rot={hero.rot} f={f} lit={hero.lit} flap={1.9} />
          </>
        ) : null}
        {/* dust floating in the moonlight */}
        {Array.from({ length: 22 }, (_, i) => {
          const r = mulberry32(i * 17 + 3);
          const cyc = (f * (0.25 + r() * 0.4) + i * 7) % 60;
          const x = 480 + r() * 520 + Math.sin(f * 0.02 + i) * 24, y = 700 + r() * 800 - cyc;
          return <Mote key={`d${i}`} x={x} y={y} r={1.6 + r() * 1.6} a={(0.25 + 0.2 * Math.sin(f * 0.07 + i)) * Math.sin((Math.PI * cyc) / 60)} color={C.moon} halo={3} />;
        })}
      </div>
    </div>
  );
};

function mixAmber(t: number) {
  const k = Math.max(0, Math.min(1, t));
  return rgba('#FFE9A8', 0.15 + 0.85 * k);
}
