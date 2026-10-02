import React from 'react';

export function Logo({ className = "w-6 h-6 text-pink-500" }) {
  // We extract width/height from className or default to 24px
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      <span className="absolute text-[8px] font-bold font-serif text-pink-500 tracking-tighter" style={{ marginTop: '-1px' }}>LL</span>
    </div>
  );
}
