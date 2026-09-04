import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Newspaper, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { AIThesisCard } from "@/components/stock/AIThesisCard";
import { MediaItem } from "@/data/mediaItems";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { useQuery } from "@tanstack/react-query";
import { announcementsApi } from "@/api/announcementsApi";
import { InfoTip } from "@/components/portfolio/InfoTip";

interface Props {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePercent: string;
  pe: string; eps: string; dividend: string;
  news: MediaItem[];
  /** Opens the full story on the Media tab. */
  onSelectNews?: (item: MediaItem) => void;
}

export function NewsEventsTab(props: Props) {
  const { news, symbol, name, sector, price, changePercent, pe, eps, dividend, onSelectNews } = props;
  const filingsQuery = useQuery({
    queryKey: ["continua", "announcements", symbol, "news-tab"],
    queryFn: () => announcementsApi.getForSymbol(symbol, { limit: 8 }),
    enabled: !!symbol,
    staleTime: 15 * 60_000,
  });
  const filings = filingsQuery.data ?? [];

  return (
    <div className="space-y-3">
      <AIThesisCard
        mode="news_summary"
        symbol={symbol}
        name={name}
        sector={sector}
        price={price}
        changePercent={changePercent}
        pe={pe} eps={eps} dividend={dividend}
        headlines={news.map(n => n.title)}
        title="AI News Summary"
      />

      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <h4 className="text-xs font-bold flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />Recent Company Filings</h4>
            <InfoTip>Real NSE announcements bridged from Continua's scraper — not a predicted events calendar, since Continua doesn't have a reliable forward corporate-calendar source yet.</InfoTip>
          </div>
          {filingsQuery.isLoading ? (
            <p className="text-[11px] text-muted-foreground py-2">Loading…</p>
          ) : filings.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2">No filings on file for {symbol} yet.</p>
          ) : (
            <div className="space-y-2">
              {filings.map((f) => (
                <a
                  key={f.id}
                  href={f.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-2 rounded-xl bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.publishedAt ? formatTimestamp(f.publishedAt) : "Date unknown"}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="text-xs font-bold flex items-center gap-1.5 px-1"><Newspaper className="h-3.5 w-3.5 text-primary" />Latest Headlines</h4>
        {news.length === 0 ? (
          <Card className="soft-card">
            <CardContent className="p-4 text-center text-[11px] text-muted-foreground">
              No recent headlines for {symbol} yet.
            </CardContent>
          </Card>
        ) : (
          news.map(n => (
            <Card key={n.id} className="soft-card cursor-pointer active:opacity-70 transition-opacity" onClick={() => onSelectNews?.(n)}>
              <CardContent className="p-3 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.sentiment === "bearish" ? "bg-bear/10 text-bear" : "bg-bull/10 text-bull"}`}>
                  {n.sentiment === "bearish" ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.source} · {formatTimestamp(n.publishedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}