import React from 'react';

export default function DailyBonusLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Ежедневный бонус"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M7 13h18v14H7z" fill="#FFE500" stroke="#0E0E10" strokeWidth="1.5" />
      <path d="M5 9h22v6H5z" fill="#FFD400" stroke="#0E0E10" strokeWidth="1.5" />
      <path d="M14 9h4v18h-4z" fill="#FF007A" stroke="#0E0E10" strokeWidth="1" />
      <path d="M5 11h22v3H5z" fill="#FF007A" />
      <path d="M16 9c-1.2-4.2-7.2-4.3-7.2-1.1C8.8 10.2 12.1 11 16 11Z" fill="#FF007A" stroke="#0E0E10" strokeWidth="1.2" />
      <path d="M16 9c1.2-4.2 7.2-4.3 7.2-1.1C23.2 10.2 19.9 11 16 11Z" fill="#FF007A" stroke="#0E0E10" strokeWidth="1.2" />
      <path d="M9 17h4v2H9z" fill="#FFF4A3" opacity="0.9" />
    </svg>
  );
}
