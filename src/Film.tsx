// Film.tsx — the master timeline. All layers read ABSOLUTE t from useTime(); no <Sequence> remounts, so
// the ring keeps its identity from the first ripple to the final seal. Scenes decide their own visibility.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Canvas, EASE, InkFilter, Paper, prog, useTime} from './lib/motion';
import {COLOR, FILM, SERIF, T} from './spec';
import {SEAL, ringGeom, ringStyle, toPathOf, waterClipOf} from './lib/ring';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {Scene04} from './scenes/Scene04';
import {Scene05} from './scenes/Scene05';
import {Scene06} from './scenes/Scene06';
import {Scene07} from './scenes/Scene07';
import {Scene08} from './scenes/Scene08';

// Transition grammar (S06): every new scene arrives as an ink wash opening from the ring's own position.
// A hard-edged circle clip, not a crossfade — the incoming paper simply floods the outgoing one.
const Wash: React.FC<{t: number; start: number; at?: [number, number]; dur?: number; until?: number; children: React.ReactNode}> =
  ({t, start, at = [960, 700], dur = 1.05, until = Infinity, children}) => {
    // PERF: every scene paints a full-frame opaque rect. Once the next scene has fully
    // flooded the frame this one is invisible, but React kept it mounted and Chrome kept
    // compositing 6 full-screen layers per frame. Unmount it — the cover is already opaque.
    if (t >= until) return null;
    const p = prog(t, start, dur, EASE.inOut);
    if (p <= 0) return null;
    if (p >= 1) return <>{children}</>;
    return <AbsoluteFill style={{clipPath: `circle(${p * 2350}px at ${at[0]}px ${at[1]}px)`}}>{children}</AbsoluteFill>;
  };

export const Film: React.FC = () => {
  const {t} = useTime();
  const ring = ringGeom(t);
  const style = ringStyle(t);
  const clip = waterClipOf(t);
  const d = toPathOf(ring.pts);
  const sealIn = t > 54.4;
  const sealInk = prog(t, 54.45, 0.7, EASE.out);   // the characters are carved in as the seal forms

  return (
    <AbsoluteFill style={{backgroundColor: COLOR.paper}}>
      {/* E00 paper — real texture under everything, so the ink sits ON something */}
      <Paper color={COLOR.paper} grain={0} fibre={0.07} seed={5} />

      {/* scene layers, back to front. Each one floods in from the ring's current position. */}
      <Wash t={t} start={-1} at={[960, 700]} until={T.s2 - 0.35 + 1.05}><Scene01 t={t} /></Wash>
      <Wash t={t} start={T.s2 - 0.35} at={[1330, 560]} until={T.s3 - 0.45 + 1.05}><Scene02 t={t} /></Wash>
      <Wash t={t} start={T.s3 - 0.45} at={[1340, 600]} until={T.s4 - 0.55 + 1.05}><Scene03 t={t} /></Wash>
      <Wash t={t} start={T.s4 - 0.55} at={[960, 340]} until={T.s5 - 0.55 + 1.05}><Scene04 t={t} /></Wash>
      <Wash t={t} start={T.s5 - 0.55} at={[960, 640]} until={T.s6 - 0.4 + 1.05}><Scene05 t={t} /></Wash>
      <Wash t={t} start={T.s6 - 0.4} at={[700, 516]} until={T.s7 - 0.5 + 1.05}><Scene06 t={t} /></Wash>
      <Wash t={t} start={T.s7 - 0.5} at={[660, 596]} until={T.s8 - 0.5 + 1.3}><Scene07 t={t} /></Wash>
      <Wash t={t} start={T.s8 - 0.5} at={[SEAL.cx, SEAL.cy]} dur={1.3}><Scene08 t={t} /></Wash>

      {/* S06/E02 — filters for ink edges. Declared once; every mark references one by id. */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <Canvas style={{opacity: 0}}>
          <InkFilter id="s1ink" edge={7} grain={0} seed={11} />
          <InkFilter id="s1ink2" edge={4} grain={0} seed={19} />
          <InkFilter id="s2ink" edge={5} grain={0} seed={23} />
          <InkFilter id="s2ink2" edge={3.4} grain={0} seed={29} />
          <InkFilter id="s3ink" edge={5} grain={0} seed={31} />
          <InkFilter id="s4ink" edge={4} grain={0} seed={37} />
          <InkFilter id="s5ink" edge={2.6} grain={0} seed={41} />
          <InkFilter id="s6ink" edge={3.2} grain={0} seed={43} />
          <InkFilter id="s7ink" edge={6} grain={0} seed={47} />
          <InkFilter id="s7ink2" edge={4} grain={0} seed={53} />
        </Canvas>
      </AbsoluteFill>

      {/* E01/X01 — THE RING. One set of 96 points, drawn here, visible in every scene, sunk under the
          waterline where the scene needs it (the sun setting, the arch springing from the river). */}
      <Canvas style={{opacity: ring.op}}>
        <defs>
          <clipPath id="ringclip">
            <rect x={-200} y={-200} width={2400} height={clip > 0 ? 1080 + 200 - clip : 1480} />
          </clipPath>
        </defs>
        <g clipPath="url(#ringclip)">
          <path d={d} fill={style.fill} stroke={style.stroke} strokeWidth={style.sw}
            strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* the arch's coping is a thick dark stone band, doubled for depth */}
          {t > 23.5 && t < 31.4 && (
            <path d={d} fill="none" stroke={COLOR.paperLt} strokeWidth={1.6} opacity={0.4} transform="translate(0 -5)" />
          )}
        </g>
      </Canvas>

      {/* E12 — the seal: the ring has already become the square; these are its knock-out and its press. */}
      {sealIn && (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{
            position: 'absolute', left: SEAL.cx - SEAL.half, top: SEAL.cy - SEAL.half,
            width: SEAL.half * 2, height: SEAL.half * 2, transform: `rotate(${SEAL.deg}deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: sealInk, fontFamily: SERIF,
          }}>
            {'杭州'.split('').map((ch, i) => (
              <span key={i} style={{
                fontSize: 108 + 6 * sealInk, fontWeight: 700, color: COLOR.paperLt, lineHeight: 1,
                letterSpacing: '0.04em', mixBlendMode: 'normal',
              }}>{ch}</span>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {FILM.sound && <Audio src={staticFile('score.wav')} />}
    </AbsoluteFill>
  );
};
