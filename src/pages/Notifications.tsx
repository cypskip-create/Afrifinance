import { useState, useMemo } from "react";
import {
  Bell, Heart, MessageCircle, Repeat2, UserPlus, TrendingUp, TrendingDown,
  CheckCircle, Trash2, Settings, ChevronRight, ArrowLeft, Newspaper,
  DollarSign, Users, Zap, Eye, Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

const featureMeta: Record<string, { label: string; icon: any; color: string }> = {
  tradershub: { label: "TradersHub", icon: MessageCircle, color: "text-primary" },
  social:     { label: "Social",     icon: Users,         color: "text-accent" },
  alerts:     { label: "Price Alerts", icon: Target,      color: "text-bull" },
  news:       { label: "News",       icon: Newspaper,     color: "text-primary" },
  portfolio:  { label: "Portfolio",  icon: DollarSign,    color: "text-bull" },
  system:     { label: "System",     icon: Zap,           color: "text-accent" },
};

const typeIcon: Record<string, any> = {
  like: Heart, comment: MessageCircle, reply: MessageCircle, repost: Repeat2,
  follow: UserPlus, mention: MessageCircle, alert: Target, news: Newspaper, system: Zap,
};

const filters = [
  { id: "all", label: "All" },
  { id: "tradershub", label: "TradersHub" },
  { id: "social", label: "Social" },
  { id: "alerts", label: "Alerts" },
  { id: "portfolio", label: "Portfolio" },
  { id: "news", label: "News" },
];

function formatTime(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, remove, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    tradershub: true, social: true, alerts: true, news: true, portfolio: true, push: false,
  });

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter(n => n.feature === activeFilter);
  }, [notifications, activeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    filtered.forEach(n => {
      const key = n.feature || "system";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const handleClick = (n: AppNotification) => {
    if (!n.read) markAsRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center px-6 text-center">
        <div>
          <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
          <h2 className="font-bold mb-1">Sign in to view notifications</h2>
          <Button className="mt-4 btn-primary" onClick={() => navigate('/auth')}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-bold flex items-center gap-2">
              Notifications
              {unreadCount > 0 && <Badge className="h-5 min-w-5 text-[10px] bg-primary rounded-full">{unreadCount}</Badge>}
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(s => !s)} className="h-9 w-9 rounded-full">
            <Settings className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1.5 pb-3">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              data-small-target
              className={`py-1.5 px-3.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all ${
                activeFilter === f.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 pb-4 space-y-3">
        {showSettings && (
          <div className="animate-fade-in">
            <p className="section-eyebrow flex items-center gap-2 pb-2 border-b border-border/60">
              <Settings className="h-3.5 w-3.5 text-primary" />Notification settings
            </p>
            <div>
              {[
                { key: "tradershub", label: "TradersHub", desc: "Likes, comments, replies, reposts" },
                { key: "social", label: "Social", desc: "Followers & mentions" },
                { key: "alerts", label: "Price Alerts", desc: "Target price triggers" },
                { key: "news", label: "News", desc: "Breaking news & headlines" },
                { key: "portfolio", label: "Portfolio", desc: "Trades & dividends" },
                { key: "push", label: "Push Notifications", desc: "Real-time mobile alerts" },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between py-2.5 border-b border-border/40">
                  <div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                  </div>
                  <Switch checked={(settings as any)[s.key]} onCheckedChange={c => setSettings(p => ({ ...p, [s.key]: c }))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{filtered.length} notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[11px] rounded-full gap-1" onClick={() => { markAllAsRead(); toast({ title: "All marked as read" }); }}>
                  <Eye className="h-3 w-3" />Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive rounded-full gap-1" onClick={() => { clearAll(); toast({ title: "Cleared" }); }}>
                <Trash2 className="h-3 w-3" />Clear
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary/30 border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold text-sm mb-1">All caught up</h3>
            <p className="text-xs text-muted-foreground">No notifications here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([feature, items]) => {
              const meta = featureMeta[feature] || featureMeta.system;
              const FeatureIcon = meta.icon;
              return (
                <div key={feature}>
                  <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                    <FeatureIcon className={`h-3.5 w-3.5 ${meta.color}`} />
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{meta.label}</h2>
                    <span className="text-[10px] text-muted-foreground">· {items.length}</span>
                  </div>
                  <div>
                    {items.map(n => {
                      const Icon = typeIcon[n.type] || Bell;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleClick(n)}
                          className={`flex items-start gap-3 py-3 -mx-4 px-4 border-b border-border/40 transition-colors cursor-pointer hover:bg-muted/25 ${
                            !n.read ? 'bg-primary/[0.04]' : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <h3 className="font-semibold text-[13px] truncate">{n.title}</h3>
                                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] text-muted-foreground tabular">{formatTime(n.created_at)}</span>
                                <Button variant="ghost" size="icon" aria-label="Delete notification" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={e => { e.stopPropagation(); remove(n.id); }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{n.message}</p>
                            {n.action_url && (
                              <span className="text-[11px] text-primary font-medium mt-1 inline-flex items-center gap-0.5">
                                View <ChevronRight className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
