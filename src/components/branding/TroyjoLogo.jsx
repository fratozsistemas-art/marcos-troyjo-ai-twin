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
                <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#002D62', stopOpacity: 0.4 }} />
                    <stop offset="50%" style={{ stopColor: '#002D62', stopOpacity: 0.7 }} />
                    <stop offset="100%" style={{ stopColor: '#001d42', stopOpacity: 0.9 }} />
                </linearGradient>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 0.3 }} />
                    <stop offset="50%" style={{ stopColor: '#F5E6C8', stopOpacity: 0.5 }} />
                    <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 0.6 }} />
                </linearGradient>
                <filter id="holographicGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feColorMatrix in="coloredBlur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            {/* Outer glow ring - Gold translucent */}
            <circle 
                cx="58" 
                cy="50" 
                r="32" 
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="6"
                filter="url(#holographicGlow)"
                opacity="0.6"
            />
            
            {/* Inner ring - Navy translucent */}
            <circle 
                cx="42" 
                cy="50" 
                r="28" 
                fill="none"
                stroke="url(#navyGradient)"
                strokeWidth="8"
                opacity="0.8"
            />
            
            {/* Central core - Navy with transparency */}
            <circle 
                cx="50" 
                cy="50" 
                r="18" 
                fill="url(#navyGradient)"
                opacity="0.5"
            />
            
            {/* Highlight overlay - White translucent */}
            <circle 
                cx="45" 
                cy="45" 
                r="12" 
                fill="white"
                opacity="0.15"
            />
        </svg>
    );
}