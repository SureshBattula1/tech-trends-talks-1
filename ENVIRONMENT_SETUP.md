# Environment Configuration Setup

This document explains how to set up and use environment configurations for different deployment environments in the Tech Trend Talks application.

## Overview

The application supports three main environments:
- **Development** (localhost) - For local development
- **Staging** - For testing before production
- **Production** - For live deployment

## Environment Files

### 1. Development Environment (`src/environments/environment.ts`)
- Used for local development
- Debug mode enabled
- Logging enabled
- Analytics disabled
- API points to localhost

### 2. Staging Environment (`src/environments/environment.staging.ts`)
- Used for testing before production
- Debug mode enabled
- Logging enabled
- Analytics enabled (staging tracking)
- API points to staging server

### 3. Production Environment (`src/environments/environment.prod.ts`)
- Used for live deployment
- Debug mode disabled
- Logging disabled
- Analytics enabled
- API points to production server

## Available Scripts

### Development
```bash
# Start development server
npm run start:dev
# or
npm start

# Build for development
npm run build:dev
```

### Staging
```bash
# Start staging server
npm run start:staging

# Build for staging
npm run build:staging
```

### Production
```bash
# Start production server
npm run start:prod

# Build for production
npm run build:prod
```

## Environment Variables

### API Configuration
- `apiUrl`: Base URL for API endpoints
- `apiVersion`: API version string

### Feature Flags
- `enableDebug`: Enable/disable debug logging
- `enableLogging`: Enable/disable general logging
- `enableAnalytics`: Enable/disable analytics tracking

### External Services
- `googleAnalyticsId`: Google Analytics measurement ID
- `sentryDsn`: Sentry error tracking DSN

### Cache Configuration
- `cacheTimeout`: Cache timeout in milliseconds

## Services

### EnvironmentService
Provides easy access to environment configuration:
```typescript
constructor(private envService: EnvironmentService) {}

// Check environment
if (this.envService.isProduction) {
  // Production-specific logic
}

// Get API URL
const apiUrl = this.envService.apiUrl;

// Get API endpoint
const endpoint = this.envService.getApiEndpoint('users');
```

### LoggingService
Respects environment configuration for logging:
```typescript
constructor(private loggingService: LoggingService) {}

// Debug logs only appear in development/staging
this.loggingService.debug('Debug message');

// Info logs respect logging flag
this.loggingService.info('Info message');

// Error logs always appear
this.loggingService.error('Error message');
```

### ApiService
Uses environment configuration for API calls:
```typescript
constructor(private apiService: ApiService) {}

// GET request
this.apiService.get<User[]>('users').subscribe(users => {
  console.log(users);
});

// POST request with headers
const headers = this.apiService.createHeaders({
  'Custom-Header': 'value'
});
this.apiService.post<User>('users', userData, headers);
```

### AppConfigService
Provides centralized application configuration:
```typescript
constructor(private configService: AppConfigService) {}

// Get feature flag
if (this.configService.isFeatureEnabled('darkMode')) {
  // Enable dark mode
}

// Get UI setting
const dateFormat = this.configService.getUISetting('dateFormat');
```

## Configuration

### Angular Configuration
The `angular.json` file includes environment-specific configurations:
- File replacements for environment files
- Build optimizations per environment
- Source map generation settings

### Environment File Replacement
During build, Angular automatically replaces the base environment file with the environment-specific one based on the build configuration.

## Customization

### Adding New Environment Variables
1. Add the variable to all environment files
2. Update the `EnvironmentService` interface if needed
3. Update the `AppConfigService` if it's a configuration setting

### Adding New Environments
1. Create a new environment file (e.g., `environment.test.ts`)
2. Add the configuration to `angular.json`
3. Add build scripts to `package.json`

## Best Practices

1. **Never commit sensitive data** to environment files
2. **Use environment variables** for secrets in production
3. **Test all environments** before deployment
4. **Keep environment files in sync** when adding new variables
5. **Use the services** instead of importing environment directly

## Troubleshooting

### Common Issues

1. **Environment not loading correctly**
   - Check that the environment file exists
   - Verify the file replacement configuration in `angular.json`

2. **Build fails for specific environment**
   - Ensure all environment files have the same structure
   - Check for syntax errors in environment files

3. **API calls pointing to wrong URL**
   - Verify the `apiUrl` in the environment file
   - Check that the correct environment is being built

### Debug Environment
To debug which environment is loaded:
```typescript
constructor(private envService: EnvironmentService) {
  console.log('Current environment:', this.envService.config);
  console.log('Is production?', this.envService.isProduction);
}
```

## Deployment

### Development
- Use `npm run start:dev` or `npm start`
- Environment: `environment.ts`

### Staging
- Use `npm run start:staging`
- Environment: `environment.staging.ts`

### Production
- Use `npm run build:prod`
- Environment: `environment.prod.ts`
- Deploy the `dist/` folder to your production server
