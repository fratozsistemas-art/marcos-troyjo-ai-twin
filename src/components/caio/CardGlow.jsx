import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CardGlow({ children, className, hover = true, ...props }) {
    return (
        <Card
            className={cn(
                "border-electric-cyan/20 transition-all duration-300",
                hover && "hover:border-electric-cyan/50 hover:shadow-lg hover:shadow-electric-cyan/20",
                className
            )}
            {...props}
        >
            <CardContent className="relative overflow-hidden">
                {children}
            </CardContent>
        </Card>
    );
}