# CodeCompass Security Testing Guide

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX  
**Purpose:** Manual and automated security validation procedures

This guide provides step-by-step instructions for testing all security features implemented in CodeCompass.

---

## 📋 Security Test Checklist

Use this checklist before each deployment:

- [ ] XSS Prevention Testing
- [ ] Rate Limiting Verification
- [ ] CSRF Protection Testing
- [ ] Input Validation Testing
- [ ] Security Headers Verification
- [ ] Authentication Security Testing
- [ ] AI Response Caching Validation
- [ ] Environment Variable Validation
- [ ] Dependency Vulnerability Scanning

---

## 🛡️ Test Procedures

### 1. XSS (Cross-Site Scripting) Prevention

**What we're testing:** Ensure user input is sanitized and cannot execute malicious scripts.

#### Test 1.1: Search XSS Attack
```bash
# Location to test: Search page (http://localhost:3000/search)

# 1. Navigate to search page
# 2. Enter this malicious query:
<script>alert('XSS Vulnerability!')</script>

# Expected Result: 
# - No alert popup appears
# - Search query is displayed as plain text (escaped)
# - HTML tags are rendered as text, not executed

# Alternative test queries:
<img src=x onerror="alert('XSS')">
<svg/onload=alert('XSS')>
javascript:alert('XSS')
```

**✅ PASS Criteria:**
- No JavaScript execution
- Tags rendered as text: `&lt;script&gt;alert('XSS')&lt;/script&gt;`
- Search results highlighted safely (no HTML injection)

**❌ FAIL Criteria:**
- Alert popup appears
- Script executes
- HTML is rendered in page

#### Test 1.2: Code Viewer XSS Attack
```bash
# Location to test: Code viewer (http://localhost:3000/viewer)

# 1. Create a test file with malicious content:
echo '<script>alert("XSS in code")</script>' > /tmp/test-xss.js

# 2. Upload or view this file in the code viewer
# 3. Check syntax highlighting

# Expected Result:
# - Code is displayed with syntax highlighting
# - Script tags are HTML-escaped in the rendered output
# - No alert popup appears
```

**✅ PASS Criteria:**
- Code rendered with proper escaping: `&lt;script&gt;...&lt;/script&gt;`
- Syntax highlighting works
- No JavaScript execution

#### Test 1.3: Note Creation XSS Attack
```bash
# Location to test: Note creation API/UI

# Try creating a note with malicious content:
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(\"XSS\")</script>",
    "content": "<img src=x onerror=\"alert(\"XSS\")\">"
  }'

# Expected Result:
# - Note is created successfully
# - When viewing note, HTML is escaped
# - No script execution when rendering note
```

**✅ PASS Criteria:**
- Note title/content sanitized before storage or on render
- No alert popups when viewing notes

---

### 2. Rate Limiting Verification

**What we're testing:** Ensure API endpoints block excessive requests.

#### Test 2.1: AI Endpoint Rate Limiting (10 req/min)
```bash
# Location: /api/ai/analyze

# Send 15 requests rapidly:
for i in {1..15}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/ai/analyze \
    -H "Content-Type: application/json" \
    -d '{"code": "console.log(\"test\")", "language": "javascript"}' \
    -w "\nHTTP Status: %{http_code}\n" \
    -s -o /dev/null
  sleep 1
done

# Expected Result:
# - Requests 1-10: HTTP 200 (success) or 401 (if auth required)
# - Requests 11-15: HTTP 429 (Too Many Requests)
```

**✅ PASS Criteria:**
- First 10 requests succeed (or 401 if auth required)
- Request 11+ returns 429 with error message
- Response includes headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**❌ FAIL Criteria:**
- All 15 requests succeed (rate limiting not working)
- No 429 responses

#### Test 2.2: Authentication Rate Limiting (5 req/min)
```bash
# Location: /api/auth/login (or equivalent)

# Send 8 login attempts:
for i in {1..8}; do
  echo "Login attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "test", "password": "wrong"}' \
    -w "\nHTTP Status: %{http_code}\n"
  sleep 1
done

# Expected Result:
# - Attempts 1-5: HTTP 401 (unauthorized)
# - Attempts 6-8: HTTP 429 (rate limited)
```

**✅ PASS Criteria:**
- First 5 attempts get auth error (401)
- Attempt 6+ gets rate limit error (429)
- Brute force attacks prevented

#### Test 2.3: Repository Operations Rate Limiting (30 req/min)
```bash
# Location: /api/repositories

# Send 35 requests:
for i in {1..35}; do
  curl -X GET "http://localhost:3000/api/repositories?page=$i" \
    -w "\nHTTP Status: %{http_code}\n" \
    -s -o /dev/null
  sleep 2
done

# Expected Result:
# - Requests 1-30: HTTP 200 (success)
# - Requests 31-35: HTTP 429 (rate limited)
```

#### Test 2.4: Rate Limit Headers
```bash
# Check rate limit headers in response:
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "test", "language": "javascript"}' \
  -I

# Expected headers:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 9
# X-RateLimit-Reset: <timestamp>
```

**✅ PASS Criteria:**
- Rate limit headers present in all responses
- `Remaining` count decreases with each request
- `Reset` timestamp is Unix epoch time

---

### 3. CSRF (Cross-Site Request Forgery) Protection

**What we're testing:** Prevent unauthorized POST/PUT/DELETE from external sites.

#### Test 3.1: Missing Origin Header
```bash
# Try POST request without Origin header:
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "test", "language": "javascript"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result: 
# - HTTP 403 Forbidden (CSRF protection active)
# - Error message: "Invalid origin" or similar
```

**✅ PASS Criteria:**
- Request blocked with 403
- Error message indicates CSRF protection

#### Test 3.2: Invalid Origin Header
```bash
# Try POST with malicious origin:
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil-site.com" \
  -d '{"code": "test", "language": "javascript"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 403 Forbidden
# - Request rejected due to origin mismatch
```

**✅ PASS Criteria:**
- Cross-origin POST requests blocked
- Only requests from `NEXT_PUBLIC_APP_URL` allowed

#### Test 3.3: Valid Origin Header
```bash
# POST with correct origin should succeed:
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"code": "console.log(\"test\")", "language": "javascript"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 200 (or 401 if auth required)
# - Request processed normally
```

**✅ PASS Criteria:**
- Same-origin requests succeed
- Application functions normally

#### Test 3.4: GET Requests (Not Protected)
```bash
# GET requests should NOT be blocked by CSRF:
curl -X GET http://localhost:3000/api/repositories \
  -H "Origin: https://any-site.com" \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 200 (GET requests allowed from any origin)
```

**✅ PASS Criteria:**
- GET requests not blocked (CSRF only applies to state-changing methods)

---

### 4. Input Validation Testing

**What we're testing:** Zod schema validation rejects invalid data.

#### Test 4.1: AI Analyze - Invalid Code Length
```bash
# Code must be 1-50,000 characters
# Test with empty code:
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"code": "", "language": "javascript"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 400 Bad Request
# - Error message: "Code must be between 1 and 50000 characters"
```

**✅ PASS Criteria:**
- 400 status code
- Detailed validation error with field name

#### Test 4.2: AI Analyze - Invalid Language
```bash
# Language must be valid enum value
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"code": "test", "language": "invalid-lang"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 400 Bad Request
# - Error indicates invalid language value
```

#### Test 4.3: AI Analyze - Question Too Long
```bash
# Question maximum is 1000 characters
LONG_QUESTION=$(python3 -c "print('a' * 1001)")

curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"code\": \"test\", \"language\": \"javascript\", \"question\": \"$LONG_QUESTION\"}" \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 400 Bad Request
# - Error: "Question must be at most 1000 characters"
```

#### Test 4.4: Repository Clone - Invalid URL
```bash
# URL must be valid GitHub/GitLab/Bitbucket URL
curl -X POST http://localhost:3000/api/repositories/clone \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"url": "not-a-valid-url"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 400 Bad Request
# - Error indicates invalid URL format
```

#### Test 4.5: Note Creation - Title Too Long
```bash  
# Title must be 1-200 characters
LONG_TITLE=$(python3 -c "print('a' * 201)")

curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"title\": \"$LONG_TITLE\", \"content\": \"test\"}" \
  -w "\nHTTP Status: %{http_code}\n"

# Expected Result:
# - HTTP 400 Bad Request
# - Error: "Title must be at most 200 characters"
```

**✅ PASS Criteria (All Tests):**
- All invalid inputs return 400 status
- Error messages are descriptive and field-specific
- Valid data after fixing validation passes

---

### 5. Security Headers Verification

**What we're testing:** HTTP security headers are present and correct.

#### Test 5.1: Check All Security Headers
```bash
# Fetch headers from homepage:
curl -I http://localhost:3000

# Expected headers (check output):
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**✅ PASS Criteria:**
- All 6+ security headers present
- `X-Frame-Options: DENY` (prevents clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `Content-Security-Policy` includes appropriate directives

#### Test 5.2: CSP Violation Testing
```bash
# Try loading external script (should be blocked by CSP):
# 1. Open http://localhost:3000 in browser
# 2. Open DevTools Console
# 3. Paste this:
var script = document.createElement('script');
script.src = 'https://evil-site.com/malicious.js';
document.head.appendChild(script);

# Expected Result:
# - Browser console shows CSP violation error
# - Script is NOT loaded or executed
# - Error: "Refused to load script from 'https://evil-site.com/malicious.js' because it violates CSP directive"
```

**✅ PASS Criteria:**
- CSP blocks external script loading
- Console shows violation error

#### Test 5.3: HSTS Header (Production Only)
```bash
# In production with HTTPS:
curl -I https://your-domain.com

# Expected header:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**✅ PASS Criteria:**
- HSTS header present in production over HTTPS
- `max-age` is at least 1 year (31536000 seconds)

---

### 6. Authentication Security Testing

**What we're testing:** Session management and authentication flows.

#### Test 6.1: Session Secret Strength
```bash
# Check .env file:
cat .env | grep SESSION_SECRET

# Expected:
# - At least 32 characters
# - Not the default value from .env.example
# - Cryptographically random (not simple words)
```

**✅ PASS Criteria:**
- SESSION_SECRET is 32+ characters
- Unique value (not copied from examples)
- Random and unpredictable

#### Test 6.2: Session Cookie Security
```bash
# Login and check cookie attributes:
# 1. Open browser DevTools > Application > Cookies
# 2. Login to application
# 3. Check session cookie attributes

# Expected attributes:
# - HttpOnly: true (prevents JavaScript access)
# - Secure: true (HTTPS only in production)
# - SameSite: Lax or Strict (CSRF protection)
# - Path: /
```

**✅ PASS Criteria:**
- `HttpOnly` flag set (XSS protection)
- `Secure` flag in production
- `SameSite` is `Lax` or `Strict`

#### Test 6.3: Logout Invalidation
```bash
# 1. Login and save session cookie
# 2. Logout
# 3. Try using old session cookie to access protected page

curl -X GET http://localhost:3000/api/user/profile \
  -H "Cookie: session=<old-session-cookie>"

# Expected Result:
# - HTTP 401 Unauthorized
# - Session is properly invalidated
```

**✅ PASS Criteria:**
- Old session cookies rejected after logout
- User must re-authenticate

---

### 7. AI Response Caching Validation

**What we're testing:** Cache reduces API calls and costs.

#### Test 7.1: Cache Hit Test
```bash
# Send same request twice:
CODE_SAMPLE='console.log("Hello, World!");'

# First request (cache miss):
TIME1=$(date +%s)
curl -X POST http://localhost:3000/api/ai/explain \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"code\": \"$CODE_SAMPLE\", \"language\": \"javascript\"}" \
  -w "\nTime: %{time_total}s\n"
TIME1_END=$(date +%s)

# Wait 2 seconds
sleep 2

# Second request (should be cache hit):
TIME2=$(date +%s)
curl -X POST http://localhost:3000/api/ai/explain \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"code\": \"$CODE_SAMPLE\", \"language\": \"javascript\"}" \
  -w "\nTime: %{time_total}s\n"
TIME2_END=$(date +%s)

# Expected Result:
# - First request: ~2-5 seconds (API call to Claude)
# - Second request: <100ms (cache hit)
# - Check server logs for "Cache hit" message
```

**✅ PASS Criteria:**
- Second request significantly faster (>10x speedup)
- Server logs show "Cache hit: ai-explain-..."
- Same response content for both requests

#### Test 7.2: Cache Key Differentiation
```bash
# Different code should have different cache keys:
curl -X POST http://localhost:3000/api/ai/explain \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"code": "console.log(\"A\");", "language": "javascript"}'

curl -X POST http://localhost:3000/api/ai/explain \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"code": "console.log(\"B\");", "language": "javascript"}'

# Expected Result:
# - Both are cache misses (different code = different keys)
# - Different responses generated
```

**✅ PASS Criteria:**
- Different inputs generate different cache keys
- Cache doesn't return wrong results for different code

#### Test 7.3: Cache TTL Verification
```bash
# Check cache expiration (requires Redis CLI or in-memory stats):

# For Redis:
redis-cli -u $UPSTASH_REDIS_REST_URL TTL "ai-explain-<cache-key>"

# Expected:
# - Explain responses: 604800 seconds (7 days)
# - Analyze responses: 86400 seconds (1 day)
# - Suggest responses: 3600 seconds (1 hour)
```

**✅ PASS Criteria:**
- TTL values match expected durations
- Cached responses expire appropriately

---

### 8. Environment Variable Validation

**What we're testing:** Application fails fast on misconfiguration.

#### Test 8.1: Missing Required Variable
```bash
# Remove required variable and start app:
mv .env .env.backup
cat .env.backup | grep -v "DATABASE_URL" > .env

npm run build

# Expected Result:
# - Build fails immediately
# - Error message: "Environment variable validation failed"
# - Specific error about missing DATABASE_URL
```

**✅ PASS Criteria:**
- Application fails to start
- Clear error message about missing variable
- Specific field name in error

#### Test 8.2: Invalid Variable Format
```bash
# Set invalid value:
echo "SESSION_SECRET=short" >> .env

npm run build

# Expected Result:
# - Build fails
# - Error: "SESSION_SECRET must be at least 32 characters"
```

**✅ PASS Criteria:**
- Validation catches format errors
- Detailed error messages

#### Test 8.3: Optional Variable Missing (Should Work)
```bash
# Remove optional variable:
cat .env.backup | grep -v "UPSTASH_REDIS" > .env

npm run build

# Expected Result:
# - Build succeeds
# - App runs without Redis (in-memory fallback)
```

**✅ PASS Criteria:**
- Application starts successfully
- Logs indicate in-memory cache fallback

---

### 9. Dependency Vulnerability Scanning

**What we're testing:** No known security vulnerabilities in dependencies.

#### Test 9.1: NPM Audit
```bash
# Run npm audit:
npm audit --production

# Expected Result:
# - 0 critical vulnerabilities
# - 0-5 high vulnerabilities (acceptable if low risk)
# - 0-10 moderate vulnerabilities
```

**✅ PASS Criteria:**
- 0 critical vulnerabilities
- All high vulnerabilities reviewed and mitigated or accepted
- Audit report reviewed before deployment

#### Test 9.2: Outdated Packages
```bash
# Check for outdated packages:
npm outdated

# Focus on security-related packages:
# - next (should be 16.1.6+)
# - isomorphic-dompurify (should be 2.16.0+)
# - zod (should be latest)
```

**✅ PASS Criteria:**
- Next.js is version 16.1.6 or higher
- All security packages are up-to-date

#### Test 9.3: License Compliance
```bash
# Check dependency licenses:
npx license-checker --summary

# Expected:
# - No GPL licenses (unless acceptable)
# - Mostly MIT, ISC, Apache-2.0, BSD
```

**✅ PASS Criteria:**
- No license conflicts
- All licenses compatible with project license (MIT)

---

## 🤖 Automated Security Testing

### Setup Jest Security Tests

Create `packages/web/__tests__/security.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    it('should sanitize HTML in search results', () => {
      const { sanitizeHtml } = require('@/lib/security');
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });
  });

  describe('Input Validation', () => {
    it('should reject code longer than 50,000 characters', async () => {
      const { analyzeRequestSchema } = require('@/lib/validation');
      const longCode = 'a'.repeat(50001);
      
      expect(() => {
        analyzeRequestSchema.parse({ code: longCode, language: 'javascript' });
      }).toThrow();
    });
  });

  describe('Environment Validation', () => {
    it('should validate SESSION_SECRET length', () => {
      const { envSchema } = require('@/lib/env');
      
      expect(() => {
        envSchema.parse({ SESSION_SECRET: 'short' });
      }).toThrow('at least 32 characters');
    });
  });
});
```

Run with:
```bash
npm test -- security.test.ts
```

---

## 📊 Security Testing Report Template

After completing tests, document results:

```markdown
# Security Testing Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development / Staging / Production
**Version:** X.Y.Z

## Test Results Summary

| Category | Tests Run | Passed | Failed | Notes |
|----------|-----------|---------|--------|-------|
| XSS Prevention | 3 | 3 | 0 | All inputs sanitized correctly |
| Rate Limiting | 4 | 4 | 0 | All tiers working as expected |
| CSRF Protection | 4 | 4 | 0 | Origin validation successful |
| Input Validation | 5 | 5 | 0 | Zod schemas rejecting invalid data |
| Security Headers | 3 | 3 | 0 | All headers present |
| Authentication | 3 | 3 | 0 | Sessions secure, logout working |
| Caching | 3 | 3 | 0 | 65% cache hit rate observed |
| Environment | 3 | 3 | 0 | Validation working correctly |
| Dependencies | 3 | 3 | 0 | 0 critical vulnerabilities |

**Overall Score:** 35/35 (100%)

## Issues Found

None

## Recommendations

- Monitor cache hit rates in production
- Review rate limits after first week of usage
- Consider adding Web Application Firewall (WAF)

**Approved for Deployment:** ☑ Yes  ☐ No

**Signature:** ____________________  Date: __________
```

---

## 🔄 Continuous Security Testing

### Daily Checks (Automated)
- [ ] Run `npm audit` in CI/CD pipeline
- [ ] Check for outdated security packages
- [ ] Monitor error rates (should be <1%)

### Weekly Checks
- [ ] Review rate limiting effectiveness
- [ ] Check cache hit rates
- [ ] Review authentication logs for suspicious activity

### Monthly Checks
- [ ] Full manual security test suite
- [ ] Dependency updates and security patches
- [ ] Review and rotate SESSION_SECRET if needed

### Quarterly Checks
- [ ] External security audit (if budget allows)
- [ ] Penetration testing
- [ ] Compliance review (GDPR, SOC2, etc.)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [SECURITY_FIXES_SUMMARY.md](SECURITY_FIXES_SUMMARY.md) - Implementation details
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Production deployment guide

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Security Team  
**Review Frequency:** Quarterly
