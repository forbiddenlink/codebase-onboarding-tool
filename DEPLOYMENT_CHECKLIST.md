# CodeCompass Deployment Checklist

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX  
**Target Environment:** Production (Vercel/Self-Hosted)

This checklist ensures a secure, reliable deployment of CodeCompass to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

#### Required Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string (NOT SQLite in production)
- [ ] `ANTHROPIC_API_KEY` - Valid API key from Anthropic Console
- [ ] `SESSION_SECRET` - Generated with `openssl rand -base64 32` (32+ characters)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (e.g., `https://codecompass.app`)
- [ ] `NODE_ENV` - Set to `production`

#### Recommended Environment Variables (High Priority)
- [ ] `UPSTASH_REDIS_REST_URL` - Redis endpoint for rate limiting & caching
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis auth token
- [ ] `GITHUB_TOKEN` - Personal access token for private repo cloning (if needed)

#### Optional Environment Variables
- [ ] `NEXTAUTH_SECRET` - Same value as `SESSION_SECRET` (backward compatibility)
- [ ] `NEXTAUTH_URL` - Same as `NEXT_PUBLIC_APP_URL`

#### Environment Variable Validation
```bash
# Test environment validation locally
npm run build

# Should fail fast if required variables are missing
# Check logs for: "Environment variable validation failed"
```

### 2. Security Hardening

#### SSL/TLS Configuration
- [ ] SSL certificate installed and verified
- [ ] HTTPS enforced (no HTTP access)
- [ ] Enable HSTS header in `next.config.js`:
```javascript
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
```

#### Security Headers Verification
- [ ] Content Security Policy (CSP) configured
- [ ] X-Frame-Options: DENY (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured (camera, microphone, geolocation restricted)

**Test with:**
```bash
curl -I https://your-domain.com | grep -E "(Content-Security|X-Frame|X-Content|X-XSS|Referrer|Permissions)"
```

#### Session Security
- [ ] `SESSION_SECRET` is 32+ characters (cryptographically random)
- [ ] `SESSION_SECRET` is unique (not copied from examples)
- [ ] `SESSION_SECRET` is stored in secure secret manager (not version control)
- [ ] Cookie settings: `SameSite=Lax` (or `Strict` if no OAuth)

#### API Keys & Secrets
- [ ] All secrets rotated from development values
- [ ] `ANTHROPIC_API_KEY` has appropriate spending limits set
- [ ] No secrets committed to version control (check `.env` in `.gitignore`)
- [ ] Secrets stored in environment-specific secret manager

### 3. Database Migration

#### PostgreSQL Setup (Production)
- [ ] PostgreSQL database provisioned (recommend Supabase, Railway, or Neon)
- [ ] Database user created with least-privilege permissions
- [ ] `DATABASE_URL` uses SSL: `?sslmode=require`
- [ ] Database backups configured (daily recommended)

#### Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Review migration SQL before applying
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# Apply migrations
npx prisma migrate deploy

# Verify tables exist
npx prisma db pull
```

- [ ] Migrations applied successfully
- [ ] Database connection verified
- [ ] Seed data loaded (if applicable)

### 4. Build & Compilation

#### Production Build
```bash
# Install production dependencies
npm ci --production=false

# Run production build
npm run build

# Expected output: "Compiled successfully"
# Build artifacts in: packages/web/.next/
```

- [ ] Build completes without errors
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`) or warnings documented
- [ ] Bundle size reasonable (<5MB for initial JS)

#### Verify Security Fixes
- [ ] Next.js version is 16.1.6+ (check `package.json`)
- [ ] No known CVEs in dependencies: `npm audit --production`
- [ ] DOMPurify installed: `npm ls isomorphic-dompurify`
- [ ] Rate limiting packages installed: `npm ls @upstash/ratelimit @upstash/redis`
- [ ] Zod validation installed: `npm ls zod`

### 5. Testing

#### Manual Security Testing
- [ ] XSS prevention tested (try injecting `<script>alert('XSS')</script>` in search)
- [ ] Rate limiting verified (make 11+ requests to AI endpoint, expect 429)
- [ ] CSRF protection tested (POST to API from different origin, expect 403)
- [ ] Input validation tested (send invalid data, expect 400 with field errors)

#### Automated Tests
```bash
# Run all tests
npm test

# Check test coverage
npm run test:coverage
```

- [ ] All critical tests passing
- [ ] Test coverage >70% for core modules (analyzer, api routes)

#### Performance Testing
- [ ] AI response caching working (check Redis/logs for cache hits)
- [ ] Page load time <3 seconds (use Lighthouse)
- [ ] API response time <500ms (excluding AI calls)
- [ ] Database query performance acceptable

---

## 🚀 Deployment Steps

### Option A: Vercel Deployment (Recommended)

#### 1. Prepare Vercel Project
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

#### 2. Configure Environment Variables in Vercel
```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add ANTHROPIC_API_KEY production
vercel env add SESSION_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add NODE_ENV production
```

Or via Vercel Dashboard:
- [ ] Go to Project Settings > Environment Variables
- [ ] Add all required variables for "Production" environment
- [ ] Verify variables are encrypted at rest

#### 3. Deploy to Production
```bash
# Deploy to production
vercel --prod

# Wait for deployment to complete
# Note the deployment URL
```

- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] No build errors in Vercel logs

#### 4. Configure Custom Domain (Optional)
- [ ] Add custom domain in Vercel Dashboard
- [ ] DNS records updated (A/CNAME)
- [ ] SSL certificate provisioned automatically
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain

### Option B: Self-Hosted Deployment

#### 1. Server Setup
- [ ] Server provisioned (Ubuntu 22.04 LTS recommended)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and configured
- [ ] Redis installed (for rate limiting/caching)
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Let's Encrypt)

#### 2. Application Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd codecompass

# Install dependencies
npm ci --production=false

# Set environment variables
export DATABASE_URL="postgresql://..."
export ANTHROPIC_API_KEY="sk-ant-..."
# ... (set all required variables)

# Build application
npm run build

# Run database migrations
cd packages/web
npx prisma migrate deploy
cd ../..

# Start production server
npm run start
```

#### 3. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start npm --name "codecompass" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

- [ ] Application running on port 3000
- [ ] PM2 process healthy
- [ ] Nginx reverse proxy configured
- [ ] SSL working (https://your-domain.com)

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔍 Post-Deployment Verification

### 1. Health Checks

#### Frontend Health
- [ ] Homepage loads: `https://your-domain.com`
- [ ] Login page accessible: `https://your-domain.com/login`
- [ ] Dashboard accessible (after login): `https://your-domain.com/dashboard`
- [ ] No console errors (check browser DevTools)

#### API Health
```bash
# Test API endpoints
curl https://your-domain.com/api/health

# Test AI endpoint (with auth)
curl -X POST https://your-domain.com/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(\"test\")", "language": "javascript"}'
```

- [ ] API returns 200 OK (or 401 if auth required)
- [ ] No 500 Internal Server Errors
- [ ] Response times acceptable

#### Database Connection
```bash
# Check database connection
npx prisma db pull

# Expected: Schema downloaded successfully
```

- [ ] Database connected
- [ ] Migrations applied
- [ ] Data accessible

### 2. Security Verification

#### Security Headers Test
```bash
# Check security headers
curl -I https://your-domain.com

# Should include:
# - Content-Security-Policy
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - Strict-Transport-Security (if SSL enabled)
```

- [ ] All security headers present
- [ ] CSP policy appropriate (no 'unsafe-inline' in production)
- [ ] HSTS enabled (after SSL verified)

#### Rate Limiting Test
```bash
# Test rate limiting (should get 429 after 10 requests)
for i in {1..15}; do
  curl -X POST https://your-domain.com/api/ai/analyze \
    -H "Content-Type: application/json" \
    -d '{"code": "test", "language": "javascript"}';
done
```

- [ ] Rate limiting active (429 after threshold)
- [ ] Rate limit headers present (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

#### CSRF Protection Test
```bash
# Test CSRF protection (should fail without proper origin)
curl -X POST https://your-domain.com/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -d '{"code": "test"}'

# Expected: 403 Forbidden
```

- [ ] CSRF protection active (403 for cross-origin POST)
- [ ] Same-origin requests succeed

### 3. Performance Verification

#### Page Load Performance
- [ ] Lighthouse score >90 (Performance)
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] No layout shifts (CLS <0.1)

#### Caching Verification
```bash
# Check Redis connection
redis-cli -u $UPSTASH_REDIS_REST_URL ping

# Expected: PONG
```

- [ ] Redis connected (if using Upstash)
- [ ] Cache hit rate monitored (check logs)
- [ ] AI response caching working (check Anthropic API usage)

### 4. Monitoring Setup

#### Error Tracking
- [ ] Error tracking service configured (Sentry, LogRocket, etc.)
- [ ] Error alerts configured
- [ ] Source maps uploaded (for better stack traces)

#### Application Monitoring
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)
- [ ] Performance monitoring (Vercel Analytics, New Relic, etc.)
- [ ] Log aggregation configured (Datadog, Papertrail, etc.)

#### Database Monitoring
- [ ] Database metrics tracked (connections, query time, etc.)
- [ ] Slow query logging enabled
- [ ] Database backup verification scheduled

---

## 🔄 Rollback Procedure

If critical issues arise post-deployment:

### Vercel Rollback
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Self-Hosted Rollback
```bash
# Stop current version
pm2 stop codecompass

# Checkout previous version
git checkout <previous-commit-sha>

# Rebuild
npm run build

# Restart
pm2 restart codecompass
```

### Database Rollback
```bash
# Restore from backup (PostgreSQL)
pg_restore -d codecompass backup.dump

# Or use point-in-time recovery if available
```

- [ ] Rollback procedure tested in staging
- [ ] Backup restoration verified
- [ ] Downtime communication plan ready

---

## 📊 Post-Deployment Monitoring (First 24 Hours)

### Hour 1-4: Initial Monitoring
- [ ] Check error rates (should be <1%)
- [ ] Monitor response times (should be <500ms)
- [ ] Verify rate limiting working
- [ ] Check AI API usage (should match expected traffic)

### Hour 4-12: Stability Check
- [ ] No memory leaks (monitor server RAM)
- [ ] No database connection exhaustion
- [ ] Cache hit rate acceptable (>50%)
- [ ] User feedback positive (no critical bugs reported)

### Hour 12-24: Full Assessment
- [ ] All features working as expected
- [ ] Performance metrics stable
- [ ] No security incidents
- [ ] Monitoring dashboards configured

---

## 🛡️ Security Incident Response

If a security issue is discovered:

1. **Immediate Actions:**
   - [ ] Rollback to previous version (see Rollback Procedure)
   - [ ] Rotate all secrets (`SESSION_SECRET`, `ANTHROPIC_API_KEY`, etc.)
   - [ ] Review logs for unauthorized access

2. **Investigation:**
   - [ ] Identify vulnerability vector
   - [ ] Check for data breaches
   - [ ] Review affected user accounts

3. **Remediation:**
   - [ ] Patch vulnerability
   - [ ] Test fix thoroughly
   - [ ] Re-deploy with fix

4. **Communication:**
   - [ ] Notify affected users (if applicable)
   - [ ] Document incident and resolution
   - [ ] Update security procedures

---

## ✅ Deployment Sign-Off

**Deployed By:** ___________________________  
**Date:** ___________________________  
**Deployment URL:** ___________________________  
**Version:** ___________________________  

**Pre-Deployment Checklist:** ☐ Complete  
**Deployment Steps:** ☐ Complete  
**Post-Deployment Verification:** ☐ Complete  
**Monitoring Setup:** ☐ Complete  

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Approvals:**
- Technical Lead: ___________________________ Date: ___________
- Security Engineer: ___________________________ Date: ___________
- Product Manager: ___________________________ Date: ___________

---

## 🔗 Additional Resources

- [SECURITY_FIXES_SUMMARY.md](SECURITY_FIXES_SUMMARY.md) - Detailed security implementation
- [SECURITY_TESTING.md](SECURITY_TESTING.md) - Security testing procedures (coming soon)
- [README.md](README.md) - General documentation
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)

---

**Last Reviewed:** 2025-01-XX  
**Next Review:** Every release cycle
