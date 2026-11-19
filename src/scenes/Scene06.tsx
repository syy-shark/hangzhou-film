// Scene06 (39.0–46.5 s, T) — 丝绸. The cup's mouth widens and the cloth feeds out of it rightwards, folds
// born at the mouth and travelling with the weave. The ring is the mouth (Film.tsx).
import React from 'react';
import {Canvas, EASE, mix, prog} from '../lib/motion';
import {COLOR, T} from '../spec';
import {CUP, SILK, silkBand, silkFolds, spineY, stroke} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

export const Scene06: React.FC<{t: number}> = ({t}) => {
  if (t < T.s6 - 0.6 || t > T.s7 + 1.0) return null;
  const enter = Math.max(0, t - T.s6);
  const p = prog(t, T.s6 + 0.55, 4.5, EASE.smooth);          // 0 → 1: how much cloth has left the mouth
  const band = silkBand(p);
  const folds = silkFolds(p, 6);
  const sheen = silkFolds(p, 1)[0];
  const cupOut = 1 - prog(t, T.s6 + 0.4, 1.4, EASE.smooth);
  const fade = prog(t, T.s6 + 0.15, 1.2, EASE.smooth);

  // the cloth's leading edge, for the cut-end mark
  const tipX = mix(SILK.x0, SILK.x1, p);
  const tipY = spineY(p);

  return (
    <>
      <Canvas>
        <defs>
          <linearGradient id="s6silk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF4E6" />
            <stop offset="38%" stopColor="#F0E4CE" />
            <stop offset="72%" stopColor="#E0CDB0" />
            <stop offset="100%" stopColor="#CBB394" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        <rect width={1920} height={1080} fill="#F3EDE0" opacity={0.7} />
        {/* the light: a pale field on the left, no hard vertical edge — a wash that fades to the paper */}
        <ellipse cx={210} cy={520} rx={560} ry={640} fill={COLOR.paperLt} opacity={0.5} />

        {/* a long dry stroke beneath the cloth: the ink the silk was cut from */}
        <path d={stroke(676, 706, 1846, 428, 1.2, 2.4, -14)} fill={COLOR.ink} opacity={0.08 * fade} />

        {/* the silk (E06) */}
        <g opacity={fade}>
          {/* the cloth's own shadow on the paper: it has thickness and sits above the page */}
          {band && <InkPath d={band} fill={COLOR.ink} opacity={0.1} />}
          {band && <g transform="translate(0 -9)"><InkPath d={band} fill="url(#s6silk)" opacity={0.99} /></g>}
          {/* top-edge highlight so the band reads as a rolled fold, not a flat shape */}
          {band && <g transform="translate(0 -9)"><InkPath d={band} fill={COLOR.paperLt} opacity={0.22} /></g>}
          {/* the underside roll: a darker band along the lower edge */}
          {band && <g transform="translate(0 17)"><InkPath d={band} fill={COLOR.tea} opacity={0.14} /></g>}
          {folds.map((d, i) => (
            <path key={i} d={d} stroke={COLOR.tea} strokeWidth={i === 2 || i === 3 ? 2.2 : 1.4}
              fill="none" opacity={i === 2 || i === 3 ? 0.3 : 0.18} strokeLinecap="round" />
          ))}
          {sheen && (
            <path d={sheen} stroke={COLOR.paperLt} strokeWidth={9} fill="none" opacity={0.5}
              strokeLinecap="round" strokeDasharray="300 2400" strokeDashoffset={-p * 900} />
          )}
          {p > 0.02 && (
            <path d={`M${tipX} ${tipY - 26} L${tipX + 6} ${tipY + 30}`} stroke={COLOR.tea} strokeWidth={2}
              opacity={0.3} />
          )}
        </g>

        {/* a length of the same cloth hanging from the band's far end: drapes, so the scene has weight.
            Built from a handful of straight quads — no gradients, no per-pixel work. */}
        {p > 0.62 && (() => {
          const a = Math.min(1, (p - 0.62) / 0.22);
          const rows = 7, cols = 4;
          const x0 = 1596, wTop = 216, wBot = 168, yTop = 372, yBot = 992;
          const quads: React.ReactNode[] = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const v0 = r / rows, v1 = (r + 1) / rows, u0 = c / cols, u1 = (c + 1) / cols;
              const P = (u: number, v: number): [number, number] => [
                x0 + (u - 0.5) * (wTop + (wBot - wTop) * v) + Math.sin(v * 4.4 + 0.4) * 24 * (1 - 0.3 * u),
                yTop + (yBot - yTop) * v + Math.sin(u * 3.1 + v * 1.6) * 9,
              ];
              const q = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
              // a light that falls off to the right: three flat tones, no gradient
              const tone = u0 < 0.25 ? 0.98 : u0 < 0.5 ? 0.9 : u0 < 0.75 ? 0.81 : 0.71;
              quads.push(
                <path key={`${r}-${c}`} d={`M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)} L${q[1][0].toFixed(1)} ${q[1][1].toFixed(1)} L${q[2][0].toFixed(1)} ${q[2][1].toFixed(1)} L${q[3][0].toFixed(1)} ${q[3][1].toFixed(1)} Z`}
                  fill={COLOR.tea} opacity={0.16 * tone} />,
              );
            }
          }
          return <g opacity={a}>{quads}</g>;
        })()}

        {/* the cup, still standing for the first beat as the mouth the cloth leaves */}
        <g opacity={cupOut * 0.8}>
          <path d={`M${CUP.cx - CUP.rx} ${CUP.rimY} L${CUP.cx - CUP.footRx} ${CUP.baseY} L${CUP.cx + CUP.footRx} ${CUP.baseY} L${CUP.cx + CUP.rx} ${CUP.rimY}`}
            fill="none" stroke={COLOR.celadon} strokeWidth={2} opacity={0.45} />
        </g>


      </Canvas>

      <Slug num="06" cn="丝绸" en="SILK" t={t} start={T.s6 + 1.0} color={COLOR.tea} />
      <div style={{position: 'absolute', left: 150, bottom: 180, fontFamily: "'Songti SC', serif", color: COLOR.ink,
        fontSize: 88, letterSpacing: '0.14em', fontWeight: 400,
        opacity: Math.max(0, Math.min(1, (t - T.s6 - 2.0) / 1.5))}}>
        软得能接住风
      </div>
    </>
  );
};
