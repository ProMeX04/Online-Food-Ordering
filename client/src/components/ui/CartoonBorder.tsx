import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface CartoonBorderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "light";
  size?: "sm" | "md" | "lg";
}

// This is a compatibility component to replace the cartoon border
// It maps to standard shadcn/ui Card component with appropriate styling
export const CartoonBorder = forwardRef<HTMLDivElement, CartoonBorderProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white",
      primary: "bg-primary text-white",
      secondary: "bg-secondary text-neutral",
      accent: "bg-accent text-white",
      light: "bg-light text-neutral"
    };
    
    const sizeClasses = {
      sm: "p-2",
      md: "p-4",
      lg: "p-6"
    };
    
    return (
      <Card
        className={cn(
          "rounded-lg border shadow-sm",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CartoonBorder.displayName = "CartoonBorder";
