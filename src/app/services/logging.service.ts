import { Injectable } from '@angular/core';
import { EnvironmentService } from './environment.service';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  
  constructor(private environmentService: EnvironmentService) {}
  
  /**
   * Log debug message (only in development/staging)
   */
  debug(message: string, ...args: any[]): void {
    // Debug logging disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.log(`[DEBUG] ${message}`, ...args);
    }
  }
  
  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    // Info logging disabled in production
    if (this.environmentService.isLoggingEnabled) {
      // console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    // Warning logging disabled in production
    if (this.environmentService.isLoggingEnabled) {
      // console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  /**
   * Log error message (always logged)
   */
  error(message: string, error?: any): void {
    // Error logging disabled in production
    // console.error(`[ERROR] ${message}`, error);
    
    // In production, you might want to send this to a logging service
    if (this.environmentService.isProduction && this.environmentService.sentryDsn) {
      // TODO: Implement Sentry error reporting
      // Sentry.captureException(error);
    }
  }
  
  /**
   * Log performance timing
   */
  time(label: string): void {
    // Performance timing disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.time(label);
    }
  }
  
  /**
   * End performance timing
   */
  timeEnd(label: string): void {
    // Performance timing disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.timeEnd(label);
    }
  }
  
  /**
   * Log table data
   */
  table(data: any): void {
    // Table logging disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.table(data);
    }
  }
  
  /**
   * Log group of related messages
   */
  group(label: string): void {
    // Group logging disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.group(label);
    }
  }
  
  /**
   * End log group
   */
  groupEnd(): void {
    // Group logging disabled in production
    if (this.environmentService.isDebugEnabled) {
      // console.groupEnd();
    }
  }
}
