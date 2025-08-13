// Google Sheets API integration
// Note: This requires server-side implementation due to CORS restrictions
// For now, we'll provide the structure and use localStorage as fallback

interface DonationEntry {
  referenceNumber: string;
  submissionDate: string;
  submissionTime: string;
  parentName: string;
  studentName: string;
  donationMode: string;
  amount?: string;
  date: string;
  time?: string;
  handedTo?: string;
  items?: string;
  receiptFileName?: string;
  photoFileName?: string;
}

// Google Sheets configuration
const SHEETS_CONFIG = {
  spreadsheetId: '', // This would be set up with actual Google Sheets ID
  range: 'Donations!A:M', // Columns A through M
  ptaEmail: '11mercado.pta@gmail.com'
};

// For production, this would be a server-side API endpoint
export const submitToGoogleSheets = async (data: DonationEntry): Promise<boolean> => {
  try {
    // In a real implementation, this would call a server endpoint
    // that handles Google Sheets API authentication and writes the data
    
    // Server endpoint would:
    // 1. Authenticate using service account credentials
    // 2. Access the Google Sheet owned by 11mercado.pta@gmail.com
    // 3. Append the donation data to the sheet
    // 4. Handle file uploads if needed
    
    console.log('Would submit to Google Sheets:', data);
    
    // For now, simulate the API call and store locally
    const response = await simulateServerCall(data);
    return response.success;
    
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return false;
  }
};

// Simulates a server API call
const simulateServerCall = async (data: DonationEntry): Promise<{ success: boolean }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Store in localStorage as fallback
  const existingEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
  existingEntries.push(data);
  localStorage.setItem('donationEntries', JSON.stringify(existingEntries));
  
  // Log what would be sent to Google Sheets
  console.log('Donation entry saved:', {
    timestamp: new Date().toISOString(),
    ...data
  });
  
  return { success: true };
};

// Helper to get entry by reference number (for editing)
export const getEntryByReference = (referenceNumber: string): DonationEntry | null => {
  const entries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
  return entries.find((entry: DonationEntry) => entry.referenceNumber === referenceNumber) || null;
};

// Helper to update entry by reference number
export const updateEntryByReference = async (referenceNumber: string, updatedData: Partial<DonationEntry>): Promise<boolean> => {
  try {
    const entries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
    const entryIndex = entries.findIndex((entry: DonationEntry) => entry.referenceNumber === referenceNumber);
    
    if (entryIndex === -1) {
      return false;
    }
    
    // Check if within 24-hour edit window
    const entry = entries[entryIndex];
    const submissionTime = new Date(entry.submissionDate + ' ' + entry.submissionTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      throw new Error('Edit window has expired (24 hours)');
    }
    
    // Update the entry
    entries[entryIndex] = { ...entry, ...updatedData };
    localStorage.setItem('donationEntries', JSON.stringify(entries));
    
    // In production, this would also update the Google Sheet
    console.log('Entry updated:', entries[entryIndex]);
    
    return true;
  } catch (error) {
    console.error('Error updating entry:', error);
    return false;
  }
};

// Instructions for Google Sheets setup:
/*
To set up Google Sheets integration:

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Generate credentials JSON file
5. Share the Google Sheet with the service account email
6. Create a server endpoint (Node.js/Python/etc.) that:
   - Uses the service account to authenticate
   - Accepts donation data from the frontend
   - Writes to the Google Sheet owned by 11mercado.pta@gmail.com
   
Server endpoint structure:
POST /api/donations
{
  "referenceNumber": "PTA-1234567890-123",
  "submissionDate": "2024-08-12",
  "submissionTime": "15:30:00",
  "parentName": "John Doe",
  "studentName": "Jane Doe",
  "donationMode": "ewallet",
  "amount": "1000",
  "date": "2024-08-12",
  ...
}

Google Sheet columns:
A: Reference Number
B: Submission Date
C: Submission Time
D: Parent Name
E: Student Name
F: Donation Mode
G: Amount
H: Date
I: Time
J: Handed To
K: Items
L: Receipt File
M: Photo File
*/