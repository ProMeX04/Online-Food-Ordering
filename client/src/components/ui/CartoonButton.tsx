import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CartoonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "primary" | "secondary" | "accent" | "neutral" | "light"
	size?: "sm" | "md" | "lg"
}

// Types for shadcn button variants and sizes
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

// This is a compatibility component to replace the cartoon style
// It maps the cartoon styles to standard shadcn/ui button variants
export const CartoonButton = forwardRef<HTMLButtonElement, CartoonButtonProps>(({ className, variant = "default", size = "md", ...props }, ref) => {
	// Map cartoon variants to shadcn/ui button variants
	const variantMap: Record<CartoonButtonProps["variant"] & string, ButtonVariant> = {
		default: "default",
		primary: "default",
		secondary: "secondary",
		accent: "outline",
		neutral: "destructive", // close match
		light: "outline",
	}

	// Map cartoon sizes to shadcn/ui button sizes
	const sizeMap: Record<CartoonButtonProps["size"] & string, ButtonSize> = {
		sm: "sm",
		md: "default",
		lg: "lg",
	}

	return <Button 
		className={cn("font-medium inline-flex items-center justify-center", className)} 
		variant={variantMap[variant]} 
		size={sizeMap[size]} 
		ref={ref} 
		{...props} 
	/>
})

CartoonButton.displayName = "CartoonButton"
