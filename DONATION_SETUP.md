# 🎯 11Mercado Donation System Setup Guide

This guide will help you set up the automated donation system that connects directly to Google Sheets for 11mercado.pta@gmail.com.

---

## 📋 Prerequisites

- Access to Google Account (11mercado.pta@gmail.com)
- Admin access to the 11Mercado platform
- Basic understanding of Google Sheets and Google Apps Script

---

## 🚀 Step 1: Create Google Sheet

1. **Go to Google Sheets**: https://sheets.google.com
2. **Create a new sheet** and name it: `11Mercado Donations`
3. **Set up columns** in Row 1:
   ```
   A1: Timestamp
   B1: Control Number  
   C1: Donor Name
   D1: Email
   E1: Phone
   F1: Amount (PHP)
   G1: Payment Method
   H1: Message
   I1: Status
   J1: Admin Notes
   ```
4. **Format the header row**:
   - Select Row 1
   - Background color: Blue (#4285f4)
   - Text color: White
   - Bold font

5. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
   Save this ID for Step 2.

---

## 🔧 Step 2: Set up Google Apps Script

1. **Go to Google Apps Script**: https://script.google.com
2. **Create new project** → Name it: `11Mercado Donation API`
3. **Replace default code** with the script from `src/utils/googleSheetsScript.js`
4. **Update Configuration**:
   ```javascript
   const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE'; // Replace with ID from Step 1
   ```

5. **Save the project** (Ctrl+S)

---

## 🌐 Step 3: Deploy as Web App

1. **Click Deploy** → **New deployment**
2. **Type**: Web app
3. **Execute as**: Me (your account)
4. **Who has access**: Anyone
5. **Click Deploy**
6. **Copy the Web App URL** (looks like):
   ```
   https://script.google.com/macros/s/[SCRIPT_ID]/exec
   ```

---

## 🔗 Step 4: Update Frontend Configuration

1. **Open** `src/components/DonationForm.jsx`
2. **Find line** with `YOUR_SCRIPT_ID` and replace:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID_HERE/exec';
   ```

3. **Save the file**

**✅ Already Connected:** The system is already configured to use your Google Sheet:
- **Sheet ID**: `1WNPHFfM784RkQ4yBCLlKfsSOfBMdSYziQCyI9McgU2o`
- **Sheet URL**: https://docs.google.com/spreadsheets/d/1WNPHFfM784RkQ4yBCLlKfsSOfBMdSYziQCyI9McgU2o/edit

---

## 📱 Step 5: Update Payment Information

1. **Open** `src/components/DonationForm.jsx`
2. **Find the payment methods section** and update with actual details:
   ```javascript
   <div>• GCash: 09XX-XXX-XXXX</div>
   <div>• Maya: 09XX-XXX-XXXX</div>
   <div>• Bank Transfer: Available</div>
   <div>• Cash: Via school office</div>
   ```

3. **Replace with your actual**:
   - GCash number
   - Maya number  
   - Bank details
   - Office location

---

## 🧪 Step 6: Test the System

### Test Donation Flow:
1. **Open the 11Mercado platform**
2. **Go to donation section**
3. **Click "Donate Now"**
4. **Fill out test form**:
   - Name: Test Donor
   - Email: test@example.com
   - Phone: 09123456789
   - Amount: 100
   - Payment Method: GCash
   - Message: Test donation

5. **Submit and verify**:
   - ✅ Success message appears
   - ✅ Control number generated
   - ✅ Receipt download works
   - ✅ Data appears in Google Sheets
   - ✅ Email notification received

---

## 📧 Step 7: Email Setup (Optional)

If you want donation receipts emailed automatically:

1. **In Google Apps Script**, add email function
2. **Update DonationForm.jsx** to include email sending
3. **Test email notifications**

---

## 🔒 Step 8: Security & Permissions

### Google Sheets Permissions:
- ✅ Sheet is accessible to 11mercado.pta@gmail.com
- ✅ Apps Script runs with proper permissions
- ✅ Web App allows anonymous access for submissions

### Data Protection:
- ✅ No sensitive payment info stored
- ✅ Only necessary donor information collected
- ✅ Control numbers prevent duplicates
- ✅ All submissions logged with timestamps

---

## 📊 Step 9: Monitor & Maintain

### Daily Tasks:
- [ ] Check Google Sheets for new donations
- [ ] Verify payments against submission records
- [ ] Update donation status (Pending → Verified)
- [ ] Send confirmation emails to verified donors

### Weekly Tasks:
- [ ] Review donation trends
- [ ] Update payment methods if needed
- [ ] Backup donation data
- [ ] Check system functionality

---

## 🚨 Troubleshooting

### Common Issues:

**❌ "Submission failed" error**
- Check Google Apps Script deployment
- Verify Web App URL in DonationForm.jsx
- Check Google Sheets permissions

**❌ No email notifications**
- Verify Gmail permissions in Apps Script
- Check spam folder
- Confirm admin email address

**❌ Duplicate control numbers**
- Check system clock/timezone
- Verify random number generation
- Review Google Sheets data

**❌ Form not opening**
- Check React component imports
- Verify button click handler
- Check browser console for errors

---

## 📞 Support

For technical issues:
- Check browser console for errors
- Review Google Apps Script logs
- Contact platform developer

For donation inquiries:
- Email: 11mercado.pta@gmail.com
- Include control number for reference

---

## ✅ Quick Checklist

Setup Complete When:
- [ ] Google Sheet created with proper columns
- [ ] Google Apps Script deployed as Web App
- [ ] Frontend updated with correct URLs
- [ ] Payment information updated
- [ ] Test donation completed successfully
- [ ] Email notifications working
- [ ] Permissions properly configured
- [ ] Monitoring system in place

---

**🎉 Congratulations!** Your automated donation system is now live and ready to help your community contribute to 11Mercado!