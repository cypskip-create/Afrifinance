import { Bell, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: "price-alert",
      icon: TrendingUp,
      title: "Price Alert Triggered",
      message: "EQTY reached your target price of KES 62.50",
      time: "2 minutes ago",
      read: false,
      color: "text-bull"
    },
    {
      id: 2,
      type: "price-alert",
      icon: TrendingDown,
      title: "Price Alert Triggered",
      message: "SAFCOM dropped below KES 13.00",
      time: "1 hour ago",
      read: false,
      color: "text-bear"
    },
    {
      id: 3,
      type: "news",
      icon: AlertCircle,
      title: "Market News",
      message: "Breaking: NSE 20 Index hits new monthly high",
      time: "3 hours ago",
      read: true,
      color: "text-primary"
    },
    {
      id: 4,
      type: "portfolio",
      icon: CheckCircle,
      title: "Trade Executed",
      message: "Your buy order for 100 shares of KCB has been executed",
      time: "1 day ago",
      read: true,
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </h1>
              <p className="text-sm text-muted-foreground">Stay updated with your alerts</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card 
                key={notification.id} 
                className={`${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-background ${notification.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
