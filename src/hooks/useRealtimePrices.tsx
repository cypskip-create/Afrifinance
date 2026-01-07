import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

// Simulated real-time price updates (replace with actual WebSocket/API)
export function useRealtimePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState(false);

  const basePrices: Record<string, number> = {
    SAFCOM: 12.85,
    EQTY: 62.50,
    SCBK: 185.00,
    BAMB: 89.75,
    KCB: 45.30,
    COOP: 15.20,
    EABL: 142.00,
    DTB: 115.50,
    NMG: 25.40,
    ABSA: 13.85,
    NCBA: 42.50,
    SCOM: 2840.00,
    BTC: 43250,
    ETH: 2580,
    SOL: 98.45,
    BNB: 312.45,
  };

  const generatePrice = useCallback((symbol: string, currentPrice?: number) => {
    const base = currentPrice || basePrices[symbol] || 100;
    const volatility = symbol.length <= 4 ? 0.002 : 0.005;
    const change = (Math.random() - 0.5) * 2 * volatility * base;
    const newPrice = Math.max(0.01, base + change);
    
    return {
      symbol,
      price: newPrice,
      previousPrice: base,
      change: newPrice - base,
      changePercent: ((newPrice - base) / base) * 100,
      volume: Math.floor(Math.random() * 1000000),
      high: newPrice * 1.02,
      low: newPrice * 0.98,
      open: base,
      timestamp: Date.now(),
    };
  }, []);

  useEffect(() => {
    // Initialize prices
    const initialPrices: Record<string, PriceData> = {};
    symbols.forEach(symbol => {
      initialPrices[symbol] = generatePrice(symbol);
    });
    setPrices(initialPrices);
    setIsConnected(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        // Update 1-3 random symbols each tick
        const numUpdates = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...symbols].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(numUpdates, shuffled.length); i++) {
          const symbol = shuffled[i];
          const current = prev[symbol]?.price;
          updated[symbol] = generatePrice(symbol, current);
        }
        return updated;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [symbols.join(','), generatePrice]);

  return { prices, isConnected };
}

// Hook for single stock real-time price
export function useRealtimePrice(symbol: string) {
  const { prices, isConnected } = useRealtimePrices([symbol]);
  return { price: prices[symbol], isConnected };
}
