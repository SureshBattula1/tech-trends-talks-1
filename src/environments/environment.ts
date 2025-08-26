export const environment = {
  production: false,
  development: true,
  staging: false,
  
  // API Configuration
  apiUrl: 'https://testing.api.techtrendstalks.com/api',
  apiVersion: 'v1',
  
  // App Configuration
  appName: 'Tech Trend Talks',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableDebug: true,
  enableLogging: true,
  enableAnalytics: false,
  
  // External Services
  googleAnalyticsId: '',
  sentryDsn: '',
  
  // Cache Configuration
  cacheTimeout: 300000, // 5 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'dev'
};
