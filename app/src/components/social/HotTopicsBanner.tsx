import { useNavigate } from "react-router-dom";
import { Flame, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const hotTopics = [
  { id: "1", tag: "#NSEMarkets", posts: 234, isHot: true },
  { id: "2", tag: "#SCOM", posts: 189, isHot: true },
  { id: "3", tag: "#BankingStocks", posts: 156, isHot: false },
  { id: "4", tag: "#DividendInvesting", posts: 134, isHot: false },
  { id: "5", tag: "#KenyaEconomy", posts: 98, isHot: false },
  { id: "6", tag: "#MarketAnalysis", posts: 87, isHot: true },
];

export function HotTopicsBanner() {
  const navigate = useNavigate();

  const handleTopicClick = (tag: string) => {
    navigate(`/traders-hub?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-y border-border">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-1 shrink-0">
          <Flame className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-accent">Hot</span>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex gap-2 pb-1">
            {hotTopics.map((topic) => (
              <Badge
                key={topic.id}
                variant="secondary"
                className="shrink-0 cursor-pointer hover:bg-primary/20 transition-colors text-xs px-2 py-1"
                onClick={() => handleTopicClick(topic.tag)}
              >
                {topic.isHot && <TrendingUp className="h-3 w-3 mr-1 text-accent" />}
                {topic.tag}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
}