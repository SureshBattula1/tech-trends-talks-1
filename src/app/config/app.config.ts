import { Injectable } from '@angular/core';
import { EnvironmentService } from '../services/environment.service';

export interface AppConfig {
  // App Settings
  appName: string;
  appVersion: string;
  appDescription: string;
  
  // API Settings
  apiTimeout: number;
  maxRetries: number;
  
  // Feature Flags
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
    debugMode: boolean;
  };
  
  // UI Settings
  ui: {
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  
  // Cache Settings
  cache: {
    defaultTTL: number;
    maxSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  
  private config: AppConfig;
  
  constructor(private environmentService: EnvironmentService) {
    this.config = this.initializeConfig();
  }
  
  /**
   * Get the complete application configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }
  
  /**
   * Get a specific configuration value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
  
  /**
   * Get feature flag value
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }
  
  /**
   * Get UI setting
   */
  getUISetting<K extends keyof AppConfig['ui']>(key: K): AppConfig['ui'][K] {
    return this.config.ui[key];
  }
  
  /**
   * Get cache setting
   */
  getCacheSetting<K extends keyof AppConfig['cache']>(key: K): AppConfig['cache'][K] {
    return this.config.cache[key];
  }
  
  /**
   * Initialize configuration based on environment
   */
  private initializeConfig(): AppConfig {
    const env = this.environmentService.config;
    
    return {
      appName: env.appName,
      appVersion: env.appVersion,
      appDescription: 'Tech Trend Talks - Your source for the latest technology trends and insights',
      
      apiTimeout: 30000, // 30 seconds
      maxRetries: env.isProduction ? 1 : 3,
      
      features: {
        darkMode: true,
        notifications: true,
        analytics: env.enableAnalytics,
        debugMode: env.enableDebug
      },
      
      ui: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MMM dd, yyyy',
        timeFormat: 'HH:mm'
      },
      
      cache: {
        defaultTTL: env.cacheTimeout,
        maxSize: env.isProduction ? 100 : 50
      }
    };
  }
}
