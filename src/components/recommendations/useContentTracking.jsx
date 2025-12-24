import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Hook to automatically track content views
export function useContentTracking(contentType, contentId, contentTitle, contentMetadata = {}) {
    useEffect(() => {
        if (!contentType || !contentId) return;

        const trackView = async () => {
            try {
                await base44.functions.invoke('trackContentView', {
                    content_type: contentType,
                    content_id: contentId,
                    content_title: contentTitle,
                    content_metadata: contentMetadata
                });
            } catch (error) {
                console.error('Error tracking content view:', error);
            }
        };

        // Track after 2 seconds to ensure user is actually viewing
        const timer = setTimeout(trackView, 2000);

        return () => clearTimeout(timer);
    }, [contentType, contentId, contentTitle]);
}

export default useContentTracking;