// Simple rate limiter for API protection
const requestLog = new Map();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 10; // requests per window

export function checkRateLimit(userEmail, endpoint) {
    const key = `${userEmail}:${endpoint}`;
    const now = Date.now();
    
    if (!requestLog.has(key)) {
        requestLog.set(key, []);
    }
    
    const requests = requestLog.get(key);
    
    // Clean old requests
    const validRequests = requests.filter(timestamp => now - timestamp < WINDOW_MS);
    
    if (validRequests.length >= MAX_REQUESTS) {
        return {
            allowed: false,
            retryAfter: WINDOW_MS - (now - validRequests[0])
        };
    }
    
    validRequests.push(now);
    requestLog.set(key, validRequests);
    
    return { allowed: true };
}

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, requests] of requestLog.entries()) {
        const valid = requests.filter(timestamp => now - timestamp < WINDOW_MS);
        if (valid.length === 0) {
            requestLog.delete(key);
        } else {
            requestLog.set(key, valid);
        }
    }
}, WINDOW_MS);