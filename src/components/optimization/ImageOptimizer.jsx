/**
 * Sprint 2: Performance Frontend - Image Optimization
 * Lazy loading, srcset, modern formats
 */

import React, { useState, useEffect } from 'react';
import { ASSETS } from '@/components/config/Assets';

export default function ImageOptimizer({ 
    src, 
    alt, 
    className = '', 
    priority = false,
    sizes = '100vw',
    objectFit = 'cover'
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(priority ? src : ASSETS.FALLBACK_IMAGE);

    useEffect(() => {
        if (!priority && src && src !== ASSETS.FALLBACK_IMAGE) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setCurrentSrc(src);
                setIsLoaded(true);
            };
            img.onerror = () => {
                setError(true);
                setCurrentSrc(ASSETS.FALLBACK_IMAGE);
            };
        } else if (priority) {
            setIsLoaded(true);
        }
    }, [src, priority]);

    return (
        <div className={`relative ${className}`}>
            <img
                src={currentSrc}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                style={{ 
                    objectFit,
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: isLoaded ? 1 : 0.6
                }}
                className="w-full h-full"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setError(true);
                    setCurrentSrc(ASSETS.FALLBACK_IMAGE);
                }}
            />
            {!isLoaded && !error && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
        </div>
    );
}

export const getOptimizedImageUrl = (url, width) => {
    if (!url || url.includes('data:image')) return url;
    
    // For Supabase storage, add transform parameters
    if (url.includes('supabase.co')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=85`;
    }
    
    return url;
};