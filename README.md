# 杭州 · Hangzhou

A 60-second ink-wash film about one city, built entirely in code. No footage, no stock
images, no samples — every ridge, ripple, moon and note is generated at render time.

1920×1080 · 30 fps · 60 s · H.264 + AAC stereo

## The film

Eight scenes, each carrying one four-character line, the city named only at the end:

| # | scene | line | what moves |
|---|---|---|---|
| 01 | 一滴 | — | one ink drop lands; the crown and ripple become a lake |
| 02 | 西湖 · West Lake | 一湖烟水 | three ridges, Leifeng on the far shore, a boat crossing |
| 03 | 三潭印月 · Three Pools | 月到天心 | night falls, the sun's disc returns as the moon over three stone lanterns |
| 04 | 断桥残雪 · Lingering Snow | 桥断，雪未断 | the moon sinks into a semicircle and the bridge is built over it |
| 05 | 龙井 · Longjing Tea | 一盏青山 | the arch flattens into a celadon rim; a leaf falls, steam rises, a mountain lives in the cup |
| 06 | 丝绸 · Silk | 软得能接住风 | the cup's mouth feeds cloth rightwards, folds born at the mouth |
| 07 | 钱塘江 · Qiantang | 潮来，天地一线 | the silk's edge stands up as the bore; 六和塔 on the bank above |
| 08 | 杭州 | 两千年，一湖水 | the film closes as a red seal on paper |

One continuous idea holds it together: **the ring**. The first ripple in Scene 01 is the
same circle that becomes the setting sun, then the full moon, then the bridge's arch, the
cup's rim, the silk's mouth, the tide's crest, and finally the seal's square. It is drawn
once, in `src/Film.tsx`, and every scene borrows its identity.

## How it is made

Plain React components rendered by [Remotion](https://remotion.dev). Each scene is a
function of `t` in seconds; there is no timeline state, no keyframe editor, no assets to
sync. Terrain is generated from a seeded `hill()` primitive, so a ridge is four numbers and
a seed, and identical on every run.

`src/spec.ts` is the film's contract — format, palette, type, copy, motion grammar, and the
banned moves (no gradients, no glow, no 3-D, no crossfade as a transition). Every value is
declared once, with an `S0x` ledger tag, and scenes read from it. Nothing re-hard-codes a
contract value.

The soundtrack is synthesised too: `scripts/score.mjs` reads `scripts/cues.json` and writes
`public/score.wav` from scratch — Karplus-Strong plucks, generated bells, water, wood. Same
cues, same file, every time, with no sample library and no dependencies.

## Running it

```bash
npm install
npx remotion studio          # live preview at any frame
npm run render               # → out/film.mp4  (full quality)
npm run preview              # → out/preview.mp4  (half scale, quick look)
npm run still                # → out/still.png
```

Requires Node 22 and ffmpeg. A full-quality render takes roughly ten minutes on an M-series
laptop at `--concurrency=2`; the preview is about a minute.

## The gate

An eight-scene film made of code has a specific failure mode: you change one scene, and
something two scenes away moves for a reason you will not notice until someone watches the
whole thing. So the repo ships a merge gate.

```bash
node scripts/gate.mjs --fast   # contract + 8 locked keyframes   (~40 s, pre-commit)
node scripts/gate.mjs          # + whole-film liveness sweep     (~3 min, before merge)
node scripts/gate.mjs --update # re-seed the baseline (needs human approval — see BOT.md)
```

- **contract** — format, duration, copy and palette re-read from `src/spec.ts` and asserted
- **locked frames** — one settled frame per scene, SSIM ≥ 0.995 against `scripts/baseline/`
- **liveness** — mean frame difference per half-second across the whole film; catches a scene
  that has gone frozen (≥2 s with no motion) or a cut that jumps (>4× median)

`.github/workflows/gate.yml` runs the same three checks on every PR and uploads the keyframes,
the motion curve and the low-res pass as artifacts. `BOT.md` describes what a resident
engineer is allowed to do about a red gate, and what is deliberately not theirs.

## Layout

```
src/
  spec.ts          the contract: S01–S06, every number and line
  Film.tsx         scene order, the ring, the transitions
  scenes/          Scene01…Scene08, one file each, pure functions of t
  lib/motion.tsx   Canvas, easing, progress, rig, pseudo-random
  lib/film.tsx     terrain, water, pagoda, bridge, cup, silk, tide, seal
  lib/typo.tsx     InkPath, Label, Slug, Mist
scripts/
  score.mjs        cues.json → public/score.wav
  cues.json        the score's source of truth
  gate.mjs         the merge gate
  check.sh         deeper post-render review (12-frame sheet, spectral, loudness)
  baseline/        locked keyframes the gate compares against
```
