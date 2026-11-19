// typo.tsx — the film's type and ink-mark components. One serif for CJK display, one sans for tracked
// Latin slugs; every size, tracking and colour comes from spec.ts.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {InkFilter, Pt, mix, prog, roughFor, EASE, rand} from './motion';
import {COLOR, SANS, SERIF} from '../spec';

export const progress = prog;

// Vertical CJK column, revealed character by character from the top.
export const VText: React.FC<{
  text: string; x: number; y: number; size: number; color: string; t: number; start: number;
  stagger?: number; dur?: number; gap?: number; family?: string; weight?: number; tracking?: number; opacity?: number;
}> = ({text, x, y, size, color, t, start, stagger = 0.09, dur = 0.85, gap = 1.06, family = SERIF, weight = 400, tracking = 0.06, opacity = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', fontFamily: family, opacity}}>
    {[...text].map((ch, i) => {
      const p = prog(t, start + i * stagger, dur, EASE.out);
      return (
        <span key={i} style={{
          fontSize: size, lineHeight: `${size * gap}px`, fontWeight: weight, color,
          letterSpacing: `${tracking}em`, display: 'block',
          opacity: p, transform: `translateY(${(1 - p) * size * 0.34}px)`,
        }}>{ch}</span>
      );
    })}
  </div>
);

// Tracked Latin label (slug, coordinates, credits).
export const Label: React.FC<{
  text: string; x: number; y: number; size?: number; color?: string; tracking?: number;
  weight?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end';
}> = ({text, x, y, size = 22, color = COLOR.inkMid, tracking = 0.3, weight = 500, opacity = 1, anchor = 'start'}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: 900, fontFamily: SANS, fontSize: size, fontWeight: weight,
    letterSpacing: `${tracking}em`, color, opacity, textTransform: 'uppercase',
    textAlign: anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left',
    transform: anchor === 'middle' ? 'translateX(-50%)' : anchor === 'end' ? 'translateX(-100%)' : undefined,
    whiteSpace: 'nowrap', lineHeight: 1.35,
  }}>{text}</div>
);

// The running scene slug: a hairline, a number, a name, a place.
export const Slug: React.FC<{num: string; cn: string; en: string; t: number; start: number; color?: string}> =
  ({num, cn, en, t, start, color = COLOR.inkMid}) => {
    const p = prog(t, start, 1.0, EASE.smooth);
    const q = prog(t, start + 0.24, 1.1, EASE.smooth);
    return (
      <div style={{position: 'absolute', left: 150, bottom: 96, fontFamily: SANS, color}}>
        <div style={{width: mix(0, 168, p), height: 1.4, background: color, opacity: 0.55, marginBottom: 14}} />
        <div style={{opacity: q, transform: `translateY(${(1 - q) * 10}px)`, fontSize: 21, letterSpacing: '0.34em', fontWeight: 500}}>
          {num} <span style={{opacity: 0.5}}>/</span> {cn} <span style={{opacity: 0.45}}>·</span> {en}
        </div>
      </div>
    );
  };

// An ink-filled path with a rough, dry edge that is stable per seed.
export const InkPath: React.FC<{d: string; fill?: string; opacity?: number; filter?: string; stroke?: string; sw?: number}> =
  ({d, fill = COLOR.ink, opacity = 1, filter, stroke, sw}) => (
    <path d={d} fill={fill} opacity={opacity} filter={filter ? `url(#${filter})` : undefined}
      stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  );

// Drifting mist: tapered horizontal strokes, two depths, moving at different speeds.
export const Mist: React.FC<{t: number; y: number; count?: number; spread?: number; seed?: number; opacity?: number; speed?: number; width?: number}> =
  ({t, y, count = 5, spread = 120, seed = 1, opacity = 0.16, speed = 7, width = 520}) => (
    <>
      {Array.from({length: count}, (_, i) => {
        const r = rand(seed + i * 2.31), r2 = rand(seed + i * 5.7);
        const x = ((r * 2400 + t * speed * (0.6 + r2 * 0.8)) % 2400) - 260;
        const yy = y + (r2 - 0.5) * spread;
        const w = width * (0.45 + r * 0.9);
        const h = 7 + r2 * 13;
        const pts: Pt[] = [];
        for (let k = 0; k <= 12; k++) {
          const u = k / 12;
          pts.push([x + w * u, yy + Math.sin(u * Math.PI) * 3.5]);
        }
        const top = pts.map(([px, py], k) => `${k ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
        const d = `${top} L${x + w} ${yy + h} L${x} ${yy + h} Z`;
        return <path key={i} d={d} fill={COLOR.ink} opacity={opacity * (0.55 + r * 0.75)} />;
      })}
    </>
  );
