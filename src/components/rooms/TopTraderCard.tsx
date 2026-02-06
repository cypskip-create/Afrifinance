import { Verified, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopTrader {
  name: string;
  handle: string;
  followers: string;
  winRate: string;
  verified: boolean;
}

interface TopTraderCardProps {
  trader: TopTrader;
  onFollow: () => void;
}

export function TopTraderCard({ trader, onFollow }: TopTraderCardProps) {
  return (
    <Card className="w-[150px] shrink-0 card-gradient overflow-hidden">
      <CardContent className="p-3 text-center">
        <Avatar className="h-12 w-12 mx-auto mb-2 ring-2 ring-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 font-bold">
            {trader.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <h4 className="font-semibold text-sm">{trader.name}</h4>
          {trader.verified && (
            <Verified className="h-3 w-3 text-primary fill-primary" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">{trader.handle}</p>
        
        <div className="flex items-center justify-center gap-2 text-xs mb-3">
          <span className="text-muted-foreground">{trader.followers}</span>
          <span className="text-green-500 font-medium">{trader.winRate}</span>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full h-7 text-xs"
          onClick={onFollow}
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Follow
        </Button>
      </CardContent>
    </Card>
  );
}
