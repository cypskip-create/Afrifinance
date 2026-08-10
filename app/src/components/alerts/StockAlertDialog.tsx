import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, Pencil, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { usePriceAlerts, PriceAlert } from "@/hooks/usePriceAlerts";
import { useToast } from "@/hooks/use-toast";

interface StockAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  currentPrice: number;
}

type Draft = { alert_type: "price_above" | "price_below"; target_value: string };

const emptyDraft = (price: number): Draft => ({ alert_type: "price_above", target_value: price ? price.toFixed(2) : "" });

export function StockAlertDialog({ open, onOpenChange, symbol, currentPrice }: StockAlertDialogProps) {
  const { alerts, createAlert, updateAlert, deleteAlert, toggleAlert } = usePriceAlerts();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft(currentPrice));

  const symbolAlerts = useMemo(
    () => alerts.filter(a => a.symbol.toUpperCase() === symbol.toUpperCase()),
    [alerts, symbol]
  );

  const startCreate = () => { setEditingId(null); setDraft(emptyDraft(currentPrice)); setCreating(true); };
  const startEdit = (alert: PriceAlert) => {
    setCreating(false);
    setEditingId(alert.id);
    setDraft({ alert_type: alert.alert_type as any, target_value: String(alert.target_value ?? "") });
  };
  const cancel = () => { setCreating(false); setEditingId(null); };

  const save = async () => {
    const target = parseFloat(draft.target_value);
    if (!target || target <= 0) {
      toast({ title: "Enter a valid target price", variant: "destructive" });
      return;
    }
    if (editingId) {
      const { error } = await updateAlert(editingId, { alert_type: draft.alert_type, target_value: target });
      if (!error) toast({ title: "Alert updated" });
      else toast({ title: "Couldn't update alert", variant: "destructive" });
    } else {
      const { error } = await createAlert({ symbol: symbol.toUpperCase(), alert_type: draft.alert_type, target_value: target, is_active: true });
      if (!error) toast({ title: "Alert created", description: `We'll notify you when ${symbol} ${draft.alert_type === "price_above" ? "rises above" : "falls below"} KES ${target}` });
      else toast({ title: "Couldn't create alert", variant: "destructive" });
    }
    cancel();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteAlert(id);
    toast(error ? { title: "Couldn't delete alert", variant: "destructive" } : { title: "Alert deleted" });
  };

  const renderForm = () => (
    <div className="space-y-3 rounded-xl border border-border p-3 bg-muted/20">
      <div className="grid grid-cols-2 gap-2">
        <Select value={draft.alert_type} onValueChange={(v: any) => setDraft(d => ({ ...d, alert_type: v }))}>
          <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="price_above">Price above</SelectItem>
            <SelectItem value="price_below">Price below</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Target KES"
          value={draft.target_value}
          onChange={e => setDraft(d => ({ ...d, target_value: e.target.value }))}
          className="h-9 text-[13px]"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-8 text-[12.5px]" onClick={save}>
          <Check className="h-3.5 w-3.5 mr-1" />{editingId ? "Save changes" : "Create alert"}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-[12.5px]" onClick={cancel}>
          <X className="h-3.5 w-3.5 mr-1" />Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) cancel(); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <Bell className="h-4 w-4" /> {symbol} price alerts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {symbolAlerts.length === 0 && !creating && (
            <p className="text-[13px] text-muted-foreground py-2">
              No alerts set for {symbol} yet. Create one to get notified when it hits your target price.
            </p>
          )}

          {symbolAlerts.map(alert => (
            editingId === alert.id ? (
              <div key={alert.id}>{renderForm()}</div>
            ) : (
              <div key={alert.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {alert.alert_type === "price_above" ? <TrendingUp className="h-4 w-4 text-bull shrink-0" /> : <TrendingDown className="h-4 w-4 text-bear shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tabular-nums truncate">
                      {alert.alert_type === "price_above" ? "Above" : "Below"} KES {alert.target_value}
                    </p>
                    {alert.triggered_at && <p className="text-[10px] text-bull">Triggered</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={alert.is_active} onCheckedChange={() => toggleAlert(alert.id, !alert.is_active)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(alert)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(alert.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )
          ))}

          {creating && renderForm()}
        </div>

        {!creating && !editingId && (
          <Button variant="outline" className="w-full rounded-full mt-1" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {symbolAlerts.length > 0 ? `Add another ${symbol} alert` : `Create ${symbol} alert`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}