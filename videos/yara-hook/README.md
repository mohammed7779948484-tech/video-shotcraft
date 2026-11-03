# yara-hook

20-second Arabic 9:16 ad hook for **«يراع» (Yara')**, a fictional voice-notes app. Built with Remotion
following the `video-shotcraft` skill (autonomous free-creation mode). Design decisions: `DESIGN.md`.

```bash
cd videos/yara-hook
npm install
python3 tools/make_audio.py            # regenerates public/audio (deterministic, numpy only)
npx remotion render src/index.ts YaraHook out/raw-bgm.mp4                                   # with score
npx remotion render src/index.ts YaraHook out/raw-nobgm.mp4 --props=props-nobgm.json        # SFX only
bash tools/master.sh                                                                          # audio mastering -> out/yara-hook.mp4, out/yara-hook-nobgm.mp4
npx remotion still src/index.ts YaraHook out/qa/frame.png --frame=548             # any frame
```

- Timeline single source of truth: `src/timeline.ts`; SFX pin table: `src/SfxLayer.tsx`.
- Fonts (OFL): IBM Plex Sans Arabic, Reem Kufi (in `public/fonts`).
- Audio is original synthesis (`tools/make_audio.py`), no third-party samples, nothing to credit.
- Everything is deterministic (seeded; no `Math.random` / `Date`).
- `remotion.config.ts` points at the sandbox Chromium; delete that line on a normal machine.
- The product, name, notes and "coming soon" CTA are fictional placeholders: swap them for a real product.

## Audio sync record (output-track lag)

- Pipeline: Remotion 4.0.484, h264 + AAC-LC 48 kHz in MP4 (`remotion.config.ts`), measured 2026-11-03.
- Probe: 24 sharp SFX cues (thump, tink, pat, key tones); method: normalised cross-correlation of the first 30 ms of each
  source file against the rendered audio track (independent reviewer). Result: lag 2175–2207 samples = **1.36–1.38 frames**
  (~46 ms); source peak lag ≤ 8 ms (≤ 0.25 f) for these cues.
- Compensation: `OUTPUT_LAG_F = 1.3` subtracted once in `src/SfxLayer.tsx` (`from = round(pin − 1.3)`), not scattered per cue.
  Residual: rounding always yields `pin − 1` frames, so cues land ≈ +0.38 f (13 ms) late, all in the same direction; the cue
  pinned at frame 0 is clamped (+1.38 f). Score plucks/pulses (`bgm.wav`) are musical events placed without this offset.
- Not delivered: a full round-trip error table for every cue.
