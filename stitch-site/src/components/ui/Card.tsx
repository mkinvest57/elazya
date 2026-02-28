import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'interactive' | 'highlight';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {

        const variants = {
            default: "bg-white/[0.03] border border-white/[0.06]",
            interactive: "bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.05] hover:shadow-glow-sm transition-all duration-300 cursor-pointer",
            highlight: "bg-gradient-to-b from-primary/[0.08] to-transparent border border-primary/20 shadow-glow-sm",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl p-6 text-foreground backdrop-blur-sm",
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
