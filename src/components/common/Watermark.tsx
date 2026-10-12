import React, { useId } from 'react';

const CX = 250;
const CY = 320;
const rad = (d: number) => (d * Math.PI) / 180;

/** Fine concentric "C" contours: radius grows, the opening narrows, opacity fades outward. */
const ARCS = Array.from({ length: 17 }, (_, i) => {
  const r = 34 + i * 17;
  const h = rad(58 - i * 1.7);
  const x = CX + r * Math.cos(h);
  const dy = r * Math.sin(h);
  return { d: `M${x.toFixed(1)} ${(CY - dy).toFixed(1)}A${r} ${r} 0 1 0 ${x.toFixed(1)} ${(CY + dy).toFixed(1)}`, w: i % 5 === 0 ? 3.4 : 1.1, o: Math.max(0.16, 1 - i * 0.05) };
});

/** Flow lines leaving the opening of the C like a stream of posts, each a gentle wave. */
const FLOWS = Array.from({ length: 11 }, (_, j) => {
  const k = j - 5;
  const y0 = CY + k * 13;
  const x0 = CX + 70;
  const amp = (j % 2 ? 1 : -1) * (10 + Math.abs(k) * 2.4);
  const yEnd = CY + k * 34;
  const t = 0.58;
  const bez = (p0: number, p1: number, p2: number, p3: number) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
  const node = { x: bez(x0, x0 + 130, x0 + 260, 640), y: bez(y0, y0 - amp, y0 + amp, yEnd) };
  return { d: `M${x0} ${y0}C${x0 + 130} ${y0 - amp} ${x0 + 260} ${y0 + amp} 640 ${yEnd}`, node, accent: [1, 5, 9].includes(j), o: 0.35 + (1 - Math.abs(k) / 5) * 0.5 };
});

/**
 * Brand watermark: fine contour arcs forming the logo's "C", with flow lines streaming out of it
 * and amber nodes (posts being published) riding the lines. Decorative only.
 * Color follows the text color; callers set size, position and opacity.
 */
export const Watermark: React.FC<{ className?: string }> = ({ className = '' }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 640 640" aria-hidden="true" focusable="false" className={`pointer-events-none select-none ${className}`} fill="none">
      <defs>
        <radialGradient id={`${id}-fade`} cx={CX / 640} cy={CY / 640} r="0.62">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width="640" height="640" fill={`url(#${id}-fade)`} />
        </mask>
        <pattern id={`${id}-dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="currentColor" />
        </pattern>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <rect x="330" y="120" width="310" height="400" fill={`url(#${id}-dots)`} opacity=".35" />
        <g stroke="currentColor" strokeLinecap="round">
          {ARCS.map((a, i) => <path key={i} d={a.d} strokeWidth={a.w} opacity={a.o} />)}
          {FLOWS.map((f, i) => <path key={`f${i}`} d={f.d} strokeWidth="1.1" opacity={f.o} />)}
        </g>
        {FLOWS.map((f, i) =>
          f.accent ? (
            <g key={`n${i}`}>
              <circle cx={f.node.x} cy={f.node.y} r="11" fill="var(--amber-400)" opacity=".18" />
              <circle cx={f.node.x} cy={f.node.y} r="5" fill="var(--amber-400)" />
            </g>
          ) : (
            <circle key={`n${i}`} cx={f.node.x} cy={f.node.y} r="2.4" fill="currentColor" opacity=".8" />
          )
        )}
      </g>
    </svg>
  );
};
