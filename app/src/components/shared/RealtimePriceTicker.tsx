import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPrice } from "@/lib/stockPrices";

interface RealtimePriceTickerProps {
  symbol: string;
  initialPrice?: number;
  className?: string;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RealtimePriceTicker({ 
  symbol, 
  initialPrice,
  className,
  showChange = true,
  size = 'md'
}: RealtimePriceTickerProps) {
  const [price, setPrice] = useState(() => getPrice(symbol, initialPrice));
  const [prevPrice, setPrevPrice] = useState(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const basePrice = getPrice(symbol, initialPrice);
    setPrice(basePrice);
    setPrevPrice(basePrice);

    const interval = setInterval(() => {
      setPrice(current => {
        const volatility = 0.001;
        const change = (Math.random() - 0.5) * 2 * volatility * current;
        const newPrice = Math.max(0.01, current + change);
        
        setPrevPrice(current);
        
        if (newPrice > current) {
          setFlash('up');
        } else if (newPrice < current) {
          setFlash('down');
        }
        
        setTimeout(() => setFlash(null), 300);
        
        return newPrice;
      });
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [symbol, initialPrice]);

  const change = price - prevPrice;
  const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const changeSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span 
        className={cn(
          "font-bold transition-colors duration-300",
          sizeClasses[size],
          flash === 'up' && 'text-bull',
          flash === 'down' && 'text-bear'
        )}
      >
        {symbol.length <= 5 ? 'KES ' : '$'}{price.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </span>
      
      {showChange && (
        <span 
          className={cn(
            "flex items-center gap-0.5 font-medium transition-all",
            changeSizeClasses[size],
            isPositive ? 'text-bull' : isNeutral ? 'text-muted-foreground' : 'text-bear',
            flash && 'scale-110'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : isNeutral ? (
            <Minus className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </span>
      )}
    </div>
  );
}