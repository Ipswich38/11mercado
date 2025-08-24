# 🚀 Supabase Centralized Database Setup

## Quick Setup Guide (5 minutes)

### 1. Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign up" and create account (free tier is enough)
3. Click "New project"
4. Fill in details:
   - **Name**: `11mercado-pta-donations`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to Philippines (Singapore recommended)
5. Click "Create new project" and wait 2-3 minutes

### 2. Get Your Project Keys
1. Once project is created, go to **Settings** → **API**
2. Copy these 2 values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Create Environment File
1. In your project root, create file `.env.local`
2. Add these lines (replace with your actual values):
```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

### 4. Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Copy contents of `supabase_schema.sql` file
3. Paste into SQL Editor and click **Run**
4. You should see success message: "Database schema created successfully!"

### 5. Test the System
1. Restart your development server: `npm run dev`
2. Submit a test donation through your donation form
3. Check Supabase dashboard → **Table Editor** → **donations**
4. You should see your test donation appear!

## 🎯 What This Fixes

**Before (localStorage):**
❌ Each device/browser has isolated data  
❌ Your smartphone shows ₱240, laptop shows ₱0  
❌ Only you see your own donations  
❌ No real admin dashboard  

**After (Supabase):**
✅ **Single source of truth** - all devices show same data  
✅ **Multi-user system** - see donations from ALL parents  
✅ **Real admin dashboard** - central view of everything  
✅ **Automatic sync** - no more browser cache issues  

## 🔧 Important Notes

- **Free tier**: 500MB database, 2GB bandwidth/month (more than enough)
- **Automatic backups**: Your data is safely stored in cloud
- **Real-time updates**: New donations appear instantly
- **Offline support**: Still works offline, syncs when back online
- **Security**: Data is encrypted and secure

## 🆘 Troubleshooting

**If donations don't appear:**
1. Check browser console for error messages
2. Verify `.env.local` file has correct keys
3. Make sure database tables were created successfully
4. Try clearing browser cache and hard refresh

**If you see "offline" messages:**
- The system will work offline and sync when connection returns
- Check your internet connection
- Verify Supabase project URL is accessible

## 📊 Verifying Success

After setup, your Admin Dashboard should show:
- **Total donations from ALL users** (not just your device)
- **Recent entries from all parents** 
- **Real-time updates** when new donations are submitted
- **Search across all donations** in Receipt Recovery
- **Centralized file attachments** (images/receipts)

Your ₱240 GCash donation should now appear on **all devices** including your laptop browsers!

## 🔄 Migration Process

The system automatically handles migration:
1. **Existing localStorage data** is kept as backup
2. **New submissions** go to centralized database
3. **Admin Dashboard** shows combined data from both sources
4. **Gradual migration** - no data loss

Once verified working, you can clear old localStorage data using the "Clear Data" button in Admin → Data Sync tab.