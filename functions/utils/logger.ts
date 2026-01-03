/**
 * Sprint 4: Audit & Monitoring - Structured Logging
 * Production-ready logging with levels and metadata
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

const CURRENT_LEVEL = Deno.env.get('LOG_LEVEL') 
    ? LOG_LEVELS[Deno.env.get('LOG_LEVEL').toUpperCase()] 
    : LOG_LEVELS.INFO;

const formatLog = (level, message, metadata = {}) => {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...metadata,
        environment: Deno.env.get('DENO_ENV') || 'production'
    });
};

export const logger = {
    debug: (message, metadata) => {
        if (LOG_LEVELS.DEBUG >= CURRENT_LEVEL) {
            console.log(formatLog('DEBUG', message, metadata));
        }
    },
    
    info: (message, metadata) => {
        if (LOG_LEVELS.INFO >= CURRENT_LEVEL) {
            console.log(formatLog('INFO', message, metadata));
        }
    },
    
    warn: (message, metadata) => {
        if (LOG_LEVELS.WARN >= CURRENT_LEVEL) {
            console.warn(formatLog('WARN', message, metadata));
        }
    },
    
    error: (message, error, metadata) => {
        if (LOG_LEVELS.ERROR >= CURRENT_LEVEL) {
            console.error(formatLog('ERROR', message, {
                ...metadata,
                error: error?.message,
                stack: error?.stack
            }));
        }
    },
    
    critical: (message, error, metadata) => {
        console.error(formatLog('CRITICAL', message, {
            ...metadata,
            error: error?.message,
            stack: error?.stack,
            alert: true
        }));
    },
    
    // Performance logging
    perf: (operation, duration, metadata) => {
        logger.info(`Performance: ${operation}`, {
            ...metadata,
            duration_ms: duration,
            performance: true
        });
    },
    
    // Security logging
    security: (event, metadata) => {
        console.warn(formatLog('SECURITY', event, {
            ...metadata,
            security_event: true
        }));
    },
    
    // Audit logging
    audit: (action, user, metadata) => {
        console.log(formatLog('AUDIT', action, {
            ...metadata,
            user_email: user?.email,
            user_id: user?.id,
            audit: true
        }));
    }
};

// Performance wrapper
export const withPerformanceLog = (fn, operationName) => {
    return async (...args) => {
        const start = performance.now();
        try {
            const result = await fn(...args);
            const duration = performance.now() - start;
            
            if (duration > 1000) { // Log slow operations
                logger.perf(operationName, duration, { slow: true });
            }
            
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            logger.error(`Failed: ${operationName}`, error, { duration_ms: duration });
            throw error;
        }
    };
};