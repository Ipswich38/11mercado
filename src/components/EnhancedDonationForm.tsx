import React, { useState, useRef } from 'react';
import { Upload, Calendar, Clock, User, CreditCard, Banknote, Gift, Camera, Download, Edit3, CheckCircle, PenTool, FileText, DollarSign } from 'lucide-react';
import { centralizedDB } from '../utils/centralizedDatabase';

interface DonationAllocation {
  generalSPTA: number;
  mercadoPTA: number;
}

interface DonationFormData {
  parentName: string;
  studentName: string;
  donationMode: 'ewallet' | 'bank' | 'cash' | 'inkind';
  amount?: string;
  allocation?: DonationAllocation;
  date: string;
  time?: string;
  handedTo?: string;
  items?: string;
  receipt?: File | null;
  photo?: File | null;
  eSignature: string;
  agreementAccepted: boolean;
  referenceNumber?: string;
}

interface AcknowledgementData extends DonationFormData {
  referenceNumber: string;
  submissionDate: string;
  submissionTime: string;
}

export default function EnhancedDonationForm({ getContrastClass, onClose, onDonationSuccess }) {
  const [formData, setFormData] = useState<DonationFormData>({
    parentName: '',
    studentName: '',
    donationMode: 'ewallet',
    amount: '',
    allocation: { generalSPTA: 0, mercadoPTA: 0 },
    date: new Date().toISOString().split('T')[0],
    time: '',
    handedTo: '',
    items: '',
    receipt: null,
    photo: null,
    eSignature: '',
    agreementAccepted: false
  });

  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [acknowledgementData, setAcknowledgementData] = useState<AcknowledgementData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editReferenceNumber, setEditReferenceNumber] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const testSupabaseConnection = async () => {
    console.log('🧪 Testing Supabase connection from donation form...');
    try {
      const testData = {
        referenceNumber: 'FORM-TEST-' + Date.now(),
        parentName: 'Form Test Parent',
        studentName: 'Form Test Student',
        donationMode: 'e-wallet',
        amount: '50',
        eSignature: 'Form Test Signature',
        submissionDate: new Date().toISOString().split('T')[0],
        submissionTime: new Date().toLocaleTimeString(),
        submissionTimestamp: new Date().toISOString(),
        allocation: { generalSPTA: 40, mercadoPTA: 10 },
        attachmentFile: null, // No file attachment for test
        attachmentFilename: null
      };
      
      console.log('🚀 Attempting to submit test data:', testData);
      const result = await centralizedDB.submitDonation(testData);
      console.log('📋 Test result:', result);
      
      if (result && result.success) {
        alert('✅ Supabase connection test successful!');
      } else {
        alert('❌ Supabase connection test failed: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      alert('❌ Test error: ' + error.message);
    }
  };

  const testWithFileAttachment = async () => {
    console.log('🧪 Testing with simulated file attachment...');
    try {
      // Create a small test image as base64 (simulates mobile upload)
      const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yAAAAABJRU5ErkJggg==";
      
      const testData = {
        referenceNumber: 'FILE-TEST-' + Date.now(),
        parentName: 'Test Parent With File',
        studentName: 'Test Student With File',
        donationMode: 'e-wallet',
        amount: '100',
        eSignature: 'Test Signature With File',
        submissionDate: new Date().toISOString().split('T')[0],
        submissionTime: new Date().toLocaleTimeString(),
        submissionTimestamp: new Date().toISOString(),
        allocation: { generalSPTA: 80, mercadoPTA: 20 },
        attachmentFile: testImageBase64,
        attachmentFilename: 'test-receipt.png'
      };
      
      console.log('🚀 Attempting to submit test data with file:', testData);
      const result = await centralizedDB.submitDonation(testData);
      console.log('📋 File test result:', result);
      
      if (result && result.success) {
        alert('✅ File attachment test successful!');
      } else {
        alert('❌ File attachment test failed: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ File test error:', error);
      alert('❌ File test error: ' + error.message);
    }
  };

  const testMobileCompatibility = async () => {
    console.log('📱 Testing mobile-specific compatibility...');
    try {
      // Test file creation and processing like mobile would do
      const testBlob = new Blob(['test file content'], { type: 'image/png' });
      const testFile = new File([testBlob], 'mobile-test.png', { type: 'image/png' });
      
      console.log('📋 Created test file:', {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type,
        lastModified: testFile.lastModified
      });
      
      // Test base64 conversion
      const base64Result = await fileToBase64(testFile);
      console.log('📄 Base64 conversion:', base64Result.substring(0, 100) + '...');
      
      // Test with larger payload similar to mobile photos
      const largeContent = 'x'.repeat(100000); // 100KB test
      const largeBlob = new Blob([largeContent], { type: 'image/jpeg' });
      const largeFile = new File([largeBlob], 'large-mobile-photo.jpg', { type: 'image/jpeg' });
      
      console.log('📸 Testing large file processing:', {
        size: largeFile.size,
        sizeInMB: (largeFile.size / 1024 / 1024).toFixed(2)
      });
      
      const largeBase64 = await fileToBase64(largeFile);
      console.log('📊 Large file base64 length:', largeBase64.length);
      
      // Test mobile-specific donation data structure
      const mobileTestData = {
        referenceNumber: 'MOBILE-TEST-' + Date.now(),
        parentName: 'Mobile Test Parent',
        studentName: 'Mobile Test Student',
        donationMode: 'e-wallet',
        amount: '250',
        eSignature: 'Mobile Test Signature',
        submissionDate: new Date().toISOString().split('T')[0],
        submissionTime: new Date().toLocaleTimeString(),
        submissionTimestamp: new Date().toISOString(),
        allocation: { generalSPTA: 200, mercadoPTA: 50 },
        attachmentFile: largeBase64,
        attachmentFilename: largeFile.name,
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      };
      
      console.log('🚀 Testing mobile data submission to Supabase...');
      const result = await centralizedDB.submitDonation(mobileTestData);
      
      if (result && result.success) {
        alert('✅ Mobile compatibility test passed! The issue might be form-specific.');
      } else {
        alert('❌ Mobile compatibility test failed: ' + (result?.error || 'Unknown error'));
        console.error('📱 Mobile test failure details:', result);
      }
      
    } catch (error) {
      console.error('❌ Mobile compatibility test error:', error);
      alert('❌ Mobile test error: ' + error.message);
    }
  };

  const receiptInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const generateReferenceNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PTA-${timestamp}-${random}`;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required';
    }

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    // E-signature validation
    if (!formData.eSignature.trim()) {
      newErrors.eSignature = 'Electronic signature is required';
    }

    // Agreement acceptance validation
    if (!formData.agreementAccepted) {
      newErrors.agreementAccepted = 'You must accept the donation agreement';
    }

    if (formData.donationMode === 'ewallet' || formData.donationMode === 'bank') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount is required for e-wallet/bank transfers';
      }
      if (!formData.receipt) {
        newErrors.receipt = 'Transaction receipt is required for e-wallet/bank transfers';
      }
      // Allocation validation for monetary donations
      const totalAmount = parseFloat(formData.amount || '0');
      const allocatedTotal = (formData.allocation?.generalSPTA || 0) + (formData.allocation?.mercadoPTA || 0);
      if (totalAmount > 0 && Math.abs(totalAmount - allocatedTotal) > 0.01) {
        newErrors.allocation = 'Allocation total must equal the donation amount';
      }
      if (totalAmount > 0 && allocatedTotal > totalAmount) {
        newErrors.allocation = 'Allocation total cannot exceed the donation amount';
      }
    }

    if (formData.donationMode === 'cash') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount is required for cash donations';
      }
      if (!formData.date) {
        newErrors.date = 'Date is required for cash donations';
      }
      if (!formData.handedTo) {
        newErrors.handedTo = 'Person who received the cash must be specified';
      }
      // Photo is optional, but e-signature required if no photo
      if (!formData.photo && !formData.eSignature.trim()) {
        newErrors.eSignature = 'E-signature is required when no photo proof is provided';
      }
      // Allocation validation for cash donations
      const totalAmount = parseFloat(formData.amount || '0');
      const allocatedTotal = (formData.allocation?.generalSPTA || 0) + (formData.allocation?.mercadoPTA || 0);
      if (totalAmount > 0 && Math.abs(totalAmount - allocatedTotal) > 0.01) {
        newErrors.allocation = 'Allocation total must equal the donation amount';
      }
      if (totalAmount > 0 && allocatedTotal > totalAmount) {
        newErrors.allocation = 'Allocation total cannot exceed the donation amount';
      }
    }

    if (formData.donationMode === 'inkind') {
      if (!formData.items) {
        newErrors.items = 'Items description is required for in-kind donations';
      }
      // Photo is optional, but e-signature required if no photo
      if (!formData.photo && !formData.eSignature.trim()) {
        newErrors.eSignature = 'E-signature is required when no photo proof is provided';
      }
    }

    // General validation - e-signature and agreement always required
    if (!formData.eSignature.trim()) {
      newErrors.eSignature = 'E-signature is required for all donations';
    }

    if (!formData.agreementAccepted) {
      newErrors.agreement = 'You must accept the donation agreement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (type: 'receipt' | 'photo') => {
    const inputRef = type === 'receipt' ? receiptInputRef : photoInputRef;
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'receipt' | 'photo') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleAmountChange = (amount: string) => {
    setFormData(prev => ({
      ...prev,
      amount
    }));
  };

  const handleAllocationChange = (field: keyof DonationAllocation, value: number) => {
    const totalAmount = parseFloat(formData.amount || '0');
    const currentAllocation = formData.allocation || { generalSPTA: 0, mercadoPTA: 0 };
    const otherField = field === 'generalSPTA' ? 'mercadoPTA' : 'generalSPTA';
    const otherValue = currentAllocation[otherField];
    
    // Round to 2 decimal places to avoid floating-point precision issues
    value = Math.round(value * 100) / 100;
    
    // Prevent entering more than total amount
    if (value + otherValue > totalAmount && totalAmount > 0) {
      // Calculate maximum allowed value and round to 2 decimal places
      const maxAllowed = Math.round((totalAmount - otherValue) * 100) / 100;
      value = Math.max(0, maxAllowed);
    }
    
    // Ensure non-negative values
    value = Math.max(0, value);
    
    setFormData(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation!,
        [field]: value
      }
    }));
  };

  // Helper functions for allocation display
  const getTotalAmount = () => parseFloat(formData.amount || '0');
  const getAllocationTotal = () => (formData.allocation?.generalSPTA || 0) + (formData.allocation?.mercadoPTA || 0);
  const getRemainingAmount = () => getTotalAmount() - getAllocationTotal();
  const isAllocationValid = () => Math.abs(getTotalAmount() - getAllocationTotal()) < 0.01;
  const isAllocationExceeding = () => getAllocationTotal() > getTotalAmount();
  
  const getInputBorderClass = (field: keyof DonationAllocation) => {
    const totalAmount = getTotalAmount();
    const allocationTotal = getAllocationTotal();
    
    if (totalAmount === 0) return getContrastClass('border-gray-300', 'border-gray-600');
    if (allocationTotal > totalAmount) return 'border-red-500';
    if (isAllocationValid()) return 'border-green-500';
    return getContrastClass('border-yellow-400', 'border-yellow-500');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitToGoogleSheets = async (data: AcknowledgementData): Promise<boolean> => {
    try {
      console.log('🔍 Starting donation submission process...');
      console.log('📱 User agent:', navigator.userAgent);
      console.log('🌐 Network status:', navigator.onLine ? 'Online' : 'Offline');
      
      // Prepare files for storage
      let attachmentFile = null;
      let attachmentFilename = null;
      
      // Store files for Financial Dashboard access (both centralized and local backup)
      if (data.receipt || data.photo) {
        const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
        
        console.log('📎 Processing file attachments...');
        console.log('📄 Receipt file:', data.receipt ? `${data.receipt.name} (${data.receipt.size} bytes)` : 'None');
        console.log('📷 Photo file:', data.photo ? `${data.photo.name} (${data.photo.size} bytes)` : 'None');
        
        // Priority: receipt first, then photo
        if (data.receipt) {
          console.log('🔄 Converting receipt to base64...');
          try {
            const receiptData = await fileToBase64(data.receipt);
            attachmentFile = receiptData;
            attachmentFilename = data.receipt.name;
            console.log('✅ Receipt conversion successful, size:', receiptData.length);
            
            // Local backup
            fileStorage[`${data.referenceNumber}_receipt`] = {
              data: receiptData,
            name: data.receipt.name,
            type: data.receipt.type,
            size: data.receipt.size,
            timestamp: new Date().toISOString()
          };
          console.log(`Stored receipt file for ${data.referenceNumber}: ${data.receipt.name}`);
          } catch (fileError) {
            console.error('❌ Receipt file conversion failed:', fileError);
            throw new Error('Failed to process receipt file: ' + fileError.message);
          }
        } else if (data.photo) {
          const photoData = await fileToBase64(data.photo);
          attachmentFile = photoData;
          attachmentFilename = data.photo.name;
          
          // Local backup
          fileStorage[`${data.referenceNumber}_photo`] = {
            data: photoData,
            name: data.photo.name,
            type: data.photo.type,
            size: data.photo.size,
            timestamp: new Date().toISOString()
          };
          console.log(`Stored photo file for ${data.referenceNumber}: ${data.photo.name}`);
        }
        
        localStorage.setItem('donationFiles', JSON.stringify(fileStorage));
      }

      // Enhanced data structure for centralized database
      const enhancedData = {
        referenceNumber: data.referenceNumber,
        parentName: data.parentName,
        studentName: data.studentName,
        donationMode: data.donationMode === 'ewallet' ? 'e-wallet' : data.donationMode === 'inkind' ? 'in-kind' : data.donationMode,
        amount: data.amount,
        eSignature: data.eSignature,
        submissionDate: data.submissionDate,
        submissionTime: data.submissionTime,
        submissionTimestamp: new Date().toISOString(),
        allocation: data.allocation || { generalSPTA: 0, mercadoPTA: 0 },
        attachmentFile,
        attachmentFilename,
        handedTo: data.handedTo || null,
        items: data.items || null,
        hasReceipt: !!data.receipt,
        hasPhoto: !!data.photo,
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        attachmentSize: attachmentFile ? attachmentFile.length : 0
      };
      
      // Check for large file sizes on mobile (common issue)
      if (enhancedData.isMobile && enhancedData.attachmentSize > 5000000) { // 5MB limit
        console.warn('⚠️ Large file detected on mobile:', enhancedData.attachmentSize, 'bytes');
        // Don't fail immediately, but log the warning
      }
      
      // Validate critical fields
      if (!enhancedData.referenceNumber || !enhancedData.parentName || !enhancedData.studentName) {
        console.error('❌ Missing critical fields:', {
          referenceNumber: !!enhancedData.referenceNumber,
          parentName: !!enhancedData.parentName,
          studentName: !!enhancedData.studentName
        });
        throw new Error('Missing required fields for database submission');
      }
      
      console.log('🚀 Submitting donation to centralized database:', enhancedData);
      console.log('🔗 CentralizedDB object:', centralizedDB);
      
      // Submit to centralized database (Supabase) with timeout
      console.log('🔍 Enhanced data being submitted:', JSON.stringify(enhancedData, null, 2));
      
      const submitWithTimeout = new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Supabase submission timeout after 30 seconds'));
        }, 30000);
        
        centralizedDB.submitDonation(enhancedData)
          .then((result) => {
            clearTimeout(timeout);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeout);
            reject(error);
          });
      });
      
      const result: any = await submitWithTimeout;
      
      console.log('📋 Submission result:', result);
      console.log('📋 Result success status:', result?.success);
      console.log('📋 Result error:', result?.error);
      
      if (result && result.success) {
        console.log('✅ Donation successfully submitted to centralized database', result.data);
        
        // Also keep in localStorage as backup/cache
        const existingEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        existingEntries.push(enhancedData);
        localStorage.setItem('donationEntries', JSON.stringify(existingEntries));
        
        console.log('🎯 RETURNING TRUE - Supabase success');
        return true;
      } else {
        console.error('❌ Failed to submit to centralized database:', result);
        
        // More specific error message for mobile users
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const errorMessage = isMobile 
          ? '⚠️ Mobile Upload Issue: Your donation is saved locally. If you have a large image, try using a smaller file or contact admin.'
          : '⚠️ Warning: Donation saved locally but failed to sync to main database. Please contact admin if this persists.';
        
        alert(errorMessage);
        
        // Fallback to localStorage only
        const existingEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        existingEntries.push({
          ...enhancedData, 
          supabaseError: result?.error || 'Unknown error',
          mobileFallback: isMobile,
          errorTimestamp: new Date().toISOString()
        });
        localStorage.setItem('donationEntries', JSON.stringify(existingEntries));
        
        console.log('📦 Stored in localStorage as fallback due to Supabase error');
        console.log('🔍 Error details for debugging:', {
          error: result?.error,
          isMobile,
          attachmentSize: enhancedData.attachmentSize,
          userAgent: navigator.userAgent
        });
        
        console.log('🎯 RETURNING FALSE - Supabase failed');
        return false; // Return false so we know there was an issue
      }
    } catch (error) {
      console.error('Error submitting donation data:', error);
      
      // Emergency fallback to localStorage
      try {
        const fallbackData = {
          ...data,
          submissionTimestamp: new Date().toISOString(),
          fallbackStorage: true
        };
        
        const existingEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        existingEntries.push(fallbackData);
        localStorage.setItem('donationEntries', JSON.stringify(existingEntries));
        
        console.log('📦 Emergency fallback to localStorage completed');
        console.warn('⚠️ Donation stored locally only due to database connection issues');
        return false; // CRITICAL: Return false to prevent receipt generation
      } catch (fallbackError) {
        console.error('Emergency fallback failed:', fallbackError);
        alert('❌ Critical error: Unable to save donation data anywhere. Please try again.');
        return false;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const referenceNumber = generateReferenceNumber();
      const submissionDate = new Date().toLocaleDateString();
      const submissionTime = new Date().toLocaleTimeString();

      const acknowledgement: AcknowledgementData = {
        ...formData,
        referenceNumber,
        submissionDate,
        submissionTime
      };

      console.log('🔄 About to call submitToGoogleSheets...');
      const success = await submitToGoogleSheets(acknowledgement);
      console.log('📋 submitToGoogleSheets returned:', success);
      
      if (success) {
        console.log('✅ Success path: showing acknowledgement');
        // Only show acknowledgement if Supabase sync was successful
        setAcknowledgementData(acknowledgement);
        setShowAcknowledgement(true);
        
        // Auto-sync successful donation to donation progress
        if (onDonationSuccess && formData.amount) {
          const donationAmount = parseFloat(formData.amount);
          if (donationAmount > 0) {
            onDonationSuccess({
              amount: donationAmount,
              allocation: formData.allocation,
              donorName: formData.parentName,
              studentName: formData.studentName,
              referenceNumber: acknowledgement.referenceNumber,
              submissionDate: acknowledgement.submissionDate,
              donationMode: formData.donationMode
            });
          }
        }
      } else {
        // CRITICAL: If Supabase sync fails, DO NOT show success or generate receipt
        console.error('❌ FAILURE path: NOT showing acknowledgement');
        console.error('❌ Donation submission failed - Supabase sync unsuccessful');
        
        alert('❌ Donation Submission Failed\n\nYour donation could not be processed at this time. Please try again or contact admin for assistance.\n\nNote: No reference number has been generated to prevent confusion.');
        
        console.log('🚫 Preventing acknowledgement display');
        // Do NOT show acknowledgement receipt or reference number
        // Do NOT call onDonationSuccess
        // This prevents generating receipts for failed submissions
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEntry = async () => {
    if (!editReferenceNumber.trim()) {
      alert('Please enter your reference number');
      return;
    }

    const entries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
    const entry = entries.find(e => e.referenceNumber === editReferenceNumber);
    
    if (!entry) {
      alert('Reference number not found');
      return;
    }

    const submissionTime = new Date(entry.submissionDate + ' ' + entry.submissionTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      alert('Sorry, entries can only be edited within 24 hours of submission');
      return;
    }

    setFormData(entry);
    setShowEditForm(false);
    setEditReferenceNumber('');
  };

  const downloadAcknowledgement = () => {
    if (!acknowledgementData) return;

    const content = `
DONATION ACKNOWLEDGEMENT RECEIPT
================================

Reference Number: ${acknowledgementData.referenceNumber}
Submission Date: ${acknowledgementData.submissionDate}
Submission Time: ${acknowledgementData.submissionTime}

DONOR INFORMATION:
- Parent/Guardian: ${acknowledgementData.parentName}
- Student: ${acknowledgementData.studentName}
- Electronic Signature: ${acknowledgementData.eSignature}

DONATION DETAILS:
- Mode: ${acknowledgementData.donationMode.toUpperCase()}
- Amount: ${acknowledgementData.amount ? '₱' + acknowledgementData.amount : 'N/A'}
- Date: ${acknowledgementData.date}
- Time: ${acknowledgementData.time || 'N/A'}
- Handed to: ${acknowledgementData.handedTo || 'N/A'}
- Items: ${acknowledgementData.items || 'N/A'}

DONATION ALLOCATION:
- General SPTA: ₱${acknowledgementData.allocation?.generalSPTA || 0}
- 11Mercado PTA Projects: ₱${acknowledgementData.allocation?.mercadoPTA || 0}

ATTACHMENTS:
- Receipt: ${acknowledgementData.receipt ? 'Uploaded' : 'None'}
- Photo: ${acknowledgementData.photo ? 'Uploaded' : 'None'}

Thank you for your generous contribution to 11Mercado PTA!
This donation has been recorded and will be used according to your allocation preferences.

For any inquiries, please contact us at 11mercado.pta@gmail.com
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PTA_Receipt_${acknowledgementData.referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showAcknowledgement && acknowledgementData) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col",
        "fixed inset-0 bg-black z-50 flex flex-col"
      )}>
        <div className={getContrastClass(
          "bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white text-center",
          "bg-gray-900 border-b-2 border-yellow-400 p-4 text-center"
        )}>
          <CheckCircle size={48} className={getContrastClass("mx-auto mb-2 text-white", "mx-auto mb-2 text-yellow-400")} />
          <h1 className={getContrastClass(
            "text-2xl font-bold text-white",
            "text-2xl font-bold text-yellow-400"
          )}>
            Donation Submitted Successfully!
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className={getContrastClass(
            "bg-white rounded-3xl p-6 shadow-xl border",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <h2 className={getContrastClass(
              "text-xl font-semibold text-gray-900 mb-4",
              "text-xl font-semibold text-yellow-400 mb-4"
            )}>
              Enhanced Acknowledgement Receipt
            </h2>

            <div className="space-y-4">
              <div className={getContrastClass(
                "bg-green-50 border border-green-200 rounded-lg p-4",
                "bg-gray-800 border border-yellow-400 rounded-lg p-4"
              )}>
                <div className={getContrastClass(
                  "text-green-800 font-medium",
                  "text-yellow-400 font-medium"
                )}>
                  Reference Number
                </div>
                <div className={getContrastClass(
                  "text-green-900 font-bold text-lg",
                  "text-yellow-200 font-bold text-lg"
                )}>
                  {acknowledgementData.referenceNumber}
                </div>
              </div>

              {acknowledgementData.allocation && (
                <div className={getContrastClass(
                  "bg-blue-50 border border-blue-200 rounded-lg p-4",
                  "bg-gray-800 border border-blue-400 rounded-lg p-4"
                )}>
                  <div className={getContrastClass(
                    "text-blue-800 font-medium mb-2",
                    "text-blue-400 font-medium mb-2"
                  )}>
                    Donation Allocation
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={getContrastClass("text-blue-600 text-sm", "text-blue-300 text-sm")}>
                        General SPTA
                      </div>
                      <div className={getContrastClass("text-blue-900 font-bold", "text-blue-200 font-bold")}>
                        ₱{acknowledgementData.allocation.generalSPTA}
                      </div>
                    </div>
                    <div>
                      <div className={getContrastClass("text-blue-600 text-sm", "text-blue-300 text-sm")}>
                        11Mercado PTA Projects
                      </div>
                      <div className={getContrastClass("text-blue-900 font-bold", "text-blue-200 font-bold")}>
                        ₱{acknowledgementData.allocation.mercadoPTA}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={getContrastClass("text-gray-600 text-sm", "text-yellow-300 text-sm")}>
                    Electronic Signature
                  </div>
                  <div className={getContrastClass("text-gray-900 font-medium italic", "text-yellow-200 font-medium italic")}>
                    {acknowledgementData.eSignature}
                  </div>
                </div>
                <div>
                  <div className={getContrastClass("text-gray-600 text-sm", "text-yellow-300 text-sm")}>
                    Agreement Status
                  </div>
                  <div className={getContrastClass("text-green-600 font-medium", "text-green-400 font-medium")}>
                    ✓ Accepted
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={getContrastClass("text-gray-600 text-sm", "text-yellow-300 text-sm")}>
                    Attachments
                  </div>
                  <div className={getContrastClass("text-gray-900 font-medium", "text-yellow-200 font-medium")}>
                    Receipt: {acknowledgementData.receipt ? '✓ Uploaded' : '✗ None'}
                  </div>
                  <div className={getContrastClass("text-gray-900 font-medium", "text-yellow-200 font-medium")}>
                    Photo: {acknowledgementData.photo ? '✓ Uploaded' : '✗ None'}
                  </div>
                </div>
                <div>
                  <div className={getContrastClass("text-gray-600 text-sm", "text-yellow-300 text-sm")}>
                    Total Amount
                  </div>
                  <div className={getContrastClass("text-gray-900 font-bold text-lg", "text-yellow-200 font-bold text-lg")}>
                    {acknowledgementData.amount ? `₱${acknowledgementData.amount}` : 'In-kind'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={downloadAcknowledgement}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={20} />
            Download Enhanced Receipt
          </button>
          <button
            onClick={() => {
              setShowAcknowledgement(false);
              setAcknowledgementData(null);
              onClose();
            }}
            className={getContrastClass(
              "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors",
              "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            )}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      <div className={getContrastClass(
        "bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={getContrastClass(
            "text-2xl font-bold text-white",
            "text-2xl font-bold text-yellow-400"
          )}>
            Enhanced Donation Form
          </h1>
          <div className="flex gap-2">
            <button
              onClick={testSupabaseConnection}
              className={getContrastClass(
                "bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm transition-colors text-white",
                "bg-green-600 border border-green-400 hover:bg-green-700 px-3 py-1 rounded-lg text-sm transition-colors text-white"
              )}
            >
              Test DB
            </button>
            <button
              onClick={testWithFileAttachment}
              className={getContrastClass(
                "bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg text-sm transition-colors text-white",
                "bg-orange-600 border border-orange-400 hover:bg-orange-700 px-3 py-1 rounded-lg text-sm transition-colors text-white"
              )}
            >
              Test w/File
            </button>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={getContrastClass(
                "bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-lg text-sm transition-colors text-white",
                "bg-purple-600 border border-purple-400 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm transition-colors text-white"
              )}
            >
              {debugMode ? 'Hide Debug' : 'Schema Debug'}
            </button>
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className={getContrastClass(
                "bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors",
                "bg-gray-800 border border-yellow-400 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm transition-colors text-yellow-400"
              )}
            >
              Edit Entry
            </button>
          </div>
        </div>
        
        {showEditForm && (
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter reference number"
                value={editReferenceNumber}
                onChange={(e) => setEditReferenceNumber(e.target.value)}
                className={getContrastClass(
                  "flex-1 p-2 rounded border border-gray-300 text-black",
                  "flex-1 p-2 rounded border border-gray-600 bg-gray-900 text-yellow-200"
                )}
              />
              <button
                onClick={handleEditEntry}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-medium transition-colors"
              >
                Load
              </button>
            </div>
          </div>
        )}
        
        {/* Schema Debug Panel */}
        {debugMode && (
          <div className={getContrastClass(
            "bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4",
            "bg-gray-800 border border-yellow-400 rounded-lg p-4 mt-4"
          )}>
            <h3 className={getContrastClass("text-gray-800 font-bold mb-2", "text-yellow-400 font-bold mb-2")}>
              🔍 Mobile vs Desktop Debug Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={getContrastClass("bg-white p-3 rounded", "bg-gray-900 p-3 rounded")}>
                <h4 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-300")}>
                  Device Info
                </h4>
                <div className={getContrastClass("text-xs text-gray-600", "text-xs text-yellow-200")}>
                  <p>📱 Mobile: {/Mobi|Android/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
                  <p>🌐 Online: {navigator.onLine ? 'Yes' : 'No'}</p>
                  <p>🕐 Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                  <p>💾 Storage: {typeof localStorage !== 'undefined' ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
              <div className={getContrastClass("bg-white p-3 rounded", "bg-gray-900 p-3 rounded")}>
                <h4 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-300")}>
                  Browser Capabilities
                </h4>
                <div className={getContrastClass("text-xs text-gray-600", "text-xs text-yellow-200")}>
                  <p>📄 FileReader: {typeof FileReader !== 'undefined' ? 'Yes' : 'No'}</p>
                  <p>🎯 Fetch API: {typeof fetch !== 'undefined' ? 'Yes' : 'No'}</p>
                  <p>🔗 WebSocket: {typeof WebSocket !== 'undefined' ? 'Yes' : 'No'}</p>
                  <p>📊 JSON: {typeof JSON !== 'undefined' ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={testMobileCompatibility}
                className={getContrastClass(
                  "bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white text-sm",
                  "bg-blue-600 border border-blue-400 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
                )}
              >
                Test Mobile File Processing
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Parent/Guardian Name */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Parent/Guardian/Donor Name *
          </label>
          <input
            type="text"
            value={formData.parentName}
            onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.parentName 
                ? 'border-red-500' 
                : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter full name"
          />
          {errors.parentName && (
            <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>
          )}
        </div>

        {/* Student Name */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Full Name of Student *
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.studentName 
                ? 'border-red-500' 
                : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter student's full name"
          />
          {errors.studentName && (
            <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>
          )}
        </div>

        {/* Mode of Donation */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-3",
            "block text-sm font-medium text-yellow-400 mb-3"
          )}>
            Mode of Donation *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'ewallet', label: 'E-wallet', icon: <CreditCard size={20} />, desc: 'GCash, Maya, etc.' },
              { id: 'bank', label: 'Bank Transfer', icon: <Banknote size={20} />, desc: 'Bank to bank' },
              { id: 'cash', label: 'Cash', icon: <Banknote size={20} />, desc: 'Physical cash' },
              { id: 'inkind', label: 'In-kind', icon: <Gift size={20} />, desc: 'Items/goods' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, donationMode: mode.id as any }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.donationMode === mode.id
                    ? getContrastClass('border-blue-500 bg-blue-50', 'border-yellow-400 bg-gray-800')
                    : getContrastClass('border-gray-200 bg-white hover:border-gray-300', 'border-gray-600 bg-gray-900 hover:border-gray-500')
                }`}
              >
                <div className={getContrastClass(
                  formData.donationMode === mode.id ? 'text-blue-600' : 'text-gray-600',
                  formData.donationMode === mode.id ? 'text-yellow-400' : 'text-yellow-300'
                )}>
                  {mode.icon}
                </div>
                <div className={getContrastClass(
                  formData.donationMode === mode.id ? 'text-blue-900 font-medium' : 'text-gray-900',
                  formData.donationMode === mode.id ? 'text-yellow-400 font-medium' : 'text-yellow-200'
                )}>
                  {mode.label}
                </div>
                <div className={getContrastClass('text-gray-500 text-xs', 'text-yellow-300 text-xs')}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount and Allocation for monetary donations */}
        {(formData.donationMode === 'ewallet' || formData.donationMode === 'bank' || formData.donationMode === 'cash') && (
          <>
            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Amount *
              </label>
              <div className="relative">
                <span className={getContrastClass(
                  "absolute left-3 top-3 text-gray-500",
                  "absolute left-3 top-3 text-yellow-300"
                )}>
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`w-full pl-8 p-3 rounded-xl border ${
                    errors.amount 
                      ? 'border-red-500' 
                      : getContrastClass('border-gray-300', 'border-gray-600')
                  } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Donation Allocation */}
            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-3",
                "block text-sm font-medium text-yellow-400 mb-3"
              )}>
                Manual Donation Allocation *
              </label>

              {/* Calculator-style Formula Display */}
              <div className={`mb-4 p-4 rounded-xl border-2 ${
                isAllocationExceeding() 
                  ? 'border-red-500 bg-red-50' 
                  : isAllocationValid() 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-yellow-400 bg-yellow-50'
              } ${getContrastClass('', 'bg-opacity-20')}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-lg font-mono font-bold">
                    <span className={getContrastClass('text-gray-700', 'text-yellow-200')}>
                      ₱{(formData.allocation?.generalSPTA || 0).toFixed(2)}
                    </span>
                    <span className={getContrastClass('text-gray-500', 'text-yellow-300')}>+</span>
                    <span className={getContrastClass('text-gray-700', 'text-yellow-200')}>
                      ₱{(formData.allocation?.mercadoPTA || 0).toFixed(2)}
                    </span>
                    <span className={getContrastClass('text-gray-500', 'text-yellow-300')}>=</span>
                    <span className={`font-bold text-lg ${
                      isAllocationExceeding() 
                        ? 'text-red-600' 
                        : isAllocationValid() 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                    }`}>
                      ₱{getAllocationTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={getContrastClass('text-gray-600', 'text-yellow-300')}>
                      Target: ₱{getTotalAmount().toFixed(2)} | 
                      Remaining: ₱{getRemainingAmount().toFixed(2)}
                    </span>
                  </div>
                  {isAllocationExceeding() && (
                    <div className="mt-2 text-red-600 text-sm font-medium">
                      ⚠️ Allocation exceeds donation amount by ₱{(getAllocationTotal() - getTotalAmount()).toFixed(2)}
                    </div>
                  )}
                  {isAllocationValid() && getTotalAmount() > 0 && (
                    <div className="mt-2 text-green-600 text-sm font-medium">
                      ✅ Allocation matches donation amount perfectly!
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className={getContrastClass(
                  "bg-gray-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={getContrastClass("text-gray-700 font-medium", "text-yellow-400 font-medium")}>
                      General SPTA
                    </label>
                    <DollarSign size={16} className={getContrastClass("text-gray-500", "text-yellow-300")} />
                  </div>
                  <div className="relative">
                    <span className={getContrastClass("absolute left-3 top-3 text-gray-500", "absolute left-3 top-3 text-yellow-300")}>₱</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={getTotalAmount()}
                      value={formData.allocation?.generalSPTA || 0}
                      onChange={(e) => handleAllocationChange('generalSPTA', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 p-3 rounded-xl border-2 ${getInputBorderClass('generalSPTA')} ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className={getContrastClass(
                  "bg-gray-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={getContrastClass("text-gray-700 font-medium", "text-yellow-400 font-medium")}>
                      11Mercado PTA Projects
                    </label>
                    <DollarSign size={16} className={getContrastClass("text-gray-500", "text-yellow-300")} />
                  </div>
                  <div className="relative">
                    <span className={getContrastClass("absolute left-3 top-3 text-gray-500", "absolute left-3 top-3 text-yellow-300")}>₱</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={getTotalAmount()}
                      value={formData.allocation?.mercadoPTA || 0}
                      onChange={(e) => handleAllocationChange('mercadoPTA', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 p-3 rounded-xl border-2 ${getInputBorderClass('mercadoPTA')} ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              {errors.allocation && (
                <p className="text-red-500 text-xs mt-1">{errors.allocation}</p>
              )}
            </div>
          </>
        )}

        {/* E-wallet/Bank Transfer specific fields */}
        {(formData.donationMode === 'ewallet' || formData.donationMode === 'bank') && (
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Upload Transaction Receipt/Confirmation *
            </label>
            <button
              type="button"
              onClick={() => handleFileUpload('receipt')}
              className={`w-full p-4 rounded-xl border-2 border-dashed ${
                errors.receipt 
                  ? 'border-red-500' 
                  : getContrastClass('border-gray-300 hover:border-gray-400', 'border-gray-600 hover:border-gray-500')
              } ${getContrastClass('bg-gray-50 hover:bg-gray-100', 'bg-gray-800 hover:bg-gray-700')} transition-colors`}
            >
              <Upload size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
              <p className={getContrastClass("text-gray-600 font-medium", "text-yellow-200 font-medium")}>
                {formData.receipt ? formData.receipt.name : 'Tap to upload transaction receipt'}
              </p>
              <p className={getContrastClass("text-gray-400 text-sm", "text-yellow-300 text-sm")}>
                Required: Screenshot of online transaction
              </p>
            </button>
            <input
              ref={receiptInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(e, 'receipt')}
              className="hidden"
            />
            {errors.receipt && (
              <p className="text-red-500 text-xs mt-1">{errors.receipt}</p>
            )}
          </div>
        )}

        {/* Cash specific fields */}
        {formData.donationMode === 'cash' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={getContrastClass(
                  "block text-sm font-medium text-gray-700 mb-2",
                  "block text-sm font-medium text-yellow-400 mb-2"
                )}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full p-3 rounded-xl border ${
                    errors.date 
                      ? 'border-red-500' 
                      : getContrastClass('border-gray-300', 'border-gray-600')
                  } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className={getContrastClass(
                  "block text-sm font-medium text-gray-700 mb-2",
                  "block text-sm font-medium text-yellow-400 mb-2"
                )}>
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className={`w-full p-3 rounded-xl border ${getContrastClass('border-gray-300', 'border-gray-600')} ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Handed Over To *
              </label>
              <input
                type="text"
                value={formData.handedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, handedTo: e.target.value }))}
                className={`w-full p-3 rounded-xl border ${
                  errors.handedTo 
                    ? 'border-red-500' 
                    : getContrastClass('border-gray-300', 'border-gray-600')
                } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Name of person who received the cash"
              />
              {errors.handedTo && (
                <p className="text-red-500 text-xs mt-1">{errors.handedTo}</p>
              )}
            </div>

            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Upload Photo (Optional - E-signature required if no photo)
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('photo')}
                className={`w-full p-4 rounded-xl border-2 border-dashed ${
                  errors.photo 
                    ? 'border-red-500' 
                    : getContrastClass('border-gray-300 hover:border-gray-400', 'border-gray-600 hover:border-gray-500')
                } ${getContrastClass('bg-gray-50 hover:bg-gray-100', 'bg-gray-800 hover:bg-gray-700')} transition-colors`}
              >
                <Camera size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
                <p className={getContrastClass("text-gray-600 font-medium", "text-yellow-200 font-medium")}>
                  {formData.photo ? formData.photo.name : 'Tap to upload photo'}
                </p>
                <p className={getContrastClass("text-gray-400 text-sm", "text-yellow-300 text-sm")}>
                  Required: Photo as proof of cash donation
                </p>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="hidden"
              />
              {errors.photo && (
                <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
              )}
            </div>
          </>
        )}

        {/* In-kind specific fields */}
        {formData.donationMode === 'inkind' && (
          <>
            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Items Description *
              </label>
              <textarea
                value={formData.items}
                onChange={(e) => setFormData(prev => ({ ...prev, items: e.target.value }))}
                className={`w-full p-3 rounded-xl border ${
                  errors.items 
                    ? 'border-red-500' 
                    : getContrastClass('border-gray-300', 'border-gray-600')
                } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows={3}
                placeholder="Describe the items you are donating"
              />
              {errors.items && (
                <p className="text-red-500 text-xs mt-1">{errors.items}</p>
              )}
            </div>

            <div>
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Upload Photo (Optional - E-signature required if no photo)
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('photo')}
                className={`w-full p-4 rounded-xl border-2 border-dashed ${
                  errors.photo 
                    ? 'border-red-500' 
                    : getContrastClass('border-gray-300 hover:border-gray-400', 'border-gray-600 hover:border-gray-500')
                } ${getContrastClass('bg-gray-50 hover:bg-gray-100', 'bg-gray-800 hover:bg-gray-700')} transition-colors`}
              >
                <Camera size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
                <p className={getContrastClass("text-gray-600 font-medium", "text-yellow-200 font-medium")}>
                  {formData.photo ? formData.photo.name : 'Tap to upload photo of items'}
                </p>
                <p className={getContrastClass("text-gray-400 text-sm", "text-yellow-300 text-sm")}>
                  Required: Photo for verification
                </p>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="hidden"
              />
              {errors.photo && (
                <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
              )}
            </div>
          </>
        )}

        {/* Electronic Signature */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Electronic Signature *
          </label>
          <div className="relative">
            <PenTool size={20} className={getContrastClass(
              "absolute left-3 top-3 text-gray-400",
              "absolute left-3 top-3 text-yellow-400"
            )} />
            <input
              type="text"
              value={formData.eSignature}
              onChange={(e) => setFormData(prev => ({ ...prev, eSignature: e.target.value }))}
              className={`w-full pl-10 p-3 rounded-xl border ${
                errors.eSignature 
                  ? 'border-red-500' 
                  : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500 font-cursive`}
              placeholder="Type your full name as electronic signature"
            />
          </div>
          {errors.eSignature && (
            <p className="text-red-500 text-xs mt-1">{errors.eSignature}</p>
          )}
          <p className={getContrastClass("text-gray-500 text-xs mt-1", "text-yellow-300 text-xs mt-1")}>
            By typing your name, you agree this serves as your electronic signature
          </p>
        </div>

        {/* Agreement Acceptance */}
        <div className={getContrastClass(
          "bg-blue-50 border border-blue-200 rounded-xl p-4",
          "bg-gray-800 border border-yellow-400 rounded-xl p-4"
        )}>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreement"
              checked={formData.agreementAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
              className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                errors.agreementAccepted ? 'border-red-500' : ''
              }`}
            />
            <label 
              htmlFor="agreement" 
              className={getContrastClass("text-sm text-blue-800", "text-sm text-yellow-200")}
            >
              <strong>I hereby confirm that all information provided is accurate and I understand that this donation will be used for 11Mercado PTA activities as specified in my allocation.</strong>
            </label>
          </div>
          {errors.agreementAccepted && (
            <p className="text-red-500 text-xs mt-2">{errors.agreementAccepted}</p>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Secure Submission...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Submit Secure Donation
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={getContrastClass(
              "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors",
              "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            )}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}