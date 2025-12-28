import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Toast({ children, variant = 'info', className, ...props }) {
    const variants = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: CheckCircle2,
            iconColor: 'text-green-600'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: AlertCircle,
            iconColor: 'text-red-600'
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: AlertTriangle,
            iconColor: 'text-yellow-600'
        },
        info: {
            bg: 'bg-electric-cyan-50 dark:bg-electric-cyan-900/20',
            border: 'border-electric-cyan-200 dark:border-electric-cyan-800',
            text: 'text-electric-cyan-800 dark:text-electric-cyan-200',
            icon: Info,
            iconColor: 'text-electric-cyan-600'
        }
    };

    const config = variants[variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                config.bg,
                config.border,
                config.text,
                className
            )}
            {...props}
        >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
            <div className="flex-1">{children}</div>
        </div>
    );
}