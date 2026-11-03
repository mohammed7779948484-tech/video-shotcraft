// Single source of truth for the film's timeline (30fps). Scene lengths live next to the scenes.
export const FPS = 30;
export const SHOTS = {
  teaser: { from: 0, dur: 27 }, // 3 x 9f hard cuts (trailer-bumper)
  black: { from: 27, dur: 6 }, // pure black, silent
  desk: { from: 33, dur: 132 },
  night: { from: 165, dur: 90 }, // 84 picture + 6 black
  jar: { from: 255, dur: 90 },
  cards: { from: 345, dur: 96 },
  name: { from: 441, dur: 159 },
} as const;
export const TOTAL = 600;
