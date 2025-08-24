# 🔧 Vercel Environment Variables Setup

Since `.env.local` files are not committed to git (for security), you need to set environment variables in Vercel:

## Method 1: Vercel Dashboard (Recommended)
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `11mercado` project and click it
3. Go to **Settings** → **Environment Variables**
4. Add these 2 variables:

**Variable 1:**
- Name: `REACT_APP_SUPABASE_URL`
- Value: `https://npsrxmdtzyebwetzynvf.supabase.co`
- Environment: `Production`, `Preview`, `Development` (check all)

**Variable 2:**
- Name: `REACT_APP_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc3J4bWR0enllYndldHp5bnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTc1NTgsImV4cCI6MjA3MTU3MzU1OH0.IOmXTlFCz53kqlchApbFZp6_lJlfTeGJSqel7j8f2NQ`
- Environment: `Production`, `Preview`, `Development` (check all)

5. Click **Save** for each
6. **Trigger a new deployment** (push any small change or use Vercel's redeploy button)

## Method 2: Vercel CLI (Alternative)
```bash
npx vercel env add REACT_APP_SUPABASE_URL
# Enter: https://npsrxmdtzyebwetzynvf.supabase.co

npx vercel env add REACT_APP_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc3J4bWR0enllYndldHp5bnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTc1NTgsImV4cCI6MjA3MTU3MzU1OH0.IOmXTlFCz53kqlchApbFZp6_lJlfTeGJSqel7j8f2NQ
```

## 🚀 After Setting Up:
1. The system will automatically use the centralized database
2. Your ₱240 GCash donation should appear on ALL devices
3. Admin dashboard will show donations from ALL parents
4. No more browser-specific data issues!