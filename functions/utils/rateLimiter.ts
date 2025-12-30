// Enhanced rate limiter for API protection with tiered limits
const requestLog = new Map();

// Tiered rate limits based on endpoint sensitivity
const RATE_LIMITS = {
    critical: { windowMs: 60000, maxRequests: 5 },    // Critical functions: 5/min
    high: { windowMs: 60000, maxRequests: 10 },        // High sensitivity: 10/min
    medium: { windowMs: 60000, maxRequests: 30 },      // Medium: 30/min
    low: { windowMs: 60000, maxRequests: 100 }         // Low: 100/min
};

// Endpoint classification
const ENDPOINT_TIERS = {
    // Critical endpoints
    'aegisProtocolValidator': 'critical',
    'generatePredictiveInsights': 'critical',
    'validateHUA': 'critical',
    
    // High sensitivity
    'analyzeDocument': 'high',
    'retrieveRAGContext': 'high',
    'searchDocumentsRAG': 'high',
    'intelligentLLMRouter': 'high',
    
    // Medium sensitivity
    'generateArticle': 'medium',
    'generateSSOTReport': 'medium',
    'querySSOTChatbot': 'medium',
    
    // Default to high for unlisted
    'default': 'high'
};

export function checkRateLimit(userEmail, endpoint) {
    // Input validation
    if (!userEmail || typeof userEmail !== 'string' || userEmail.length > 255) {
        return { allowed: false, error: 'Invalid user identifier' };
    }
    
    if (!endpoint || typeof endpoint !== 'string' || endpoint.length > 100) {
        return { allowed: false, error: 'Invalid endpoint' };
    }
    
    const tier = ENDPOINT_TIERS[endpoint] || ENDPOINT_TIERS['default'];
    const limits = RATE_LIMITS[tier];
    
    const key = `${userEmail}:${endpoint}`;
    const now = Date.now();
    
    if (!requestLog.has(key)) {
        requestLog.set(key, []);
    }
    
    const requests = requestLog.get(key);
    
    // Clean old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < limits.windowMs);
    
    // Check if limit exceeded
    if (validRequests.length >= limits.maxRequests) {
        const oldestRequest = validRequests[0];
        const retryAfterMs = limits.windowMs - (now - oldestRequest);
        
        return {
            allowed: false,
            retryAfter: retryAfterMs,
            limit: limits.maxRequests,
            remaining: 0,
            resetTime: oldestRequest + limits.windowMs
        };
    }
    
    // Add current request
    validRequests.push(now);
    requestLog.set(key, validRequests);
    
    return { 
        allowed: true,
        limit: limits.maxRequests,
        remaining: limits.maxRequests - validRequests.length,
        resetTime: now + limits.windowMs
    };
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