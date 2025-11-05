import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Sparkles } from "lucide-react";

interface AIAssistantProps {
  symbol?: string;
}

export function AIAssistant({ symbol }: AIAssistantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [prompt, setPrompt] = useState('');

  const getAnalysis = async (type: 'recommendation' | 'sentiment') => {
    if (!symbol && type !== 'sentiment') return;
    
    setLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-stock-analysis', {
        body: { 
          symbol: symbol || 'NSE',
          analysisType: type 
        }
      });

      if (error) throw error;

      setResponse(data);
      toast({
        title: "Analysis complete",
        description: "AI has generated insights for you",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">AI Stock Assistant</h3>
        <Sparkles className="w-4 h-4 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {symbol && (
          <div className="flex gap-2">
            <Button
              onClick={() => getAnalysis('recommendation')}
              disabled={loading}
              className="flex-1"
              variant="outline"
            >
              Get Recommendation
            </Button>
            <Button
              onClick={() => getAnalysis('sentiment')}
              disabled={loading}
              className="flex-1"
              variant="outline"
            >
              Sentiment Analysis
            </Button>
          </div>
        )}

        {response && (
          <div className="p-4 bg-accent/50 rounded-lg space-y-2">
            {response.recommendation && (
              <div>
                <span className="font-semibold">Recommendation: </span>
                <span className={`uppercase font-bold ${
                  response.recommendation === 'buy' ? 'text-green-500' :
                  response.recommendation === 'sell' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {response.recommendation}
                </span>
              </div>
            )}
            
            {response.confidence && (
              <div>
                <span className="font-semibold">Confidence: </span>
                <span className="text-primary">{response.confidence}%</span>
              </div>
            )}

            {response.sentiment && (
              <div>
                <span className="font-semibold">Sentiment: </span>
                <span className={`capitalize ${
                  response.sentiment === 'positive' ? 'text-green-500' :
                  response.sentiment === 'negative' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {response.sentiment}
                </span>
              </div>
            )}

            {response.reasoning && (
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold mb-1">Analysis:</p>
                <p className="text-sm text-muted-foreground">{response.reasoning}</p>
              </div>
            )}

            {response.summary && (
              <div className="pt-2 border-t">
                <p className="text-sm">{response.summary}</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Ask the AI anything about {symbol || 'the market'}:</p>
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., What's the outlook for this stock?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px]"
            />
            <Button size="icon" disabled>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Lovable AI • {symbol ? `Analyzing ${symbol}` : 'Market insights'}
          </p>
        </div>
      </div>
    </Card>
  );
}