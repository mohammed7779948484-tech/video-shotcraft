import React from 'react';
import { staticFile } from 'remotion';
import { C, FONT } from '../tokens';
import { EASE, ramp, rgba } from './anim';

/** soft radial light. mix-blend screen so overlapping lights add like real light. */
export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; a?: number; sx?: number }> = ({
  x, y, r, color = C.amber, a = 1, sx = 1,
}) => (
  <div
    style={{
      position: 'absolute', left: x - r * sx, top: y - r, width: 2 * r * sx, height: 2 * r, borderRadius: '50%',
      background: `radial-gradient(circle closest-side, ${rgba(color, Math.min(1, a))} 0%, ${rgba(color, Math.min(1, a * 0.55))} 22%, ${rgba(color, a * 0.2)} 50%, ${rgba(color, a * 0.05)} 76%, ${rgba(color, 0)} 100%)`,
      mixBlendMode: 'screen', pointerEvents: 'none',
    }}
  />
);

/** tiny drifting dot with halo (the "dim firefly" used for swarms and motes). */
export const Mote: React.FC<{ x: number; y: number; r?: number; a?: number; color?: string; halo?: number }> = ({
  x, y, r = 4, a = 1, color = C.amber, halo = 5,
}) => (
  <>
    <Glow x={x} y={y} r={r * halo} color={color} a={0.55 * a} />
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: rgba(C.amberHot, Math.min(1, a)), boxShadow: `0 0 ${r * 2}px ${rgba(C.amber, 0.8 * a)}` }} />
  </>
);

/** A drawn firefly (side view, faces right unless flip). `lit` 0..1 drives the lantern. */
export const FireflyBug: React.FC<{
  x: number; y: number; s?: number; rot?: number; flip?: boolean; f: number; lit?: number; flap?: number; phase?: number; opacity?: number;
}> = ({ x, y, s = 1, rot = 0, flip = false, f, lit = 1, flap = 1.6, phase = 0, opacity = 1 }) => {
  const w = Math.sin(f * flap + phase);
  const ang = -26 + w * 30;
  const ang2 = -12 + w * 24;
  const tail = mixHex('#4a3a22', '#FFF1B8', lit);
  const tail2 = mixHex('#6b4a1e', '#FFC857', lit);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(${flip ? -1 : 1}) scale(${s})`, opacity, pointerEvents: 'none' }}>
      <svg width={260} height={190} viewBox="-130 -95 260 190" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <radialGradient id="fbHalo">
            <stop offset="0%" stopColor={C.amberHot} stopOpacity={0.95} />
            <stop offset="30%" stopColor={C.amber} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.amberDeep} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="fbAbd" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#2a2118" />
            <stop offset="45%" stopColor={tail2} />
            <stop offset="100%" stopColor={tail} />
          </linearGradient>
        </defs>
        <circle cx={-48} cy={10} r={96} fill="url(#fbHalo)" opacity={0.85 * lit} />
        {/* far wing */}
        <g transform={`rotate(${ang2} 6 -6)`} opacity={0.8}>
          <ellipse cx={-34} cy={-8} rx={50} ry={12} fill="rgba(210,226,255,0.2)" stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
        </g>
        {/* legs */}
        <path d="M2 14 L-6 30 M12 14 L10 32 M22 12 L28 28" stroke="#0f0c08" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        {/* abdomen with lantern */}
        <ellipse cx={-34} cy={9} rx={46} ry={16} fill="url(#fbAbd)" />
        <ellipse cx={-62} cy={10} rx={21} ry={13} fill={tail} opacity={0.35 + 0.65 * lit} />
        {/* thorax + shield */}
        <ellipse cx={6} cy={3} rx={24} ry={15} fill="#1c1611" />
        <ellipse cx={22} cy={4} rx={14} ry={12} fill="#6a2f1b" />
        <ellipse cx={20} cy={1} rx={9} ry={5} fill="rgba(255,190,140,0.25)" />
        {/* head + antennae */}
        <circle cx={38} cy={7} r={9.5} fill="#0f0c08" />
        <path d="M44 3 C 54 -6 62 -10 72 -12 M42 1 C 50 -12 56 -18 64 -22" stroke="#0f0c08" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* near wing */}
        <g transform={`rotate(${ang} 8 -8)`}>
          <ellipse cx={-30} cy={-10} rx={54} ry={14} fill="rgba(222,234,255,0.3)" stroke="rgba(255,255,255,0.42)" strokeWidth={1.2} />
          <path d="M-78 -10 L 20 -10" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        </g>
        {/* lantern highlight */}
        <ellipse cx={-60} cy={7} rx={10} ry={5} fill="#ffffff" opacity={0.55 * lit} />
      </svg>
    </div>
  );
};

export function mixHex(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
}

/** Film grain from a fixed noise tile, jittered per frame (deterministic). */
export const Grain: React.FC<{ f: number; opacity?: number }> = ({ f, opacity = 0.07 }) => {
  const ox = (f * 53) % 256, oy = (f * 97) % 256;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity, mixBlendMode: 'overlay',
      backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundSize: '256px 256px', backgroundPosition: `${ox}px ${oy}px`,
    }} />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)` }} />
);

/**
 * Caption: Arabic words rise out of blur one by one (blur-slide grammar: y, blur and opacity
 * share ONE progress value and ONE ease-out curve). RTL: the first word lands on the right.
 */
export const Caption: React.FC<{
  text: string; f: number; start: number; y: number; size?: number; weight?: number; color?: string;
  gap?: number; dur?: number; out?: number; accent?: number[]; scrim?: boolean;
}> = ({ text, f, start, y, size = 78, weight = 700, color = C.ink, gap = 4, dur = 22, out, accent = [], scrim = true }) => {
  const words = text.split(' ');
  const outP = out === undefined ? 0 : ramp(f, out, 10, EASE.swift);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', direction: 'rtl', opacity: 1 - outP, pointerEvents: 'none' }}>
      {scrim && (
        <div style={{ position: 'absolute', left: 40, right: 40, top: -70, bottom: -70, background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(3,5,12,0.55), rgba(3,5,12,0))' }} />
      )}
      <div style={{ position: 'relative', display: 'flex', gap: size * 0.3, direction: 'rtl', whiteSpace: 'nowrap', fontFamily: FONT.ui, fontSize: size, fontWeight: weight, lineHeight: 1.2 }}>
        {words.map((w, i) => {
          const p = ramp(f, start + i * gap, dur, EASE.out);
          return (
            <span key={i} style={{
              display: 'inline-block', opacity: p, color: accent.includes(i) ? C.amber : color,
              transform: `translateY(${((1 - p) * size * 0.38).toFixed(2)}px)`,
              filter: p >= 0.999 ? undefined : `blur(${((1 - p) * 18).toFixed(2)}px)`,
              textShadow: accent.includes(i) ? `0 0 28px ${rgba(C.amber, 0.45)}` : '0 2px 24px rgba(0,0,0,0.5)',
            }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};
