import React from "react";

interface LuxuryStarsProps {
  count?: number;
  size?: number;
  color?: string;
  gap?: number;
}

export function LuxuryStars({
  count = 5,
  size = 11,
  color = "#B08A4F",
  gap = 2,
}: LuxuryStarsProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        verticalAlign: "middle",
      }}
      aria-label={`${count} star rating`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default LuxuryStars;
