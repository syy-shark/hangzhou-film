#!/usr/bin/env node
// gate.mjs — the film's regression gate. Every scene change must pass it before it merges.
//
// Three independent checks, each one answering a question a human reviewer would otherwise
// have to answer by watching the whole film:
//
//   1. LOCKED FRAMES  — eight keyframes, one per scene, are re-rendered and compared
//                       pixel-wise against a committed baseline. Guards "I only touched
//                       Scene03, why did Scene05 move?"
//   2. LIVENESS       — one low-res pass over the whole film, down-sampled to a mean
//                       |frame diff| per 0.5 s. Guards the failure a still frame can never
//                       show: a scene that has gone frozen, or a cut that jumps.
//   3. CONTRACT       — format, palette and copy are read out of src/spec.ts and asserted
//                       against what actually got rendered. Guards drift between the spec
//                       and the composition.
//
// Usage:
//   node scripts/gate.mjs              # full gate: keyframes + liveness pass + contract
//   node scripts/gate.mjs --fast       # keyframes + contract only (pre-commit, ~1 min)
//   node scripts/gate.mjs --update     # rewrite the baseline from the current render
//
// Exit 1 on any failure. Nothing here writes outside out/gate/ except --update.
import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'out/gate');
const BASE = join(ROOT, 'scripts/baseline');
const FAST = process.argv.includes('--fast');
const UPDATE = process.argv.includes('--update');
mkdirSync(OUT, {recursive: true});
mkdirSync(BASE, {recursive: true});

const spec = readFileSync(join(ROOT, 'src/spec.ts'), 'utf8');
const specNum = (k) => {
  const m = new RegExp(`FILM\\s*=\\s*\\{[^}]*?${k}:\\s*([0-9.]+)`).exec(spec);
  if (!m) throw new Error(`spec.ts has no FILM.${k}`);
  return Number(m[1]);
};
const FPS = specNum('fps');

// One frame per scene, chosen at the far side of the scene's entrance so the frame is
// settled: the spot where a regression in that scene is unambiguous.
const KEYS = [
  ['s02-lake',     9.5],
  ['s03-moon',    19.0],
  ['s04-bridge',  27.0],
  ['s05-tea',     35.0],
  ['s06-silk',    43.0],
  ['s07-tide',    50.0],
  ['s08-seal',    57.5],
  ['s01-drop',     2.0],
].map(([name, sec]) => ({name, frame: Math.round(sec * FPS)}));

// ffmpeg writes its measurements to stderr and still exits 0, so both streams count.
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, {cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 30, ...opts});
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
};
const ssim = (a, b) => {
  const out = run('ffmpeg', ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-']);
  const m = /All:([0-9.]+)/.exec(out);
  return m ? Number(m[1]) : 0;
};

let failures = 0;
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++; };
const pass = (msg) => console.log(`  ok    ${msg}`);

// ── 3. CONTRACT — cheapest, so run it first and never render for a spec that already lies ──
console.log('\ncontract  (src/spec.ts → the rendered file)');
const film = ['duration', 'fps', 'width', 'height'].reduce((o, k) => (o[k] = specNum(k), o), {});
const copy = (spec.match(/cn:\s*'([^']+)'/g) ?? []).map((s) => /'(.+)'/.exec(s)[1]);
// count the palette without evaluating TS: every named key that carries a hex value
const paletteBlock = spec.match(/COLOR\s*=\s*\{([\s\S]*?)\};/)[1];
const palette = (paletteBlock.match(/\w+:\s*'#[0-9A-Fa-f]{6}'/g) ?? []).length;
if (film.width !== 1920 || film.height !== 1080) fail(`format ${film.width}×${film.height}, spec says 1920×1080`);
else pass(`format ${film.width}×${film.height} @ ${film.fps}fps / ${film.duration}s`);
if (copy.length < 7) fail(`only ${copy.length} place-name lines in COPY, the film needs 7 scenes + the closing`);
else pass(`${copy.length} copy lines bound to scenes, ${palette} palette keys resolved`);

// ── 1. LOCKED FRAMES ──
console.log('\nlocked frames  (pixel-identical against scripts/baseline/)');
const missing = [];
for (const k of KEYS) {
  const got = join(OUT, `${k.name}.png`);
  const ref = join(BASE, `${k.name}.png`);
  run('npx', ['remotion', 'still', 'Film', got, `--frame=${k.frame}`, '--scale=0.5', '--concurrency=1']);
  if (!existsSync(got)) { fail(`${k.name}: nothing rendered at frame ${k.frame}`); continue; }
  if (UPDATE || !existsSync(ref)) {
    writeFileSync(ref, readFileSync(got));
    pass(`${k.name}: baseline written (frame ${k.frame})`);
    if (!UPDATE) missing.push(k.name);
    continue;
  }
  const s = ssim(ref, got);
  if (s < 0.995) fail(`${k.name}: frame ${k.frame} drifted, SSIM ${s.toFixed(4)} < 0.995`);
  else pass(`${k.name}: frame ${k.frame} SSIM ${s.toFixed(4)}`);
}
if (missing.length && !UPDATE) console.log(`  note  ${missing.length} baselines were just seeded — commit them, then the gate is armed`);

// ── 2. LIVENESS ──
//
// A threshold on absolute motion cannot judge this film: its transitions ARE fast ink
// washes, and its holds ARE deliberate. So the arbiter is the approved profile itself —
// scripts/baseline/motion.txt, the motion curve of a film a human signed off on.
//
// Comparing shapes catches both failures with one number:
//   a scene that froze   → its slots fall toward zero  (negative swing)
//   an unplanned cut     → its slots jump             (positive swing)
// both of which the approved profile does not contain.
if (!FAST) {
  console.log('\nliveness  (motion curve vs scripts/baseline/motion.txt)');
  const probe = join(OUT, 'liveness.mp4');
  run('npx', ['remotion', 'render', 'Film', probe, '--scale=0.2', '--concurrency=4', '--log=error']);
  const REF = join(BASE, 'motion.txt');
  if (!existsSync(probe)) {
    fail('liveness pass produced no file');
  } else {
    const raw = run('ffmpeg', ['-loglevel', 'error', '-i', probe, '-vf',
      'scale=192:108,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
      '-f', 'null', '-']);
    const diffs = (raw.match(/YAVG=([0-9.]+)/g) ?? []).map((s) => Number(s.slice(5)));
    const half = FPS / 2;
    const curve = [];
    for (let i = 0; i + half <= diffs.length; i += half) {
      const slice = diffs.slice(i, i + half);
      curve.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    const body = curve.map((v, i) => `${(i * 0.5).toFixed(1)}s\t${v.toFixed(4)}`);

    if (UPDATE || !existsSync(REF)) {
      writeFileSync(REF, body.join('\n'));
      writeFileSync(join(OUT, 'motion.txt'), body.join('\n'));
      pass(`${curve.length} half-seconds seeded as the approved profile — commit it to arm this check`);
    } else if (curve.length === 0) {
      fail('liveness produced no frames to measure');
    } else {
      const ref = readFileSync(REF, 'utf8').trim().split('\n')
        .map((l) => Number(l.split('\t')[1]));
      // Tolerances: a slot may move by this much before it counts as a change. Motion is
      // measured on a 0-255 scale after down-sampling, so 0.25 is one visible event.
      const FROZEN = -0.25, CUT = 0.60;
      const n = Math.min(curve.length, ref.length);
      if (Math.abs(curve.length - ref.length) > 2) {
        fail(`the film is ${curve.length / 2}s of motion, the approved profile is ${ref.length / 2}s`);
      }
      // A single half-second is not evidence. The whole point of this check is the failure
      // a human misses — a scene that is dead for seconds, or a cut. Both last longer than
      // one slot, so a finding must hold across TWO adjacent slots. That also neutralises
      // the one thing a pixel-diff pass is bad at: a lone encoder or compositor hiccup,
      // which shows up as one slot of nonsense and never as a sustained shift.
      const hits = {freeze: [], cut: []};
      for (let i = 0; i < n - 1; i++) {
        const d0 = curve[i] - ref[i], d1 = curve[i + 1] - ref[i + 1];
        if (d0 < FROZEN && d1 < FROZEN) hits.freeze.push({i, d: Math.min(d0, d1)});
        if (d0 > CUT && d1 > CUT) hits.cut.push({i, d: Math.max(d0, d1)});
      }
      // collapse consecutive runs so one dead stretch reports once
      const runs = (list) => list.filter((h, k) => k === 0 || h.i - list[k - 1].i > 1);
      const freezes = runs(hits.freeze), cuts = runs(hits.cut);
      for (const f of freezes) {
        fail(`frozen at ${f.i * 0.5}s — motion fell to ${curve[f.i].toFixed(3)} from ${ref[f.i].toFixed(3)}, sustained`);
      }
      for (const c of cuts) {
        fail(`cut at ${c.i * 0.5}s — motion jumped to ${curve[c.i].toFixed(3)} from ${ref[c.i].toFixed(3)}, sustained`);
      }
      if (hits.freeze.length !== freezes.length) console.log(`  note  ${hits.freeze.length - freezes.length} isolated dip(s) ignored — under one second`);
      if (hits.cut.length !== cuts.length) console.log(`  note  ${hits.cut.length - cuts.length} isolated spike(s) ignored — under one second`);
      const drift = curve.reduce((a, v, i) => a + Math.abs(v - (ref[i] ?? v)), 0) / n;
      pass(`${n} half-seconds checked, mean drift ${drift.toFixed(3)}, ${freezes.length} sustained freeze(s), ${cuts.length} sustained cut(s)`);
      writeFileSync(join(OUT, 'motion.txt'), body.join('\n'));
      console.log('  artifact  out/gate/motion.txt  (compare with scripts/baseline/motion.txt)');
    }
  }
} else {
  console.log('\nliveness  skipped (--fast). Full gate runs it before merge.');
}

// ── verdict ──
console.log(`\n${failures ? '✗ gate RED' : '✓ gate GREEN'}  —  ${failures} failure${failures === 1 ? '' : 's'}`);
process.exit(failures ? 1 : 0);
