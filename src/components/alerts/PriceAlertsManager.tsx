import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PriceAlertsManagerProps {
  initialSymbol?: string;
}

export function PriceAlertsManager({ initialSymbol }: PriceAlertsManagerProps = {}) {
  const { alerts, loading, createAlert, deleteAlert, toggleAlert } = usePriceAlerts();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState(initialSymbol || '');
  const [alertType, setAlertType] = useState<'price_above' | 'price_below'>('price_above');
  const [targetValue, setTargetValue] = useState('');

  const handleCreateAlert = async () => {
    if (!symbol || !targetValue) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const result = await createAlert({
      symbol: symbol.toUpperCase(),
      alert_type: alertType,
      target_value: parseFloat(targetValue),
      is_active: true,
    });

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Alert created",
        description: `You'll be notified when ${symbol} ${alertType === 'price_above' ? 'rises above' : 'falls below'} KSh ${targetValue}`,
      });
      setOpen(false);
      setSymbol('');
      setTargetValue('');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const result = await deleteAlert(id);
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Alert deleted",
        description: "Price alert has been removed",
      });
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    await toggleAlert(id, !isActive);
  };

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Price Alerts
        </h3>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., SCOM"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </div>
              
              <div>
                <Label htmlFor="alertType">Alert Type</Label>
                <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                  <SelectTrigger id="alertType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_above">Price Above</SelectItem>
                    <SelectItem value="price_below">Price Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="targetValue">Target Price (KSh)</Label>
                <Input
                  id="targetValue"
                  type="number"
                  placeholder="0.00"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
              
              <Button onClick={handleCreateAlert} className="w-full">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No price alerts set</p>
          <p className="text-sm mt-2">Create alerts to get notified when stocks hit your target prices</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{alert.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {alert.alert_type === 'price_above' ? 'Above' : 'Below'} KSh {alert.target_value}
                    </span>
                    {alert.triggered_at && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                        Triggered
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => handleToggleAlert(alert.id, alert.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}