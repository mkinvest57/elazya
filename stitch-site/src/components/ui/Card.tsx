import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'interactive' | 'pricing';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {

        const variants = {
            default: "bg-surface-1 border border-surface-3",
            interactive: "bg-surface-1 border border-surface-3 hover:border-primary/50 hover:shadow-glow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer",
            pricing: "bg-gradient-to-b from-surface-1 to-surface-2 border-2 border-primary shadow-glow-cyan relative overflow-hidden",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl p-6 text-foreground shadow-sm",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

export { Card }
