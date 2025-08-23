# EmailJS Setup Guide for 11Mercado PTA Contact Form

This guide will help you set up EmailJS to enable real email sending from the Contact Us form to `11mercado.pta@gmail.com`.

## Current Status

❌ **Email sending is currently using fallback method (mailto links)**  
✅ **System is safe and won't break - uses fallback when EmailJS is not configured**

## Setup Steps

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Add Gmail Service

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add Service"**
3. Choose **"Gmail"** 
4. Click **"Connect Account"**
5. Sign in with the Gmail account: `11mercado.pta@gmail.com`
6. Grant the necessary permissions
7. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set template name: `"Contact Form Template"`
4. Configure the template:

**Template Subject:**
```
Contact Form: {{subject}}
```

**Template Content:**
```
New message from 11Mercado App:

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Sent via 11Mercado Mobile App
Timestamp: {{timestamp}}
---
```

5. Save the template and copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key

1. Go to **"Account"** → **"General"** 
2. Find your **Public Key** (e.g., `user_abcXYZ123`)

### 5. Update Configuration

Edit the file: `/src/config/emailConfig.ts`

Replace these values:
```typescript
export const EMAIL_CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_your_actual_id', // Replace with step 2
    TEMPLATE_ID: 'template_your_actual_id', // Replace with step 3  
    PUBLIC_KEY: 'your_actual_public_key', // Replace with step 4
    ENABLED: true // Change to true
  },
  // ... rest remains the same
};
```

### 6. Test the Setup

1. Deploy the updated configuration
2. Go to the Contact Us form in the app
3. Send a test message
4. Check `11mercado.pta@gmail.com` inbox
5. Verify the message was received

## Current Behavior (Before Setup)

- ✅ Form validation works
- ✅ Success message appears
- ❌ No actual email sent to `11mercado.pta@gmail.com`  
- ✅ Fallback: Opens user's email client with pre-filled message
- ✅ Messages stored locally for admin review

## After Setup Behavior

- ✅ Form validation works
- ✅ Success message appears  
- ✅ **Real email sent to `11mercado.pta@gmail.com`**
- ✅ Fallback still available if EmailJS fails
- ✅ Messages tracked and stored

## Troubleshooting

### EmailJS Not Working?

1. Check browser console for errors
2. Verify all IDs are correct in config
3. Ensure Gmail service is connected
4. Check EmailJS dashboard logs
5. Make sure template variables match

### Gmail Authentication Issues?

1. Re-authenticate the Gmail service in EmailJS
2. Check if 2FA is enabled (EmailJS supports it)
3. Verify the correct Gmail account is connected

### Still Not Working?

The system will automatically fall back to:
1. Opening user's email client (mailto)
2. Copying email details to clipboard  
3. Showing email details to copy manually

## Free Tier Limits

EmailJS free tier includes:
- ✅ 200 emails/month
- ✅ Gmail integration
- ✅ Template support
- ✅ Basic analytics

This should be sufficient for PTA contact form usage.

## Security Notes

- ✅ Public key is safe to expose (client-side)
- ✅ No sensitive credentials in code
- ✅ EmailJS handles authentication securely
- ✅ All communication encrypted (HTTPS)

---

**⚠️ Important:** Until EmailJS is configured, the contact form will use the fallback method (mailto links). The system is designed to be safe and functional even without EmailJS setup.