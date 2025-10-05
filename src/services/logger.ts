/**
 * Centralized logging service
 * Replaces console.error with structured logging
 * Can be extended to send logs to external services (Sentry, LogRocket, etc.)
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  error(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('error', message, context);
    
    if (this.isDevelopment) {
      console.error(formattedMessage, context || '');
    } else {
      // In production, send to monitoring service
      // Example: Sentry.captureException(new Error(message), { extra: context });
      console.error(formattedMessage, context || '');
    }
  }

  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('warn', message, context);
    
    if (this.isDevelopment) {
      console.warn(formattedMessage, context || '');
    } else {
      console.warn(formattedMessage, context || '');
    }
  }

  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('info', message, context);
    
    if (this.isDevelopment) {
      console.info(formattedMessage, context || '');
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage, context || '');
    }
  }
}

export const logger = new Logger();
