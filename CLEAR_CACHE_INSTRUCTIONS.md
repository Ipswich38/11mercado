# 🧹 Chrome Cache Clearing Instructions

## The white screen error is caused by cached old JavaScript code in Chrome.

### 🔧 **Clear Chrome Cache Completely:**

1. **Open Chrome Developer Tools** (F12)
2. **Right-click the refresh button** (while DevTools is open)
3. **Select "Empty Cache and Hard Reload"**

OR

1. **Chrome Settings** → **Privacy and Security** → **Clear browsing data**
2. **Time range:** "All time"
3. **Check ALL boxes:**
   - Browsing history
   - Cookies and other site data  
   - **Cached images and files** ← MOST IMPORTANT
   - Hosted app data
   - Site settings
4. **Click "Clear data"**
5. **Close and reopen Chrome completely**
6. **Visit the site fresh**

### 🔄 **Alternative Fix:**
- **Use Incognito/Private mode** - this bypasses all cache
- **Try different browser** (Firefox works as you mentioned)

The error `Cannot read properties of undefined (reading 'receipt')` happens because Chrome is running old cached JavaScript that doesn't have the null safety checks we just added.

After clearing cache completely, Chrome should work like Firefox!