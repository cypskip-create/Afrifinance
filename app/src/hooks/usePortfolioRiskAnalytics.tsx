import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { historicalApi } from "@/api/historicalApi";
import {
  dailyReturns, correlation, beta, annualizedVolatility, maxDrawdown, sharpeRatio, sortinoRatio, mean,
} from "@/lib/portfolioMetrics";

interface HoldingLike { symbol: string; weight: number } // weight in %, 0-100

const LOOKBACK_DAYS = 180;

/** Real daily-candle history (historicalApi) for every holding, reduced
 *  into: a pairwise correlation matrix, portfolio-level volatility /
 *  max drawdown / Sharpe / Sortino, and beta against an equal-weight
 *  basket of the holdings themselves as a same-currency market proxy
 *  (Continua has no historical index-level candle feed to regress
 *  against, so this is documented as a portfolio-composition proxy, not
 *  a true NSE index beta). */
export function usePortfolioRiskAnalytics(holdings: HoldingLike[]) {
  const symbolsKey = [...new Set(holdings.map((h) => h.symbol.toUpperCase()))].sort().join(",");
  const symbols = useMemo(() => (symbolsKey ? symbolsKey.split(",") : []), [symbolsKey]);
  const from = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);

  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["continua", "candles", symbol, LOOKBACK_DAYS],
      queryFn: () => historicalApi.getCandles(symbol, { interval: "1d", from }),
      staleTime: 30 * 60_000,
      retry: 1,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  return useMemo(() => {
    const closesBySymbol: Record<string, number[]> = {};
    const returnsBySymbol: Record<string, number[]> = {};
    symbols.forEach((symbol, i) => {
      const candles = results[i]?.data ?? [];
      const closes = candles.map((c) => c.close);
      closesBySymbol[symbol] = closes;
      returnsBySymbol[symbol] = dailyReturns(closes);
    });

    const withData = symbols.filter((s) => returnsBySymbol[s]?.length >= 5);

    const pairs: { a: string; b: string; corr: number }[] = [];
    for (let i = 0; i < withData.length; i++) {
      for (let j = i + 1; j < withData.length; j++) {
        const c = correlation(returnsBySymbol[withData[i]], returnsBySymbol[withData[j]]);
        if (c != null) pairs.push({ a: withData[i], b: withData[j], corr: c });
      }
    }

    const maxLen = Math.max(0, ...withData.map((s) => returnsBySymbol[s].length));
    const basketReturns: number[] = [];
    for (let t = 0; t < maxLen; t++) {
      const dayVals = withData.map((s) => returnsBySymbol[s][t]).filter((v) => v != null);
      if (dayVals.length > 0) basketReturns.push(mean(dayVals));
    }

    const portfolioReturns: number[] = [];
    for (let t = 0; t < maxLen; t++) {
      let sum = 0, wSum = 0;
      holdings.forEach((h) => {
        const r = returnsBySymbol[h.symbol.toUpperCase()]?.[t];
        if (r != null) { sum += r * h.weight; wSum += h.weight; }
      });
      if (wSum > 0) portfolioReturns.push(sum / wSum);
    }

    const portfolioBeta = beta(portfolioReturns, basketReturns);
    const marketVolatility = annualizedVolatility(basketReturns);

    const volatilityByHolding = withData.map((s) => ({
      symbol: s,
      volatility: annualizedVolatility(returnsBySymbol[s]),
    })).sort((a, b) => b.volatility - a.volatility);

    const drawdownByHolding = withData.map((s) => ({
      symbol: s,
      drawdown: maxDrawdown(closesBySymbol[s]),
    })).sort((a, b) => a.drawdown - b.drawdown);

    return {
      isLoading,
      hasEnoughData: withData.length >= 2 && portfolioReturns.length >= 10,
      pairs,
      portfolioVolatility: annualizedVolatility(portfolioReturns),
      marketVolatility,
      portfolioMaxDrawdown: maxDrawdown(
        portfolioReturns.reduce<number[]>((acc, r) => {
          const prev = acc.length ? acc[acc.length - 1] : 100;
          acc.push(prev * (1 + r));
          return acc;
        }, [])
      ),
      portfolioBeta,
      sharpe: sharpeRatio(portfolioReturns),
      sortino: sortinoRatio(portfolioReturns),
      volatilityByHolding,
      drawdownByHolding,
      symbolsWithData: withData,
    };
  }, [results, symbols, holdings, isLoading]);
}