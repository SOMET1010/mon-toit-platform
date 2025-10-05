/**
 * Centralized logging service
 * Replaces console.error with structured logging
 * Production-ready with future integration support (Sentry, LogRocket, etc.)
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with structured context
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = this.formatError(error);
    const logData = {
      level: 'error' as LogLevel,
      message,
      error: errorDetails,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorDetails, context);
    } else {
      // Production: Send to monitoring service
      // TODO: Integrate Sentry or similar
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    const logData = {
      level: 'warn' as LogLevel,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      console.warn(JSON.stringify(logData));
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    const logData = {
      level: 'info' as LogLevel,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log debug information (dev only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Format error object for logging
   */
  private formatError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'object' && error !== null) {
      return error as Record<string, unknown>;
    }

    return { value: String(error) };
  }
}

export const logger = new Logger();
