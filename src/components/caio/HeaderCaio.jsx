import React from 'react';
import { cn } from '@/lib/utils';

export default function HeaderCaio({ children, className, ...props }) {
    return (
        <header
            className={cn(
                "relative overflow-hidden",
                "bg-gradient-to-r from-abyss-blue via-electric-cyan-900 to-metallic-gold-900",
                "text-white",
                className
            )}
            {...props}
        >
            {children}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-cyan/20 to-transparent bg-[length:200%_100%] animate-shimmer opacity-30" />
        </header>
    );
}