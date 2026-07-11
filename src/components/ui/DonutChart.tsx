interface DonutChartProps {
  percent: number;       // 0-100
  stroke?: string;
  trackStroke?: string;
  size?: number;
}

export function DonutChart({
  percent,
  stroke = 'var(--color-primary)',
  trackStroke = 'var(--color-surface-container)',
  size = 160,
}: DonutChartProps) {
  // Radius 15.9155 baked into the SVG path literals below

  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className="block mx-auto"
      aria-label={`${percent}% compliance`}
    >
      {/* Track */}
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke={trackStroke}
        strokeWidth="2.8"
      />
      {/* Progress */}
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke={stroke}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray={`${percent}, 100`}
        className="circle-progress"
        style={{ strokeDashoffset: 0 }}
      />
    </svg>
  );
}
