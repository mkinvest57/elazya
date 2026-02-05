import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        `${prefix}${Math.round(current).toLocaleString()}${suffix}`
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

export function PulseIndicator({ active }: { active: boolean }) {
    return (
        <div className="relative flex items-center justify-center w-3 h-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 duration-1000 ${active ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
                }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}></span>
        </div>
    );
}
