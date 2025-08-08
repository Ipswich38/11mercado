/**
 * Google Apps Script for 11Mercado Donations
 * This script should be deployed as a Web App in Google Apps Script
 * and connected to a Google Sheet for 11mercado.pta@gmail.com
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Create a Google Sheet with these columns:
 *    A: Timestamp, B: Control Number, C: Donor Name, D: Email, E: Phone, 
 *    F: Amount, G: Payment Method, H: Message, I: Status, J: Notes
 * 5. Update SHEET_ID below with your sheet ID
 * 6. Deploy as Web App with execute permissions for "Anyone"
 * 7. Copy the Web App URL and update DonationForm.jsx
 */

// Configuration
const SHEET_ID = '1WNPHFfM784RkQ4yBCLlKfsSOfBMdSYziQCyI9McgU2o'; // 11Mercado Donations Sheet
const SHEET_NAME = 'Donations'; // Name of the sheet tab

function doPost(e) {
  try {
    // Parse the form data
    const formData = e.parameter;
    
    // Validate required fields based on donation type
    const basicRequiredFields = ['timestamp', 'controlNumber', 'parentFirstName', 'studentFullName', 'donationType'];
    for (const field of basicRequiredFields) {
      if (!formData[field]) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: `Missing required field: ${field}`
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Additional validation based on donation type
    if (formData.donationType === 'In-Kind' && !formData.inkindItems) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'In-kind donations must specify items'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if ((formData.donationType === 'Cash' || formData.donationType === 'GCash' || formData.donationType === 'Maya' || formData.donationType === 'Bank Transfer') && !formData.totalAmount) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Monetary donations must specify total amount'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if control number already exists
    const existingData = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    const controlNumbers = existingData.map(row => row[0]);
    
    if (controlNumbers.includes(formData.controlNumber)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Control number already exists. Please try again.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle file upload if present
    let fileInfo = 'No file uploaded';
    if (formData.proofFile) {
      try {
        // In a real implementation, you'd save to Google Drive and store the file URL
        // For now, we'll store basic file information
        const fileData = JSON.parse(formData.proofFile);
        fileInfo = `${fileData.name} (${fileData.type}, ${(fileData.size / 1024 / 1024).toFixed(2)}MB)`;
        
        // TODO: In production, use DriveApp to save the file and get a shareable URL
        // const blob = Utilities.newBlob(Utilities.base64Decode(fileData.data.split(',')[1]), fileData.type, fileData.name);
        // const file = DriveApp.createFile(blob);
        // const fileUrl = file.getUrl();
        // fileInfo = `${fileData.name}: ${fileUrl}`;
      } catch (error) {
        console.error('File processing error:', error);
        fileInfo = 'File upload error';
      }
    }

    // Prepare the data row based on donation type
    const rowData = [
      new Date(formData.timestamp),
      formData.controlNumber,
      formData.parentFirstName,
      formData.studentFullName,
      formData.donationType,
      formData.totalAmount ? parseFloat(formData.totalAmount) : 'N/A',
      formData.sptaAmount ? parseFloat(formData.sptaAmount) : 0,
      formData.classroomPtaAmount ? parseFloat(formData.classroomPtaAmount) : 0,
      formData.inkindItems || 'N/A',
      formData.cashEntrustedTo || 'N/A',
      formData.cashEntrustedDate || 'N/A',
      formData.cashEntrustedTime || 'N/A',
      formData.message || '',
      fileInfo, // Proof of payment file information
      formData.status || 'Pending Verification',
      '' // Notes column for admin use
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Send notification email to admin
    try {
      sendNotificationEmail(formData);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the whole operation if email fails
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Donation recorded successfully',
        controlNumber: formData.controlNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing donation:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Server error. Please try again later.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotificationEmail(formData) {
  const adminEmail = '11mercado.pta@gmail.com';
  
  const subject = `New Donation Submission - ${formData.controlNumber}`;
  
  const body = `
New donation submission received for 11Mercado Fund Drive:

CONTROL NUMBER: ${formData.controlNumber}
DATE & TIME: ${new Date(formData.timestamp).toLocaleString('en-PH')}

DONOR INFORMATION:
Parent First Name: ${formData.parentFirstName}
Student Full Name: ${formData.studentFullName}

DONATION DETAILS:
Donation Type: ${formData.donationType}
${formData.totalAmount ? `Total Amount: ₱${parseFloat(formData.totalAmount).toLocaleString('en-PH')}

ALLOCATION BREAKDOWN:
• SPTA: ₱${formData.sptaAmount ? parseFloat(formData.sptaAmount).toLocaleString('en-PH') : '0.00'}
• Classroom PTA: ₱${formData.classroomPtaAmount ? parseFloat(formData.classroomPtaAmount).toLocaleString('en-PH') : '0.00'}` : 'N/A (In-Kind)'}
In-Kind Items: ${formData.inkindItems || 'N/A'}
${formData.donationType === 'Cash' ? `Cash Entrusted To: ${formData.cashEntrustedTo || 'Direct to Treasurer'}
Cash Entrusted Date: ${formData.cashEntrustedDate || 'N/A'}
Cash Entrusted Time: ${formData.cashEntrustedTime || 'N/A'}` : ''}
Message: ${formData.message || 'None'}

STATUS: ${formData.status || 'Pending Verification'}

NEXT STEPS:
1. Wait for payment proof from donor
2. Verify payment in your ${formData.paymentMethod} account
3. Update status in Google Sheets
4. Send confirmation email to donor

View all donations: https://docs.google.com/spreadsheets/d/${SHEET_ID}

This is an automated notification from 11Mercado donation system.
  `.trim();
  
  GmailApp.sendEmail(adminEmail, subject, body);
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput('11Mercado Donation System API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Helper function to create the sheet headers (run once)
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Control Number',
      'Parent First Name',
      'Student Full Name',
      'Donation Type',
      'Total Amount (PHP)',
      'SPTA Amount (PHP)',
      'Classroom PTA Amount (PHP)',
      'In-Kind Items',
      'Cash Entrusted To',
      'Cash Entrusted Date',
      'Cash Entrusted Time',
      'Message',
      'Proof of Payment',
      'Status',
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
    sheet.setColumnWidth(2, 150); // Control Number
    sheet.setColumnWidth(3, 150); // Parent First Name
    sheet.setColumnWidth(4, 200); // Student Full Name
    sheet.setColumnWidth(5, 120); // Donation Type
    sheet.setColumnWidth(6, 120); // Total Amount
    sheet.setColumnWidth(7, 120); // SPTA Amount
    sheet.setColumnWidth(8, 120); // Classroom PTA Amount
    sheet.setColumnWidth(9, 300); // In-Kind Items
    sheet.setColumnWidth(10, 200); // Cash Entrusted To
    sheet.setColumnWidth(11, 150); // Cash Entrusted Date
    sheet.setColumnWidth(12, 120); // Cash Entrusted Time
    sheet.setColumnWidth(13, 300); // Message
    sheet.setColumnWidth(14, 250); // Proof of Payment
    sheet.setColumnWidth(15, 150); // Status
    sheet.setColumnWidth(16, 200); // Admin Notes
    
    Logger.log('Sheet setup completed successfully');
  }
}