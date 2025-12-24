import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Hook to track user activities automatically
export function useActivityTracker() {
    const trackActivity = async (activity_type, entity_type = null, entity_id = null, details = {}) => {
        try {
            await base44.functions.invoke('trackUserActivity', {
                activity_type,
                entity_type,
                entity_id,
                details
            });
        } catch (error) {
            console.error('Error tracking activity:', error);
        }
    };

    return { trackActivity };
}

// Component wrapper for automatic tracking
export default function ActivityTracker({ children }) {
    return <>{children}</>;
}