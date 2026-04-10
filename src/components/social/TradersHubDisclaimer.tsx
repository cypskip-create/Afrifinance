import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface Props {
  userId: string | undefined;
  onAccept: () => void;
}

export function TradersHubDisclaimer({ userId, onAccept }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const key = `tradershub_disclaimer_${userId}`;
    if (!localStorage.getItem(key)) {
      setShow(true);
    }
  }, [userId]);

  const handleAccept = () => {
    if (userId) {
      localStorage.setItem(`tradershub_disclaimer_${userId}`, "true");
    }
    setShow(false);
    onAccept();
  };

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm rounded-3xl p-0 gap-0 [&>button]:hidden">
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold">Before You Dive In</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No post you see here is financial advice. These are just people's personal insights and opinions. Always do your own research before making any investment decisions.
          </p>
          <Button
            className="w-full h-12 rounded-full font-bold text-base"
            onClick={handleAccept}
          >
            I Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
