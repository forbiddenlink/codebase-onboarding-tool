type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(logLevel as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
