// Central SFX table: every cue is { from, src, volume } pinned to a frame of the single timeline,
// with a comment naming the picture action it belongs to (S2/S3/S4). Constants come from the scenes,
// so any retiming of the picture moves the sound with it.
import React from 'react';
import { Audio, Sequence, staticFile, interpolate } from 'remotion';
import { SHOTS, TOTAL } from './timeline';
import { ARRIVALS, HERO_ARRIVAL } from './scenes/Jar';
import { CUES } from './scenes/Cards';
import { FLIES, HEART_AT } from './scenes/Night';
import { ORDER, KEY_AT, REVEAL, startOf } from './scenes/Name';

// Output-track lag of the render pipeline (AAC priming), in frames. Measured, see README ("Audio sync record").
export const OUTPUT_LAG_F = 1.3;

type Cue = { from: number; src: string; volume: number; dur?: number; note: string; fadeIn?: number; fadeOut?: number };
const S = SHOTS;
const alt = (i: number, a: string, b: string) => (i % 2 ? b : a);

export const SFX: Cue[] = [];
const add = (c: Cue) => SFX.push(c);

// --- teaser: three cuts on three thumps, then true silence in the black beat
add({ from: 0, src: 'thump', volume: 0.85, dur: 12, note: 'cut 1: spark leaves the pen' });
add({ from: 9, src: 'thump', volume: 0.8, dur: 12, note: 'cut 2: swarm' });
add({ from: 18, src: 'thump', volume: 0.9, dur: 9, fadeOut: 4, note: 'cut 3: jar full of light (tail dies before the black beat)' });
add({ from: 6, src: 'whoosh_short', volume: 0.22, dur: 8, note: 'lead-in to cut 2' });
add({ from: 15, src: 'whoosh_short', volume: 0.22, dur: 8, note: 'lead-in to cut 3' });

// --- desk: the idea is born
add({ from: S.desk.from, src: 'room_air', volume: 0.2, dur: 132, fadeIn: 20, fadeOut: 20, note: 'quiet room' });
add({ from: S.desk.from + 18, src: 'shimmer_up', volume: 0.38, dur: 40, note: 'motes gather at the nib' });
add({ from: S.desk.from + 52, src: 'bell_birth', volume: 0.5, dur: 48, note: 'firefly condenses (hero birth)' });
add({ from: S.desk.from + 98, src: 'whoosh_exit', volume: 0.4, dur: 34, note: 'hero leaves through the window / camera tilt up' });

// --- night: pull-back, the field goes out, hero alone
add({ from: S.night.from, src: 'whoosh_air', volume: 0.3, dur: 40, note: 'pull-back from the hero to the wide field' });
add({ from: S.night.from, src: 'crickets', volume: 0.18, dur: 84, fadeIn: 10, fadeOut: 10, note: 'night bed' });
[...FLIES].map((a) => a.die).sort((a, b) => a - b).filter((_, i) => i % 7 === 3).forEach((d, i) => add({ from: S.night.from + Math.round(d), src: 'tick_c', volume: 0.30 - i * 0.012, dur: 6, note: 'a firefly goes out (audible over the score: -11..-15 dB margin before fix)' }));
add({ from: S.night.from + HEART_AT[0], src: 'heartbeat', volume: 0.62, dur: 18, fadeOut: 4, note: 'hero heartbeat 1 (pinned to the picture pulse)' });
add({ from: S.night.from + HEART_AT[1], src: 'heartbeat', volume: 0.5, dur: 9, fadeOut: 4, note: 'hero heartbeat 2 (failing); dies before the black beat at night+84' });

// --- jar: voice wakes the field; every arrival = tink on the same frame as the glow surge
add({ from: S.jar.from + 4, src: 'breath_swell', volume: 0.28, dur: 28, note: 'voice pill appears' });
ARRIVALS.forEach((a, i) => add({ from: S.jar.from + a, src: alt(i, 'tink_a', 'tink_b'), volume: 0.55 - i * 0.027, dur: 14, note: `firefly ${i + 1} enters the jar (double sample, stepped-down level)` }));
add({ from: S.jar.from + HERO_ARRIVAL, src: 'tink_lid', volume: 0.62, dur: 22, note: 'hero lands: lid note, jar full' });
add({ from: S.jar.from + 75, src: 'riser_plunge', volume: 0.5, dur: 15, note: 'plunge into the glass' });
add({ from: S.cards.from, src: 'impact_big', volume: 0.42, dur: 40, fadeOut: 12, note: 'amber flash: the jar becomes the app' });

// --- cards: hard-accelerating deal, whip on flight, pat on landing
CUES.forEach((c, i) => {
  add({ from: S.cards.from + Math.round(c), src: 'card_whip', volume: 0.34 - i * 0.02, dur: 8, note: `card ${i + 1} flies out of the glow` });
  add({ from: S.cards.from + Math.round(c) + 9, src: alt(i, 'pat_a', 'pat_b'), volume: 0.5 - i * 0.045, dur: 7, note: `card ${i + 1} lands in its slot` });
});

// --- name: the light writes
add({ from: S.name.from, src: 'whoosh_air', volume: 0.3, dur: 30, note: 'app dissolves into fireflies' });
ORDER.slice(0, 13).forEach((_, rank) => add({ from: S.name.from + Math.round(startOf(rank)), src: ['tick_a', 'tick_b', 'tick_c'][rank % 3], volume: 0.3 - rank * 0.01, dur: 7, note: `fragment ${rank + 1} ignites` }));
KEY_AT.forEach((k, i) => add({ from: S.name.from + k, src: `key_${i + 1}`, volume: 0.5, dur: 27, note: `key fragment ${i + 1} of 3` }));
add({ from: S.name.from + REVEAL - 72, src: 'riser_2s', volume: 0.5, dur: 72, fadeOut: 3, note: 'riser into the reveal' });
add({ from: S.name.from + REVEAL, src: 'impact_big', volume: 0.8, dur: 78, fadeOut: 20, note: 'REVEAL: the name is readable' });
add({ from: S.name.from + REVEAL + 2, src: 'sparkle_tail', volume: 0.42, dur: 50, fadeOut: 22, note: 'sparkle after the impact' });
add({ from: S.name.from + REVEAL + 22, src: 'bell_hi', volume: 0.28, dur: 30, fadeOut: 14, note: 'tagline lands' });

export const SfxLayer: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm && <Audio src={staticFile('audio/bgm.wav')} volume={0.5} />}
    {SFX.map((c, i) => {
      const from = Math.max(0, Math.round(c.from - OUTPUT_LAG_F));
      const dur = c.dur ?? 30;
      const vol = (f: number) => {
        let v = c.volume;
        if (c.fadeIn) v *= interpolate(f, [0, c.fadeIn], [0, 1], { extrapolateRight: 'clamp' });
        if (c.fadeOut) v *= interpolate(f, [dur - c.fadeOut, dur], [1, 0], { extrapolateLeft: 'clamp' });
        return Math.max(0, v);
      };
      if (from >= TOTAL) return null;
      return (
        <Sequence key={i} from={from} durationInFrames={Math.min(dur, TOTAL - from)}>
          <Audio src={staticFile(`audio/sfx/${c.src}.wav`)} volume={vol} />
        </Sequence>
      );
    })}
  </>
);
