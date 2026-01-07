import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HeatmapStock {
  symbol: string;
  name: string;
  change: number;
  marketCap: number;
  sector: string;
}

interface StockHeatmapProps {
  stocks?: HeatmapStock[];
}

export function StockHeatmap({ stocks }: StockHeatmapProps) {
  const navigate = useNavigate();

  const defaultStocks: HeatmapStock[] = [
    { symbol: 'SAFCOM', name: 'Safaricom', change: 2.4, marketCap: 1200, sector: 'Telecom' },
    { symbol: 'EQTY', name: 'Equity Group', change: 3.8, marketCap: 950, sector: 'Banking' },
    { symbol: 'SCBK', name: 'StanChart', change: 1.1, marketCap: 680, sector: 'Banking' },
    { symbol: 'KCB', name: 'KCB Group', change: -0.8, marketCap: 520, sector: 'Banking' },
    { symbol: 'COOP', name: 'Co-op Bank', change: -1.5, marketCap: 380, sector: 'Banking' },
    { symbol: 'EABL', name: 'EABL', change: 2.1, marketCap: 420, sector: 'Consumer' },
    { symbol: 'BAMB', name: 'Bamburi', change: -2.8, marketCap: 290, sector: 'Industrial' },
    { symbol: 'DTB', name: 'DTB Kenya', change: 0.5, marketCap: 240, sector: 'Banking' },
    { symbol: 'ABSA', name: 'ABSA Kenya', change: 1.9, marketCap: 350, sector: 'Banking' },
    { symbol: 'NMG', name: 'Nation Media', change: -0.3, marketCap: 180, sector: 'Media' },
    { symbol: 'NCBA', name: 'NCBA Group', change: 0.7, marketCap: 310, sector: 'Banking' },
    { symbol: 'BRIT', name: 'Britam', change: -1.2, marketCap: 150, sector: 'Insurance' },
  ];

  const stockData = stocks || defaultStocks;
  
  // Calculate total market cap for sizing
  const totalMarketCap = stockData.reduce((sum, s) => sum + s.marketCap, 0);

  const getHeatmapColor = (change: number) => {
    if (change > 3) return 'from-bull/90 to-bull/70';
    if (change > 1.5) return 'from-bull/70 to-bull/50';
    if (change > 0) return 'from-bull/50 to-bull/30';
    if (change > -1.5) return 'from-bear/30 to-bear/50';
    if (change > -3) return 'from-bear/50 to-bear/70';
    return 'from-bear/70 to-bear/90';
  };

  const getTextColor = (change: number) => {
    return Math.abs(change) > 1.5 ? 'text-white' : change >= 0 ? 'text-bull' : 'text-bear';
  };

  // Create a treemap-style layout
  const sortedStocks = [...stockData].sort((a, b) => b.marketCap - a.marketCap);
  
  return (
    <div className="grid grid-cols-4 gap-1.5 auto-rows-fr">
      {sortedStocks.map((stock, index) => {
        // Larger stocks get more visual prominence
        const isLarge = index < 3;
        const isMedium = index >= 3 && index < 6;
        
        return (
          <div
            key={stock.symbol}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className={`
              relative overflow-hidden rounded-lg cursor-pointer
              transition-all duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-lg
              bg-gradient-to-br ${getHeatmapColor(stock.change)}
              ${isLarge ? 'col-span-2 row-span-2 min-h-[100px]' : isMedium ? 'col-span-1 row-span-2 min-h-[80px]' : 'min-h-[60px]'}
              active:scale-[0.98]
            `}
          >
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '12px 12px'
              }} 
            />
            
            <div className="relative h-full p-2 flex flex-col justify-between">
              <div>
                <div className={`font-bold ${isLarge ? 'text-sm' : 'text-xs'} ${getTextColor(stock.change)}`}>
                  {stock.symbol}
                </div>
                {(isLarge || isMedium) && (
                  <div className={`text-[10px] opacity-80 ${Math.abs(stock.change) > 1.5 ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {stock.name}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`font-bold ${isLarge ? 'text-base' : 'text-xs'} ${getTextColor(stock.change)}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                </span>
                {isLarge && (
                  stock.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-white/80" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-white/80" />
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
