import { useState } from "react";
import { Bell, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Trash2, Settings, ChevronRight, ArrowLeft, Filter, MoreHorizontal, Newspaper, DollarSign, Users, Zap, Clock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "price-alert",
      icon: TrendingUp,
      title: "Price Alert Triggered",
      message: "EQTY reached your target price of KES 62.50",
      time: "2 minutes ago",
      read: false,
      color: "text-bull",
      actionUrl: "/stock/EQTY",
      actionLabel: "View Stock"
    },
    {
      id: 2,
      type: "price-alert",
      icon: TrendingDown,
      title: "Price Alert Triggered",
      message: "SAFCOM dropped below KES 13.00",
      time: "1 hour ago",
      read: false,
      color: "text-bear",
      actionUrl: "/stock/SAFCOM",
      actionLabel: "View Stock"
    },
    {
      id: 3,
      type: "news",
      icon: Newspaper,
      title: "Breaking News",
      message: "NSE 20 Index hits new monthly high as banking stocks surge",
      time: "3 hours ago",
      read: true,
      color: "text-primary",
      actionUrl: "/news",
      actionLabel: "Read More"
    },
    {
      id: 4,
      type: "portfolio",
      icon: DollarSign,
      title: "Dividend Received",
      message: "You received KES 2,450 dividend from Safaricom",
      time: "5 hours ago",
      read: true,
      color: "text-bull",
      actionUrl: "/track-investments",
      actionLabel: "View Portfolio"
    },
    {
      id: 5,
      type: "portfolio",
      icon: CheckCircle,
      title: "Trade Executed",
      message: "Your buy order for 100 shares of KCB has been executed",
      time: "1 day ago",
      read: true,
      color: "text-primary",
      actionUrl: "/track-investments",
      actionLabel: "View Trade"
    },
    {
      id: 6,
      type: "social",
      icon: Users,
      title: "New Follower",
      message: "TraderKE_Pro started following you",
      time: "1 day ago",
      read: true,
      color: "text-accent",
      actionUrl: "/traders-hub",
      actionLabel: "View Profile"
    },
    {
      id: 7,
      type: "system",
      icon: Zap,
      title: "Feature Update",
      message: "New stock screener filters are now available",
      time: "2 days ago",
      read: true,
      color: "text-accent",
      actionUrl: "/screener",
      actionLabel: "Try Now"
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true,
    newsAlerts: true,
    portfolioAlerts: true,
    socialAlerts: true,
    marketOpen: true,
    marketClose: false,
    weeklyDigest: true
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({ title: "All notifications cleared" });
  };

  const getNotificationsByType = (type: string) => {
    if (type === "all") return notifications;
    return notifications.filter(n => n.type === type);
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = notification.icon;
    return (
      <Card 
        className={`transition-all duration-200 ${!notification.read ? 'bg-primary/5 border-primary/20' : 'card-gradient'}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl bg-muted/50 ${notification.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {notification.time}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
              
              {notification.actionUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 mt-2 text-xs text-primary p-0"
                  onClick={() => {
                    markAsRead(notification.id);
                    navigate(notification.actionUrl!);
                  }}
                >
                  {notification.actionLabel} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 text-[10px] bg-primary">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">Stay updated with alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="h-9 w-9"
            >
              <Settings className={`h-5 w-5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="card-gradient animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "priceAlerts", label: "Price Alerts", desc: "Get notified when stocks hit your targets" },
                { key: "newsAlerts", label: "News Alerts", desc: "Breaking news and market updates" },
                { key: "portfolioAlerts", label: "Portfolio Alerts", desc: "Trade executions and dividends" },
                { key: "socialAlerts", label: "Social Alerts", desc: "Followers and mentions" },
                { key: "marketOpen", label: "Market Open", desc: "Daily market opening notification" },
                { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly portfolio summary" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-sm font-medium">{setting.label}</div>
                    <div className="text-xs text-muted-foreground">{setting.desc}</div>
                  </div>
                  <Switch 
                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {notifications.length} total
              </Badge>
              {unreadCount > 0 && (
                <Badge className="text-xs bg-primary/20 text-primary">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                  <Eye className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={clearAll}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Tabbed Notifications */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="all" className="text-[10px] px-1">All</TabsTrigger>
            <TabsTrigger value="price-alert" className="text-[10px] px-1">Alerts</TabsTrigger>
            <TabsTrigger value="news" className="text-[10px] px-1">News</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-[10px] px-1">Portfolio</TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] px-1">Social</TabsTrigger>
          </TabsList>

          {["all", "price-alert", "news", "portfolio", "social"].map((type) => (
            <TabsContent key={type} value={type} className="mt-4 space-y-3">
              {getNotificationsByType(type).length === 0 ? (
                <Card className="card-gradient">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {type === "all" 
                        ? "You're all caught up!" 
                        : `No ${type.replace("-", " ")} notifications yet`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getNotificationsByType(type).map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Enable Push Notifications CTA */}
        <Card className="card-gradient border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Enable Push Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  Get real-time alerts for price movements and news
                </p>
              </div>
              <Button size="sm" className="btn-primary h-8">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
