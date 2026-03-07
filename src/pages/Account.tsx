import { useState } from "react";
import { User, Settings, CreditCard, Users, Bell, Shield, Crown, Zap, LogOut, ChevronRight, Smartphone, Globe, HelpCircle, FileText, Star, Eye, EyeOff, Lock, Check } from "lucide-react";
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

export default function Account() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [portfolioPublic, setPortfolioPublic] = useState(true);
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isFree = profile?.subscription_plan === 'free' || !profile?.subscription_plan;

  const freeFeatures = ["Basic charts", "Standard watchlist", "Community access", "Ads included"];
  const premiumFeatures = [
    "Ad-free experience",
    "Advanced charts & 90+ indicators",
    "AI-powered insights & alerts",
    "Unlimited price alerts",
    "Priority support",
    "Exclusive portfolio analytics",
    "Higher data refresh rate",
    "Export to PDF",
  ];

  const menuItems = [
    { icon: CreditCard, label: "Payment Methods", description: "Manage your cards", action: () => {} },
    { icon: Users, label: "Referrals & Rewards", description: "Invite friends, earn rewards", action: () => {} },
    { icon: Bell, label: "Notification Settings", description: "Manage alerts", action: () => navigate('/notifications') },
    { icon: Shield, label: "Privacy & Security", description: "Account protection", action: () => {} },
    { icon: Smartphone, label: "Connected Devices", description: "Manage sessions", action: () => {} },
    { icon: Globe, label: "Language & Region", description: "English (Kenya)", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance", action: () => {} },
    { icon: FileText, label: "Terms & Privacy", description: "Legal information", action: () => {} },
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
                    {isFree ? 'Free' : 'Premium'}
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

        {/* Subscription Plans - Side by Side */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Crown className="h-5 w-5 text-accent" />
              <span>Subscription Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Free Plan */}
              <div className={`p-4 rounded-2xl border-2 transition-all ${isFree ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="mb-3">
                  <h4 className="font-bold text-base flex items-center gap-1.5">
                    Free
                    {isFree && <Badge variant="default" className="text-[9px] px-1.5">Current</Badge>}
                  </h4>
                  <p className="text-lg font-bold mt-1">KES 0</p>
                </div>
                <ul className="space-y-1.5">
                  {freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Plan */}
              <div className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${!isFree ? 'border-primary bg-primary/5' : 'border-accent/30 bg-accent/5'}`}>
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                  POPULAR
                </div>
                <div className="mb-3">
                  <h4 className="font-bold text-base flex items-center gap-1.5">
                    Premium
                    {!isFree && <Badge variant="default" className="text-[9px] px-1.5">Current</Badge>}
                    <Zap className="h-3.5 w-3.5 text-accent" />
                  </h4>
                  <p className="text-lg font-bold mt-1">KES 999<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </div>
                <ul className="space-y-1.5">
                  {premiumFeatures.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isFree && (
                  <Button className="w-full mt-3 h-9 btn-primary text-xs font-bold">
                    Upgrade Now
                  </Button>
                )}
              </div>
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
          <LogOut className="h-5 w-5 mr-2" /> Sign Out
        </Button>
        <p className="text-center text-xs text-muted-foreground">AfriFinance v1.0.0 • Made with ❤️ in Kenya</p>
      </div>
    </div>
  );
}
