# Donation Form - Google Sheets Integration Setup

## Overview
The donation form is fully functional and includes:
- ✅ Parent/Guardian and Student name fields
- ✅ 4 donation modes: E-wallet, Bank Transfer, Cash, In-kind
- ✅ Dynamic fields based on donation mode
- ✅ File upload for receipts and photos
- ✅ Form validation
- ✅ Acknowledgement receipt generation
- ✅ Reference number system
- ✅ Edit functionality (24-hour window)
- ✅ Downloadable receipt
- ✅ Data storage (currently localStorage, ready for Google Sheets)

## Current Status
- **Frontend**: Complete and functional
- **Data Storage**: Currently using localStorage as fallback
- **Google Sheets**: Ready for integration (requires server setup)

## Google Sheets Integration Setup

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `pta-donation-service`
   - Grant roles: `Editor`
   - Create and download the JSON key file

### Step 2: Google Sheet Setup
1. Create a Google Sheet in the account `11mercado.pta@gmail.com`
2. Name it: "PTA Donations 2024"
3. Create headers in row 1:
   - A: Reference Number
   - B: Submission Date  
   - C: Submission Time
   - D: Parent Name
   - E: Student Name
   - F: Donation Mode
   - G: Amount
   - H: Date
   - I: Time
   - J: Handed To
   - K: Items
   - L: Receipt File
   - M: Photo File
   - N: Edit Count
   - O: Last Modified

4. Share the sheet with the service account email (from step 1)
5. Copy the Sheet ID from the URL

### Step 3: Server Implementation
Create a Node.js server (separate from Vite app):

```bash
# Create server directory
mkdir donation-server
cd donation-server
npm init -y
npm install express cors googleapis multer
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Google Sheets configuration
const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE';
const RANGE = 'Donations!A:O';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Endpoint to submit donation
app.post('/api/donations', upload.fields([
  { name: 'receipt', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    
    // Prepare row data for Google Sheets
    const values = [[
      data.referenceNumber,
      data.submissionDate,
      data.submissionTime,
      data.parentName,
      data.studentName,
      data.donationMode,
      data.amount || '',
      data.date,
      data.time || '',
      data.handedTo || '',
      data.items || '',
      req.files?.receipt?.[0]?.filename || '',
      req.files?.photo?.[0]?.filename || '',
      0, // Edit count
      new Date().toISOString()
    ]];

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: { values }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save donation' });
  }
});

// Endpoint to get donation by reference number
app.get('/api/donations/:refNumber', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE
    });

    const rows = response.data.values;
    const donation = rows.find(row => row[0] === req.params.refNumber);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve donation' });
  }
});

app.listen(3001, () => {
  console.log('Donation server running on port 3001');
});
```

### Step 4: Update Frontend Configuration
In `src/utils/googleSheets.ts`, update the server endpoint:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export const submitToGoogleSheets = async (data: DonationEntry): Promise<boolean> => {
  try {
    const formData = new FormData();
    
    // Append donation data
    Object.keys(data).forEach(key => {
      if (data[key] && key !== 'receipt' && key !== 'photo') {
        formData.append(key, data[key]);
      }
    });
    
    // Append files
    if (data.receipt) formData.append('receipt', data.receipt);
    if (data.photo) formData.append('photo', data.photo);
    
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      body: formData
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};
```

### Step 5: Testing
1. Start the server: `node server.js`
2. Test the donation form
3. Check the Google Sheet for new entries

## Features Summary

### Donation Modes
1. **E-wallet/Bank Transfer**: Requires amount + receipt upload
2. **Cash**: Requires amount + date/time + person who received it
3. **In-kind**: Requires items description + optional photo

### Validation Rules
- Parent/Guardian name: Required
- Student name: Required  
- Amount: Required for monetary donations
- Receipt: Required for e-wallet/bank transfers
- Date: Required for cash donations
- Handed to: Required for cash donations
- Items: Required for in-kind donations

### Edit Functionality
- Users can edit entries within 24 hours
- Requires original reference number
- Automatically validates edit window

### Acknowledgement Receipt
- Generates unique reference number (PTA-timestamp-random)
- Shows all submission details
- Downloadable as text file
- Contains submission date/time

## Security Considerations
- Service account credentials should be kept secure
- File uploads should be validated and scanned
- Rate limiting should be implemented
- HTTPS should be used in production

## Production Deployment
1. Deploy server to secure hosting (Heroku, Railway, etc.)
2. Update CORS settings for production domain
3. Use environment variables for credentials
4. Implement proper error handling and logging
5. Set up monitoring and backups