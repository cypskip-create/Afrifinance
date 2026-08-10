import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react";

export interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface WidgetManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: WidgetConfig[];
  onSave: (widgets: WidgetConfig[]) => void;
}

const defaultWidgets: WidgetConfig[] = [
  { id: "morning-brief", name: "Morning Brief", enabled: true, order: 0 },
  { id: "nse-indices", name: "NSE Indices", enabled: true, order: 1 },
  { id: "fear-greed", name: "Fear & Greed Index", enabled: true, order: 2 },
  { id: "quick-trade", name: "Quick Trade", enabled: true, order: 3 },
  { id: "watchlist", name: "Live Watchlist", enabled: true, order: 4 },
  { id: "trending", name: "Trending Stocks", enabled: true, order: 5 },
  { id: "movers", name: "Top Movers & Losers", enabled: true, order: 6 },
  { id: "currency", name: "Currency Converter", enabled: true, order: 7 },
  { id: "heatmap", name: "Market Pulse", enabled: true, order: 8 },
  { id: "calendar", name: "Economic Calendar", enabled: true, order: 9 },
];

export function WidgetManager({ open, onOpenChange, widgets, onSave }: WidgetManagerProps) {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const toggleWidget = (id: string) => {
    setLocalWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newWidgets = [...localWidgets];
    const draggedWidget = newWidgets[draggedItem];
    newWidgets.splice(draggedItem, 1);
    newWidgets.splice(index, 0, draggedWidget);
    
    // Update order values
    newWidgets.forEach((w, i) => w.order = i);
    
    setLocalWidgets(newWidgets);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleReset = () => {
    setLocalWidgets(defaultWidgets);
  };

  const handleSave = () => {
    onSave(localWidgets);
    onOpenChange(false);
  };

  const enabledCount = localWidgets.filter(w => w.enabled).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize Widgets</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-muted-foreground mb-4">
          Toggle widgets on/off and drag to reorder. {enabledCount} of {localWidgets.length} enabled.
        </p>

        <div className="space-y-2">
          {localWidgets.map((widget, index) => (
            <div
              key={widget.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                widget.enabled ? 'bg-muted/20 border-border' : 'bg-muted/5 border-border/50 opacity-60'
              } ${draggedItem === index ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <div className="flex items-center gap-2">
                  {widget.enabled ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{widget.name}</span>
                </div>
              </div>
              <Switch 
                checked={widget.enabled}
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1 btn-primary" onClick={handleSave}>
            Save Layout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { defaultWidgets };