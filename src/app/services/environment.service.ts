import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  /**
   * Get the current environment configuration
   */
  get config() {
    return environment;
  }
  
  /**
   * Check if running in production mode
   */
  get isProduction(): boolean {
    return environment.production;
  }
  
  /**
   * Check if running in development mode
   */
  get isDevelopment(): boolean {
    return environment.development;
  }
  
  /**
   * Check if running in staging mode
   */
  get isStaging(): boolean {
    return environment.staging;
  }

    /**
   * Get the API base URL
   */
    get apiBaseUrl(): string {
      return environment.baseUrl;
    }
  
  /**
   * Get the API base URL
   */
  get apiUrl(): string {
    return environment.apiUrl;
  }
  
  /**
   * Get the API version
   */
  get apiVersion(): string {
    return environment.apiVersion;
  }
  
  /**
   * Get the full API endpoint URL
   */
  getApiEndpoint(endpoint: string): string {
    // Since apiUrl already contains the protocol, just construct the full URL
    let url = `${this.apiUrl}/${this.apiVersion}/${endpoint}`;
    
    // Clean up multiple slashes but preserve the protocol structure
    // Replace multiple slashes with single slash, but ensure http:// stays intact
    url = url.replace(/\/+/g, '/');
    
    // Ensure the protocol has the correct format (http:// or https://)
    if (url.startsWith('http:/') && !url.startsWith('http://')) {
      url = url.replace('http:/', 'http://');
    }
    if (url.startsWith('https:/') && !url.startsWith('https://')) {
      url = url.replace('https:/', 'https://');
    }
    
    return url;
  }
  
  /**
   * Check if debug mode is enabled
   */
  get isDebugEnabled(): boolean {
    return environment.enableDebug;
  }
  
  /**
   * Check if logging is enabled
   */
  get isLoggingEnabled(): boolean {
    return environment.enableLogging;
  }
  
  /**
   * Check if analytics is enabled
   */
  get isAnalyticsEnabled(): boolean {
    return environment.enableAnalytics;
  }
  
  /**
   * Get the Google Analytics ID
   */
  get googleAnalyticsId(): string {
    return environment.googleAnalyticsId;
  }
  
  /**
   * Get the Sentry DSN
   */
  get sentryDsn(): string {
    return environment.sentryDsn;
  }
  
  /**
   * Get the cache timeout in milliseconds
   */
  get cacheTimeout(): number {
    return environment.cacheTimeout;
  }
  
  /**
   * Get the app name
   */
  get appName(): string {
    return environment.appName;
  }
  
  /**
   * Get the app version
   */
  get appVersion(): string {
    return environment.appVersion;
  }
  
  /**
   * Get the build date
   */
  get buildDate(): string {
    return environment.buildDate;
  }
  
  /**
   * Get the build number
   */
  get buildNumber(): string {
    return environment.buildNumber;
  }
}
