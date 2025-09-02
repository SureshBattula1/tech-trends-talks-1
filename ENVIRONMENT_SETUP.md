# Environment Setup & Build Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Environment Configurations](#environment-configurations)
- [Build Commands](#build-commands)
- [Deployment Instructions](#deployment-instructions)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This document provides comprehensive instructions for setting up and building the **Tech Trends Talks** Angular application across three different environments:

- **Development** (Local) - `http://127.0.0.1:8000/api`
- **Staging** (Testing) - `https://testing.api.techtrendstalks.com/api`
- **Production** - `https://api.techtrendstalks.com/api`

---

## 🔧 Environment Configurations

### 1. Development Environment (Local)

**File:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  development: true,
  staging: false,
  
  // API Configuration
  apiUrl: 'http://127.0.0.1:8000/api',
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
```

**Use Case:** Local development with your local API server running on port 8000.

---

### 2. Staging Environment (Testing)

**File:** `src/environments/environment.staging.ts`

```typescript
export const environment = {
  production: false,
  development: false,
  staging: true,
  
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
  sentryDsn: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx',
  
  // Cache Configuration
  cacheTimeout: 600000, // 10 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'staging'
};
```

**Use Case:** Testing environment for QA and pre-production testing.

---

### 3. Production Environment

**File:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  development: false,
  staging: false,
  
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
  sentryDsn: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx',
  
  // Cache Configuration
  cacheTimeout: 900000, // 15 minutes
  
  // Build Information
  buildDate: new Date().toISOString(),
  buildNumber: 'prod'
};
```

**Use Case:** Live production environment for end users.

---

## 🚀 Build Commands

### Development Environment

```bash
# Start development server with local API
ng serve --configuration development

# Or use the npm script
npm run start:dev

# Build for development
ng build --configuration development

# Build with watch mode
ng build --configuration development --watch
```

**Features:**
- ✅ Debug mode enabled
- ✅ Logging enabled
- ✅ Source maps enabled
- ✅ Hot reload enabled
- ❌ Analytics disabled
- ❌ Optimization disabled

---

### Staging Environment

```bash
# Start staging server with testing API
ng serve --configuration staging

# Or use the npm script
npm run start:staging

# Build for staging
ng build --configuration staging

# Build with optimization
ng build --configuration staging --optimization
```

**Features:**
- ✅ Debug mode enabled
- ✅ Logging enabled
- ✅ Analytics enabled (staging GA)
- ✅ Source maps enabled
- ✅ Basic optimization

---

### Production Environment

```bash
# Build for production
ng build --configuration production

# Or use the npm script
npm run build:prod

# Build with full optimization
ng build --configuration production --optimization --aot

# Build with source maps (for debugging)
ng build --configuration production --source-map
```

**Features:**
- ❌ Debug mode disabled
- ❌ Logging disabled
- ✅ Analytics enabled (production GA)
- ❌ Source maps disabled (by default)
- ✅ Full optimization enabled
- ✅ AOT compilation enabled

---

## 📦 Deployment Instructions

### 1. Local Development Deployment

```bash
# Install dependencies
npm install

# Start local development server
npm run start:dev

# Access the application
# Frontend: http://localhost:4200
# API: http://127.0.0.1:8000/api
```

### 2. Staging Deployment

```bash
# Build for staging
npm run build:staging

# The build output will be in: dist/tech-trends-talks-1/browser/
# Deploy the contents to your staging server

# For testing the build locally:
npx http-server dist/tech-trends-talks-1/browser/ -p 8080
```

### 3. Production Deployment

```bash
# Build for production
npm run build:prod

# The build output will be in: dist/tech-trends-talks-1/browser/
# Deploy the contents to your production server

# For testing the production build locally:
npx http-server dist/tech-trends-talks-1/browser/ -p 8080
```

---

## 🔍 Environment-Specific Features

### Development Environment
- **API Endpoint:** `http://127.0.0.1:8000/api`
- **Debug Console:** Full debug information
- **Error Logging:** Detailed error messages
- **Hot Reload:** Instant code changes
- **Source Maps:** Full debugging capability

### Staging Environment
- **API Endpoint:** `https://testing.api.techtrendstalks.com/api`
- **Analytics:** Staging Google Analytics
- **Error Tracking:** Staging Sentry DSN
- **Performance:** Basic optimization
- **Testing:** Full feature testing

### Production Environment
- **API Endpoint:** `https://api.techtrendstalks.com/api`
- **Analytics:** Production Google Analytics
- **Error Tracking:** Production Sentry DSN
- **Performance:** Full optimization
- **Security:** HTTPS only

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. API Connection Issues
```bash
# Check if API server is running
curl http://127.0.0.1:8000/api/health

# Check network connectivity
ping testing.api.techtrendstalks.com
```

#### 2. Build Failures
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean
```

#### 3. Environment Configuration Issues
```bash
# Verify environment file is being used
ng build --configuration development --verbose

# Check environment variables
echo $NODE_ENV
```

### Debug Commands

```bash
# Check Angular version
ng version

# Check Node.js version
node --version

# Check npm version
npm --version

# List all available configurations
ng config --help
```

---

## 📋 Pre-deployment Checklist

### Development
- [ ] Local API server running on port 8000
- [ ] All dependencies installed
- [ ] Environment file configured correctly
- [ ] No console errors
- [ ] All features working locally

### Staging
- [ ] Staging API accessible
- [ ] Google Analytics ID configured
- [ ] Sentry DSN configured
- [ ] Build completes without errors
- [ ] All features tested

### Production
- [ ] Production API accessible
- [ ] Google Analytics ID configured
- [ ] Sentry DSN configured
- [ ] SSL certificates valid
- [ ] Performance optimized
- [ ] Security headers configured

---

## 🔒 Security Considerations

### Environment Variables
```bash
# Never commit sensitive data to version control
# Use environment variables for:
- API Keys
- Database Credentials
- Analytics IDs
- Sentry DSNs
```

### HTTPS Requirements
- **Development:** HTTP allowed for local development
- **Staging:** HTTPS recommended
- **Production:** HTTPS required

### API Security
- Implement proper CORS policies
- Use authentication tokens
- Validate all API responses
- Implement rate limiting

---

## 📊 Monitoring & Analytics

### Google Analytics Setup
1. Create GA4 property for each environment
2. Update `googleAnalyticsId` in environment files
3. Test tracking in staging before production

### Sentry Error Tracking
1. Create Sentry project for each environment
2. Update `sentryDsn` in environment files
3. Configure error sampling rates

### Performance Monitoring
- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Track API response times
- Monitor user experience metrics

---

## 🚀 Quick Start Commands

### For New Developers
```bash
# Clone the repository
git clone <repository-url>
cd tech-trends-talks-1

# Install dependencies
npm install

# Start development server
npm run start:dev

# Access the application
open http://localhost:4200
```

### For Deployment
```bash
# Staging deployment
npm run build:staging
# Deploy dist/tech-trends-talks-1/browser/ to staging server

# Production deployment
npm run build:prod
# Deploy dist/tech-trends-talks-1/browser/ to production server
```

---

## 📞 Support

For issues related to:
- **Environment Configuration:** Check this document
- **Build Issues:** Check Angular CLI documentation
- **API Issues:** Contact backend team
- **Deployment Issues:** Contact DevOps team

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Maintainer:** Tech Trends Talks Team
