// Centralized configuration management
// All environment-dependent values should be defined here

/**
 * Get environment variable with validation
 */
function getEnvVar(key, defaultValue = null, required = false) {
    const value = Deno.env.get(key);
    
    if (!value && required) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    
    return value || defaultValue;
}

/**
 * Application configuration
 */
export const CONFIG = {
    // API Keys (from environment)
    OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
    XAI_API_KEY: getEnvVar('XAI_API_KEY'),
    STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
    STRIPE_PUBLISHABLE_KEY: getEnvVar('STRIPE_PUBLISHABLE_KEY'),
    
    // Base44 Configuration
    BASE44_APP_ID: getEnvVar('BASE44_APP_ID', '', true),
    
    // Application URLs (environment-aware)
    APP_URL: getEnvVar('APP_URL', 'https://app.base44.com'),
    API_BASE_URL: getEnvVar('API_BASE_URL', 'https://api.base44.com'),
    
    // Feature Flags
    ENABLE_RATE_LIMITING: getEnvVar('ENABLE_RATE_LIMITING', 'true') === 'true',
    ENABLE_AEGIS_PROTOCOL: getEnvVar('ENABLE_AEGIS_PROTOCOL', 'true') === 'true',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '60000')),
    RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '10')),
    
    // Security
    MAX_REQUEST_SIZE_BYTES: parseInt(getEnvVar('MAX_REQUEST_SIZE_BYTES', '10485760')), // 10MB
    SESSION_TIMEOUT_MS: parseInt(getEnvVar('SESSION_TIMEOUT_MS', '3600000')), // 1 hour
    
    // LLM Configuration
    DEFAULT_LLM_MODEL: getEnvVar('DEFAULT_LLM_MODEL', 'gpt-4o-mini'),
    MAX_TOKENS: parseInt(getEnvVar('MAX_TOKENS', '4096')),
    
    // Logging
    LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
    ENABLE_DEBUG: getEnvVar('ENABLE_DEBUG', 'false') === 'true'
};

/**
 * Validate all required configuration
 */
export function validateConfig() {
    const errors = [];
    
    if (!CONFIG.BASE44_APP_ID) {
        errors.push('BASE44_APP_ID is required');
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
    
    return true;
}

/**
 * Get configuration value safely
 */
export function getConfig(key) {
    if (!(key in CONFIG)) {
        throw new Error(`Configuration key ${key} does not exist`);
    }
    return CONFIG[key];
}