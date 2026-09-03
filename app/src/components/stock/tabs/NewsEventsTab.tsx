import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Newspaper, TrendingUp, TrendingDown } from "lucide-react";
import { AIThesisCard } from "@/components/stock/AIThesisCard";
import { Fundamentals } from "@/data/stockFundamentals";
import { NewsHeadline, headlineTime } from "@/lib/newsHeadline";

interface Props {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePercent: string;
  pe: string; eps: string; dividend: string;
  news: NewsHeadline[];
  fundamentals: Fundamentals;
  /** Opens the source (an NSE filing URL for a real announcement, or the
   *  full story on the Media tab for a mock/editorial item). */
  onSelectNews?: (item: NewsHeadline) => void;
}

const typeColor = (t: string) =>
  t === "earnings" ? "bg-primary/10 text-primary" :
  t === "dividend" ? "bg-bull/10 text-bull" :
  t === "agm" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground";

export function NewsEventsTab(props: Props) {
  const { news, fundamentals, symbol, name, sector, price, changePercent, pe, eps, dividend, onSelectNews } = props;
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
          <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />Upcoming Events</h4>
          <div className="space-y-2">
            {fundamentals.events.map(e => (
              <div key={e.title} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                <div className="text-center w-12 shrink-0">
                  <p className="text-[9px] text-muted-foreground uppercase">{e.date.split(" ")[0]}</p>
                  <p className="text-sm font-bold leading-none">{e.date.split(" ")[1]}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{e.title}</p>
                </div>
                <Badge variant="secondary" className={`text-[9px] ${typeColor(e.type)}`}>{e.type.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
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
                {/* Sentiment icon only for editorial media items — a regulatory
                    filing has no sentiment, so we show a neutral icon rather
                    than fabricate a bullish/bearish read on it. */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  n.kind === "media" && n.sentiment === "bearish" ? "bg-bear/10 text-bear"
                  : n.kind === "media" ? "bg-bull/10 text-bull"
                  : "bg-muted text-muted-foreground"
                }`}>
                  {n.kind === "media" ? (
                    n.sentiment === "bearish" ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <Newspaper className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {n.source} · {headlineTime(n)}
                    {n.needsReview && " · Unconfirmed match"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}