/**
 * Sprint 3: Performance Backend - Caching Layer
 * In-memory cache for frequent operations
 */

const cache = new Map();
const CACHE_TTL = {
    short: 60000,      // 1 minute
    medium: 300000,    // 5 minutes
    long: 900000,      // 15 minutes
    extended: 3600000  // 1 hour
};

export const cacheGet = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
        cache.delete(key);
        return null;
    }
    
    return cached.data;
};

export const cacheSet = (key, data, ttl = CACHE_TTL.medium) => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
    });
    
    // Cleanup if cache grows too large
    if (cache.size > 1000) {
        const oldestKey = Array.from(cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        cache.delete(oldestKey);
    }
};

export const cacheDelete = (key) => {
    cache.delete(key);
};

export const cacheClear = (pattern) => {
    if (!pattern) {
        cache.clear();
        return;
    }
    
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
        if (regex.test(key)) {
            cache.delete(key);
        }
    }
};

export const getCacheStats = () => {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
        oldestEntry: Math.min(...Array.from(cache.values()).map(v => v.timestamp))
    };
};

// Memoization wrapper for expensive operations
export const memoize = (fn, ttl = CACHE_TTL.medium) => {
    return async (...args) => {
        const key = `memoized:${fn.name}:${JSON.stringify(args)}`;
        const cached = cacheGet(key);
        
        if (cached !== null) {
            return cached;
        }
        
        const result = await fn(...args);
        cacheSet(key, result, ttl);
        return result;
    };
};