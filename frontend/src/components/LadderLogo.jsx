import React from 'react';

export default function LadderLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Месячный рейтинг"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M9 6h14v8c0 5-3 8-7 8s-7-3-7-8Z" fill="#FFE500" stroke="#0E0E10" strokeWidth="1.5" />
      <path d="M9 9H5c0 5 2 8 6 8M23 9h4c0 5-2 8-6 8" fill="none" stroke="#FFE500" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 22v4M11 27h10" fill="none" stroke="#FFE500" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 10h6M14 13h4" stroke="#0E0E10" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="16" cy="7" r="1.4" fill="#00E5FF" />
    </svg>
  );
}
