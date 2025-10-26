import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Minus, Plus } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useToast } from '@/hooks/use-toast';

interface BuySharesDialogProps {
  symbol: string;
  name: string;
  price: number;
  children?: React.ReactNode;
}

export function BuySharesDialog({ symbol, name, price, children }: BuySharesDialogProps) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [loading, setLoading] = useState(false);
  
  const { addHolding, updateHolding, holdings } = usePortfolio();
  const { toast } = useToast();
  
  const availableBalance = 50000.00;
  const totalCost = shares * price;

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Check if stock already exists in portfolio
      const existingHolding = holdings.find(h => h.symbol === symbol);
      
      if (existingHolding) {
        // Update existing holding
        const newTotalShares = existingHolding.shares + shares;
        const newAvgCost = ((existingHolding.avg_cost * existingHolding.shares) + (price * shares)) / newTotalShares;
        
        const result = await updateHolding(existingHolding.id, {
          shares: newTotalShares,
          avg_cost: newAvgCost,
        });
        
        if (result?.error) {
          toast({
            title: "Error",
            description: "Failed to update holding",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Added ${shares} more shares to ${symbol}`,
          });
          setOpen(false);
          setShares(1);
        }
      } else {
        // Add new holding
        const result = await addHolding({
          symbol,
          name,
          shares,
          avg_cost: price,
          sector: null,
        });
        
        if (result?.error) {
          toast({
            title: "Error",
            description: "Failed to buy shares",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Bought ${shares} shares of ${symbol}`,
          });
          setOpen(false);
          setShares(1);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90">
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">Buy {symbol}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Stock Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
            <span className="text-muted-foreground">{name}</span>
            <span className="font-bold text-lg">KES {price.toFixed(2)}</span>
          </div>
          
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-primary hover:bg-primary/90 h-11">
              Buy
            </Button>
            <Button variant="outline" disabled className="h-11 opacity-50">
              Sell (No shares)
            </Button>
          </div>
          
          {/* Order Type */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Order Type</div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={orderType === 'market' ? 'default' : 'outline'}
                onClick={() => setOrderType('market')}
                className={orderType === 'market' ? 'bg-primary hover:bg-primary/90' : ''}
              >
                Market Order
              </Button>
              <Button
                variant={orderType === 'limit' ? 'default' : 'outline'}
                onClick={() => setOrderType('limit')}
                className={orderType === 'limit' ? 'bg-primary hover:bg-primary/90' : ''}
              >
                Limit Order
              </Button>
            </div>
          </div>
          
          {/* Number of Shares */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Number of Shares</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShares(Math.max(1, shares - 1))}
                className="h-12 w-12"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center text-xl font-bold h-12 bg-muted/20"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShares(shares + 1)}
                className="h-12 w-12"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Available balance: KES {availableBalance.toLocaleString()}
            </div>
          </div>
          
          {/* Total Cost */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="text-3xl font-bold text-primary">
                KES {totalCost.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Buy Now Button */}
          <Button 
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
            onClick={handleBuyNow}
            disabled={loading || totalCost > availableBalance}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            {loading ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
