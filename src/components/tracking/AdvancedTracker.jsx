import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

// Advanced tracking hook with granular event capture
export function useAdvancedTracking(contentType, contentId, contentTitle, contentMetadata = {}) {
    const location = useLocation();
    const sessionId = useRef(crypto.randomUUID());
    const startTime = useRef(Date.now());
    const maxScroll = useRef(0);
    const hasTrackedView = useRef(false);

    // Track content view
    useEffect(() => {
        if (!contentType || !contentId || hasTrackedView.current) return;

        const trackView = async () => {
            try {
                await trackEvent({
                    interaction_type: 'view',
                    event_name: 'content_view',
                    content_type: contentType,
                    content_id: contentId,
                    content_title: contentTitle,
                    content_metadata: contentMetadata,
                    session_id: sessionId.current
                });
                hasTrackedView.current = true;
            } catch (error) {
                console.error('Error tracking view:', error);
            }
        };

        const timer = setTimeout(trackView, 2000);
        return () => clearTimeout(timer);
    }, [contentType, contentId, contentTitle]);

    // Track scroll depth
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            if (scrollPercent > maxScroll.current) {
                maxScroll.current = Math.min(scrollPercent, 100);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track reading time on unmount
    useEffect(() => {
        return () => {
            if (!hasTrackedView.current) return;

            const duration = Math.floor((Date.now() - startTime.current) / 1000);
            
            trackEvent({
                interaction_type: 'read',
                event_name: 'content_read_complete',
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                duration_seconds: duration,
                scroll_depth: maxScroll.current,
                session_id: sessionId.current
            });
        };
    }, [contentType, contentId, contentTitle]);

    // Return tracking functions for manual events
    return {
        trackClick: useCallback((target, actionTarget) => {
            return trackEvent({
                interaction_type: 'click',
                event_name: target,
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                action_target: actionTarget,
                session_id: sessionId.current
            });
        }, [contentType, contentId, contentTitle]),

        trackPurchaseClick: useCallback((purchaseUrl) => {
            return trackEvent({
                interaction_type: 'purchase',
                event_name: 'purchase_click',
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                action_target: purchaseUrl,
                session_id: sessionId.current
            });
        }, [contentType, contentId, contentTitle]),

        trackShare: useCallback((platform) => {
            return trackEvent({
                interaction_type: 'share',
                event_name: `share_${platform}`,
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                content_metadata: { ...contentMetadata, platform },
                session_id: sessionId.current
            });
        }, [contentType, contentId, contentTitle]),

        trackBookmark: useCallback(() => {
            return trackEvent({
                interaction_type: 'bookmark',
                event_name: 'content_bookmarked',
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                session_id: sessionId.current
            });
        }, [contentType, contentId, contentTitle])
    };
}

async function trackEvent(eventData) {
    try {
        // Add device info
        eventData.device_info = {
            type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: navigator.userAgent.split(' ').slice(-1)[0],
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
        };

        await base44.functions.invoke('trackEvent', eventData);
    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

// Hook for tracking section visits
export function useSectionTracking(sectionName, contentId) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!sectionName || !contentId || hasTracked.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTracked.current) {
                        trackEvent({
                            interaction_type: 'view',
                            event_name: 'section_view',
                            content_type: 'section',
                            content_id: contentId,
                            content_title: sectionName,
                            section_visited: sectionName
                        });
                        hasTracked.current = true;
                    }
                });
            },
            { threshold: 0.5 }
        );

        const element = document.getElementById(sectionName);
        if (element) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [sectionName, contentId]);
}

export default useAdvancedTracking;