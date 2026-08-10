import { DollarSign, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("KES");
  const [toCurrency, setToCurrency] = useState("USD");

  const rates = {
    "USD/KES": 129.5,
    "GBP/KES": 164.2,
    "EUR/KES": 138.7
  };

  const convertAmount = () => {
    const value = parseFloat(amount);
    if (fromCurrency === "KES" && toCurrency === "USD") {
      return (value / rates["USD/KES"]).toFixed(2);
    }
    if (fromCurrency === "USD" && toCurrency === "KES") {
      return (value * rates["USD/KES"]).toFixed(2);
    }
    return value.toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg font-semibold">FX Rates</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live rates display */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded bg-muted/20">
            <div className="text-muted-foreground">USD/KES</div>
            <div className="font-medium text-accent">129.50</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/20">
            <div className="text-muted-foreground">GBP/KES</div>
            <div className="font-medium text-accent">164.20</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/20">
            <div className="text-muted-foreground">EUR/KES</div>
            <div className="font-medium text-accent">138.70</div>
          </div>
        </div>

        {/* Quick converter */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={swapCurrencies}
              className="h-10 w-10 p-0"
            >
              <Repeat className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="text-center p-2 bg-primary/10 rounded border">
                <span className="font-medium text-primary">
                  {convertAmount()} {toCurrency}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 text-xs">
            <span className="text-muted-foreground">{fromCurrency}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">{toCurrency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}