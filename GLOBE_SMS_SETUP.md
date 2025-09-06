# Globe Labs SMS Setup Guide
## 11Mercado PTA Attendance Tracker

This guide will help you set up Globe Labs SMS integration for the attendance tracker using your Globe unlimited text plan.

## 🎯 Overview

Your SMS system will work like this:
1. Parents text a keyword (e.g., "JOIN 11MERCADO") to your Globe Labs short code
2. Globe Labs automatically generates access tokens for each parent
3. When you mark attendance, SMS notifications are sent using your Globe unlimited plan
4. Parents receive attendance alerts directly from your Globe number

## 📋 Setup Steps

### Step 1: Globe Labs Developer Registration

1. **Sign up at Globe Labs:**
   - Go to: https://developer.globelabs.com.ph/users/sign_up
   - Create your developer account
   - Verify your email address

2. **Create Your SMS App:**
   - After login, go to: http://developer.globelabs.com.ph/apps/new
   - Fill in app details:
     - **Name**: `11Mercado PTA Attendance`
     - **Short Description**: `School attendance notification system for parents`
     - **Email Support**: Your school email address
     - **Category**: Select "Education" or "Utilities"
     - **Redirect URI**: `https://your-website.com/api/globe-webhook` (or use localhost for testing)

3. **Note Your App Credentials:**
   - **App ID**: Save this from your app dashboard
   - **App Secret**: Save this from your app dashboard
   - **Short Code**: Globe Labs will assign this (usually 4-5 digits)

### Step 2: Database Setup

1. **Run the Supabase SQL:**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL from: `src/database/sms_subscriptions_table.sql`
   - This creates the table to store parent SMS subscriptions

### Step 3: Webhook Configuration

1. **Deploy Your Webhook Endpoint:**
   - Your webhook endpoint is at: `src/api/globe-webhook.js`
   - Deploy this to your hosting platform (Vercel, Netlify, etc.)
   - Note the URL: `https://your-domain.com/api/globe-webhook`

2. **Configure Globe Labs Webhook:**
   - In your Globe Labs app dashboard
   - Set the webhook URL to receive subscription notifications
   - Enable webhook events for: "Subscription", "Unsubscription", "SMS"

### Step 4: Parent Onboarding

1. **Create Registration Message:**
   Send this to all parents:

   ```
   📱 11Mercado PTA SMS Notifications
   
   Get instant attendance alerts for your child!
   
   TO REGISTER:
   Text: JOIN 11MERCADO
   Send to: [YOUR_SHORT_CODE]
   
   ✅ FREE via your Globe plan
   ✅ Instant attendance updates
   ✅ Safe & secure notifications
   
   Questions? Contact the PTA office.
   ```

2. **Parent Registration Flow:**
   - Parent texts "JOIN 11MERCADO" to your short code
   - Globe sends them a confirmation message
   - Parent replies "YES" to confirm
   - Globe Labs generates access token for their number
   - Your system receives webhook and stores the token
   - Parent gets welcome message from your system

### Step 5: Link Parents to Students

1. **Use the Parent Phone Manager:**
   - In the Attendance Tracker, click "Manage Parent Phones"
   - You'll see two panels:
     - **Left**: All students (with/without phone numbers)
     - **Right**: Active SMS subscriptions from Globe Labs
   
2. **Link Process:**
   - Select a student from the left panel
   - If their parent has subscribed, you'll see their number on the right
   - Click "Link" to connect the parent's phone to the student
   - Or manually enter phone numbers for parents who subscribed

## 🔧 Configuration Files

### Environment Variables (`.env.local`):
```env
# Your Globe number (sender ID)
VITE_GLOBE_SENDER_NUMBER=+639524807848

# Globe Labs API (get these from your app dashboard)
VITE_GLOBE_ACCESS_TOKEN=your_access_token_here

# SMS sender name for messages
VITE_SMS_SENDER_NAME=11Mercado PTA
```

## 📱 How It Works

### For Present Attendance:
```
11Mercado PTA Alert: [Student Name] marked PRESENT today (Sep 6, 2025 at 8:30 AM). Safe learning environment confirmed. ✅
```

### For Absent Attendance:
```
11Mercado PTA Alert: [Student Name] marked ABSENT today (Sep 6, 2025 at 8:30 AM). Reason: Sick with fever. Please ensure student safety. ⚠️
```

### For Late Attendance:
```
11Mercado PTA Alert: [Student Name] marked LATE today (Sep 6, 2025 at 9:15 AM). Student has arrived safely. 🕐
```

## ✅ Testing the System

1. **Test Parent Registration:**
   - Use your own Globe number to text the keyword
   - Verify you receive confirmation messages
   - Check if your subscription appears in the Parent Phone Manager

2. **Test SMS Notifications:**
   - Link your number to a test student
   - Mark the student present/absent
   - Verify you receive the SMS notification

3. **Check SMS Logs:**
   - The Attendance Tracker shows all SMS attempts
   - Monitor for any failed deliveries
   - Check Supabase logs for webhook activity

## 🚨 Troubleshooting

### Parents Not Receiving Messages:
- Verify their subscription status in Parent Phone Manager
- Check if they replied "YES" to Globe's confirmation
- Ensure their number format is correct (+639XXXXXXXXX)

### Webhook Not Working:
- Check if your webhook URL is publicly accessible
- Verify SSL certificate (HTTPS required)
- Check webhook logs in your hosting platform

### SMS Delivery Issues:
- Confirm Globe Labs access tokens are valid
- Check if parent's number is still active
- Verify your Globe unlimited plan is active

## 💡 Best Practices

1. **Regular Monitoring:**
   - Check webhook logs weekly
   - Monitor failed SMS deliveries
   - Review parent subscription status

2. **Parent Communication:**
   - Send monthly reminders about the SMS system
   - Provide clear unsubscribe instructions
   - Keep parents informed about system updates

3. **Privacy & Security:**
   - Only store necessary parent information
   - Use secure HTTPS endpoints
   - Regularly audit access tokens

## 📞 Support

- **Globe Labs Support**: Contact through developer portal
- **Technical Issues**: Check webhook logs and Supabase dashboard
- **Parent Questions**: Direct them to PTA office

---

**🎉 Your SMS system is now ready!** Parents will receive instant attendance notifications using your Globe unlimited text plan, keeping everyone connected and informed about student safety.