# 🚀 Build Commands Quick Reference

## 📋 Environment URLs
- **Development:** `http://127.0.0.1:8000/api`
- **Staging:** `https://testing.api.techtrendstalks.com/api`
- **Production:** `https://api.techtrendstalks.com/api`

---

## 🔧 Development Commands

```bash
# Start development server
npm run start:dev
# OR
ng serve --configuration development

# Build for development
ng build --configuration development

# Build with watch mode
ng build --configuration development --watch
```

**Access:** http://localhost:4200

---

## 🧪 Staging Commands

```bash
# Start staging server
npm run start:staging
# OR
ng serve --configuration staging

# Build for staging
npm run build:staging
# OR
ng build --configuration staging

# Build with optimization
ng build --configuration staging --optimization
```

**Access:** http://localhost:4200 (with staging API)

---

## 🏭 Production Commands

```bash
# Build for production
npm run build:prod
# OR
ng build --configuration production

# Build with full optimization
ng build --configuration production --optimization --aot

# Build with source maps (for debugging)
ng build --configuration production --source-map
```

**Output:** `dist/tech-trends-talks-1/browser/`

---

## 📦 Deployment Commands

```bash
# Test build locally
npx http-server dist/tech-trends-talks-1/browser/ -p 8080

# Deploy to staging
npm run build:staging
# Copy dist/tech-trends-talks-1/browser/ to staging server

# Deploy to production
npm run build:prod
# Copy dist/tech-trends-talks-1/browser/ to production server
```

---

## 🛠️ Utility Commands

```bash
# Install dependencies
npm install

# Clear cache
ng cache clean

# Check versions
ng version
node --version
npm --version

# Lint code
ng lint

# Run tests
ng test

# Generate component
ng generate component component-name

# Generate service
ng generate service service-name
```

---

## 🔍 Debug Commands

```bash
# Check API connectivity
curl http://127.0.0.1:8000/api/health
curl https://testing.api.techtrendstalks.com/api/health
curl https://api.techtrendstalks.com/api/health

# Check build configuration
ng build --configuration development --verbose

# Check environment variables
echo $NODE_ENV
```

---

## 📊 Environment Features

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Debug Mode | ✅ | ✅ | ❌ |
| Logging | ✅ | ✅ | ❌ |
| Analytics | ❌ | ✅ | ✅ |
| Source Maps | ✅ | ✅ | ❌ |
| Optimization | ❌ | ✅ | ✅ |
| AOT Compilation | ❌ | ❌ | ✅ |

---

## 🚨 Common Issues & Solutions

```bash
# Build fails - Clear cache
rm -rf node_modules package-lock.json
npm install

# API not accessible - Check server
curl http://127.0.0.1:8000/api/health

# Port already in use
ng serve --port 4201

# Memory issues
node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build
```

---

## 📞 Quick Help

- **Environment Issues:** Check `ENVIRONMENT_SETUP.md`
- **Build Issues:** Check Angular CLI docs
- **API Issues:** Contact backend team
- **Deployment Issues:** Contact DevOps team

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0
