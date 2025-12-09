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
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            {/* Back silhouette - Gold with white glow */}
            <ellipse 
                cx="60" 
                cy="30" 
                rx="16" 
                ry="20" 
                fill="#D4AF37"
                filter="url(#glow)"
                opacity="0.9"
            />
            <path 
                d="M 60 50 L 55 58 L 52 75 L 52 95 L 68 95 L 68 75 L 65 58 Z" 
                fill="#D4AF37"
                filter="url(#glow)"
                opacity="0.9"
            />
            
            {/* Front silhouette - Navy Blue */}
            <ellipse 
                cx="40" 
                cy="25" 
                rx="18" 
                ry="22" 
                fill="#002D62"
            />
            <path 
                d="M 40 47 L 34 56 L 30 75 L 30 95 L 50 95 L 50 75 L 46 56 Z" 
                fill="#002D62"
            />
        </svg>
    );
}