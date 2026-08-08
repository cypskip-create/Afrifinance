import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Newspaper, Bell, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RouteSeo } from "@/components/shared/RouteSeo";
import { Logo } from "@/components/shared/Logo";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <RouteSeo />
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Track Kenya's Markets
          <span className="text-primary block mt-2">Stay Informed. Invest Smart.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track NSE stocks, stay updated with market news, and make informed investment decisions with real-time market data.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="h-14 px-8 text-lg" onClick={() => navigate("/auth")}>
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => navigate("/markets")}>
            Explore Markets
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need to Track Markets
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
              <p className="text-muted-foreground">
                Live stock prices, charts, and market movements from the Nairobi Securities Exchange.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market News</h3>
              <p className="text-muted-foreground">
                Stay updated with the latest market news, earnings reports, and economic developments.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Price Alerts</h3>
              <p className="text-muted-foreground">
                Set custom alerts for price changes and never miss important market movements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
              <p className="text-muted-foreground">
                Access detailed stock analysis, sector insights, and market trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">60+</div>
            <div className="text-muted-foreground">Listed Companies</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">Real-Time</div>
            <div className="text-muted-foreground">Market Updates</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">News & Analysis</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Why Choose StockTracker?
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Comprehensive Data</h3>
                  <p className="text-muted-foreground">
                    Access complete market data, stock fundamentals, and historical trends.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Latest News</h3>
                  <p className="text-muted-foreground">
                    Stay informed with breaking news and market analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Smart Alerts</h3>
                  <p className="text-muted-foreground">
                    Never miss a market move with customizable price alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border-2 border-primary/20">
            <div className="text-center">
              <TrendingUp className="h-24 w-24 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Start Tracking Today</h3>
              <p className="text-muted-foreground mb-6">
                Join StockTracker today and get access to comprehensive market data and news.
              </p>
              <Button size="lg" className="w-full h-12" onClick={() => navigate("/auth")}>
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary text-primary-foreground rounded-lg p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Track the Markets?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of investors staying informed with StockTracker
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" onClick={() => navigate("/auth")}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo size="sm" />
            <div className="text-sm text-muted-foreground mt-4 md:mt-0">
              © 2025 AfriFinance. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
