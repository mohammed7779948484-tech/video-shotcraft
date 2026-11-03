# «يراع» (Yara') — 20s social hook · design spec

Mode: **autonomous free creation** (user delegated every creative/engineering decision, asked for a
publishable, reviewed result). Stages 0–3 below are the Agent's recorded decisions, not user confirmations.

## 0. Product brief + requirement→execution table

| Item | Decision | Why |
|---|---|---|
| Product | **Yara'** — a fictional voice-first notes app. Name = Arabic *yarāʿ*: both "firefly" and "reed pen (qalam)". | The user asked the Agent to invent the product. Fictional ⇒ no real brand/person is imitated. |
| Audience | Arabic-speaking people who "lose ideas" (students, creators, professionals), scrolling on a phone. | Hook for social. |
| Core claim | *Ideas are fireflies: speak them and Yara' keeps and files them.* | One idea per film (P4). |
| Features to show (P4 list) | ① the idea escapes (problem) ② speak → captured ③ auto-organised notes ④ the brand | Each gets exactly one shot. |
| Format | **1080×1920 (9:16), 30 fps, 20.0 s (600 f), Arabic RTL**. | User asked 15–20 s; vertical is the native ad format. Upper bound of the range chosen to give holds (R1/R3). |
| Data | Everything is invented. No real person, customer, or live data. The 5 note cards are neutral fake notes. | Q1 data口径. |
| CTA | "قريبًا · YARA'" (coming soon). | The product is fictional: no availability/store claim is made. Replace when a real product exists. |
| Audio | Original procedural score + SFX (see §5). | Freesound was unreachable (HTTP 403 through the sandbox proxy); skill forbids silently falling back to the old shared library. |

## 1. Visual direction (grown from the product, not a promo skin)

Three text directions were considered: (a) *Paper & ink* (warm paper, serif) — rejected: loses the firefly;
(b) *Neon tech* (cyan/violet UI) — rejected: generic, game-like; (c) **Midnight & lantern light** — chosen:
the product's own metaphor *is* light in the dark, so palette, UI and motion all derive from one source.

Tokens (`src/tokens.ts`): night `#050813 → #18264d`, moon `#9db4ff`, **firefly amber `#FFC857`** (light, plus emphasis words and chip outlines),
hot `#FFE9A8`, deep `#FF9F1C`, paper-ink `#EDE8DE`. Fonts: **Reem Kufi** (wordmark, Kufi geometry),
**IBM Plex Sans Arabic** (captions + UI). Glass surfaces with 1px hairline, no flat fills.

Motion personality (pipeline §1 two-axis table): energy *low-mid*, tone *wonder/care* → preset
"calm care": symmetric ease-in-out, ~40 f main durations, no overshoot except physical landings
(cards, jar tink). Three words: **quiet, luminous, precise**. One easing family everywhere.

## 2. Feature → shot mapping (cards verified in `gallery/api/library.json`, demo TSX read before use)

| Shot | Function | Card(s) used | How it was adapted (see §6 for risks) |
|---|---|---|---|
| S1 teaser 0–33f | cold open | `trailer-bumper` (`rhythm/trailer-grammar-moves`) | 3×9f hard cuts with 1→1.04 push each, 6f **pure black, silent**; cuts show the 3 most striking future frames (the firefly condensing at the pen nib / the swarm / the jar of light). Title card of the card is replaced by the real S2 (no INTRODUCING). |
| S2 desk 33–165f | idea is born (single hero, full arc ≥3s) | (hero arc grammar of `spotlight-hero-card`, Q5; no card geometry reused) | New scene. Gather → bloom → condense → lift → hover → exit; camera push then tilt-up. |
| S3 night 165–255f | problem: ideas are lost | `depth-layer-moves` (far/mid/near parallax rates), `tension-camera-moves` pull-back intent | Depth rates reimplemented with zoom exponents `z^(0.55+0.75d)`; pull-back from hero to wide field; field dies in a decelerating wave. |
| S4 jar 255–345f | speak → captured | `voice-waveform-live` (pill, 64→40 bars, speak/pause envelope, per-word transcript), `glow-flyline-moves` C `orb-flyline-relay` (resonance frame) | Warm-sand look → midnight/amber; arrivals are the SHARED frame of glow surge + ripple + glass tink + harp note. |
| S5 cards 345–441f | auto-organised notes | `deck-deal-flyin` (cue spacing, dive/settle ease, press), `row-embed` (amber seam on landing) | 5 notes dealt with intervals 9→7.5→6→4.5f from the jar's glow into real feed slots (Q9); caption starts during the last landings; board static ≥1.3 s after the last card lands. |
| S6 name 441–600f | brand reveal (signature motion) | **`stroke-segment-build`** (suspense reveal) + `glow-flyline` (flyline-arc) head-bright fading trail (`Trail` in `lib/fx.tsx`) | Neon tubes → firefly-lit fragments masked into the Kufi glyphs (see §3). |
| Captions | all | `blur-slide` (y, blur, opacity share ONE progress + ONE ease-out) | RTL: first word lands on the right. |

## 3. Signature motion: «النور يكتب» (light writes)

16 soft elliptical fragments are masked into the letterforms of «يراع»; each is ignited by a firefly that
flies out of a note card. Parameters kept from `stroke-segment-build`: spacing shrinking **7f→2.5f** across 13
fragments (`FIRST=14`; the card text says 9f→3f but the demo's own `EASE.out` maths gives ≈20f→0f, with the last five
fragments on the same frame — a source conflict; a linear shrink was chosen so every ignition and its tick stays distinct), 7f strike "on–off–on–half–on" settling to **0.58**, 14f breath,
three key fragments on a 7f/6f beat (the two dots of ي + the head of ع — the identity features, held
back), reveal 0.58→1→1.25→1, room lights with lit-count (physical: more fragments, brighter room),
**hold ≥ 1 s** (R1). Fragments are shrunk (×0.74) so the word is *not* readable for >60 % of the build.

## 4. Shot table (frames @30 fps)

| # | from | dur | content | key motion | caption |
|---|---|---|---|---|---|
| 1 | 0 | 27 | teaser 3×9f | trailer-bumper cuts | — |
| – | 27 | 6 | black | silence | — |
| 2 | 33 | 132 | desk / birth | gather→bloom→condense→hover→exit | «أفكارك يراعات.» |
| 3 | 165 | 90 | night field | pull-back, field extinguishes, hero heartbeat fails, 6f black | «تلمع لحظة… ثم تضيع.» |
| 4 | 255 | 90 | jar | voice pill, 10+1 arrivals, plunge into glass → amber flash | «قُلها فقط.» + live transcript |
| 5 | 345 | 96 | app | 5 cards dealt w/ hard accel; board static ≥1.3 s after the last landing (local f55→96) | «تكلّم… ويراع يرتّبها.» (starts f44, dissolves with the UI in shot 6) |
| 6 | 441 | 159 | name | dissolve → fragments → keys @86/93/99 → reveal @105 → hold 54f | «امسك الفكرة قبل أن تطير.» + «قريبًا · YARA'» |

## 5. Sound

**Freesound CC0 recordings (19 cues, `public/audio/fs/` + processed into `public/audio/sfx/`)**, chosen by source match
(then rating/downloads as supporting evidence) with the skill's `sfx-source.py` (licence re-checked on each page, SHA-256 +
analysis stored in `public/audio/fs/audio-manifest.json`, credits in `FREESOUND-CREDITS.md`):
glass clinks ×3 (fs:738633, fs:560298, fs:262958 — jar arrivals alternate two different glasses, lid note a third),
card snap + soft sub kick (fs:120508, fs:784658 — alternating landings), whooshes (fs:701104, fs:267950),
riser (fs:685256), sub-bass drop and boom (fs:428073 teaser hits, fs:856174 flash + REVEAL impact),
crystal twinkle / sparkle flourish / little bells (fs:639429, fs:844398, fs:759840), heartbeat (fs:384662),
night crickets (fs:424871), wing-flap foley (fs:561009). `tools/process_freesound.py` cuts the action window (a few ms
before each energy peak), peak-normalises to 0.9 (some sources were as quiet as −34 dBFS; one preview peaked at +1.25 dBFS),
fades it and logs every cut/gain in `audio-manifest.json -> freesound_cues`. The files are **lossy MP3 previews**, not
uploader originals.
**Still synthesised (`tools/make_audio.py`)**: ignition ticks, three key tones, shimmer-up, breath swell, room air, and the whole
**score** (Dm → B♭ → Gm → F → D-major resolution pad + harp plucks pinned to arrivals/cards/keys).
Vocabulary follows S1 (riser/impact/sparkle/whoosh; glass/paper foley; no game bleeps). Real silences at the teaser
black beat and the night→jar black beat. Pins: declarative table in `src/SfxLayer.tsx`, derived from scene constants.
Deliveries: with score, and without score (SFX kept) via `--props=props-nobgm.json`.

## 6. Declared deviations / risks (aesthetic-rules: allowed if recorded)

- **R4**: no beat-locked music grid (no user-chosen BGM), so no camera-layer beat slams are used.
- **Q4 (glint)**: fireflies are the *subject* (narrative light), not decorative sparkle on UI; every other
  element keeps one hero. Swarm used once (S3).
- **Dark scenes**: whole hook is dark by design (≤1 dark segment rule of `glow-flyline-moves` is about a
  longer film mixing light pages; here the dark world is the brand). The app UI is dark mode.
- **Q1**: the UI is hand-built (not a replication of an existing page) — allowed; quality bar = readable,
  native Arabic typography, real note density.
- **Card adaptations** change the *material* (neon→light) of `stroke-segment-build`; its own known-pitfall
  list says ignition and half-lit values must be retuned — they were re-checked on stills.
- Captions: 78 px (76 px for the closing tagline), measured ink height 72–105 px. The literal Q11 wording (≥5.2 % of
  frame height) comes from 1080p landscape; here the absolute minimum (≥56 px captions, ≥32 px auxiliary) is met on a
  1080-wide frame and the ambiguity is declared. Auxiliary text ≥ 34 px (tag chips 34 px).
- **S1 (sound)**: the score is a calm pad + harp, not a strong-beat electronic bed — there is no user-chosen BGM and the
  tone is wonder/care. Declared deviation. No audio was auditioned by ear (see below).
- **Pull-back-isolation pitfall**: night fireflies go out in a deterministic shuffled order (random-order extinguish can
  read as a glitch); the wave is density-eased and the hero's heartbeat is driven from the same frames as its sound.
- Cards/name: the name «يراع» is spoken in the cards caption (so the product is introduced), but the header mark was
  removed so the big wordmark reveal stays fresh.
- Not delivered: the workbench manifest (`src/workbench.ts`) and Jianying export (not requested).

## 7. Audio honesty notes

- An earlier build used only synthesised audio because Freesound returned HTTP 403 from the sandbox at that time; it was
  reachable again later and the main SFX were replaced by the CC0 recordings above. The skill's sourcing rule is now
  followed for those 19 cues; the synthetic ones are declared in §5.
- **Nothing was auditioned by ear** — selection is by source description, analysis, rating/downloads, and measurements
  (loudness, peaks, per-segment RMS). A human listen pass before posting is recommended; any file can be swapped in
  `public/audio/sfx/` (names are the pin keys in `src/SfxLayer.tsx`).
- Mastering after render (ffmpeg, audio only, `tools/master.sh`): +3.3 dB gain, limiter 0.84 (−1.5 dBFS), 0.4 s fade-out,
  trimmed to 20.000 s. Result ≈ −14 LUFS integrated, sample peak ≈ −1.5 dBFS. Both deliveries get identical treatment.
