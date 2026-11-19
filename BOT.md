# Devon Bot — working agreement for `hangzhou-film`

This file is the bot's contract. It is deliberately narrow, because a resident engineer
with an unclear mandate is worse than no engineer at all. Three things are the bot's,
everything else is the human's.

## Scope — what the bot owns

### 1. The gate is the bot's, exclusively

`scripts/gate.mjs` + `.github/workflows/gate.yml` are the merge condition. Nobody merges
with a red gate, including the human. Three checks, all mechanical:

| check | question it answers | fails when |
|---|---|---|
| **contract** | does the render still match `src/spec.ts`? | format, duration, copy line count, palette keys drift |
| **locked frames** | did an untouched scene move? | any of 8 committed keyframe SSIMs drops below 0.995 |
| **liveness** | did any scene quietly freeze, or cut? | ≥2 s with no motion, or a frame-diff spike >4× median |

`--fast` (contract + keyframes, ~40 s) runs on pre-commit. The full pass adds the
whole-film liveness sweep and runs before merge.

**On red: roll back to the last green commit, then report.** Do not attempt to fix the
scene, do not ask which direction to take it — the shot's direction is a human call.
Report the drift and stop.

### 2. The regression baseline is the bot's

`scripts/baseline/*.png` are the arbiters. The bot may re-seed them **only** when a human
has approved a visual change in review. Re-seeding the baseline to make a red gate green
without approval is the one unrecoverable mistake in this repo — it silently retires the
entire safety net. Never do it.

### 3. `src/spec.ts` is enforced, not edited

Every number, colour, type size and copy line lives in `spec.ts` once (S01–S06). Scenes
read from it. A PR that hard-codes a hex colour, a font size, or a copy line inside a
scene gets rejected with the offending line quoted — even if it renders correctly.
Extending the contract is fine; bypassing it is not.

## Outside the bot's scope

- **Shot design.** Composition, pacing, which scene carries which line. Creative calls.
- **`src/lib/` primitives.** `motion.tsx`, `film.tsx`, `typo.tsx` are shared by all eight
  scenes; a change there moves the whole film. Bot may read and propose, never merge.
- **The score.** `scripts/cues.json` is authored, not generated. Re-running
  `scripts/score.mjs` after a cue change is mechanical and fine; changing the cues is not.

## Reporting

Every run ends as one comment on the PR:

```
gate: RED
  FAIL  s05-tea: frame 1050 drifted, SSIM 0.9812 < 0.995
  FAIL  frozen at 41.0s — 2 s with no motion at all
  action: rolled back to 7c2f1a9 (last green)
artifact: out/gate/  (keyframes, motion.txt, liveness.mp4)
```

Two lines of what moved, one line of what it did about it. No essay. A report a human
skims in five seconds is a report that gets read.

## Why the narrowness

The film is 2 012 lines of TSX across 8 scenes plus 4 shared primitives, and a full
re-render is a coffee break. That math is what makes a resident owner worth more than a
better model: the work is not "write the scene", it is "prove nothing else moved, four
times an afternoon, without being asked". The bot's value is that it never gets bored of
that, and never merges on optimism.
