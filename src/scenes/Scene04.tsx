// Scene04 (23.0–31.0 s, T) — 断桥残雪. The moon sinks, becomes a semicircle, and the bridge is built over it:
// the arch IS the ring (drawn by Film.tsx). Snow falls; one visitor walks the crest under an umbrella.
import React from 'react';
import {Character, Canvas, EASE, Pose, prog, rig, rand} from '../lib/motion';
import {COLOR, T, WATER} from '../spec';
import {BRIDGE, VISITOR, balustrade, bridgeCourses, bridgeSolid, deckY, hill, rippleLines, stroke, umbrella} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

const SNOW_HILL = hill(-40, 1980, 706, [[280, 96, 200], [640, 62, 160], [1040, 38, 180], [1420, 84, 210], [1780, 56, 170]], 200);
const DECK = bridgeSolid();
const COURSES = bridgeCourses(6);
const POSTS = balustrade();

// Snow: deterministic flake field, two depths; nothing falls through the bridge deck.
const flakes = (t: number, n: number, seed: number, speed: number, depth: number) =>
  Array.from({length: n}, (_, i) => {
    const r = rand(seed + i * 1.31), r2 = rand(seed + i * 2.77), r3 = rand(seed + i * 4.13);
    const x = ((r * 2080 + Math.sin(t * 0.5 + i) * 26 + t * 14 * (0.4 + r2)) % 2080) - 80;
    const y = ((r2 * 1180 + t * speed * (0.5 + r3)) % 1180) - 50;
    return {x, y, r: (1.4 + r3 * 2.6) * depth, o: (0.24 + r * 0.5) * depth};
  });

// The visitor's walk: from the left abutment up to the crest, then stands.
const walkX = (t: number) => {
  const u = Math.max(0, Math.min(1, (t - (T.s4 + 0.4)) / 4.4));
  const e = 1 - Math.pow(1 - u, 2.2);
  return 640 + e * 306;
};

export const Scene04: React.FC<{t: number}> = ({t}) => {
  if (t < T.s4 - 0.8 || t > T.s5 + 1.0) return null;
  const enter = Math.max(0, t - T.s4);
  const snowIn = Math.min(1, enter / 2.0);
  const visit = walkX(t);
  const vy = deckY(visit);
  const pose: Pose = {
    x: 0, y: 0, facing: 1, lean: 3.4, head: -4, mood: 'calm', look: 0,
    armL: [16, 10], armR: [128, 52], legL: [8, 5], legR: [-7, 4],
  };
  const hand = rig(VISITOR, pose).armR.hand;

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paperLt} />
        {/* S02 snow sky: pale paper with a colder band at the horizon */}
        <rect width={1920} height={1080} fill="#E8E6DF" opacity={0.5} />
        <rect y={520} width={1920} height={560} fill="#DCDCD4" opacity={0.55} />

        <InkPath d={SNOW_HILL} fill={COLOR.paperLt} opacity={0.9} />
        <InkPath d={SNOW_HILL} fill={COLOR.inkMid} opacity={0.14} filter="s4ink" />

        {/* distant levee, a single dry stroke */}
        <path d={stroke(0, 704, 1920, 700, 2.2, 2.8, 4)} fill={COLOR.stone} opacity={0.3} />

        {/* the bridge: solid mass with the arch knocked out (the ring carries the coping) */}
        <path d={DECK} fill={COLOR.stone} fillRule="evenodd" opacity={0.9} />
        {COURSES.map((d, i) => <path key={i} d={d} stroke={COLOR.paperLt} strokeWidth={1.3} fill="none" opacity={0.22} />)}
        {/* snow lying on the deck: a lighter band hugging the top edge */}
        <path d={DECK} fill={COLOR.paperLt} fillRule="evenodd" opacity={0.0} />
        <path d={`${Array.from({length: 72}, (_, i) => {
          const x = BRIDGE.x0 + (i / 71) * (BRIDGE.x1 - BRIDGE.x0);
          return `${i ? 'L' : 'M'}${x.toFixed(1)} ${(deckY(x) - 5).toFixed(1)}`;
        }).join(' ')} L${BRIDGE.x1} ${WATER} L${BRIDGE.x0} ${WATER} Z`} fill={COLOR.paperLt} opacity={0.0} />
        {/* balustrade posts + rail, snow caps on the windward half */}
        <g opacity={0.9}>
          <path d={POSTS.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y - p.h}`).join(' ')} stroke={COLOR.stone} strokeWidth={5} fill="none" opacity={0.85} />
          {POSTS.map((p, i) => (
            <g key={i}>
              <rect x={p.x - 3} y={p.y - p.h} width={6} height={p.h} fill={COLOR.stone} opacity={0.88} />
              {p.x < BRIDGE.cx + 40 && <rect x={p.x - 9} y={p.y - p.h - 7} width={18} height={6} rx={3} fill={COLOR.paperLt} opacity={0.95} />}
            </g>
          ))}
        </g>
        {/* the crack: 断 — a dark fracture just right of the crest, snow caught in it */}
        <g opacity={0.85}>
          <path d="M976 470 L965 508 L982 536 L968 574 L984 606 L972 640" stroke={COLOR.ink} strokeWidth={4.5} fill="none" opacity={0.55} />
          <path d="M976 470 L965 508 L982 536 L968 574 L984 606 L972 640" stroke={COLOR.paperLt} strokeWidth={1.8} fill="none" opacity={0.7} strokeDasharray="9 13" />
        </g>

        {/* water below: pale, with the arch's reflection as a second, thinner arc */}
        <rect y={WATER} width={1920} height={380} fill="#CFD2CA" opacity={0.55} />
        {rippleLines(712, 1030, 13, 40, 1900, 37, 0.7).map((r, i) => (
          <path key={i} d={r.d} stroke={COLOR.stone} strokeWidth={1.3} fill="none" opacity={r.o * 0.8} />
        ))}
        <g opacity={0.3}>
          <ellipse cx={BRIDGE.cx} cy={WATER + 96} rx={BRIDGE.r * 0.92} ry={62} fill={COLOR.paperLt} />
        </g>
        {/* the arch's reflection breathes with the water */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={BRIDGE.cx + Math.sin(t * 0.7 + i) * 12} cy={WATER + 40 + i * 30}
            rx={BRIDGE.r * (0.86 - i * 0.05)} ry={7 - i} fill="none" stroke={COLOR.paperLt} strokeWidth={1.6}
            opacity={0.24 - i * 0.04} />
        ))}

        {/* snow, two depths */}
        <g opacity={snowIn}>
          {flakes(t, 92, 7, 52, 0.62).map((f, i) => <circle key={`a${i}`} cx={f.x} cy={f.y} r={f.r * 0.8} fill={COLOR.paperLt} opacity={f.o * 0.75} />)}
          {flakes(t, 46, 91, 88, 1).map((f, i) => <circle key={`b${i}`} cx={f.x} cy={f.y + 30} r={f.r} fill="#FFFFFF" opacity={f.o} />)}
        </g>

        <Mist t={t} y={678} count={4} opacity={0.16} seed={131} speed={5} width={680} />

        {/* the visitor (E09): feet on the deck, umbrella in the near hand */}
        <g transform={`translate(${visit} ${vy}) scale(0.78)`}>
          <Character body={VISITOR} pose={{...pose, x: 0, y: 0}}
            held={umbrella(hand, 66, -11)} />
        </g>
        <ellipse cx={visit} cy={vy + 4} rx={26} ry={5} fill={COLOR.ink} opacity={0.1} />
      </Canvas>

      <Slug num="04" cn="断桥残雪" en="LINGERING SNOW" t={t} start={T.s4 + 1.1} color={COLOR.stone} />
      <div style={{position: 'absolute', right: 150, top: 264, textAlign: 'right', fontFamily: 'Songti SC, serif',
        fontSize: 92, color: COLOR.ink, letterSpacing: '0.1em', fontWeight: 400, lineHeight: 1.3,
        opacity: Math.max(0, Math.min(1, (t - T.s4 - 1.4) / 1.4))}}>
        桥断<br />雪未断
      </div>
    </>
  );
};
