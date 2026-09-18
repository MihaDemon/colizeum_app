import React from 'react';

export default function PromoRefreshLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Обновить промокоды"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="14.25" fill="#15161B" stroke="#FFE500" strokeWidth="1.3" />

      <path
        d="M8.5 4.8h10.2l4.8 4.8v17.6H8.5V4.8Z"
        fill="#FFE500"
        stroke="#0E0E10"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M18.7 4.8v5h4.8"
        fill="#FFD400"
        stroke="#0E0E10"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      <path
        d="M11.5 13h7.2M11.5 16h5.2"
        fill="none"
        stroke="#0E0E10"
        strokeWidth="1.35"
        strokeLinecap="round"
      />

      <path
        d="m11 22.5 7.9-7.9 3 3-7.9 7.9-3.8.8.8-3.8Z"
        fill="#FF007A"
        stroke="#0E0E10"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <path d="m18.9 14.6 3 3" stroke="#FFE500" strokeWidth="1.1" />
    </svg>
  );
}
