// Email service utility for sending messages to 11mercado.pta@gmail.com
// This simulates email sending and provides structure for actual implementation

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  from: string;
  timestamp: string;
  type: 'contact' | 'project-proposal' | 'donation-receipt';
}

const PTA_EMAIL = '11mercado.pta@gmail.com';

// Simulate email sending (in production, this would use a real email service)
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

    // Log the email that would be sent
    console.log('📧 Email to be sent to PTA:', emailData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for demonstration
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    sentEmails.push(emailData);
    localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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