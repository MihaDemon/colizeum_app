import React from 'react';

export default function PromoCodeLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Промокод"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M5 8h22v16H5Z" fill="#FFE500" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M5 12h22v8H5Z" fill="#FF007A" opacity="0.95" />
      <path d="M10 8v16M22 8v16" stroke="#0E0E10" strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="5" cy="16" r="2.2" fill="#0E0E10" />
      <circle cx="27" cy="16" r="2.2" fill="#0E0E10" />
      <path d="M13 15h6M13 18h4" stroke="#FFE500" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="25" cy="6" r="2" fill="#00E5FF" />
    </svg>
  );
}
