import { User, Settings, CreditCard, Users, Bell, Shield, Crown, Zap, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const subscriptionPlans = [
    {
      name: "Free",
      price: "KES 0",
      features: ["Basic features", "Limited AI (3/day)", "Ads included"],
      current: true
    },
    {
      name: "Premium",
      price: "KES 999/month",
      features: ["Ad-free experience", "Enhanced tools", "AI Assistant (30/day)"],
      current: false
    },
    {
      name: "Premium+",
      price: "KES 1,999/month", 
      features: ["Everything included", "Unlimited AI", "Priority support"],
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Account" 
        subtitle="Profile & settings"
        showSearch={false}
        showAI={false}
        showNotifications={true}
      />

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <span>{profile?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    {profile?.subscription_plan?.charAt(0).toUpperCase() + profile?.subscription_plan?.slice(1) || 'Free'}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Crown className="h-5 w-5 text-accent" />
              <span>Subscription Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionPlans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  plan.current 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center space-x-2">
                      <span>{plan.name}</span>
                      {plan.current && <Badge variant="default">Current</Badge>}
                      {plan.name === "Premium+" && <Zap className="h-4 w-4 text-accent" />}
                    </h4>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                  {!plan.current && (
                    <Button size="sm" variant={plan.name === "Premium+" ? "default" : "outline"}>
                      Upgrade
                    </Button>
                  )}
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Light / Dark mode</div>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Language</div>
                <div className="text-sm text-muted-foreground">English / Kiswahili</div>
              </div>
              <Button variant="outline" size="sm">
                English
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Price Alerts</div>
                <div className="text-sm text-muted-foreground">Push notifications</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">News Alerts</div>
                <div className="text-sm text-muted-foreground">Market updates</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Referrals & Rewards
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}