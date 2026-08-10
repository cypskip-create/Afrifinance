import { useMemo } from "react";

interface SparklineChartProps {
  data?: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
}

export const SparklineChart = ({ 
  data, 
  width = 60, 
  height = 24, 
  isPositive = true 
}: SparklineChartProps) => {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    // Generate random sparkline data if none provided
    const points = [];
    let value = 50;
    for (let i = 0; i < 20; i++) {
      value = value + (Math.random() - 0.48) * 8;
      value = Math.max(20, Math.min(80, value));
      points.push(value);
    }
    return points;
  }, [data]);

  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const range = max - min || 1;

  const points = chartData.map((value, index) => {
    const x = (index / (chartData.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const strokeColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
