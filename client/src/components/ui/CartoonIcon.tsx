import { cn } from "@/lib/utils";

interface CartoonIconProps {
  iconName: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  bgColor?: "primary" | "secondary" | "accent" | "info" | "warning" | "neutral" | "light";
}

// Modern icon component that replaces the cartoon-styled version
export const CartoonIcon = ({
  iconName,
  className,
  size = "md",
  bgColor = "primary"
}: CartoonIconProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl"
  };
  
  const bgClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-neutral",
    accent: "bg-accent text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-white",
    neutral: "bg-neutral text-white",
    light: "bg-light text-neutral"
  };
  
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center shadow-sm",
      sizeClasses[size],
      bgClasses[bgColor],
      className
    )}>
      <i className={`fa fa-${iconName}`}></i>
    </div>
  );
};
