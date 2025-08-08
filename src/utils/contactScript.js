/**
 * Google Apps Script for 11Mercado Contact Us Form
 * This script should be deployed as a Web App in Google Apps Script
 * to forward contact messages to 11mercado.pta@gmail.com
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project named "11Mercado Contact Handler"
 * 3. Paste this code
 * 4. Update the ADMIN_EMAIL constant below
 * 5. Deploy as Web App with execute permissions for "Anyone"
 * 6. Copy the Web App URL and update ContactUsForm.jsx
 * 7. Optionally create a Google Sheet to log messages
 */

// Configuration
const ADMIN_EMAIL = '11mercado.pta@gmail.com';
const SHEET_ID = ''; // Optional: Add a Google Sheet ID to log messages
const SHEET_NAME = 'Contact Messages';

function doPost(e) {
  try {
    // Parse the form data
    const formData = e.parameter;
    
    // Validate required fields
    const requiredFields = ['messageId', 'name', 'email', 'subject', 'message'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: `Missing required field: ${field}`
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Log to Google Sheet if configured
    if (SHEET_ID) {
      try {
        logToSheet(formData);
      } catch (sheetError) {
        console.error('Sheet logging failed:', sheetError);
        // Continue with email sending even if sheet logging fails
      }
    }
    
    // Send email notification
    try {
      sendContactEmail(formData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Failed to send email notification'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        messageId: formData.messageId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing contact message:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Server error. Please try again later.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendContactEmail(formData) {
  const subject = `[11Mercado] ${formData.subject} - ${formData.messageId}`;
  
  // Priority indicator for subject
  const priorityIndicator = formData.priority === 'Urgent' ? '🚨 URGENT: ' : 
                           formData.priority === 'High' ? '⚠️ HIGH: ' : '';
  
  const fullSubject = `${priorityIndicator}${subject}`;
  
  const body = `
New message received through the 11Mercado Contact Us form:

═══════════════════════════════════════════════════════════════
MESSAGE DETAILS
═══════════════════════════════════════════════════════════════

MESSAGE ID: ${formData.messageId}
DATE & TIME: ${new Date(formData.timestamp).toLocaleString('en-PH')}
PRIORITY: ${formData.priority}
SOURCE: ${formData.source || '11Mercado Platform'}

═══════════════════════════════════════════════════════════════
CONTACT INFORMATION
═══════════════════════════════════════════════════════════════

NAME: ${formData.name}
EMAIL: ${formData.email}
PHONE: ${formData.phone || 'Not provided'}

SUBJECT: ${formData.subject}

═══════════════════════════════════════════════════════════════
MESSAGE
═══════════════════════════════════════════════════════════════

${formData.message}

═══════════════════════════════════════════════════════════════
RESPONSE INSTRUCTIONS
═══════════════════════════════════════════════════════════════

Please respond directly to: ${formData.email}
Reference Message ID: ${formData.messageId}

This is an automated message from the 11Mercado platform.
To ensure proper tracking, please keep the Message ID in your response.

═══════════════════════════════════════════════════════════════
`.trim();
  
  // Send email to admin
  GmailApp.sendEmail(ADMIN_EMAIL, fullSubject, body, {
    replyTo: formData.email,
    name: '11Mercado Platform'
  });
  
  // Send auto-reply confirmation to sender
  sendAutoReply(formData);
}

function sendAutoReply(formData) {
  const subject = `Message Received - 11Mercado [${formData.messageId}]`;
  
  const body = `
Dear ${formData.name},

Thank you for contacting the 11Mercado PTA team! We have successfully received your message.

MESSAGE DETAILS:
═══════════════════════════════════════════════════════════════
Subject: ${formData.subject}
Message ID: ${formData.messageId}
Submitted: ${new Date(formData.timestamp).toLocaleString('en-PH')}
Priority: ${formData.priority}

WHAT HAPPENS NEXT:
═══════════════════════════════════════════════════════════════
• Your message has been forwarded to our PTA team
• We will respond to your inquiry within 24-48 hours
• Please keep the Message ID (${formData.messageId}) for reference
• For urgent matters, you may call the school office directly

MESSAGE SUMMARY:
═══════════════════════════════════════════════════════════════
"${formData.message.substring(0, 200)}${formData.message.length > 200 ? '...' : ''}"

If you have additional questions or need to update your inquiry, 
please reply to this email or submit a new message through the 
11Mercado platform at your convenience.

Best regards,
11Mercado PTA Team
11mercado.pta@gmail.com

═══════════════════════════════════════════════════════════════
This is an automated confirmation from the 11Mercado platform.
Please do not reply to this message unless you need to provide
additional information about your inquiry.
═══════════════════════════════════════════════════════════════
`.trim();

  try {
    GmailApp.sendEmail(formData.email, subject, body, {
      name: '11Mercado PTA Team',
      replyTo: ADMIN_EMAIL
    });
  } catch (error) {
    console.error('Auto-reply failed:', error);
    // Don't fail the whole operation if auto-reply fails
  }
}

function logToSheet(formData) {
  if (!SHEET_ID) return;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    const newSheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    setupContactSheet(newSheet);
  }
  
  const targetSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  const rowData = [
    new Date(formData.timestamp),
    formData.messageId,
    formData.name,
    formData.email,
    formData.phone || '',
    formData.subject,
    formData.priority,
    formData.message,
    formData.status || 'New',
    formData.source || '11Mercado Platform',
    '' // Admin notes
  ];
  
  targetSheet.appendRow(rowData);
}

function setupContactSheet(sheet) {
  const headers = [
    'Timestamp',
    'Message ID',
    'Name',
    'Email',
    'Phone',
    'Subject',
    'Priority',
    'Message',
    'Status',
    'Source',
    'Admin Notes'
  ];
  
  sheet.appendRow(headers);
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 150); // Message ID
  sheet.setColumnWidth(3, 150); // Name
  sheet.setColumnWidth(4, 200); // Email
  sheet.setColumnWidth(5, 120); // Phone
  sheet.setColumnWidth(6, 200); // Subject
  sheet.setColumnWidth(7, 100); // Priority
  sheet.setColumnWidth(8, 400); // Message
  sheet.setColumnWidth(9, 100); // Status
  sheet.setColumnWidth(10, 150); // Source
  sheet.setColumnWidth(11, 200); // Admin Notes
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput('11Mercado Contact Us API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function to verify email sending works
function testEmail() {
  const testData = {
    messageId: 'TEST-001',
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    phone: '09123456789',
    subject: 'Test Message',
    priority: 'Normal',
    message: 'This is a test message to verify the contact system is working.',
    source: '11Mercado Platform'
  };
  
  sendContactEmail(testData);
  Logger.log('Test email sent successfully');
}