# yara-hook

20-second Arabic 9:16 ad hook for **«يراع» (Yara')**, a fictional voice-notes app. Built with Remotion
following the `video-shotcraft` skill (autonomous free-creation mode). Design decisions: `DESIGN.md`.

```bash
cd videos/yara-hook
npm install
python3 tools/make_audio.py            # regenerates public/audio (deterministic, numpy only)
npx remotion render src/index.ts YaraHook out/yara-hook.mp4                       # with score
npx remotion render src/index.ts YaraHook out/yara-hook-nobgm.mp4 --props=props-nobgm.json   # SFX only
npx remotion still src/index.ts YaraHook out/qa/frame.png --frame=548             # any frame
```

- Timeline single source of truth: `src/timeline.ts`; SFX pin table: `src/SfxLayer.tsx`.
- Fonts (OFL): IBM Plex Sans Arabic, Reem Kufi (in `public/fonts`).
- Audio is original synthesis (`tools/make_audio.py`), no third-party samples, nothing to credit.
- Everything is deterministic (seeded; no `Math.random` / `Date`).
- `remotion.config.ts` points at the sandbox Chromium; delete that line on a normal machine.
- The product, name, notes and "coming soon" CTA are fictional placeholders: swap them for a real product.
