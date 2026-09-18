import React from 'react';

export default function HubLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Главная"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M5 14 16 5l11 9v13H5Z" fill="#FFE500" stroke="#0E0E10" strokeWidth="1.5" />
      <path d="M8 14.5 16 8l8 6.5V25H8Z" fill="#0E0E10" />
      <path d="M12 25v-7h8v7" fill="#FFE500" stroke="#0E0E10" strokeWidth="1.2" />
      <path d="M11 14h3v3h-3zM18 14h3v3h-3z" fill="#00E5FF" />
      <path d="m16 3 2 3h-4Z" fill="#FF007A" />
    </svg>
  );
}
