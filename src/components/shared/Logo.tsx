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
        alt="AfriFinance Logo" 
        className={`${sizeClasses[size]} rounded-xl object-cover shadow-sm`}
      />
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold text-foreground`}>AfriFinance</h1>
          {size === "lg" && (
            <p className="text-xs text-muted-foreground">Smart Investment Companion</p>
          )}
        </div>
      )}
    </div>
  );
};
