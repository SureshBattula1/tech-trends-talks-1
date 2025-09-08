export const environment = {
  production: false,
  development: false,
  staging: true,
  
  
  // BASE URL
  baseUrl: 'https://testing.api.techtrendstalks.com',

  // API Configuration
  apiUrl: 'https://testing.api.techtrendstalks.com/api',
  apiVersion: 'v1',
  
  // App Configuration
  appName: 'Tech Trend Talks (Staging)',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableDebug: true,
  enableLogging: true,
  enableAnalytics: true,
  
  // External Services
  googleAnalyticsId: 'G-XXXXXXXXXX', // Replace with staging GA ID
  sentryDsn: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx', // Replace with staging Sentry DSN
  
  // Cache Configuration
  cacheTimeout: 600000, // 10 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'staging'
};
