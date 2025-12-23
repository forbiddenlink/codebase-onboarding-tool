/**
 * Logging utility for CodeCompass
 * Provides structured logging with different levels and optional metadata
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // Get log level from environment variable
    const envLogLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    this.logLevel = validLevels.includes(envLogLevel) ? envLogLevel : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `[${levelStr}] ${timestamp} - ${message}${metadataStr}`;
  }

  private getConsoleMethod(level: LogLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case 'debug':
      case 'info':
        return 'log';
      case 'warn':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Log debug message (for development/troubleshooting)
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, metadata);
      console.log(formatted);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, metadata);
      console.log(formatted);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, metadata);
      console.warn(formatted);
    }
  }

  /**
   * Log error message with optional error object
   */
  error(message: string, error?: Error | any, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      const errorInfo = error instanceof Error
        ? { message: error.message, stack: error.stack, ...metadata }
        : { error, ...metadata };
      const formatted = this.formatMessage('error', message, errorInfo);
      console.error(formatted);
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (this.shouldLog(level)) {
      const formatted = this.formatMessage(level, message, metadata);
      const method = this.getConsoleMethod(level);
      console[method](formatted);
    }
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }
}

/**
 * Context-aware logger that prepends context to all messages
 */
class ContextLogger {
  constructor(private parent: Logger, private context: string) {}

  debug(message: string, metadata?: LogMetadata): void {
    this.parent.debug(`[${this.context}] ${message}`, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.parent.info(`[${this.context}] ${message}`, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.parent.warn(`[${this.context}] ${message}`, metadata);
  }

  error(message: string, error?: Error | any, metadata?: LogMetadata): void {
    this.parent.error(`[${this.context}] ${message}`, error, metadata);
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export types
export type { LogLevel, LogMetadata };
