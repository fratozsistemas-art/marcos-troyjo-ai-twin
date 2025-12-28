import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ButtonPremium({ children, className, ...props }) {
    return (
        <Button
            className={cn(
                "bg-metallic-gold hover:bg-metallic-gold-600 text-abyss-blue font-semibold",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "animate-glow-gold",
                className
            )}
            {...props}
        >
            {children}
        </Button>
    );
}