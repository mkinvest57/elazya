import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover shadow-glow-sm hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98]",
            secondary: "bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15]",
            outline: "bg-transparent border border-white/[0.1] text-white/80 hover:border-primary/40 hover:text-white hover:bg-white/[0.03]",
            ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/[0.05]",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm gap-2",
            md: "h-11 px-6 text-sm gap-2",
            lg: "h-13 px-8 text-base gap-3",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
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
