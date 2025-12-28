import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function BadgeCaio({ children, variant = 'cyan', className, ...props }) {
    const variants = {
        cyan: 'bg-electric-cyan-100 text-electric-cyan-800 border-electric-cyan-200',
        gold: 'bg-metallic-gold-100 text-metallic-gold-800 border-metallic-gold-200',
        abyss: 'bg-abyss-blue-100 text-abyss-blue-800 border-abyss-blue-200'
    };

    return (
        <Badge
            className={cn(
                variants[variant],
                "border font-semibold",
                className
            )}
            {...props}
        >
            {children}
        </Badge>
    );
}