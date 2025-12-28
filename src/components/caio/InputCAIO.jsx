import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function InputCAIO({ className, focus = true, ...props }) {
    return (
        <Input
            className={cn(
                'border-abyss-blue-200 dark:border-abyss-blue-700',
                focus && 'focus:border-electric-cyan focus:ring-electric-cyan/20',
                'transition-all duration-200',
                className
            )}
            {...props}
        />
    );
}