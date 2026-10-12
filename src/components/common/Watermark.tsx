import React from 'react';

/**
 * Brand watermark: three concentric "C" arcs (content rippling outward) with flow lines that end in
 * amber nodes (posts going out). Same visual language as the logo. Purely decorative.
 * Color follows the text color; callers set opacity, size and position.
 */
export const Watermark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 480 480" aria-hidden="true" focusable="false" className={`pointer-events-none select-none ${className}`} fill="none">
    <g stroke="currentColor" strokeLinecap="round">
      <path d="M367.1 98.8A190 190 0 1 0 367.1 381.2" strokeWidth="26" />
      <path d="M333.7 136A140 140 0 1 0 333.7 344" strokeWidth="18" opacity=".75" />
      <path d="M300.2 173.1A90 90 0 1 0 300.2 306.9" strokeWidth="11" opacity=".55" />
      <path d="M392 196H452M404 240H466M392 284H452" strokeWidth="7" strokeDasharray="2 16" opacity=".8" />
    </g>
    <g fill="var(--amber-400)">
      <circle cx="458" cy="196" r="9" />
      <circle cx="472" cy="240" r="6" opacity=".8" />
      <circle cx="458" cy="284" r="9" />
    </g>
  </svg>
);
