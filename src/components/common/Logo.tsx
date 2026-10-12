import React from 'react';

/** Campaign Flow mark: a "C" that flows out into a published post (amber node). Same artwork as public/favicon.svg. */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
    <defs>
      <linearGradient id="cf-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#34c9b9" />
        <stop offset="1" stopColor="#136b62" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#cf-g)" />
    <path d="M43 22.5A15.5 15.5 0 1 0 43 41.5" fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
    <circle cx="46" cy="22" r="5" fill="#f2a93b" />
    <circle cx="46" cy="42" r="3" fill="#fff" fillOpacity=".85" />
  </svg>
);

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    <span className="font-semibold tracking-tight text-zinc-50 text-sm">Campaign Flow</span>
  </span>
);
