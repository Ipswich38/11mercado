import React, { useState, useRef } from 'react';
import { Upload, Calendar, Clock, User, CreditCard, Banknote, Gift, Camera, Download, Edit3, CheckCircle } from 'lucide-react';

interface DonationFormData {
  parentName: string;
  studentName: string;
  donationMode: 'ewallet' | 'bank' | 'cash' | 'inkind';
  amount?: string;
  date: string;
  time?: string;
  handedTo?: string;
  items?: string;
  receipt?: File | null;
  photo?: File | null;
  referenceNumber?: string;
}

interface AcknowledgementData extends DonationFormData {
  referenceNumber: string;
  submissionDate: string;
  submissionTime: string;
  hasReceipt: boolean;
  hasPhoto: boolean;
  fileNames: {
    receipt: string | null;
    photo: string | null;
  };
}

export default function DonationForm({ getContrastClass, onClose }) {
  const [formData, setFormData] = useState<DonationFormData>({
    parentName: '',
    studentName: '',
    donationMode: 'ewallet',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    handedTo: '',
    items: '',
    receipt: null,
    photo: null
  });

  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [acknowledgementData, setAcknowledgementData] = useState<AcknowledgementData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editReferenceNumber, setEditReferenceNumber] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (formData.donationMode === 'ewallet' || formData.donationMode === 'bank') {
      if (!formData.amount) {
        newErrors.amount = 'Amount is required for e-wallet/bank transfers';
      }
      if (!formData.receipt) {
        newErrors.receipt = 'Receipt upload is required for e-wallet/bank transfers';
      }
    }

    if (formData.donationMode === 'cash') {
      if (!formData.amount) {
        newErrors.amount = 'Amount is required for cash donations';
      }
      if (!formData.date) {
        newErrors.date = 'Date is required for cash donations';
      }
      if (!formData.handedTo) {
        newErrors.handedTo = 'Person who received the cash must be specified';
      }
    }

    if (formData.donationMode === 'inkind') {
      if (!formData.items) {
        newErrors.items = 'Items description is required for in-kind donations';
      }
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const submitToGoogleSheets = async (data: AcknowledgementData): Promise<boolean> => {
    try {
      // This would integrate with Google Sheets API
      // For now, we'll simulate the API call
      console.log('Submitting to Google Sheets:', data);
      
      // Convert files to base64 for storage
      let processedData = { ...data };
      
      // Store files as base64 strings with metadata
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      
      if (formData.receipt) {
        const receiptBase64 = await fileToBase64(formData.receipt);
        fileStorage[`${data.referenceNumber}_receipt`] = {
          data: receiptBase64,
          name: formData.receipt.name,
          type: formData.receipt.type,
          size: formData.receipt.size
        };
        processedData.hasReceipt = true;
        processedData.fileNames = { 
          ...processedData.fileNames, 
          receipt: formData.receipt.name 
        };
      }
      
      if (formData.photo) {
        const photoBase64 = await fileToBase64(formData.photo);
        fileStorage[`${data.referenceNumber}_photo`] = {
          data: photoBase64,
          name: formData.photo.name,
          type: formData.photo.type,
          size: formData.photo.size
        };
        processedData.hasPhoto = true;
        processedData.fileNames = { 
          ...processedData.fileNames, 
          photo: formData.photo.name 
        };
      }
      
      localStorage.setItem('donationFiles', JSON.stringify(fileStorage));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage as a fallback
      const existingEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
      existingEntries.push(processedData);
      localStorage.setItem('donationEntries', JSON.stringify(existingEntries));
      
      return true;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      return false;
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
        submissionTime,
        hasReceipt: !!formData.receipt,
        hasPhoto: !!formData.photo,
        fileNames: {
          receipt: formData.receipt?.name || null,
          photo: formData.photo?.name || null
        }
      };

      const success = await submitToGoogleSheets(acknowledgement);
      
      if (success) {
        setAcknowledgementData(acknowledgement);
        setShowAcknowledgement(true);
      } else {
        alert('There was an error submitting your donation. Please try again.');
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

    // Check if editing is within 24 hours
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

    // Load the entry for editing
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

DONATION DETAILS:
- Mode: ${acknowledgementData.donationMode.toUpperCase()}
- Amount: ${acknowledgementData.amount ? '₱' + acknowledgementData.amount : 'N/A'}
- Date: ${acknowledgementData.date}
- Time: ${acknowledgementData.time || 'N/A'}
- Handed to: ${acknowledgementData.handedTo || 'N/A'}
- Items: ${acknowledgementData.items || 'N/A'}

Thank you for your generous contribution to 11Mercado PTA!

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
              Acknowledgement Receipt
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={getContrastClass(
                    "text-gray-600 text-sm",
                    "text-yellow-300 text-sm"
                  )}>
                    Submission Date
                  </div>
                  <div className={getContrastClass(
                    "text-gray-900 font-medium",
                    "text-yellow-200 font-medium"
                  )}>
                    {acknowledgementData.submissionDate}
                  </div>
                </div>
                <div>
                  <div className={getContrastClass(
                    "text-gray-600 text-sm",
                    "text-yellow-300 text-sm"
                  )}>
                    Submission Time
                  </div>
                  <div className={getContrastClass(
                    "text-gray-900 font-medium",
                    "text-yellow-200 font-medium"
                  )}>
                    {acknowledgementData.submissionTime}
                  </div>
                </div>
              </div>

              <div>
                <div className={getContrastClass(
                  "text-gray-600 text-sm",
                  "text-yellow-300 text-sm"
                )}>
                  Parent/Guardian
                </div>
                <div className={getContrastClass(
                  "text-gray-900 font-medium",
                  "text-yellow-200 font-medium"
                )}>
                  {acknowledgementData.parentName}
                </div>
              </div>

              <div>
                <div className={getContrastClass(
                  "text-gray-600 text-sm",
                  "text-yellow-300 text-sm"
                )}>
                  Student
                </div>
                <div className={getContrastClass(
                  "text-gray-900 font-medium",
                  "text-yellow-200 font-medium"
                )}>
                  {acknowledgementData.studentName}
                </div>
              </div>

              <div>
                <div className={getContrastClass(
                  "text-gray-600 text-sm",
                  "text-yellow-300 text-sm"
                )}>
                  Donation Mode
                </div>
                <div className={getContrastClass(
                  "text-gray-900 font-medium capitalize",
                  "text-yellow-200 font-medium capitalize"
                )}>
                  {acknowledgementData.donationMode.replace('ewallet', 'E-wallet').replace('inkind', 'In-kind')}
                </div>
              </div>

              {acknowledgementData.amount && (
                <div>
                  <div className={getContrastClass(
                    "text-gray-600 text-sm",
                    "text-yellow-300 text-sm"
                  )}>
                    Amount
                  </div>
                  <div className={getContrastClass(
                    "text-gray-900 font-medium text-lg",
                    "text-yellow-200 font-medium text-lg"
                  )}>
                    ₱{acknowledgementData.amount}
                  </div>
                </div>
              )}

              {acknowledgementData.items && (
                <div>
                  <div className={getContrastClass(
                    "text-gray-600 text-sm",
                    "text-yellow-300 text-sm"
                  )}>
                    Items
                  </div>
                  <div className={getContrastClass(
                    "text-gray-900 font-medium",
                    "text-yellow-200 font-medium"
                  )}>
                    {acknowledgementData.items}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={getContrastClass(
            "bg-blue-50 border border-blue-200 rounded-3xl p-4 mt-4",
            "bg-gray-900 border-2 border-yellow-400 rounded-3xl p-4 mt-4"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Edit3 size={20} className={getContrastClass("text-blue-600", "text-yellow-400")} />
              <h3 className={getContrastClass(
                "font-semibold text-blue-800",
                "font-semibold text-yellow-400"
              )}>
                Need to Edit?
              </h3>
            </div>
            <p className={getContrastClass(
              "text-blue-700 text-sm mb-3",
              "text-yellow-200 text-sm mb-3"
            )}>
              You can edit your entry within 24 hours using your reference number.
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={downloadAcknowledgement}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={20} />
            Download Receipt
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
            Donation Form
          </h1>
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
            <p className={getContrastClass(
              "text-white/80 text-xs mt-1",
              "text-yellow-200 text-xs mt-1"
            )}>
              Note: Entries can only be edited within 24 hours of submission
            </p>
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
                <div className={getContrastClass(
                  'text-gray-500 text-xs',
                  'text-yellow-300 text-xs'
                )}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic fields based on donation mode */}
        {(formData.donationMode === 'ewallet' || formData.donationMode === 'bank' || formData.donationMode === 'cash') && (
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
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
        )}

        {/* E-wallet/Bank Transfer specific fields */}
        {(formData.donationMode === 'ewallet' || formData.donationMode === 'bank') && (
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Upload Receipt/Confirmation *
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
              <p className={getContrastClass(
                "text-gray-600 font-medium",
                "text-yellow-200 font-medium"
              )}>
                {formData.receipt ? formData.receipt.name : 'Tap to upload receipt'}
              </p>
              <p className={getContrastClass(
                "text-gray-400 text-sm",
                "text-yellow-300 text-sm"
              )}>
                JPG, PNG, PDF up to 10MB
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
                Upload Photo (Optional)
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('photo')}
                className={`w-full p-4 rounded-xl border-2 border-dashed ${getContrastClass('border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100', 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700')} transition-colors`}
              >
                <Camera size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
                <p className={getContrastClass(
                  "text-gray-600 font-medium",
                  "text-yellow-200 font-medium"
                )}>
                  {formData.photo ? formData.photo.name : 'Tap to upload photo'}
                </p>
                <p className={getContrastClass(
                  "text-gray-400 text-sm",
                  "text-yellow-300 text-sm"
                )}>
                  Optional but helpful
                </p>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="hidden"
              />
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
                Upload Photo (Optional)
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('photo')}
                className={`w-full p-4 rounded-xl border-2 border-dashed ${getContrastClass('border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100', 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700')} transition-colors`}
              >
                <Camera size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
                <p className={getContrastClass(
                  "text-gray-600 font-medium",
                  "text-yellow-200 font-medium"
                )}>
                  {formData.photo ? formData.photo.name : 'Tap to upload photo of items'}
                </p>
                <p className={getContrastClass(
                  "text-gray-400 text-sm",
                  "text-yellow-300 text-sm"
                )}>
                  Optional but helpful for verification
                </p>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="hidden"
              />
            </div>
          </>
        )}

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Submit Donation
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