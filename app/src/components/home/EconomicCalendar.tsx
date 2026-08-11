import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { relativeDate } from "@/lib/stockPrices";

interface EconomicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  country: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

// Dates are offsets from "today" (via relativeDate) rather than fixed calendar strings, so
// this list always reads as genuinely upcoming instead of drifting into the past as real
// time moves on.
const isoDate = (daysOffset: number) => relativeDate(daysOffset).toISOString().slice(0, 10);

const UPCOMING_EVENTS: EconomicEvent[] = [
  {
    id: '1',
    title: 'CBK Interest Rate Decision',
    date: isoDate(4),
    time: '14:00',
    impact: 'high',
    country: 'KE',
    forecast: '12.00%',
    previous: '12.00%',
  },
  {
    id: '2',
    title: 'Kenya CPI (YoY)',
    date: isoDate(9),
    time: '10:00',
    impact: 'high',
    country: 'KE',
    forecast: '6.8%',
    previous: '6.6%',
  },
  {
    id: '3',
    title: 'Kenya Trade Balance',
    date: isoDate(18),
    time: '10:00',
    impact: 'medium',
    country: 'KE',
    forecast: '-KES 120B',
    previous: '-KES 115B',
  },
  {
    id: '4',
    title: 'Kenya GDP Growth',
    date: isoDate(26),
    time: '09:00',
    impact: 'medium',
    country: 'KE',
    forecast: '5.2%',
    previous: '5.0%',
  },
];

export function EconomicCalendar() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-bear/20 text-bear border-bear/30';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'low': return 'bg-bull/20 text-bull border-bull/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Economic Calendar
          </CardTitle>
          <Badge variant="outline" className="text-xs gap-1">
            <Bell className="h-3 w-3" />
            {UPCOMING_EVENTS.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {UPCOMING_EVENTS.slice(0, 4).map((event) => (
          <div 
            key={event.id}
            className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded">
                    {event.country}
                  </span>
                  <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                    {event.impact}
                  </Badge>
                </div>
                <p className="text-sm font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                  <span>•</span>
                  <span>{event.time} EAT</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {event.forecast && (
                  <div>
                    <p className="text-xs text-muted-foreground">Forecast</p>
                    <p className="text-sm font-semibold">{event.forecast}</p>
                  </div>
                )}
              </div>
            </div>
            {event.previous && (
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Previous: {event.previous}</span>
                {event.forecast && event.previous && (
                  <span className={`flex items-center gap-1 ${
                    parseFloat(event.forecast) > parseFloat(event.previous) 
                      ? 'text-bull' 
                      : parseFloat(event.forecast) < parseFloat(event.previous)
                      ? 'text-bear'
                      : 'text-muted-foreground'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    Expected {parseFloat(event.forecast) > parseFloat(event.previous) ? 'higher' : 'lower'}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}