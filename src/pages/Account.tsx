import { User, Settings, CreditCard, BookOpen, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Account() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary">Account</h1>
          <p className="text-sm text-muted-foreground">Manage your profile & settings</p>
        </div>
      </header>

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
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-lg">Investor</div>
                <div className="text-sm text-muted-foreground">Free Plan</div>
                <Button size="sm" className="mt-2 btn-accent">
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-accent" />
              <span>Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-medium text-primary mb-2">Premium - KES 1,000/month</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Live price updates</li>
                <li>• Unlimited watchlists</li>
                <li>• Advanced charts</li>
                <li>• Data export</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h3 className="font-medium text-accent mb-2">Premium+ - KES 1,500/month</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All Premium features</li>
                <li>• AI earnings summaries</li>
                <li>• Multi-chart comparison</li>
                <li>• Priority support</li>
              </ul>
            </div>
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

        {/* Learning Hub */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <span>Learning Hub</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border-2 border-dashed border-accent/30 rounded-lg">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expand Your Knowledge</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access courses, tutorials, and investment guides
              </p>
              <Button className="btn-accent">
                Start Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}