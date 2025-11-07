import { Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTimeBasedGreeting } from "@/utils/timeGreeting";

interface MorningBriefProps {
  userName?: string | null;
}

export function MorningBrief({ userName }: MorningBriefProps) {
  const { period } = getTimeBasedGreeting();
  const today = new Date().toLocaleDateString('en-KE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const firstName = userName ? userName.split(' ')[0] : 'Investor';

  return (
    <Card className="card-gradient border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-primary">
            Good {period} {firstName}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {today}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-5 w-5 text-bull mt-0.5" />
          <div>
            <p className="text-sm font-medium">NSE up 1.2% as banking sector rallies</p>
            <p className="text-xs text-muted-foreground">
              Equity Bank leads gains on strong Q3 earnings beat, KES steady at 129.5 vs USD
            </p>
          </div>
        </div>
        
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
          <p className="text-sm">
            <span className="font-medium text-primary">Key Focus:</span>{" "}
            <span 
              className="underline hover:text-primary cursor-pointer"
              onClick={() => window.location.href = '/news'}
            >
              EABL earnings call at 2:00 PM EAT
            </span>
            , inflation data due Thursday
          </p>
        </div>
      </CardContent>
    </Card>
  );
}