// S5 — "تتحول إلى ملاحظات": the jar's light becomes the app. Five idea-cards are dealt from the
// glow with a HARD acceleration (deck-deal-flyin kinematics: cue_k spacing shrinks 9f->4f, 9f dive with an
// arc + 1.06 peak, 5f overshoot settle, 1f press) and land in real slots of the feed (Q9), each landing
// leaves an amber seam on the card's lower edge (row-embed). Then 0.5s+ rest before the caption.
import React from 'react';
import { Easing } from 'remotion';
import { C, FONT } from '../tokens';
import { EASE, mix, ramp, rgba, bezier } from '../lib/anim';
import { Glow, Mote } from '../lib/fx';

export const CARDS_DUR = 96;

export const ar = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
export const countLabel = (n: number) => (n === 0 ? 'لا أفكار محفوظة بعد' : n === 1 ? 'فكرة واحدة محفوظة' : n === 2 ? 'فكرتان محفوظتان' : `${ar(n)} أفكار محفوظة`);

export const SLOT_Y0 = 270;
export const CARD_H = 204;
export const PITCH = 228;
export const CARD_X = 80;
export const CARD_W = 920;
export const slotY = (k: number) => SLOT_Y0 + k * PITCH;

// hard-accelerating cue frames (intervals 9, 7.5, 6, 4.5)
export const CUES = [14, 23, 30.5, 36.5, 41];

export const NOTES = [
  { t: 'إعلان المرطبان السحري', s: 'يراعات تهبط في زجاجة… ثم تكتب الاسم.', tag: 'فكرة' },
  { t: 'اجتماع الخميس', s: 'تسليم الهوية البصرية قبل الظهر.', tag: 'عمل' },
  { t: 'هدية أمي', s: 'عطر عود، وبطاقة بخط اليد.', tag: 'شخصي' },
  { t: 'جملة للمقال', s: 'أجمل جملة هي التي لم تُكتب بعد.', tag: 'كتابة' },
  { t: 'قائمة السفر', s: 'جواز، شاحن، ودفتر صغير.', tag: 'سفر' },
];

const DIVE = bezier(0.3, 0, 0.2, 1);
const SETTLE = Easing.bezier(0.3, 0, 0.25, 1.15);
const ORIGIN = { x: 540, y: 1560 };

const Card: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  const cue = CUES[k];
  const n = NOTES[k];
  const diveT = DIVE(Math.min(1, Math.max(0, (f - cue) / 9)));
  const settleT = f < cue + 9 ? 0 : SETTLE(Math.min(1, (f - cue - 9) / 5));
  const landed = f >= cue + 14;
  const y = slotY(k);
  const flying = f >= cue && !landed;
  const pre = f < cue;
  // flight: from the glow, arc up and over, overshoot into the slot
  const dx = (ORIGIN.x - 540) * (1 - diveT);
  const dy = (ORIGIN.y - (y + CARD_H / 2)) * (1 - diveT);
  const arc = Math.sin(diveT * Math.PI) * 90;
  const sc = flying ? mix(0.5, 1, diveT) * (1 + Math.sin(diveT * Math.PI) * 0.06) : 1;
  const rot = flying ? ((k * 7) % 5 - 2.2) * (1 - diveT) * 2.2 : 0;
  const press = f >= cue + 10 && f < cue + 13 ? 0.996 : 1;
  if (pre) return null;
  const tx = landed ? 0 : dx;
  const ty = landed ? 0 : dy - arc * (1 - settleT);
  const overshoot = flying && f >= cue + 9 ? (settleT - 1) * 14 : 0;
  const seam = f >= cue + 9 ? 1 - ramp(f, cue + 9, 10, EASE.out) : 0; // amber seam, lower edge
  const lit = f >= cue + 9 ? ramp(f, cue + 9, 4, EASE.out) * (0.55 + 0.45 * (1 - ramp(f, cue + 13, 24, EASE.out))) : 0; // firefly dot flare
  const op = ramp(f, cue, 3, EASE.linear);
  return (
    <>
      {flying && diveT < 0.97 && (
        <div style={{ position: 'absolute', left: CARD_X, top: y, width: CARD_W, height: CARD_H, borderRadius: 34, background: rgba(C.amber, 0.12), filter: 'blur(14px)', opacity: 0.6 * (1 - diveT), transform: `translate(${tx * 1.05}px, ${ty * 1.05}px) scale(${sc})` }} />
      )}
      <div style={{
        position: 'absolute', left: CARD_X, top: y, width: CARD_W, height: CARD_H, borderRadius: 34, opacity: op,
        transform: `translate(${tx}px, ${ty + overshoot}px) scale(${sc * press}) rotate(${rot}deg)`,
        background: 'linear-gradient(180deg, rgba(30,44,86,0.92), rgba(18,28,58,0.94))',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.07), ${flying ? '0 40px 80px rgba(0,0,0,0.55)' : '0 14px 34px rgba(0,0,0,0.45)'}`,
        direction: 'rtl', fontFamily: FONT.ui, overflow: 'hidden',
      }}>
        {/* the firefly that became this note */}
        <div style={{ position: 'absolute', right: 34, top: 44, width: 22, height: 22, borderRadius: '50%', background: C.amberHot, boxShadow: `0 0 ${14 + 30 * lit}px ${rgba(C.amber, 0.5 + 0.5 * lit)}, 0 0 ${40 * lit}px ${rgba(C.amber, 0.6 * lit)}` }} />
        <div style={{ position: 'absolute', right: 74, top: 20, fontSize: 56, fontWeight: 700, color: C.ink, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{n.t}</div>
        <div style={{ position: 'absolute', right: 74, top: 104, fontSize: 38, fontWeight: 400, color: C.ink2, lineHeight: 1.4, whiteSpace: 'nowrap' }}>{n.s}</div>
        <div style={{ position: 'absolute', left: 30, top: 30, height: 54, padding: '0 26px', borderRadius: 27, display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 500, color: C.amber, boxShadow: `inset 0 0 0 1.5px ${rgba(C.amber, 0.5)}`, background: rgba(C.amber, 0.08) }}>{n.tag}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: `linear-gradient(90deg, ${rgba(C.amber, 0)}, ${rgba(C.amber, 0.95 * seam)}, ${rgba(C.amber, 0)})` }} />
      </div>
    </>
  );
};

export const AppUI: React.FC<{ f: number; dissolve?: number }> = ({ f, dissolve = 0 }) => {
  const landedN = CUES.filter((c) => f >= c + 12).length;
  const inT = ramp(f, 0, 18, EASE.out);
  const glowFade = 1 - ramp(f, 40, 30, EASE.out) * 0.6;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(180deg, #070b1a 0%, #0a1128 50%, #0c1433 100%)', fontFamily: FONT.ui }}>
      <Glow x={540} y={1650} r={800} color={C.amber} a={0.2 * glowFade} sx={1.3} />
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - dissolve, filter: dissolve > 0 ? `blur(${dissolve * 12}px)` : undefined, transform: `scale(${1 - 0.03 * dissolve})`, transformOrigin: '50% 40%' }}>
        {/* header */}
        <div style={{ position: 'absolute', right: 80, top: 132, direction: 'rtl', opacity: inT, transform: `translateY(${(1 - inT) * -20}px)` }}>
          <div style={{ fontSize: 68, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>أفكاري</div>
          <div style={{ fontSize: 34, color: C.ink2, marginTop: 2 }}>{countLabel(landedN)}</div>
        </div>
        <div style={{ position: 'absolute', left: 80, top: 140, display: 'flex', alignItems: 'center', gap: 14, opacity: inT }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.amberHot, boxShadow: `0 0 22px ${rgba(C.amber, 0.9)}, 0 0 60px ${rgba(C.amber, 0.45)}` }} />
        </div>
        {NOTES.map((_, k) => <Card key={k} f={f} k={k} />)}
      </div>
    </div>
  );
};
