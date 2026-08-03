import logoImage from "@/assets/logo.jpeg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center space-x-2">
      <img
        src={logoImage}
        alt="AfriFinance — Kenyan stock market tracking and research app"
        className={`${sizeClasses[size]} rounded-xl object-cover shadow-sm`}
      />
      {showText && (
        <div>
          <span className={`${textSizeClasses[size]} font-bold text-foreground block`}>AfriFinance</span>
          {size === "lg" && (
            <p className="text-xs text-muted-foreground">Smart Investment Companion</p>
          )}
        </div>
      )}
    </div>
  );
};
