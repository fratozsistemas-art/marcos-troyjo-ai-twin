import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CardBordered({ children, className, borderColor = 'cyan', ...props }) {
    const borderColors = {
        cyan: 'border-l-4 border-l-electric-cyan',
        gold: 'border-l-4 border-l-metallic-gold',
        abyss: 'border-l-4 border-l-abyss-blue'
    };

    return (
        <Card
            className={cn(
                'transition-all duration-300 hover:shadow-md',
                borderColors[borderColor],
                className
            )}
            {...props}
        >
            <CardContent className="p-6">
                {children}
            </CardContent>
        </Card>
    );
}