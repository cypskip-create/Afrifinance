import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface AnalystRatingsProps {
  buy?: number;
  hold?: number;
  sell?: number;
  targetPrice?: string;
  currentPrice?: number;
}

export const AnalystRatings = ({ 
  buy = 12, 
  hold = 5, 
  sell = 2, 
  targetPrice = "15.50",
  currentPrice = 12.85
}: AnalystRatingsProps) => {
  const total = buy + hold + sell;
  const buyPercent = (buy / total) * 100;
  const holdPercent = (hold / total) * 100;
  const sellPercent = (sell / total) * 100;
  
  const targetNum = parseFloat(targetPrice);
  const upside = ((targetNum - currentPrice) / currentPrice) * 100;

  const getConsensus = () => {
    if (buyPercent >= 60) return { label: "Strong Buy", color: "text-bull" };
    if (buyPercent >= 40) return { label: "Buy", color: "text-bull" };
    if (holdPercent >= 50) return { label: "Hold", color: "text-accent" };
    if (sellPercent >= 40) return { label: "Sell", color: "text-bear" };
    return { label: "Hold", color: "text-accent" };
  };

  const consensus = getConsensus();

  return (
    <div className="space-y-4">
      {/* Consensus */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Analyst Consensus</span>
        <span className={`font-semibold ${consensus.color}`}>{consensus.label}</span>
      </div>

      {/* Rating Bar */}
      <div className="space-y-2">
        <div className="flex h-3 rounded-full overflow-hidden">
          <div 
            className="bg-bull transition-all duration-500" 
            style={{ width: `${buyPercent}%` }}
          />
          <div 
            className="bg-accent transition-all duration-500" 
            style={{ width: `${holdPercent}%` }}
          />
          <div 
            className="bg-bear transition-all duration-500" 
            style={{ width: `${sellPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1 text-bull">
            <ThumbsUp className="h-3 w-3" />
            <span>{buy} Buy</span>
          </div>
          <div className="flex items-center gap-1 text-accent">
            <Minus className="h-3 w-3" />
            <span>{hold} Hold</span>
          </div>
          <div className="flex items-center gap-1 text-bear">
            <ThumbsDown className="h-3 w-3" />
            <span>{sell} Sell</span>
          </div>
        </div>
      </div>

      {/* Price Target */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground">Price Target</div>
          <div className="font-semibold">KES {targetPrice}</div>
        </div>
        <div className={`text-right ${upside >= 0 ? 'text-bull' : 'text-bear'}`}>
          <div className="text-xs text-muted-foreground">Upside</div>
          <div className="font-semibold">{upside >= 0 ? '+' : ''}{upside.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
