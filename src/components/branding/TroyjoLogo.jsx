import React from 'react';

export default function TroyjoLogo({ size = 40, className = '' }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 100 100" 
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            {/* Back circle - Gold with white glow */}
            <circle 
                cx="58" 
                cy="50" 
                r="28" 
                fill="#D4AF37"
                filter="url(#glow)"
                opacity="0.75"
            />
            
            {/* Front circle - Navy Blue solid */}
            <circle 
                cx="42" 
                cy="50" 
                r="32" 
                fill="#002D62"
            />
        </svg>
    );
}