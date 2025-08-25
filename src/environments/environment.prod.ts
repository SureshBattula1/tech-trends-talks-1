export const environment = {
  production: true,
  development: false,
  staging: false,
  
  // API Configuration
  apiUrl: 'https://api.techtrendtalks.com/api',
  apiVersion: 'v1',
  
  // App Configuration
  appName: 'Tech Trend Talks',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableDebug: false,
  enableLogging: false,
  enableAnalytics: true,
  
  // External Services
  googleAnalyticsId: 'GA_MEASUREMENT_ID', // Replace with actual GA ID
  sentryDsn: 'SENTRY_DSN', // Replace with actual Sentry DSN
  
  // Cache Configuration
  cacheTimeout: 900000, // 15 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'prod'
};
