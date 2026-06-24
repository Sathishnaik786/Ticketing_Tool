# YVI Enterprise Workforce System (EWS) - Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the YVI Enterprise Workforce System to various environments, including development, staging, and production.

## Deployment Environments

### Development Environment
- Local development with hot-reloading
- Separate database instance for development
- Debug logging enabled
- CORS configured for local development

### Staging Environment
- Pre-production testing environment
- Mirrors production configuration
- Automated testing and validation
- Performance monitoring

### Production Environment
- Live production system
- Optimized for performance and security
- Full security measures enabled
- Comprehensive monitoring and alerting

## Frontend Deployment

### Netlify Deployment

#### Prerequisites
- Netlify account
- Git repository with source code
- Environment variables configured

#### Steps
1. **Connect Repository**
   - Sign in to Netlify dashboard
   - Click "New site from Git"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Choose your repository

2. **Build Configuration**
   ```
   Build command: npm run build
   Publish directory: dist
   Environment variables: Add from .env.example
   ```

3. **Environment Variables**
   - `VITE_API_URL`: Production backend API URL
   - `VITE_SUPABASE_URL`: Production Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Production Supabase anon key

4. **Deploy Settings**
   - Branch to deploy: main/master
   - Deploy context: Production
   - Enable continuous deployment

#### Netlify Configuration File

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "18" }

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[template.environment]
  VITE_API_URL = "API URL for your backend"
  VITE_SUPABASE_URL = "Your Supabase project URL"
  VITE_SUPABASE_ANON_KEY = "Your Supabase anon key"
```

### Vercel Deployment

#### Steps
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from CLI**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure Environment Variables**
   - `VITE_API_URL`: Production backend API URL
   - `VITE_SUPABASE_URL`: Production Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Production Supabase anon key

### Cloudflare Pages Deployment

#### Steps
1. **Connect Repository**
   - Sign in to Cloudflare Dashboard
   - Navigate to Pages
   - Click "Create a project"
   - Connect your Git repository

2. **Build Configuration**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: frontend
   ```

## Backend Deployment

### Render Deployment

#### Prerequisites
- Render account
- Git repository with source code
- Supabase project configured

#### Steps
1. **Create Web Service**
   - Sign in to Render Dashboard
   - Click "New +" and select "Web Service"
   - Connect your Git repository

2. **Configuration**
   ```
   Environment: Node
   Build command: npm install
   Start command: npm start
   Region: Choose your preferred region
   ```

3. **Environment Variables**
   - `PORT`: 10000 (or as assigned by Render)
   - `NODE_ENV`: production
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: Strong secret key for JWT signing
   - `FRONTEND_URL`: Your frontend URL

4. **Health Check**
   - Path: `/health`
   - Success: 200 status code

#### Render Configuration File

Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: yvi-ews-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
    healthCheckPath: /health
```

### Heroku Deployment

#### Steps
1. **Prepare for Heroku**
   - Add Heroku buildpack for Node.js
   - Ensure `start` script in package.json

2. **Deploy via CLI**
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   heroku config:set JWT_SECRET=your_jwt_secret
   git push heroku main
   ```

### Railway Deployment

#### Steps
1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Variables**
   - Set environment variables in Railway dashboard

## Database Deployment (Supabase)

### Production Setup

1. **Create Production Project**
   - Sign in to Supabase Dashboard
   - Create new project
   - Choose production plan
   - Set up organization if needed

2. **Configure Database**
   - Run schema migrations
   - Set up Row-Level Security (RLS) policies
   - Configure authentication settings
   - Set up database connections

3. **Run Schema Files**
   Execute the following SQL files in your Supabase SQL editor:
   - `backend/schema.sql`
   - `backend/rbac_schema.sql`

4. **Configure Authentication**
   - Set up email authentication
   - Configure password policies
   - Set up email templates
   - Configure security settings

5. **Set Up RLS Policies**
   - Enable Row-Level Security on all tables
   - Configure appropriate policies based on roles
   - Test access controls

## Environment Configuration

### Production Environment Variables

#### Backend (.env.production)
```bash
# Server Configuration
PORT=10000
NODE_ENV=production

# Frontend Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# JWT Configuration
JWT_SECRET=your-very-long-production-jwt-secret-key-here-make-it-very-secure

# Security Configuration
TRUST_PROXY=true
```

#### Frontend (.env.production)
```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.onrender.com/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Environment Configuration
VITE_NODE_ENV=production
VITE_APP_NAME=Production - Employee Management System
```

### Environment-Specific Configuration

#### Development
```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3003/api
```

#### Staging
```bash
NODE_ENV=staging
FRONTEND_URL=https://staging.yourdomain.com
VITE_API_URL=https://staging-api.yourdomain.com/api
```

#### Production
```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        cd ../frontend
        npm ci
    - name: Run tests
      run: |
        cd backend
        npm test
        cd ../frontend
        npm run lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './frontend/dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Render
      run: |
        curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## Monitoring and Observability

### Backend Monitoring

#### Health Checks
- **Endpoint**: `/health`
- **Response**: 200 OK with status information
- **Frequency**: Every 30 seconds

#### Logging
- **Format**: JSON structured logging
- **Levels**: info, warn, error
- **Retention**: 30 days for production

### Frontend Monitoring

#### Performance Metrics
- **Page Load Time**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Largest Contentful Paint**: < 2.5 seconds

#### Error Tracking
- **Client-side errors**: Sentry or similar
- **Performance monitoring**: Web Vitals tracking
- **User experience**: Session replay

## Security Deployment

### HTTPS Configuration
- **Frontend**: Force HTTPS in production
- **Backend**: SSL termination at load balancer
- **API**: HTTPS-only communication

### Security Headers
- **CORS**: Production-optimized configuration
- **Helmet**: All security headers enabled
- **Rate Limiting**: Production-appropriate limits

### Environment Security
- **Secrets Management**: Never commit secrets
- **Environment Variables**: Proper isolation
- **Access Control**: Minimal necessary permissions

## Backup and Recovery

### Database Backups
- **Frequency**: Daily automated backups
- **Retention**: 30-day retention
- **Testing**: Monthly restore testing

### Application Backups
- **Code**: Git version control
- **Configuration**: Infrastructure as Code
- **Environment**: Documented deployment procedures

## Rollback Strategy

### Frontend Rollback
1. Identify the problematic deployment
2. Revert to previous stable version
3. Monitor application performance
4. Investigate and fix the issue

### Backend Rollback
1. Identify the problematic changes
2. Revert to previous stable version
3. Monitor API performance and errors
4. Investigate and fix the issue

## Performance Optimization

### Frontend Optimization
- **Bundle Size**: < 250KB initial bundle
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Aggressive caching for static assets

### Backend Optimization
- **Response Time**: < 500ms for most requests
- **Database Queries**: Optimized with proper indexing
- **Caching**: Consider Redis for frequently accessed data

## Scaling Configuration

### Horizontal Scaling
- **Backend**: Multiple instances behind load balancer
- **Database**: Connection pooling configuration
- **Frontend**: CDN distribution

### Auto-Scaling
- **CPU Threshold**: 70% utilization trigger
- **Memory Threshold**: 80% utilization trigger
- **Request Rate**: Based on traffic patterns

## Troubleshooting

### Common Issues

#### Deployment Failures
1. **Check logs** in deployment platform dashboard
2. **Verify environment variables** are properly set
3. **Confirm dependencies** are correctly specified

#### Performance Issues
1. **Monitor response times** and database queries
2. **Check resource utilization** on deployment platform
3. **Review database indexing** and query optimization

#### Security Issues
1. **Verify HTTPS** configuration
2. **Check CORS** settings
3. **Confirm authentication** and authorization

## Post-Deployment Checklist

### Before Going Live
- [ ] All environment variables configured
- [ ] Health checks passing
- [ ] Security scanning completed
- [ ] Performance testing done
- [ ] Backup procedures verified
- [ ] Monitoring configured
- [ ] Rollback plan tested

### After Deployment
- [ ] Monitor application performance
- [ ] Verify user access and functionality
- [ ] Check error logs for issues
- [ ] Confirm security measures working
- [ ] Update documentation if needed

---

*This deployment guide should be updated as deployment procedures evolve and new platforms are supported.*