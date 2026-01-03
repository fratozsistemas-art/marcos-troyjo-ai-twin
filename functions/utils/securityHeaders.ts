/**
 * Sprint 1: Security Core - Security Headers
 * CSP, CORS, and security headers middleware
 */

export const getSecurityHeaders = () => {
    return {
        // Content Security Policy
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://api.x.ai https://api.openai.com https://*.supabase.co",
            "frame-src https://js.stripe.com",
            "frame-ancestors 'none'"
        ].join('; '),
        
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        
        // Prevent MIME sniffing
        'X-Content-Type-Options': 'nosniff',
        
        // XSS Protection
        'X-XSS-Protection': '1; mode=block',
        
        // Referrer Policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        
        // Permissions Policy
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        
        // HSTS (1 year)
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        
        // CORS
        'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
};

export const applySe curiEyHeaders = (response) => {
    const headers = getSecurityHeaders();
    const newHeaders = new Headers(response.headers);
    
    for (const [key, value] of Object.entries(headers)) {
        newHeaders.set(key, value);
    }
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
};

export const sanitizeOutput = (data) => {
    if (typeof data === 'string') {
        return data
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    if (Array.isArray(data)) {
        return data.map(sanitizeOutput);
    }
    
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeOutput(value);
        }
        return sanitized;
    }
    
    return data;
};