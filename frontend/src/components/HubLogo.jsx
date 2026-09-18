import React from 'react';

export default function HubLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Главная"
      shapeRendering="geometricPrecision"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="14.55" fill="#000000" />

      <path
        d="M3.35 12.2C5.15 6.85 10.05 3.05 16 3.05s10.85 3.8 12.65 9.15H3.35Z"
        fill="#FFEE32"
      />
      <path
        d="M3.35 19.8h11.35L16 17.55l1.3 2.25h11.35C26.85 25.15 21.95 28.95 16 28.95S5.15 25.15 3.35 19.8Z"
        fill="#FFEE32"
      />

      <path
        d="m8.75 14.35 3.55 3.55m0-3.55-3.55 3.55"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.12"
        strokeLinecap="round"
      />
      <circle
        cx="22.55"
        cy="16"
        r="2.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.08"
      />
    </svg>
  );
}
