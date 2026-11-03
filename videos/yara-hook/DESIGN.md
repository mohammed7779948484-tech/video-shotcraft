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

Tokens (`src/tokens.ts`): night `#050813 → #18264d`, moon `#9db4ff`, **firefly amber `#FFC857`** (light only),
hot `#FFE9A8`, deep `#FF9F1C`, paper-ink `#EDE8DE`. Fonts: **Reem Kufi** (wordmark, Kufi geometry),
**IBM Plex Sans Arabic** (captions + UI). Glass surfaces with 1px hairline, no flat fills.

Motion personality (pipeline §1 two-axis table): energy *low-mid*, tone *wonder/care* → preset
"calm care": symmetric ease-in-out, ~40 f main durations, no overshoot except physical landings
(cards, jar tink). Three words: **quiet, luminous, precise**. One easing family everywhere.

## 2. Feature → shot mapping (cards verified in `gallery/api/library.json`, demo TSX read before use)

| Shot | Function | Card(s) used | How it was adapted (see §6 for risks) |
|---|---|---|---|
| S1 teaser 0–33f | cold open | `trailer-bumper` (`rhythm/trailer-grammar-moves`) | 3×9f hard cuts with 1→1.04 push each, 6f **pure black, silent**; cuts show the 3 most striking future frames (nib bloom / swarm / jar of light). Title card of the card is replaced by the real S2 (no INTRODUCING). |
| S2 desk 33–165f | idea is born (single hero, full arc ≥3s) | (hero arc grammar of `spotlight-hero-card`, Q5; no card geometry reused) | New scene. Gather → bloom → condense → lift → hover → exit; camera push then tilt-up. |
| S3 night 165–255f | problem: ideas are lost | `depth-layer-moves` (far/mid/near parallax rates), `tension-camera-moves` pull-back intent | Depth rates reimplemented with zoom exponents `z^(0.55+0.75d)`; pull-back from hero to wide field; field dies in a decelerating wave. |
| S4 jar 255–345f | speak → captured | `voice-waveform-live` (pill, 64→40 bars, speak/pause envelope, per-word transcript), `glow-flyline-moves` C `orb-flyline-relay` (resonance frame) | Warm-sand look → midnight/amber; arrivals are the SHARED frame of glow surge + ripple + glass tink + harp note. |
| S5 cards 345–441f | auto-organised notes | `deck-deal-flyin` (cue spacing, dive/settle ease, press), `row-embed` (amber seam on landing) | 5 notes dealt with intervals 9→7.5→6→4.5f from the jar's glow into real feed slots (Q9); 0.5s+ rest before caption. |
| S6 name 441–600f | brand reveal (signature motion) | **`stroke-segment-build`** (suspense reveal) + `glow-flyline` trail grammar | Neon tubes → firefly-lit fragments masked into the Kufi glyphs (see §3). |
| Captions | all | `blur-slide` (y, blur, opacity share ONE progress + ONE ease-out) | RTL: first word lands on the right. |

## 3. Signature motion: «النور يكتب» (light writes)

16 soft elliptical fragments are masked into the letterforms of «يراع»; each is ignited by a firefly that
flies out of a note card. Parameters kept from `stroke-segment-build`: ease-out spacing 9f→3f across 13
fragments (`FIRST=16, SPAN=56`), 7f strike "on–off–on–half–on" settling to **0.58**, 14f breath,
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
| 5 | 345 | 96 | app | 5 cards dealt w/ hard accel, 0.5s rest | «تكلّم… ويراع يرتّبها.» |
| 6 | 441 | 159 | name | dissolve → fragments → keys @86/93/99 → reveal @105 → hold 54f | «امسك الفكرة قبل أن تطير.» + «قريبًا · YARA'» |

## 5. Sound

All audio is synthesised by `tools/make_audio.py` (numpy, fixed seeds) → `public/audio/`:
~28 SFX (thump, soft whoosh, **glass tinks (inharmonic partials)**, warm bells, soft ticks for ignition,
felt pats for cards, riser → impact → sparkle for the reveal) and a 20 s score (Dm→B♭→Gm→F→D major
resolution + harp plucks pinned to the arrivals/cards/keys). Vocabulary follows S1 (riser/impact/sparkle/
whoosh; no game bleeps; glass/paper are foley-style). The picture's silences (teaser black, night→jar
black) are real silences. Pins are a declarative table in `src/SfxLayer.tsx`, derived from scene constants.
Two deliveries: with score, and without score (SFX kept) via `--props=props-nobgm.json`.

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
- Captions: 74–78 px (≥ 5.2 % of 1920 height is 100 px for the *frame height*; on a 1080-wide phone the
  effective rule "≥56 px at 1080p" is met). Auxiliary text ≥ 34 px.
- Not delivered: the workbench manifest (`src/workbench.ts`) and Jianying export (not requested).
