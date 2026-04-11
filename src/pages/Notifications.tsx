import { useState } from "react";
import { 
  Bell, TrendingUp, TrendingDown, CheckCircle, Trash2, 
  Settings, ChevronRight, ArrowLeft, Newspaper, DollarSign, Users, 
  Zap, Eye, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: "price-alert" | "news" | "portfolio" | "social" | "system";
  icon: React.ElementType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
  actionUrl?: string;
  actionLabel?: string;
}

const categoryTabs = [
  { id: "all", label: "All", icon: Bell },
  { id: "price-alert", label: "Alerts", icon: Target },
  { id: "news", label: "News", icon: Newspaper },
  { id: "portfolio", label: "Portfolio", icon: DollarSign },
  { id: "social", label: "Social", icon: Users },
];

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: "price-alert", icon: TrendingUp, title: "Price Alert Triggered", message: "EQTY reached your target price of KES 62.50", time: "2 min ago", read: false, color: "text-bull", actionUrl: "/stock/EQTY", actionLabel: "View Stock" },
    { id: 2, type: "price-alert", icon: TrendingDown, title: "Price Alert Triggered", message: "SAFCOM dropped below KES 13.00", time: "1h ago", read: false, color: "text-bear", actionUrl: "/stock/SAFCOM", actionLabel: "View Stock" },
    { id: 3, type: "news", icon: Newspaper, title: "Breaking News", message: "NSE 20 Index hits new monthly high as banking stocks surge", time: "3h ago", read: true, color: "text-primary", actionUrl: "/news", actionLabel: "Read More" },
    { id: 4, type: "portfolio", icon: DollarSign, title: "Dividend Received", message: "You received KES 2,450 dividend from Safaricom", time: "5h ago", read: true, color: "text-bull", actionUrl: "/track-investments", actionLabel: "View Portfolio" },
    { id: 5, type: "portfolio", icon: CheckCircle, title: "Trade Executed", message: "Your buy order for 100 shares of KCB has been executed", time: "1d ago", read: true, color: "text-primary", actionUrl: "/track-investments", actionLabel: "View Trade" },
    { id: 6, type: "social", icon: Users, title: "New Follower", message: "TraderKE_Pro started following you", time: "1d ago", read: true, color: "text-accent", actionUrl: "/traders-hub", actionLabel: "View Profile" },
    { id: 7, type: "system", icon: Zap, title: "Feature Update", message: "New stock screener filters are now available", time: "2d ago", read: true, color: "text-accent", actionUrl: "/screener", actionLabel: "Try Now" },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true, newsAlerts: true, portfolioAlerts: true,
    socialAlerts: true, marketOpen: true, weeklyDigest: true,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All marked as read" });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast({ title: "All notifications cleared" });
  };

  const filtered = activeCategory === "all" ? notifications : notifications.filter(n => n.type === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 text-[10px] bg-primary rounded-full">{unreadCount}</Badge>
                )}
              </h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="h-9 w-9 rounded-full">
            <Settings className={`h-4.5 w-4.5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1.5 pb-3">
          {categoryTabs.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-3">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="card-gradient animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" />Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "priceAlerts", label: "Price Alerts", desc: "Target price notifications" },
                { key: "newsAlerts", label: "News Alerts", desc: "Breaking news & updates" },
                { key: "portfolioAlerts", label: "Portfolio", desc: "Trades & dividends" },
                { key: "socialAlerts", label: "Social", desc: "Followers & mentions" },
                { key: "marketOpen", label: "Market Open", desc: "Daily opening alert" },
                { key: "weeklyDigest", label: "Weekly Digest", desc: "Portfolio summary" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-sm font-medium">{setting.label}</div>
                    <div className="text-[11px] text-muted-foreground">{setting.desc}</div>
                  </div>
                  <Switch 
                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{filtered.length} notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[11px] rounded-full gap-1" onClick={markAllAsRead}>
                  <Eye className="h-3 w-3" />Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive rounded-full gap-1" onClick={clearAll}>
                <Trash2 className="h-3 w-3" />Clear
              </Button>
            </div>
          </div>
        )}

        {/* Notification List */}
        {filtered.length === 0 ? (
          <Card className="card-gradient">
            <CardContent className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-sm mb-1">All caught up!</h3>
              <p className="text-xs text-muted-foreground">No notifications here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(notification => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all cursor-pointer active:scale-[0.99] ${
                    !notification.read ? 'bg-primary/5 border border-primary/15' : 'bg-card border border-border/40'
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) navigate(notification.actionUrl);
                  }}
                >
                  <div className={`p-2 rounded-xl bg-muted/50 ${notification.color} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">{notification.message}</p>
                    {notification.actionLabel && (
                      <span className="text-xs text-primary font-medium mt-1.5 inline-flex items-center gap-0.5">
                        {notification.actionLabel} <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enable Push */}
        <Card className="card-gradient border-primary/20 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Push Notifications</h3>
                <p className="text-[11px] text-muted-foreground">Real-time alerts for price movements</p>
              </div>
              <Button size="sm" className="btn-primary h-8 rounded-full">Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
