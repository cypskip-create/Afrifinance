import { useState, useEffect } from "react";
import { User, Settings, CreditCard, Users, Bell, Shield, Crown, Zap, LogOut, ChevronRight, Smartphone, Globe, HelpCircle, FileText, Star, Eye, EyeOff, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useToast } from "@/hooks/use-toast";

const freeFeatures = [
  "Basic market data & charts",
  "Standard watchlist (5 stocks)",
  "Community access (read-only)",
  "Ads included",
];

const premiumFeatures = [
  "Ad-free experience",
  "Advanced charts & 90+ indicators",
  "AI-powered insights & recommendations",
  "Unlimited price alerts",
  "Priority support",
  "Exclusive portfolio analytics",
  "Full TradersHub posting access",
  "Real-time NSE data",
];

export default function Account() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolioPublic, setPortfolioPublic] = useState(true);

  // Sync from profile
  useEffect(() => {
    const pp = (profile as any)?.portfolio_public;
    if (pp !== undefined && pp !== null) setPortfolioPublic(!!pp);
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const comingSoon = (label: string) => toast({ title: `${label}`, description: "Coming soon — we're working on this!" });

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isPremium = profile?.subscription_plan === 'premium' || profile?.subscription_plan === 'premium+';

  const menuItems = [
    { icon: CreditCard, label: "Payment Methods", description: "Manage your cards", action: () => comingSoon("Payment Methods") },
    { icon: Users, label: "Referrals & Rewards", description: "Invite friends, earn rewards", action: () => comingSoon("Referrals & Rewards") },
    { icon: Bell, label: "Notification Settings", description: "Manage alerts", action: () => navigate('/notifications') },
    { icon: Shield, label: "Privacy & Security", description: "Account protection", action: () => comingSoon("Privacy & Security") },
    { icon: Smartphone, label: "Connected Devices", description: "Manage sessions", action: () => comingSoon("Connected Devices") },
    { icon: Globe, label: "Language & Region", description: "English (Kenya)", action: () => comingSoon("Language & Region") },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance", action: () => comingSoon("Help & Support") },
    { icon: FileText, label: "Terms & Privacy", description: "Legal information", action: () => comingSoon("Terms & Privacy") },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Account" subtitle="Profile & settings" showSearch={false} showNotifications={true} />

      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <Card className="card-gradient overflow-hidden">
          <div className="h-20 bg-gradient-primary" />
          <CardContent className="relative pt-0 pb-4">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <h3 className="font-bold text-xl flex items-center justify-center gap-2">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  <Badge variant="secondary" className="text-xs font-medium">
                    <Crown className="h-3 w-3 mr-1" />
                    {isPremium ? 'Premium' : 'Free'}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </p>
              </div>
              <Button className="mt-4 w-full max-w-[200px] btn-primary" onClick={() => setEditProfileOpen(true)}>
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />

        {/* Subscription Plans — Side by Side Comparison */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Crown className="h-5 w-5 text-accent" />
              <span>Subscription Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Free Plan */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${!isPremium ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2">
                    Free
                    {!isPremium && <Badge variant="default" className="text-[10px]">Current</Badge>}
                  </h4>
                  <p className="text-xs text-muted-foreground">KES 0/month</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${isPremium ? 'border-primary bg-primary/5' : 'border-accent/50 bg-accent/5'}`}>
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                RECOMMENDED
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    Premium
                    {isPremium && <Badge variant="default" className="text-[10px]">Current</Badge>}
                  </h4>
                  <p className="text-sm font-semibold text-foreground">KES 999<span className="text-xs text-muted-foreground font-normal">/month</span></p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isPremium && (
                <Button className="w-full h-11 rounded-2xl btn-primary font-bold text-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>App Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center"><Star className="h-4 w-4" /></div>
                <div>
                  <div className="font-medium text-sm">Theme</div>
                  <div className="text-xs text-muted-foreground">Light / Dark mode</div>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  {portfolioPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-medium text-sm">Portfolio Visibility</div>
                  <div className="text-xs text-muted-foreground">{portfolioPublic ? "Public" : "Private"}</div>
                </div>
              </div>
              <Switch checked={portfolioPublic} onCheckedChange={async (checked) => {
                setPortfolioPublic(checked);
                await updateProfile({ portfolio_public: checked } as any);
                toast({ title: checked ? "Portfolio is now public" : "Portfolio is now private" });
              }} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center"><Bell className="h-4 w-4" /></div>
                <div>
                  <div className="font-medium text-sm">Price Alerts</div>
                  <div className="text-xs text-muted-foreground">Push notifications</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                <div>
                  <div className="font-medium text-sm">News Alerts</div>
                  <div className="text-xs text-muted-foreground">Market updates</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Zap className="h-5 w-5 text-accent" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
        
        <p className="text-center text-xs text-muted-foreground">AfriFinance v1.0.0 • Made with ❤️ in Kenya</p>
      </div>
    </div>
  );
}
