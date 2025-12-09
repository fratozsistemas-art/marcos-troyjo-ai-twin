import React from 'react';
import { Card } from '@/components/ui/card';

export default function VideoPlayer({ videoUrl, title, aspectRatio = '16/9' }) {
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
        return null;
    };

    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    if (!embedUrl) return null;

    return (
        <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <div style={{ aspectRatio, position: 'relative', width: '100%' }}>
                <iframe
                    src={embedUrl}
                    title={title || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                />
            </div>
        </div>
    );
}