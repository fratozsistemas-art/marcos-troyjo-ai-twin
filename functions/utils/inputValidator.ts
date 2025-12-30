// Centralized input validation and sanitization utilities

/**
 * Validates and sanitizes a string input
 */
export function validateString(input, options = {}) {
    const {
        maxLength = 10000,
        minLength = 0,
        allowEmpty = false,
        paramName = 'input'
    } = options;
    
    if (input === null || input === undefined) {
        if (allowEmpty) return '';
        throw new Error(`${paramName} is required`);
    }
    
    if (typeof input !== 'string') {
        throw new Error(`${paramName} must be a string`);
    }
    
    const trimmed = input.trim();
    
    if (trimmed.length < minLength) {
        throw new Error(`${paramName} must be at least ${minLength} characters`);
    }
    
    if (trimmed.length > maxLength) {
        throw new Error(`${paramName} exceeds maximum length of ${maxLength} characters`);
    }
    
    return trimmed;
}

/**
 * Validates an email address
 */
export function validateEmail(email) {
    const trimmed = validateString(email, { maxLength: 255, paramName: 'email' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        throw new Error('Invalid email format');
    }
    
    return trimmed.toLowerCase();
}

/**
 * Validates a UUID
 */
export function validateUUID(uuid, paramName = 'id') {
    const trimmed = validateString(uuid, { maxLength: 100, paramName });
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmed)) {
        throw new Error(`${paramName} must be a valid UUID`);
    }
    
    return trimmed;
}

/**
 * Validates a number input
 */
export function validateNumber(input, options = {}) {
    const {
        min = -Infinity,
        max = Infinity,
        integer = false,
        paramName = 'number'
    } = options;
    
    if (input === null || input === undefined) {
        throw new Error(`${paramName} is required`);
    }
    
    const num = Number(input);
    
    if (isNaN(num) || !isFinite(num)) {
        throw new Error(`${paramName} must be a valid number`);
    }
    
    if (integer && !Number.isInteger(num)) {
        throw new Error(`${paramName} must be an integer`);
    }
    
    if (num < min || num > max) {
        throw new Error(`${paramName} must be between ${min} and ${max}`);
    }
    
    return num;
}

/**
 * Validates an enum value
 */
export function validateEnum(input, allowedValues, paramName = 'value') {
    const trimmed = validateString(input, { maxLength: 100, paramName });
    
    if (!allowedValues.includes(trimmed)) {
        throw new Error(`${paramName} must be one of: ${allowedValues.join(', ')}`);
    }
    
    return trimmed;
}

/**
 * Validates a boolean
 */
export function validateBoolean(input, paramName = 'boolean') {
    if (typeof input !== 'boolean') {
        throw new Error(`${paramName} must be a boolean`);
    }
    return input;
}

/**
 * Validates an array
 */
export function validateArray(input, options = {}) {
    const {
        maxLength = 1000,
        minLength = 0,
        paramName = 'array'
    } = options;
    
    if (!Array.isArray(input)) {
        throw new Error(`${paramName} must be an array`);
    }
    
    if (input.length < minLength) {
        throw new Error(`${paramName} must have at least ${minLength} items`);
    }
    
    if (input.length > maxLength) {
        throw new Error(`${paramName} exceeds maximum length of ${maxLength} items`);
    }
    
    return input;
}

/**
 * Validates a JSON object structure
 */
export function validateObject(input, requiredKeys = [], paramName = 'object') {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new Error(`${paramName} must be an object`);
    }
    
    for (const key of requiredKeys) {
        if (!(key in input)) {
            throw new Error(`${paramName} missing required key: ${key}`);
        }
    }
    
    return input;
}

/**
 * Sanitizes HTML to prevent XSS
 */
export function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validates URL
 */
export function validateURL(input, paramName = 'url') {
    const trimmed = validateString(input, { maxLength: 2048, paramName });
    
    try {
        const url = new URL(trimmed);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error(`${paramName} must use http or https protocol`);
        }
        return trimmed;
    } catch {
        throw new Error(`${paramName} must be a valid URL`);
    }
}