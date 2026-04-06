

import React from 'react';

// FIX: Add title prop for accessibility and to fix TS error.
export const PointDoublerIcon: React.FC<{ className?: string; style?: React.CSSProperties; title?: string }> = ({ className = 'h-8 w-8', style, title }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {title && <title>{title}</title>}
    <path d="M7 7l10 10M17 7L7 17" stroke="#94a3b8" />
    <text x="12" y="16" fontSize="12" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none">2X</text>
  </svg>
);