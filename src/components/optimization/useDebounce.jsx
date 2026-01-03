/**
 * Sprint 2: Performance Frontend - Debounce Hook
 * Optimizes search and input operations
 */

import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export const useThrottle = (value, interval = 300) => {
    const [throttledValue, setThrottledValue] = useState(value);
    const [lastRan, setLastRan] = useState(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan >= interval) {
                setThrottledValue(value);
                setLastRan(Date.now());
            }
        }, interval - (Date.now() - lastRan));

        return () => {
            clearTimeout(handler);
        };
    }, [value, interval, lastRan]);

    return throttledValue;
};