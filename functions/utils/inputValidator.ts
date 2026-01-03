/**
 * Sprint 1: Security Core - Input Validation
 * Validates and sanitizes user inputs
 */

const MAX_LENGTHS = {
    message: 10000,
    title: 200,
    description: 2000,
    email: 255,
    name: 100,
    url: 2000
};

export const validateInput = (input, rules = {}) => {
    const errors = [];
    
    // Required check
    if (rules.required && (!input || input.trim() === '')) {
        errors.push('Field is required');
        return { valid: false, errors };
    }
    
    if (!input) return { valid: true, sanitized: '' };
    
    // Type validation
    if (rules.type === 'email' && !isValidEmail(input)) {
        errors.push('Invalid email format');
    }
    
    if (rules.type === 'url' && !isValidURL(input)) {
        errors.push('Invalid URL format');
    }
    
    // Length validation
    const maxLength = rules.maxLength || MAX_LENGTHS[rules.type] || 1000;
    if (input.length > maxLength) {
        errors.push(`Maximum length is ${maxLength} characters`);
    }
    
    // SQL Injection patterns
    if (containsSQLInjection(input)) {
        errors.push('Invalid input detected');
    }
    
    // XSS patterns
    if (rules.sanitizeHTML && containsXSS(input)) {
        errors.push('Invalid HTML content detected');
    }
    
    return {
        valid: errors.length === 0,
        errors,
        sanitized: sanitizeInput(input, rules)
    };
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const containsSQLInjection = (input) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /(\bOR\b|\bAND\b).*?=.*?/i
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
};

const containsXSS = (input) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi
    ];
    return xssPatterns.some(pattern => pattern.test(input));
};

const sanitizeInput = (input, rules) => {
    let sanitized = input.trim();
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Sanitize HTML if required
    if (rules.sanitizeHTML) {
        sanitized = sanitized
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    return sanitized;
};

export const validateConversationInput = (data) => {
    const validation = {
        valid: true,
        errors: {}
    };
    
    if (data.content) {
        const contentCheck = validateInput(data.content, {
            required: true,
            maxLength: MAX_LENGTHS.message,
            type: 'message'
        });
        if (!contentCheck.valid) {
            validation.valid = false;
            validation.errors.content = contentCheck.errors;
        }
    }
    
    if (data.metadata?.name) {
        const nameCheck = validateInput(data.metadata.name, {
            maxLength: MAX_LENGTHS.title,
            type: 'title'
        });
        if (!nameCheck.valid) {
            validation.valid = false;
            validation.errors.name = nameCheck.errors;
        }
    }
    
    return validation;
};