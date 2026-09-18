import React from 'react';

const segmentColors = [
  '#000000',
  '#FFE500',
  '#000000',
  '#FFE500',
  '#000000',
  '#FFE500',
  '#000000',
  '#FFE500'
];

const CENTER = 16;
const SECTOR_RADIUS = 13.5;
const SECTOR_ANGLE = 360 / segmentColors.length;

const pointOnCircle = (angle, radius) => {
  const radians = (angle * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians)
  };
};

const getSectorPath = (index) => {
  const startAngle = -90 + index * SECTOR_ANGLE;
  const endAngle = startAngle + SECTOR_ANGLE;
  const startPoint = pointOnCircle(startAngle, SECTOR_RADIUS);
  const endPoint = pointOnCircle(endAngle, SECTOR_RADIUS);

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${startPoint.x} ${startPoint.y}`,
    `A ${SECTOR_RADIUS} ${SECTOR_RADIUS} 0 0 1 ${endPoint.x} ${endPoint.y}`,
    'Z'
  ].join(' ');
};

export default function WheelLogo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Колесо бонусов"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="13.5" fill="#0E0E10" />

      <g>
        {segmentColors.map((color, index) => (
          <path
            key={index}
            d={getSectorPath(index)}
            fill={color}
            stroke="#0E0E10"
            strokeWidth="0.65"
          />
        ))}
      </g>

      <circle cx="16" cy="16" r="14" fill="none" stroke="#FFE500" strokeWidth="2" />

      <circle cx="16" cy="16" r="4" fill="#0E0E10" stroke="#FFE500" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.5" fill="#FFE500" />
    </svg>
  );
}
