# Vercel Deployment Guide for CodeCompass

## Status
✅ Repository pushed to GitHub  
✅ Vercel project linked (`codebase-onboarding-tool`)  
⏳ Configuration needed for monorepo setup

## Required Configuration Steps

### 1. Configure Project Settings on Vercel Dashboard

I've opened the settings page in your browser. Please configure:

**Root Directory:**
- Go to: Settings > General > Root Directory
- Set to: `packages/web`
- Click "Save"

**Build & Development Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (runs at root level)
- Development Command: `npm run dev`

### 2. Environment Variables

Set these in Settings > Environment Variables:

#### Production Environment Variables

**Required:**
```
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

**Authentication (NextAuth.js):**
```
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Database:**
```
DATABASE_URL=<your-production-database-url>
```
*Note: For production, you'll want to use PostgreSQL (Railway, Supabase, Neon, etc.) instead of SQLite*

**Optional (Recommended):**
```
NODE_ENV=production
ENABLE_ADVANCED_ANALYSIS=true
ENABLE_VECTOR_SEARCH=true
LOG_LEVEL=info
ENABLE_ANALYTICS=false
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 3. Deploy

After configuration, run from project root:

```bash
vercel --prod
```

Or simply push to GitHub main branch (auto-deploys if GitHub integration is enabled).

## Alternative: Deploy to Different Vercel Project

If you prefer a clean setup:

```bash
# Remove existing link
rm -rf .vercel

# Deploy fresh with interactive setup
vercel
```

Then select:
- Setup and deploy: Yes
- Scope: Your team/account
- Link to existing project: No
- Project name: codecompass (or your choice)
- Directory: ./ (root)
- Override settings: Yes
  - Root Directory: packages/web
  - Build Command: npm run build
  - Output Directory: .next
  - Development Command: npm run dev

## Database Setup for Production

### Recommended: PostgreSQL on Neon or Supabase

1. **Create a PostgreSQL database:**
   - [Neon](https://neon.tech) - Serverless PostgreSQL (free tier available)
   - [Supabase](https://supabase.com) - PostgreSQL + extras (free tier available)
   - [Railway](https://railway.app) - PostgreSQL hosting

2. **Get your connection string:**
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

3. **Update Vercel environment variables:**
   ```bash
   vercel env add DATABASE_URL production
   # Paste your PostgreSQL connection string
   ```

4. **Run migrations:**
   ```bash
   # SSH into Vercel deployment or use Vercel CLI
   npx prisma migrate deploy
   ```

## Troubleshooting

### Build fails with module not found
**Solution:** Ensure Root Directory is set to `packages/web` in project settings.

### Database connection issues
**Solution:** 
1. Verify DATABASE_URL is set correctly for production
2. Ensure connection string includes `?sslmode=require` for PostgreSQL
3. Run `npx prisma generate` as part of build process

### Environment variables not working
**Solution:**
1. Check variables are set for correct environment (Production, Preview, Development)
2. Redeploy after adding environment variables
3. Use `vercel env ls` to list all environment variables

## Next Steps

1. ✅ Configure Root Directory: `packages/web`
2. ✅ Set environment variables (especially ANTHROPIC_API_KEY, NEXTAUTH_SECRET, DATABASE_URL)
3. ✅ Deploy: `vercel --prod`
4. ✅ Set up production database (PostgreSQL recommended)
5. ✅ Run database migrations
6. ✅ Test deployment
7. ✅ Configure custom domain (optional)

## Quick Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# List environment variables
vercel env ls

# Add environment variable
vercel env add <NAME> <environment>

# Remove a deployment
vercel rm <deployment-url>
```

## Current Project Details

**Project ID:** prj_0UWAasb0xqwfFt2qHPWI4HzxVnAm  
**Project Name:** codebase-onboarding-tool  
**Org:** elizabeth-emersons-projects  
**GitHub:** https://github.com/forbiddenlink/codebase-onboarding-tool  
**Settings URL:** https://vercel.com/elizabeth-emersons-projects/codebase-onboarding-tool/settings
