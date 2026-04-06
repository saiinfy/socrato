import React from 'react';

// FIX: Add title prop for accessibility and to fix TS error.
export const FiftyFiftyIcon: React.FC<{ className?: string; title?: string }> = ({ className = 'h-8 w-8', title }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {title && <title>{title}</title>}
    <circle cx="12" cy="6" r="1.5" fill="#3b82f6" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <circle cx="12" cy="18" r="1.5" fill="#3b82f6" />
  </svg>
);
