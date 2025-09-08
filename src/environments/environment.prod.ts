export const environment = {
  production: true,
  development: false,
  staging: false,

  // BASE URL
  baseUrl: 'https://api.techtrendstalks.com',
  
  // API Configuration
  apiUrl: 'https://api.techtrendstalks.com/api',
  apiVersion: 'v1',
  
  // App Configuration
  appName: 'Tech Trend Talks',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableDebug: false,
  enableLogging: false,
  enableAnalytics: true,
  
  // External Services
  googleAnalyticsId: 'G-XXXXXXXXXX', // Replace with actual GA4 ID
  sentryDsn: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx', // Replace with actual Sentry DSN
  
  // Cache Configuration
  cacheTimeout: 900000, // 15 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'prod'
};
