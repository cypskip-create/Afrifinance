import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface StockPriceChartProps {
  symbol: string;
  timeframe: string;
}

// Mock data generator based on timeframe
const generateMockData = (timeframe: string) => {
  const dataPoints: { date: string; price: number }[] = [];
  const basePrice = 150;
  let points = 30;
  let dateFormat = "MMM DD";

  switch (timeframe) {
    case "1D":
      points = 24;
      dateFormat = "HH:mm";
      break;
    case "1W":
      points = 7;
      break;
    case "1M":
      points = 30;
      break;
    case "3M":
      points = 90;
      break;
    case "1Y":
      points = 365;
      dateFormat = "MMM";
      break;
    case "5Y":
      points = 1825;
      dateFormat = "YYYY";
      break;
  }

  for (let i = 0; i < points; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (points - i));
    
    const randomChange = (Math.random() - 0.5) * 10;
    const trend = i * 0.05; // Slight upward trend
    const price = basePrice + randomChange + trend;

    let formattedDate = "";
    if (timeframe === "1D") {
      formattedDate = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (timeframe === "5Y") {
      formattedDate = date.getFullYear().toString();
    } else {
      formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    dataPoints.push({
      date: formattedDate,
      price: parseFloat(price.toFixed(2))
    });
  }

  return dataPoints;
};

export const StockPriceChart = ({ symbol, timeframe }: StockPriceChartProps) => {
  const data = generateMockData(timeframe);
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;

  const chartConfig = {
    price: {
      label: "Price",
      color: isPositive ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              // Show fewer labels for better readability
              return value;
            }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
            />} 
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={chartConfig.price.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.price.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
