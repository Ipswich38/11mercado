// EmailJS Configuration for 11Mercado PTA Email System
// To set up EmailJS for production:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Create a service (connect to Gmail: 11mercado.pta@gmail.com)
// 4. Create a template for contact forms
// 5. Replace the values below with your actual credentials

export const EMAIL_CONFIG = {
  // EmailJS service configuration
  EMAILJS: {
    SERVICE_ID: 'service_11mercado', // Replace with your EmailJS service ID
    TEMPLATE_ID: 'template_contact', // Replace with your template ID  
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your public key
    ENABLED: false // Set to true when EmailJS is configured
  },

  // PTA email settings
  PTA: {
    EMAIL: '11mercado.pta@gmail.com',
    NAME: '11Mercado PTA'
  },

  // Fallback settings
  FALLBACK: {
    USE_MAILTO: true, // Enable mailto fallback when EmailJS fails
    STORE_FAILED_ATTEMPTS: true // Store failed emails for admin review
  }
};

// Production setup instructions:
/*
EMAILJS SETUP STEPS:

1. Sign up at https://www.emailjs.com/
2. Connect Gmail service:
   - Go to Email Services
   - Add Gmail service
   - Connect to: 11mercado.pta@gmail.com
   - Follow OAuth authentication

3. Create email template:
   - Go to Email Templates
   - Create new template
   - Template variables:
     * {{from_name}} - Sender's name
     * {{from_email}} - Sender's email
     * {{subject}} - Email subject
     * {{message}} - Email content
     * {{timestamp}} - When sent

4. Update configuration:
   - Replace SERVICE_ID with your service ID
   - Replace TEMPLATE_ID with your template ID
   - Replace PUBLIC_KEY with your public key
   - Set ENABLED to true

5. Test the integration before going live

Example template content:
---
Subject: {{subject}}

New message from 11Mercado App:

From: {{from_name}} ({{from_email}})
Subject: {{subject}}

Message:
{{message}}

---
Sent via 11Mercado Mobile App
Timestamp: {{timestamp}}
---
*/