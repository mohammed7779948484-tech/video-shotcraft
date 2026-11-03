// Design tokens for "Yara'" (a fictional voice-notes app). The whole film grows
// from these: midnight ink, firefly amber, paper white. Nothing else.
export const C = {
  night0: '#050813',
  night1: '#0A1020',
  night2: '#101a35',
  night3: '#18264d',
  moon: '#9db4ff',
  amber: '#FFC857', // firefly light
  amberHot: '#FFE9A8',
  amberDeep: '#FF9F1C',
  paper: '#F4EFE6',
  ink: '#EDE8DE',
  ink2: 'rgba(237,232,222,0.72)',
  ink3: 'rgba(237,232,222,0.46)',
  glass: 'rgba(255,255,255,0.055)',
  hair: 'rgba(255,255,255,0.13)',
};

export const FONT = {
  ui: '"Plex Arabic", "IBM Plex Sans Arabic", sans-serif',
  brand: '"Reem Kufi", "Plex Arabic", sans-serif',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Motion personality: calm wonder. Symmetric/soft ease, ~40f main durations,
// overshoot only for physical landings (cards, jar tinks).
export const PERSONALITY = { mainDur: 42, overshoot: 1.06 };
