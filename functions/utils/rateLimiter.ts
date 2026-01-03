/**
 * Sprint 1: Security Core - Rate Limiting
 * Protects critical endpoints from abuse
 */

const RATE_LIMITS = {
    consultations: { window: 60000, max: 10 }, // 10 per minute
    auth: { window: 300000, max: 5 }, // 5 per 5 minutes
    exports: { window: 60000, max: 3 }, // 3 per minute
    uploads: { window: 60000, max: 10 }, // 10 per minute
    ai_operations: { window: 60000, max: 20 } // 20 per minute
};

const requestLog = new Map();

export const checkRateLimit = (identifier, operation = 'consultations') => {
    const limit = RATE_LIMITS[operation] || RATE_LIMITS.consultations;
    const key = `${identifier}:${operation}`;
    const now = Date.now();
    
    if (!requestLog.has(key)) {
        requestLog.set(key, []);
    }
    
    const requests = requestLog.get(key).filter(timestamp => now - timestamp < limit.window);
    
    if (requests.length >= limit.max) {
        return {
            allowed: false,
            retryAfter: Math.ceil((requests[0] + limit.window - now) / 1000)
        };
    }
    
    requests.push(now);
    requestLog.set(key, requests);
    
    // Cleanup old entries
    if (requestLog.size > 10000) {
        const oldestKey = requestLog.keys().next().value;
        requestLog.delete(oldestKey);
    }
    
    return { allowed: true };
};

export const getRateLimitHeaders = (identifier, operation) => {
    const limit = RATE_LIMITS[operation] || RATE_LIMITS.consultations;
    const key = `${identifier}:${operation}`;
    const requests = requestLog.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(timestamp => now - timestamp < limit.window);
    
    return {
        'X-RateLimit-Limit': limit.max,
        'X-RateLimit-Remaining': Math.max(0, limit.max - validRequests.length),
        'X-RateLimit-Reset': Math.ceil((now + limit.window) / 1000)
    };
};