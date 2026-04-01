import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/hooks/usePortfolio";

interface TradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  stockName: string;
  currentPrice: number;
  isUp: boolean;
  changePercent: string;
}

type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit";
type InputMode = "shares" | "amount";
type Step = "order" | "review" | "success";

export function TradeSheet({ open, onOpenChange, symbol, stockName, currentPrice, isUp, changePercent }: TradeSheetProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [inputMode, setInputMode] = useState<InputMode>("shares");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState(currentPrice.toFixed(2));
  const [step, setStep] = useState<Step>("order");
  const { toast } = useToast();
  const { addToPortfolio } = usePortfolio();

  const effectivePrice = orderType === "limit" ? parseFloat(limitPrice) || currentPrice : currentPrice;
  const shares = inputMode === "shares" ? parseFloat(quantity) || 0 : (parseFloat(quantity) || 0) / effectivePrice;
  const estimatedCost = shares * effectivePrice;
  const fee = 0;

  const resetForm = () => {
    setQuantity("");
    setStep("order");
    setSide("buy");
    setOrderType("market");
    setInputMode("shares");
    setLimitPrice(currentPrice.toFixed(2));
  };

  const handleReview = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    if (side === "buy") {
      await addToPortfolio(symbol, stockName, Math.round(shares), effectivePrice);
    }
    setStep("success");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl p-0 border-0">
        {step === "order" && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <p className="font-bold text-base">{symbol}</p>
                <p className="text-xs text-muted-foreground">{stockName}</p>
              </div>
              <div className="w-9" />
            </div>

            {/* Buy / Sell Toggle */}
            <div className="flex p-4 gap-2">
              <Button
                className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${
                  side === "buy" ? "bg-bull text-white shadow-lg" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setSide("buy")}
              >
                Buy
              </Button>
              <Button
                className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${
                  side === "sell" ? "bg-bear text-white shadow-lg" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setSide("sell")}
              >
                Sell
              </Button>
            </div>

            {/* Live Price */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">KES {currentPrice.toFixed(2)}</span>
                <span className={`text-sm font-semibold flex items-center gap-0.5 ${isUp ? 'text-bull' : 'text-bear'}`}>
                  {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {changePercent}%
                </span>
              </div>
            </div>

            {/* Order Type */}
            <div className="px-4 pb-3 flex gap-2">
              {(["market", "limit"] as OrderType[]).map(t => (
                <Button
                  key={t}
                  variant={orderType === t ? "default" : "outline"}
                  size="sm"
                  className="h-9 rounded-full text-xs font-semibold capitalize flex-1"
                  onClick={() => setOrderType(t)}
                >
                  {t} Order
                </Button>
              ))}
            </div>

            {/* Limit Price */}
            {orderType === "limit" && (
              <div className="px-4 pb-3">
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Limit Price (KES)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="h-11 text-lg font-bold rounded-xl"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="px-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-medium">
                  {inputMode === "shares" ? "Number of Shares" : "Amount (KES)"}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary rounded-full"
                  onClick={() => setInputMode(m => m === "shares" ? "amount" : "shares")}
                >
                  Switch to {inputMode === "shares" ? "KES" : "Shares"}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <Input
                type="number"
                placeholder={inputMode === "shares" ? "0" : "0.00"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-14 text-3xl font-bold text-center rounded-2xl border-2 border-border focus:border-primary"
              />

              {/* Preview */}
              <div className="mt-4 space-y-2.5 bg-muted/30 rounded-2xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. {inputMode === "shares" ? "Shares" : "Shares"}</span>
                  <span className="font-semibold">{shares > 0 ? shares.toFixed(2) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Cost</span>
                  <span className="font-semibold">KES {estimatedCost > 0 ? estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="font-semibold text-bull">KES 0.00</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Buying Power</span>
                  <span className="font-semibold">KES 500,000</span>
                </div>
              </div>
            </div>

            {/* Review Button */}
            <div className="p-4">
              <Button
                onClick={handleReview}
                className={`w-full h-13 rounded-2xl text-base font-bold shadow-lg transition-all ${
                  side === "buy" ? "bg-bull hover:bg-bull/90 text-white" : "bg-bear hover:bg-bear/90 text-white"
                }`}
                style={{ height: 52 }}
              >
                Review {side === "buy" ? "Buy" : "Sell"} Order
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => setStep("order")} className="h-9 w-9 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <p className="font-bold text-base">Review Order</p>
              <div className="w-9" />
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-1">{side === "buy" ? "Buying" : "Selling"}</p>
                <p className="text-3xl font-bold">{shares.toFixed(2)} shares</p>
                <p className="text-lg text-muted-foreground mt-1">{symbol} · {stockName}</p>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                {[
                  { label: "Order Type", value: orderType === "market" ? "Market Order" : `Limit @ KES ${limitPrice}` },
                  { label: "Price per Share", value: `KES ${effectivePrice.toFixed(2)}` },
                  { label: "Shares", value: shares.toFixed(2) },
                  { label: "Estimated Total", value: `KES ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                  { label: "Fees", value: "KES 0.00" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <Button
                onClick={handlePlaceOrder}
                className={`w-full rounded-2xl text-base font-bold shadow-lg ${
                  side === "buy" ? "bg-bull hover:bg-bull/90 text-white" : "bg-bear hover:bg-bear/90 text-white"
                }`}
                style={{ height: 52 }}
              >
                Place {side === "buy" ? "Buy" : "Sell"} Order
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-bull/10 flex items-center justify-center mb-6 animate-scale-in">
              <Check className="h-10 w-10 text-bull" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order {side === "buy" ? "Placed" : "Placed"}!</h2>
            <p className="text-muted-foreground mb-1">
              {side === "buy" ? "Bought" : "Sold"} {shares.toFixed(2)} shares of {symbol}
            </p>
            <p className="text-lg font-bold mb-8">
              KES {estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="w-full space-y-3">
              <Button className="w-full h-12 rounded-2xl font-bold" onClick={handleClose}>
                View in Portfolio
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
