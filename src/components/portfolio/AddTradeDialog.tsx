import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddTradeDialogProps {
  children?: React.ReactNode;
}

export function AddTradeDialog({ children }: AddTradeDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addHolding } = usePortfolio();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addHolding({
        symbol: symbol.toUpperCase(),
        name,
        shares: parseInt(shares),
        avg_cost: parseFloat(avgCost),
        sector: sector || null,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.code === '23505' ? 'Stock already in portfolio' : 'Failed to add trade',
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Trade added to portfolio",
        });
        setOpen(false);
        // Reset form
        setSymbol('');
        setName('');
        setShares('');
        setAvgCost('');
        setSector('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const popularStocks = [
    { symbol: 'SAFCOM', name: 'Safaricom PLC', sector: 'Telecommunications' },
    { symbol: 'EQTY', name: 'Equity Group Holdings', sector: 'Banking' },
    { symbol: 'KCB', name: 'KCB Group PLC', sector: 'Banking' },
    { symbol: 'COOP', name: 'Co-operative Bank', sector: 'Banking' },
    { symbol: 'SCBK', name: 'Standard Chartered Bank', sector: 'Banking' },
  ];

  const handleStockSelect = (selectedSymbol: string) => {
    const stock = popularStocks.find(s => s.symbol === selectedSymbol);
    if (stock) {
      setSymbol(stock.symbol);
      setName(stock.name);
      setSector(stock.sector);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-select">Quick Select (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {popularStocks.map((stock) => (
                <Button
                  key={stock.symbol}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockSelect(stock.symbol)}
                  className="text-xs"
                >
                  {stock.symbol}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol *</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., SAFCOM"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shares">Shares *</Label>
              <Input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="100"
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Safaricom PLC"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgCost">Average Cost (KES) *</Label>
              <Input
                id="avgCost"
                type="number"
                step="0.01"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="12.50"
                min="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g., Banking"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}