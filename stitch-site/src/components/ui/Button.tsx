import * as React from "react"
import { cn } from "@/lib/utils"
// Note: We don't strictly need Radix Slot unless we want polymorphism (asChild), but standard button is fine for now.
// I'll stick to standard button to avoid missing dependency if Radix isn't installed (I didn't install @radix-ui/react-slot).
// Reverting Slot import.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        // Stitch Design Tokens mapping
        const variants = {
            primary: "bg-primary text-black hover:bg-primary-hover shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98]",
            secondary: "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white",
            outline: "bg-transparent border border-surface-3 text-foreground hover:border-primary hover:text-primary",
            ghost: "bg-transparent text-foreground hover:bg-white/5",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-12 px-8 text-base",
            lg: "h-14 px-10 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    isLoading && "opacity-80 cursor-wait",
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
