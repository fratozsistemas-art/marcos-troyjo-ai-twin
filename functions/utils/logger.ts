/**
 * Structured Logging Utility for Backend Functions
 * 
 * Provides consistent, structured logging across all backend functions
 * with support for different log levels, context, and metadata.
 * 
 * Features:
 * - Structured JSON logging
 * - Log levels (debug, info, warn, error)
 * - Automatic timestamp and request ID tracking
 * - Performance timing utilities
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  functionName?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private context: LogContext;
  private timers: Map<string, number>;

  constructor(functionName: string, initialContext?: LogContext) {
    this.context = {
      functionName,
      ...initialContext,
    };
    this.timers = new Map();
  }

  /**
   * Creates a log entry with standard structure
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
    };

    if (metadata) {
      entry.metadata = metadata;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return entry;
  }

  /**
   * Writes log entry to console
   */
  private write(entry: LogEntry): void {
    const logFn = entry.level === LogLevel.ERROR ? console.error :
                  entry.level === LogLevel.WARN ? console.warn :
                  console.log;
    
    logFn(JSON.stringify(entry));
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.write(this.createLogEntry(LogLevel.DEBUG, message, metadata));
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.write(this.createLogEntry(LogLevel.INFO, message, metadata));
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.write(this.createLogEntry(LogLevel.WARN, message, metadata));
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.write(this.createLogEntry(LogLevel.ERROR, message, metadata, error));
  }

  /**
   * Starts a performance timer
   */
  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * Ends a performance timer and logs the duration
   */
  endTimer(label: string, metadata?: Record<string, any>): void {
    const start = this.timers.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.info(`Timer [${label}] completed`, {
        ...metadata,
        duration_ms: Math.round(duration),
      });
      this.timers.delete(label);
    } else {
      this.warn(`Timer [${label}] was not started`);
    }
  }

  /**
   * Updates the logger context
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }
}

/**
 * Creates a logger instance for a backend function
 */
export function createLogger(functionName: string, request?: Request): Logger {
  const context: LogContext = {
    functionName,
  };

  // Extract request ID from headers if available
  if (request) {
    const requestId = request.headers.get('x-request-id') || 
                      request.headers.get('cf-ray') ||
                      crypto.randomUUID();
    context.requestId = requestId;
  }

  return new Logger(functionName, context);
}

/**
 * Utility to log function execution with automatic timing
 */
export async function logExecution<T>(
  logger: Logger,
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  logger.startTimer(operationName);
  try {
    const result = await fn();
    logger.endTimer(operationName, { status: 'success' });
    return result;
  } catch (error) {
    logger.endTimer(operationName, { status: 'error' });
    throw error;
  }
}