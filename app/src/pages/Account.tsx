import { useState, useEffect } from "react";
import { User, Settings, CreditCard, Bell, Shield, Crown, LogOut, ChevronRight, Globe, HelpCircle, FileText, Eye, EyeOff, Check, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ProfileSettingsDialog, Section } from "@/components/profile/ProfileSettingsDialog";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useToast } from "@/hooks/use-toast";

// Benchmarked against Simply Wall St (~$10/mo), Moomoo (freemium+tiered),
// Seeking Alpha ($4.95 first month → $239/yr), Robinhood Gold ($5/mo).
// Kenya pricing anchored to income parity and typical local SaaS pricing.
const FREE = [
  "Watchlists & delayed prices",
  "TradersHub — read & post",
  "Basic charts",
  "3 AI theses / month",
];
const PREMIUM = [
  "Real-time NSE prices",
  "Unlimited AI investment theses",
  "Investment Health Score on every stock",
  "Advanced screener & compare",
  "Portfolio insights + benchmarking",
  "Priority price / earnings alerts",
  "Ad-free",
];

export default function Account() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<Section>("menu");
  const [annual, setAnnual] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, updateProfile, refetch: refetchProfile } = useProfile();
  const { methods: paymentMethods } = usePaymentMethods();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolioPublic, setPortfolioPublic] = useState(true);
  const [fontScale, setFontScale] = useState<string>(() => localStorage.getItem("app_font_scale") || "1");

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-scale", fontScale);
    localStorage.setItem("app_font_scale", fontScale);
  }, [fontScale]);

  useEffect(() => {
    const pp = profile?.portfolio_public;
    if (pp !== undefined && pp !== null) setPortfolioPublic(!!pp);
  }, [profile]);

  const handleSignOut = async () => { await signOut(); navigate('/auth'); };
  const openSettings = (section: Section) => { setSettingsSection(section); setSettingsOpen(true); };
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isPremium = profile?.subscription_plan === 'premium' || profile?.subscription_plan === 'premium+';

  const menuItems = [
    { icon: Bell, label: "Notifications", action: () => navigate('/notifications') },
    { icon: CreditCard, label: "Payment methods", action: () => openSettings("payment") },
    { icon: Shield, label: "Privacy & security", action: () => openSettings("privacy") },
    { icon: Globe, label: "Language & region", action: () => openSettings("language") },
    { icon: HelpCircle, label: "Help & support", action: () => openSettings("help") },
    { icon: FileText, label: "Terms & privacy", action: () => openSettings("legal") },
  ];

  // Monthly is KES 800. Yearly is billed as a single KES 7,980 charge, which works out
  // to KES 665/mo — a 17% discount off the monthly rate (matches the "save 17%" pill).
  const monthly = 800;
  const yearlyMonthlyEquivalent = 665;
  const yearly = yearlyMonthlyEquivalent * 12; // 7,980
  const savingsPct = Math.round((1 - yearlyMonthlyEquivalent / monthly) * 100);
  const priceLabel = annual ? `KES ${yearly.toLocaleString()}` : `KES ${monthly.toLocaleString()}`;
  const periodLabel = annual ? "/year" : "/month";
  const subLabel = annual ? `KES ${yearlyMonthlyEquivalent}/mo, billed yearly` : "Cancel anytime";

  const handleUpgrade = async () => {
    if (!user) return;
    if (paymentMethods.length === 0) {
      toast({ title: "Add a payment method first", description: "Add M-Pesa or a card to complete your upgrade." });
      openSettings("payment");
      return;
    }
    const { error } = await updateProfile({ subscription_plan: 'premium' });
    if (error) {
      toast({ title: "Upgrade failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    toast({
      title: "Welcome to Premium",
      description: annual ? `You're billed KES ${yearly.toLocaleString()}/year.` : `You're billed KES ${monthly.toLocaleString()}/month.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Profile" showSearch={false} showNotifications />

      <div className="px-4 pt-6 space-y-8">
        {/* ── IDENTITY — canvas ── */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-muted text-foreground text-lg font-semibold">
              {profile?.full_name ? getInitials(profile.full_name) : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold truncate">{profile?.full_name || user?.email?.split('@')[0] || 'Guest'}</h2>
              {isPremium && <Badge className="h-4 px-1.5 text-[9px] brand-active border-0"><Crown className="h-2.5 w-2.5 mr-0.5" />Premium</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="mt-1.5 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              data-small-target
            >
              Edit profile
            </button>
          </div>
        </div>

        <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
        <ProfileSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          initialSection={settingsSection}
          currentHandle={profile?.handle}
          portfolioPublic={portfolioPublic}
          onSaved={refetchProfile}
        />

        {/* ── SUBSCRIPTION — short, editorial, one clear CTA ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-eyebrow">Subscription</p>
            <div className="inline-flex items-center rounded-full bg-muted p-0.5">
              <button
                data-small-target
                onClick={() => setAnnual(false)}
                className={`text-[10px] font-semibold rounded-full px-2.5 py-1 transition-colors ${!annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >Monthly</button>
              <button
                data-small-target
                onClick={() => setAnnual(true)}
                className={`text-[10px] font-semibold rounded-full px-2.5 py-1 transition-colors ${annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >Yearly · save {savingsPct}%</button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-border/60">
              {/* Free */}
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Free</p>
                <p className="mt-1 text-lg font-semibold tabular">KES 0</p>
                <p className="text-[10px] text-muted-foreground">Forever</p>
                <ul className="mt-3 space-y-1.5">
                  {FREE.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Premium */}
              <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-foreground font-semibold">Premium</p>
                  <Sparkles className="h-3 w-3 text-foreground" />
                </div>
                <p className="mt-1 text-lg font-semibold tabular">{priceLabel}<span className="text-[10px] text-muted-foreground font-normal">{periodLabel}</span></p>
                <p className="text-[10px] text-muted-foreground">{subLabel}</p>
                <ul className="mt-3 space-y-1.5">
                  {PREMIUM.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-foreground">
                      <Check className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!isPremium && (
              <div className="p-3 border-t border-border/60 bg-background">
                <Button className="btn-primary w-full h-10 text-sm" onClick={handleUpgrade}>Upgrade to Premium</Button>
              </div>
            )}
          </div>
        </section>

        {/* ── APPEARANCE ── */}
        <section>
          <p className="section-eyebrow mb-3">Appearance</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-[11px] text-muted-foreground">Light, Dark, or AMOLED for OLED screens</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="hairline-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Type className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Text size</p>
                  <p className="text-[11px] text-muted-foreground">Global scale</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[{ label: "S", val: "0.9" }, { label: "M", val: "1" }, { label: "L", val: "1.1" }, { label: "XL", val: "1.2" }].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setFontScale(opt.val)}
                    data-small-target
                    className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                      fontScale === opt.val ? "brand-active" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRIVACY ── */}
        <section>
          <p className="section-eyebrow mb-3">Privacy</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {portfolioPublic ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">Portfolio visibility</p>
                <p className="text-[11px] text-muted-foreground">{portfolioPublic ? "Public — visible on your profile" : "Private — only you"}</p>
              </div>
            </div>
            <Switch checked={portfolioPublic} onCheckedChange={async (checked) => {
              setPortfolioPublic(checked);
              await updateProfile({ portfolio_public: checked });
              toast({ title: checked ? "Portfolio public" : "Portfolio private" });
            }} />
          </div>
        </section>

        {/* ── SETTINGS ── */}
        <section>
          <p className="section-eyebrow mb-2">Settings</p>
          <div>
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between py-3 border-b border-border/50 last:border-0 group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </section>

        <Button variant="ghost" className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>

        <p className="text-center text-[10px] text-muted-foreground pb-4">Continua · v1.0</p>
      </div>
    </div>
  );
}