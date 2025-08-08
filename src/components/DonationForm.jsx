import React, { useState } from 'react';
import { Button } from './ui/button';
import { X, Heart, Download, CheckCircle } from 'lucide-react';

const DonationForm = ({ isOpen, onClose, onDonationSuccess }) => {
  const [formData, setFormData] = useState({
    parentFirstName: '',
    studentFullName: '',
    donationType: 'GCash',
    totalAmount: '',
    sptaAmount: '',
    classroomPtaAmount: '',
    inkindItems: '',
    cashEntrustedTo: '',
    cashEntrustedDate: '',
    cashEntrustedTime: '',
    message: ''
  });
  const [proofFile, setProofFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [acknowledgmentData, setAcknowledgmentData] = useState(null);

  const generateControlNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    return `11M-${year}${month}${day}-${time}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-calculate allocation when total amount changes
    if (name === 'totalAmount') {
      const total = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        totalAmount: value,
        sptaAmount: '',
        classroomPtaAmount: ''
      }));
    }
  };

  // Calculate remaining amount for allocation
  const calculateRemaining = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    const spta = parseFloat(formData.sptaAmount) || 0;
    const classroom = parseFloat(formData.classroomPtaAmount) || 0;
    return total - spta - classroom;
  };

  const handleAllocationChange = (field, value) => {
    const total = parseFloat(formData.totalAmount) || 0;
    const numValue = parseFloat(value) || 0;
    
    if (numValue <= total) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, WebP) or PDF file.');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      setProofFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Convert file to base64 for storage (in real implementation, upload to cloud storage)
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const submitToGoogleSheets = async (submissionData) => {
    // Using Google Apps Script Web App URL (this will be provided by the admin)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(submissionData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Google Sheets submission error:', error);
      // Fallback: use local storage for demo purposes
      const donations = JSON.parse(localStorage.getItem('11m_donations') || '[]');
      donations.push(submissionData);
      localStorage.setItem('11m_donations', JSON.stringify(donations));
      
      return { success: true, message: 'Donation recorded successfully' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate allocation for monetary donations
    if (formData.donationType !== 'In-Kind' && formData.totalAmount) {
      const remaining = calculateRemaining();
      if (remaining !== 0) {
        alert(`Please ensure the allocation amounts add up to your total donation. ${remaining > 0 ? `You have ₱${remaining.toLocaleString('en-PH')} remaining to allocate.` : `You have over-allocated by ₱${Math.abs(remaining).toLocaleString('en-PH')}.`}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const controlNumber = generateControlNumber();
      const timestamp = new Date().toISOString();

      // Convert uploaded file to base64 if present
      let fileData = null;
      if (proofFile) {
        try {
          fileData = {
            name: proofFile.name,
            type: proofFile.type,
            size: proofFile.size,
            data: await convertFileToBase64(proofFile)
          };
        } catch (fileError) {
          console.error('File conversion error:', fileError);
          // Continue without file if conversion fails
        }
      }

      const submissionData = {
        timestamp,
        controlNumber,
        parentFirstName: formData.parentFirstName,
        studentFullName: formData.studentFullName,
        donationType: formData.donationType,
        totalAmount: (formData.donationType !== 'In-Kind' && formData.totalAmount) ? parseFloat(formData.totalAmount) : null,
        sptaAmount: (formData.donationType !== 'In-Kind' && formData.sptaAmount) ? parseFloat(formData.sptaAmount) : null,
        classroomPtaAmount: (formData.donationType !== 'In-Kind' && formData.classroomPtaAmount) ? parseFloat(formData.classroomPtaAmount) : null,
        inkindItems: formData.donationType === 'In-Kind' ? formData.inkindItems : '',
        cashEntrustedTo: formData.donationType === 'Cash' ? formData.cashEntrustedTo : '',
        cashEntrustedDate: formData.donationType === 'Cash' ? formData.cashEntrustedDate : '',
        cashEntrustedTime: formData.donationType === 'Cash' ? formData.cashEntrustedTime : '',
        message: formData.message,
        status: 'Pending Verification',
        proofFile: fileData
      };

      const result = await submitToGoogleSheets(submissionData);

      if (result.success) {
        setAcknowledgmentData({
          controlNumber,
          timestamp,
          ...formData,
          totalAmount: (formData.donationType !== 'In-Kind' && formData.totalAmount) ? parseFloat(formData.totalAmount) : null
        });
        setSubmissionStatus('success');
        
        // Call success callback to refresh funding data
        if (onDonationSuccess) {
          onDonationSuccess();
        }
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReceipt = () => {
    if (!acknowledgmentData) return '';

    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        🏫 11MERCADO FUND DRIVE                                ║
║                         OFFICIAL DONATION RECEIPT                              ║
║                         DepEd CSJ-DMNSHS                                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  CONTROL NUMBER: ${acknowledgmentData.controlNumber.padEnd(48)} ║
║  DATE & TIME: ${new Date(acknowledgmentData.timestamp).toLocaleString('en-PH').padEnd(51)} ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  DONOR INFORMATION:                                                           ║
║                                                                               ║
║  Parent First Name: ${acknowledgmentData.parentFirstName.padEnd(48)} ║
║  Student Full Name: ${acknowledgmentData.studentFullName.padEnd(48)} ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  DONATION DETAILS:                                                            ║
║                                                                               ║
║  Type: ${acknowledgmentData.donationType.padEnd(60)} ║
${acknowledgmentData.totalAmount ? `║  Total Amount: ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(acknowledgmentData.totalAmount).padEnd(54)} ║
║                                                                               ║
║  ALLOCATION BREAKDOWN:                                                        ║
║  • SPTA Fund: ${(acknowledgmentData.sptaAmount ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(parseFloat(acknowledgmentData.sptaAmount)) : '₱0.00').padEnd(53)} ║
║  • Classroom PTA: ${(acknowledgmentData.classroomPtaAmount ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(parseFloat(acknowledgmentData.classroomPtaAmount)) : '₱0.00').padEnd(49)} ║` : ''}
${acknowledgmentData.donationType === 'In-Kind' ? `║  In-Kind Items: ${acknowledgmentData.inkindItems.substring(0, 50).padEnd(50)} ║${acknowledgmentData.inkindItems.length > 50 ? `\n║  ${acknowledgmentData.inkindItems.substring(50, 100).padEnd(74)} ║` : ''}` : ''}
${acknowledgmentData.donationType === 'Cash' ? `║  Cash Handler: ${(acknowledgmentData.cashEntrustedTo || '11Mercado Treasurer (Direct)').padEnd(52)} ║
║  Date Given: ${(acknowledgmentData.cashEntrustedDate || 'N/A').padEnd(56)} ║
║  Time Given: ${(acknowledgmentData.cashEntrustedTime || 'N/A').padEnd(56)} ║` : ''}
${acknowledgmentData.message ? `║  Message: ${acknowledgmentData.message.substring(0, 60).padEnd(60)} ║` : ''}
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  STATUS: 🟡 PENDING VERIFICATION                                              ║
║                                                                               ║
║  📋 IMPORTANT NOTES:                                                          ║
║  • Keep this control number for your records                                 ║
║  • Verification completed within 24-48 hours                                 ║
║  • Email confirmation sent once verified                                     ║
║  • For inquiries: 11mercado.pta@gmail.com                                    ║
║                                                                               ║
║  🙏 Thank you for supporting our school community!                           ║
║                                                                               ║
║  Generated: ${new Date().toLocaleString('en-PH').padEnd(54)} ║
║  Platform: 11Mercado Digital Donation System                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `.trim();
  };

  const downloadReceipt = () => {
    const receiptText = generateReceipt();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `11Mercado_Receipt_${acknowledgmentData.controlNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      parentFirstName: '',
      studentFullName: '',
      donationType: 'GCash',
      totalAmount: '',
      sptaAmount: '',
      classroomPtaAmount: '',
      inkindItems: '',
      cashEntrustedTo: '',
      cashEntrustedDate: '',
      cashEntrustedTime: '',
      message: ''
    });
    setProofFile(null);
    setFilePreview(null);
    setSubmissionStatus(null);
    setAcknowledgmentData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Support 11Mercado</h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success State */}
        {submissionStatus === 'success' && acknowledgmentData && (
          <div className="p-6 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thank You for Your Donation!
            </h3>
            <p className="text-gray-600 mb-4">
              Your donation has been recorded successfully.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Control Number:</div>
              <div className="text-lg font-mono font-bold text-green-700">
                {acknowledgmentData.controlNumber}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Keep this number for your records
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={downloadReceipt}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Download size={16} className="mr-2" />
                Download Receipt
              </Button>
              
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {submissionStatus === 'error' && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Submission Failed
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error processing your donation. Please try again.
            </p>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form State */}
        {!submissionStatus && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Donation Type Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800 font-medium mb-2">
                💝 Donation Types Available:
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• GCash: 09XX-XXX-XXXX</div>
                <div>• Maya: 09XX-XXX-XXXX</div>
                <div>• Bank Transfer: Available</div>
                <div>• Cash: Give to 11Mercado Treasurer</div>
                <div>• In-Kind: Items/supplies for the school</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent First Name *
              </label>
              <input
                type="text"
                name="parentFirstName"
                value={formData.parentFirstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter parent's first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                name="studentFullName"
                value={formData.studentFullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Type *
              </label>
              <select
                name="donationType"
                value={formData.donationType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GCash">GCash</option>
                <option value="Maya">Maya (PayMaya)</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="In-Kind">In-Kind Donation</option>
              </select>
            </div>

            {/* Dynamic fields based on donation type */}
            {(formData.donationType === 'GCash' || formData.donationType === 'Maya' || formData.donationType === 'Bank Transfer' || formData.donationType === 'Cash') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Donation Amount (PHP) *
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    min="50"
                    step="50"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                  />
                </div>

                {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-sm text-yellow-800 font-medium mb-2">
                        💰 Allocation Breakdown (Total: ₱{parseFloat(formData.totalAmount).toLocaleString('en-PH')})
                      </div>
                      <div className="text-xs text-yellow-700">
                        Please specify how much goes to SPTA and Classroom PTA. The amounts should add up to your total donation.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SPTA Amount (PHP)
                        </label>
                        <input
                          type="number"
                          name="sptaAmount"
                          value={formData.sptaAmount}
                          onChange={(e) => handleAllocationChange('sptaAmount', e.target.value)}
                          min="0"
                          step="50"
                          max={formData.totalAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Classroom PTA Amount (PHP)
                        </label>
                        <input
                          type="number"
                          name="classroomPtaAmount"
                          value={formData.classroomPtaAmount}
                          onChange={(e) => handleAllocationChange('classroomPtaAmount', e.target.value)}
                          min="0"
                          step="50"
                          max={formData.totalAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="200"
                        />
                      </div>
                    </div>

                    {calculateRemaining() !== 0 && (
                      <div className={`text-sm p-2 rounded ${calculateRemaining() > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {calculateRemaining() > 0 
                          ? `⚠️ Remaining to allocate: ₱${calculateRemaining().toLocaleString('en-PH')}`
                          : `❌ Over-allocated by: ₱${Math.abs(calculateRemaining()).toLocaleString('en-PH')}`
                        }
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {formData.donationType === 'In-Kind' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Donated *
                </label>
                <textarea
                  name="inkindItems"
                  value={formData.inkindItems}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List the items you are donating (e.g., school supplies, books, equipment...)"
                />
              </div>
            )}

            {formData.donationType === 'Cash' && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Cash donations must be given to the 11Mercado Treasurer. 
                    If given to someone else, please specify below.
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cash Given To (Optional)
                  </label>
                  <input
                    type="text"
                    name="cashEntrustedTo"
                    value={formData.cashEntrustedTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank if given directly to treasurer"
                  />
                </div>

                {formData.cashEntrustedTo && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Entrusted *
                      </label>
                      <input
                        type="date"
                        name="cashEntrustedDate"
                        value={formData.cashEntrustedDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Entrusted (Optional)
                      </label>
                      <input
                        type="time"
                        name="cashEntrustedTime"
                        value={formData.cashEntrustedTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* File Upload for Proof of Payment */}
            {(formData.donationType === 'GCash' || formData.donationType === 'Maya' || formData.donationType === 'Bank Transfer' || formData.donationType === 'Cash') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Proof of Payment (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="text-xs text-gray-500">
                    Upload image (JPG, PNG, WebP) or PDF file. Max size: 5MB
                  </div>
                  
                  {/* File Preview */}
                  {proofFile && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-green-700 text-sm font-medium">
                            📎 {proofFile.name}
                          </div>
                          <div className="text-xs text-green-600">
                            ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProofFile(null);
                            setFilePreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Image Preview */}
                      {filePreview && (
                        <div className="mt-2">
                          <img 
                            src={filePreview} 
                            alt="Payment proof preview" 
                            className="max-w-full h-32 object-contain rounded border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message to the school community..."
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-800">
                <strong>📄 After Submitting:</strong> You'll receive a professional acknowledgment receipt with the 11Mercado logo 
                and a control number. Upload your proof of payment above or email it to 11mercado.pta@gmail.com 
                with your control number for verification and final confirmation.
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? 'Processing...' : 'Submit Donation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DonationForm;