import { useState, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";

const STOCK_DATA: Record<string, { name: string; price: number; sector: string }> = {
  SAFCOM: { name: "Safaricom PLC", price: 12.85, sector: "Telecommunications" },
  EQTY: { name: "Equity Group Holdings", price: 62.50, sector: "Banking" },
  KCB: { name: "KCB Group PLC", price: 45.30, sector: "Banking" },
  COOP: { name: "Co-operative Bank", price: 15.20, sector: "Banking" },
  SCBK: { name: "Standard Chartered", price: 185.00, sector: "Banking" },
  EABL: { name: "EA Breweries Ltd", price: 142.00, sector: "Manufacturing" },
  ABSA: { name: "ABSA Bank Kenya", price: 13.85, sector: "Banking" },
  NCBA: { name: "NCBA Group PLC", price: 42.50, sector: "Banking" },
  BRIT: { name: "Britam Holdings", price: 6.85, sector: "Insurance" },
  KPLC: { name: "Kenya Power", price: 1.95, sector: "Energy" },
  BAMB: { name: "Bamburi Cement", price: 89.75, sector: "Construction" },
};

interface TradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol?: string;
  onTradeAdded: (symbol: string, name: string, shares: number, avgCost: number, sector?: string) => Promise<any>;
}

type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit";
type InputMode = "shares" | "amount";

export function TradeSheet({ open, onOpenChange, symbol: initialSymbol, onTradeAdded }: TradeSheetProps) {
  const { toast } = useToast();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [inputMode, setInputMode] = useState<InputMode>("shares");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [symbolInput, setSymbolInput] = useState(initialSymbol || "");
  const [step, setStep] = useState<"order" | "review" | "success">("order");

  const stock = STOCK_DATA[symbolInput.toUpperCase()];
  const price = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : (stock?.price || 0);

  const estimatedValue = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    if (inputMode === "shares") return qty * price;
    return qty;
  }, [quantity, price, inputMode]);

  const estimatedShares = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    if (inputMode === "shares") return qty;
    return price > 0 ? qty / price : 0;
  }, [quantity, price, inputMode]);

  const handleReview = () => {
    if (!stock || !quantity || parseFloat(quantity) <= 0) {
      toast({ title: "Invalid order", description: "Enter a valid stock and quantity", variant: "destructive" });
      return;
    }
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    const result = await onTradeAdded(
      symbolInput.toUpperCase(),
      stock.name,
      Math.floor(estimatedShares),
      price,
      stock.sector
    );
    if (result?.error) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
      return;
    }
    setStep("success");
  };

  const handleClose = () => {
    setStep("order");
    setQuantity("");
    setLimitPrice("");
    if (!initialSymbol) setSymbolInput("");
    onOpenChange(false);
  };

  // Reset when symbol changes
  if (initialSymbol && initialSymbol !== symbolInput && open) {
    setSymbolInput(initialSymbol);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-[hsl(220,15%,10%)] text-white border-white/10 p-0">
        {step === "success" ? (
          <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[hsl(152,60%,45%)]/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-[hsl(152,60%,45%)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">Order Placed!</h2>
            <p className="text-white/50 text-sm text-center mb-2">
              {side === "buy" ? "Bought" : "Sold"} {Math.floor(estimatedShares)} shares of {symbolInput.toUpperCase()}
            </p>
            <p className="text-lg font-bold text-[hsl(152,60%,45%)] mb-8">KES {estimatedValue.toFixed(2)}</p>
            <Button className="w-full h-12 rounded-2xl bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)] font-semibold" onClick={handleClose}>
              View in Portfolio
            </Button>
          </div>
        ) : step === "review" ? (
          <div className="flex flex-col h-full px-6 py-8 animate-fade-in">
            <h2 className="text-xl font-bold mb-6">Review Order</h2>
            <div className="bg-white/5 rounded-2xl p-4 space-y-3 mb-6 border border-white/5">
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Stock</span>
                <span className="font-semibold">{symbolInput.toUpperCase()} · {stock?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Side</span>
                <Badge className={side === "buy" ? "bg-[hsl(152,60%,45%)]/20 text-[hsl(152,60%,45%)]" : "bg-[hsl(0,70%,55%)]/20 text-[hsl(0,70%,55%)]"}>
                  {side.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Shares</span>
                <span className="font-semibold">{Math.floor(estimatedShares)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Price</span>
                <span className="font-semibold">KES {price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Fees</span>
                <span className="text-[hsl(152,60%,45%)] font-semibold">KES 0.00</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white/80 font-semibold">Estimated Total</span>
                <span className="text-lg font-bold">KES {estimatedValue.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-auto space-y-3">
              <Button
                className="w-full h-14 rounded-2xl bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)] font-bold text-base"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
              <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/5" onClick={() => setStep("order")}>
                Back to Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full px-6 py-6">
            {/* Buy/Sell Toggle */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
              <button
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  side === "buy" ? "bg-[hsl(152,60%,45%)] text-black" : "text-white/50"
                }`}
                onClick={() => setSide("buy")}
              >
                Buy
              </button>
              <button
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  side === "sell" ? "bg-[hsl(0,70%,55%)] text-white" : "text-white/50"
                }`}
                onClick={() => setSide("sell")}
              >
                Sell
              </button>
            </div>

            {/* Stock Selection */}
            {!initialSymbol && (
              <div className="mb-4">
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Stock Symbol</label>
                <Input
                  value={symbolInput}
                  onChange={e => setSymbolInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SAFCOM"
                  className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-base placeholder:text-white/20 focus-visible:ring-[hsl(152,60%,45%)]"
                />
              </div>
            )}

            {stock && (
              <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold">{symbolInput.toUpperCase()}</p>
                  <p className="text-xs text-white/40">{stock.name}</p>
                </div>
                <p className="text-lg font-bold">KES {stock.price.toFixed(2)}</p>
              </div>
            )}

            {/* Order Type */}
            <div className="flex gap-2 mb-4">
              {(["market", "limit"] as OrderType[]).map(t => (
                <button
                  key={t}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    orderType === t ? "bg-white/10 text-white" : "text-white/40"
                  }`}
                  onClick={() => setOrderType(t)}
                >
                  {t === "market" ? "Market" : "Limit"}
                </button>
              ))}
            </div>

            {orderType === "limit" && (
              <div className="mb-4">
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Limit Price (KES)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-base placeholder:text-white/20 focus-visible:ring-[hsl(152,60%,45%)]"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-white/40 font-medium">
                  {inputMode === "shares" ? "Number of Shares" : "Amount (KES)"}
                </label>
                <button className="text-[10px] text-[hsl(152,60%,45%)] font-semibold" onClick={() => setInputMode(inputMode === "shares" ? "amount" : "shares")}>
                  Switch to {inputMode === "shares" ? "KES" : "Shares"}
                </button>
              </div>
              <Input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder={inputMode === "shares" ? "0" : "0.00"}
                className="h-14 bg-white/5 border-white/10 text-white rounded-xl text-2xl font-bold text-center placeholder:text-white/20 focus-visible:ring-[hsl(152,60%,45%)]"
              />
            </div>

            {/* Live Preview */}
            {parseFloat(quantity) > 0 && stock && (
              <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5 space-y-1.5 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Est. {inputMode === "shares" ? "Cost" : "Shares"}</span>
                  <span className="font-semibold">
                    {inputMode === "shares" ? `KES ${estimatedValue.toFixed(2)}` : `${Math.floor(estimatedShares)} shares`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Fees</span>
                  <span className="text-[hsl(152,60%,45%)] font-semibold">KES 0.00</span>
                </div>
              </div>
            )}

            {/* Review Button */}
            <div className="mt-auto">
              <Button
                className={`w-full h-14 rounded-2xl font-bold text-base transition-all ${
                  side === "buy"
                    ? "bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)]"
                    : "bg-[hsl(0,70%,55%)] text-white hover:bg-[hsl(0,70%,60%)]"
                }`}
                onClick={handleReview}
                disabled={!stock || !quantity || parseFloat(quantity) <= 0}
              >
                Review Order <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
