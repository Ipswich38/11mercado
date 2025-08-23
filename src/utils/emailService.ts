// Email service utility for sending messages to 11mercado.pta@gmail.com
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  from: string;
  timestamp: string;
  type: 'contact' | 'project-proposal' | 'donation-receipt';
}

const PTA_EMAIL = EMAIL_CONFIG.PTA.EMAIL;

// Real email sending using EmailJS
export const sendEmailToPTA = async (data: Partial<EmailData>): Promise<boolean> => {
  try {
    const emailData: EmailData = {
      to: PTA_EMAIL,
      subject: data.subject || 'Message from 11Mercado App',
      content: data.content || '',
      from: data.from || 'app@11mercado.com',
      timestamp: new Date().toISOString(),
      type: data.type || 'contact'
    };

    console.log('📧 Sending email to PTA:', emailData);

    // Check if EmailJS is enabled and configured
    if (EMAIL_CONFIG.EMAILJS.ENABLED && EMAIL_CONFIG.EMAILJS.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      // Attempt to send via EmailJS
      try {
        const result = await emailjs.send(
          EMAIL_CONFIG.EMAILJS.SERVICE_ID,
          EMAIL_CONFIG.EMAILJS.TEMPLATE_ID,
          {
            to_email: PTA_EMAIL,
            from_name: emailData.from,
            from_email: emailData.from,
            subject: emailData.subject,
            message: emailData.content,
            timestamp: emailData.timestamp
          },
          EMAIL_CONFIG.EMAILJS.PUBLIC_KEY
        );

        if (result.status === 200) {
          console.log('✅ Email sent successfully via EmailJS');
          
          // Store successful send in localStorage for tracking
          const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
          sentEmails.push({ ...emailData, status: 'sent', service: 'emailjs' });
          localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
          
          return true;
        } else {
          throw new Error(`EmailJS returned status: ${result.status}`);
        }
      } catch (emailjsError) {
        console.warn('⚠️ EmailJS failed, trying fallback method:', emailjsError);
        throw emailjsError;
      }
    }
    
    // EmailJS not configured or disabled - use fallback method
    console.log('📧 EmailJS not configured, using fallback method');
    
    if (EMAIL_CONFIG.FALLBACK.USE_MAILTO) {
      const success = await sendViaMailtoFallback(emailData);
      if (success) {
        // Store as fallback send
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push({ ...emailData, status: 'sent_via_mailto', service: 'mailto' });
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
        return true;
      }
    }
    
    throw new Error('No email service configured and fallback failed');
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Store failed attempt for admin review if enabled
    if (EMAIL_CONFIG.FALLBACK.STORE_FAILED_ATTEMPTS) {
      const failedEmails = JSON.parse(localStorage.getItem('failedEmails') || '[]');
      failedEmails.push({
        ...data,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('failedEmails', JSON.stringify(failedEmails));
    }
    
    return false;
  }
};

// Fallback method using mailto
const sendViaMailtoFallback = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Prepare mailto URL with proper encoding
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.content);
    const mailtoUrl = `mailto:${PTA_EMAIL}?subject=${subject}&body=${body}`;
    
    // Try to open user's email client
    const opened = window.open(mailtoUrl, '_self');
    
    // Small delay to allow the email client to open
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // If we can't open the email client, provide copy-paste instructions
    if (!opened || opened.closed) {
      const copyText = `To: ${PTA_EMAIL}\nSubject: ${emailData.subject}\n\nMessage:\n${emailData.content}`;
      
      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(copyText);
        alert(`📧 Email details copied to clipboard!\n\nPaste into your email application and send to:\n${PTA_EMAIL}`);
      } catch (clipboardError) {
        // Fallback: show email details to copy manually
        alert(`📧 Please copy this information and send via your email:\n\n${copyText}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Mailto fallback failed:', error);
    return false;
  }
};

// Format contact form data for email
export const formatContactEmail = (formData: any): Partial<EmailData> => {
  return {
    subject: `Contact Form: ${formData.subject}`,
    content: `
New contact message received from 11Mercado App:

From: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent via 11Mercado Mobile App
Timestamp: ${new Date().toLocaleString()}
    `,
    from: formData.email,
    type: 'contact'
  };
};

// Format project proposal data for email
export const formatProjectProposalEmail = (formData: any): Partial<EmailData> => {
  return {
    subject: `Project Proposal: ${formData.title}`,
    content: `
New project proposal submitted via 11Mercado App:

PROJECT DETAILS:
Title: ${formData.title}
Category: ${formData.category}
Timeline: ${formData.timeline || 'Not specified'}
Budget: ${formData.budget || 'Not specified'}

DESCRIPTION:
${formData.description}

JUSTIFICATION:
${formData.justification}

PROPOSER INFORMATION:
Name: ${formData.proposedBy}
Email: ${formData.email}

---
Sent via 11Mercado Mobile App
Timestamp: ${new Date().toLocaleString()}
Proposal ID: PROP-${Date.now()}
    `,
    from: formData.email,
    type: 'project-proposal'
  };
};

// Format donation notification email
export const formatDonationNotificationEmail = (donationData: any): Partial<EmailData> => {
  const { amount, allocation, donorName, studentName, referenceNumber, submissionDate, donationMode } = donationData;
  
  return {
    subject: `New Donation Received - ${referenceNumber}`,
    content: `
🎉 NEW DONATION NOTIFICATION
============================

A new donation has been successfully submitted through the 11Mercado App:

DONATION DETAILS:
📋 Reference Number: ${referenceNumber}
💰 Amount: ${amount ? '₱' + parseFloat(amount).toLocaleString() : 'In-kind donation'}
💳 Payment Mode: ${donationMode.toUpperCase()}
📅 Submission Date: ${submissionDate}

DONOR INFORMATION:
👤 Parent/Guardian: ${donorName}
🎓 Student: ${studentName}

${allocation ? `
FUND ALLOCATION:
📊 General SPTA: ₱${allocation.generalSPTA.toLocaleString()}
📊 11Mercado PTA: ₱${allocation.mercadoPTA.toLocaleString()}
` : ''}

NEXT STEPS:
✅ Verify the donation in the Finance Dashboard
✅ Process acknowledgment if required
✅ Update financial records

This is an automated notification from the 11Mercado PTA system.
Access the Finance Dashboard for complete details and documentation.

---
🤖 Automated notification from 11Mercado PTA System
⏰ Generated: ${new Date().toLocaleString()}
    `,
    from: 'donations@11mercado.app',
    type: 'donation-receipt'
  };
};

// Get all sent emails (for demo purposes)
export const getSentEmails = (): EmailData[] => {
  return JSON.parse(localStorage.getItem('sentEmails') || '[]');
};

// Production email setup instructions:
/*
For production deployment, integrate with:

1. EmailJS (https://www.emailjs.com/)
   - Easy client-side email sending
   - Direct integration with Gmail
   - Template support

2. SendGrid API
   - Professional email service
   - High deliverability
   - Analytics and tracking

3. Server-side solution (Node.js/Python)
   - More secure and reliable
   - Better error handling
   - Can integrate with Google Workspace

Example EmailJS integration:
```javascript
import emailjs from '@emailjs/browser';

export const sendEmailToPTA = async (data) => {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: '11mercado.pta@gmail.com',
        from_name: data.from,
        subject: data.subject,
        message: data.content
      },
      'YOUR_PUBLIC_KEY'
    );
    return result.status === 200;
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
};
```
*/