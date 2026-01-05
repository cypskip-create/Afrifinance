import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

interface StockPriceChartProps {
  symbol: string;
  timeframe: string;
}

// Mock data generator based on timeframe
const generateMockData = (timeframe: string) => {
  const dataPoints: { date: string; price: number; timestamp: number }[] = [];
  const basePrice = 150;
  let points = 30;

  switch (timeframe) {
    case "1D":
      points = 78; // 5-min intervals for trading hours
      break;
    case "1W":
      points = 35; // Hourly data
      break;
    case "1M":
      points = 22; // Trading days
      break;
    case "3M":
      points = 65;
      break;
    case "1Y":
      points = 252; // Trading days
      break;
    case "5Y":
      points = 1260;
      break;
  }

  let currentPrice = basePrice;
  
  for (let i = 0; i < points; i++) {
    const date = new Date();
    
    if (timeframe === "1D") {
      date.setMinutes(date.getMinutes() - (points - i) * 5);
    } else {
      date.setDate(date.getDate() - (points - i));
    }
    
    // More realistic price movement with momentum
    const momentum = Math.random() > 0.48 ? 1 : -1;
    const volatility = timeframe === "1D" ? 0.3 : 0.8;
    const change = momentum * Math.random() * volatility;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.5, currentPrice + change));

    let formattedDate = "";
    if (timeframe === "1D") {
      formattedDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (timeframe === "1W") {
      formattedDate = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === "1M" || timeframe === "3M") {
      formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timeframe === "1Y") {
      formattedDate = date.toLocaleDateString('en-US', { month: 'short' });
    } else {
      formattedDate = date.toLocaleDateString('en-US', { year: 'numeric' });
    }

    dataPoints.push({
      date: formattedDate,
      price: parseFloat(currentPrice.toFixed(2)),
      timestamp: date.getTime()
    });
  }

  return dataPoints;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-semibold text-lg">
          KES {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const StockPriceChart = ({ symbol, timeframe }: StockPriceChartProps) => {
  const data = useMemo(() => generateMockData(timeframe), [timeframe]);
  
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  
  const strokeColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const gradientId = `colorPrice-${symbol}-${timeframe}`;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="0%" 
                stopColor={strokeColor} 
                stopOpacity={0.3}
              />
              <stop 
                offset="100%" 
                stopColor={strokeColor} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            hide={true}
          />
          <YAxis 
            hide={true}
            domain={[minPrice - padding, maxPrice + padding]}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{
              stroke: 'hsl(var(--muted-foreground))',
              strokeWidth: 1,
              strokeDasharray: '4 4'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: strokeColor,
              stroke: 'hsl(var(--background))',
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
