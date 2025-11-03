import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StockLinkProps {
  symbol: string;
  children?: React.ReactNode;
  className?: string;
}

export function StockLink({ symbol, children, className }: StockLinkProps) {
  const navigate = useNavigate();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/stock/${symbol}`);
      }}
      className={cn(
        "cursor-pointer hover:text-primary hover:underline transition-colors font-medium",
        className
      )}
    >
      {children || symbol}
    </span>
  );
}
