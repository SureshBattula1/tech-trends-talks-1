export const environment = {
  production: false,
  development: false,
  staging: true,
  
  // API Configuration
  apiUrl: 'https://staging-api.techtrendtalks.com/api',
  apiVersion: 'v1',
  
  // App Configuration
  appName: 'Tech Trend Talks (Staging)',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableDebug: true,
  enableLogging: true,
  enableAnalytics: true,
  
  // External Services
  googleAnalyticsId: 'GA_MEASUREMENT_ID_STAGING', // Replace with staging GA ID
  sentryDsn: 'SENTRY_DSN_STAGING', // Replace with staging Sentry DSN
  
  // Cache Configuration
  cacheTimeout: 600000, // 10 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'staging'
};
