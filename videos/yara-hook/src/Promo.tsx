// Master timeline. SHOTS is the single source of truth (frames @30fps); captions, SFX pins and
// transitions all derive from it.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fonts } from './Fonts';
import { C } from './tokens';
import { EASE, ramp, rgba } from './lib/anim';
import { Caption, Grain, Vignette } from './lib/fx';
import { Desk } from './scenes/Desk';
import { Night } from './scenes/Night';
import { Jar, VoiceUI } from './scenes/Jar';
import { AppUI } from './scenes/Cards';
import { Name } from './scenes/Name';
import { SHOTS, TOTAL } from './timeline';
import { SfxLayer } from './SfxLayer';
export { SHOTS, TOTAL };


const Shot: React.FC<{ s: number; children: React.ReactNode }> = ({ s, children }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: '50% 50%' }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
const push = (f: number, start: number) => 1 + 0.04 * Math.min(1, Math.max(0, (f - start) / 9));

export const Promo: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  const g = useCurrentFrame();
  const desk = g - SHOTS.desk.from, night = g - SHOTS.night.from, jar = g - SHOTS.jar.from;
  const cards = g - SHOTS.cards.from, name = g - SHOTS.name.from;

  let body: React.ReactNode = null;
  if (g < SHOTS.teaser.dur) {
    if (g < 9) {
      // macro: the idea blooming at the pen nib (desk, camera forced tight on the nib)
      body = <Shot s={push(g, 0)}><div style={{ position: 'absolute', inset: 0, transform: 'scale(2.5)', transformOrigin: '56% 70%' }}><Desk f={58 + g} /></div></Shot>;
    } else if (g < 18) {
      body = <Shot s={push(g, 9)}><Night f={30 + (g - 9)} /></Shot>;
    } else {
      body = <Shot s={push(g, 18)}><div style={{ position: 'absolute', inset: 0, transform: 'scale(1.0)' }}><Jar f={80} /></div></Shot>;
    }
  } else if (g < SHOTS.desk.from) {
    body = <AbsoluteFill style={{ background: '#000' }} />;
  } else if (g < SHOTS.night.from) {
    const fade = ramp(desk, 0, 12, EASE.out);
    body = (
      <>
        <Desk f={desk} />
        <Caption text="أفكارك يراعات." f={desk} start={50} y={880} cx={330} out={106} accent={[1]} />
        <AbsoluteFill style={{ background: '#000', opacity: 1 - fade }} />
      </>
    );
  } else if (g < SHOTS.jar.from) {
    const toBlack = ramp(night, 76, 8, EASE.swift);
    body = (
      <>
        <Night f={Math.min(night, 83)} />
        <Caption text="تلمع لحظة…" f={night} start={14} y={430} />
        <Caption text="ثم تضيع." f={night} start={44} y={540} accent={[1]} />
        <AbsoluteFill style={{ background: '#000', opacity: night >= 84 ? 1 : toBlack }} />
      </>
    );
  } else if (g < SHOTS.cards.from) {
    const flash = ramp(jar, 84, 6, EASE.exit);
    const fromBlack = 1 - ramp(jar, 0, 10, EASE.out);
    body = (
      <>
        <Jar f={jar} />
        <VoiceUI f={jar} />
        <Caption text="قُلها فقط." f={jar} start={8} y={300} accent={[0]} out={72} />
        <AbsoluteFill style={{ background: C.amber, opacity: flash }} />
        <AbsoluteFill style={{ background: '#000', opacity: fromBlack }} />
      </>
    );
  } else if (g < SHOTS.name.from) {
    const flash = 1 - ramp(cards, 0, 16, EASE.out);
    body = (
      <>
        <AppUI f={cards} />
        <Caption text="تكلّم… ويراع يرتّبها." f={cards} start={62} y={1470} size={78} accent={[1]} scrim={false} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #fff3cf 0%, ${C.amber} 60%, ${C.amberDeep} 100%)`, opacity: flash }} />
      </>
    );
  } else {
    body = <Name f={name} />;
  }

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Fonts />
      {body}
      <Vignette strength={0.55} />
      <Grain f={g} />
      <SfxLayer bgm={bgm} />
    </AbsoluteFill>
  );
};
