import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Smartphone, Edit, Star } from 'lucide-react';
import { centralizedDB } from '../utils/centralizedDatabase';

interface NewDonationFormProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
  onDonationSuccess: (data: any) => void;
}

interface FormData {
  parentName: string;
  studentName: string;
  donationMode: 'ewallet' | 'cash' | 'inkind';
  amount: string;
  eSignature: string;
  allocation: {
    generalSPTA: number;
    mercadoPTA: number;
  };
  receipt: File | null;
  agreementAccepted: boolean;
  comments: string;
}

export default function NewDonationForm({ getContrastClass, onClose, onDonationSuccess }: NewDonationFormProps) {
  console.log('🆕 NEW DONATION FORM v2.0 LOADING - Build:', new Date().toISOString());
  
  const [formData, setFormData] = useState<FormData>({
    parentName: '',
    studentName: '',
    donationMode: 'ewallet',
    amount: '',
    eSignature: '',
    allocation: { generalSPTA: 0, mercadoPTA: 0 },
    receipt: null,
    agreementAccepted: false,
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [showSatisfactionSurvey, setShowSatisfactionSurvey] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [showEditMode, setShowEditMode] = useState(false);
  const [editReferenceNumber, setEditReferenceNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile detection
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.parentName.trim()) newErrors.parentName = 'Required';
    if (!formData.studentName.trim()) newErrors.studentName = 'Required';
    if (!formData.eSignature.trim()) newErrors.eSignature = 'Required';
    if (!formData.agreementAccepted) newErrors.agreement = 'Must accept';

    if (formData.donationMode !== 'inkind') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount required';
      }
      const total = parseFloat(formData.amount || '0');
      const allocated = formData.allocation.generalSPTA + formData.allocation.mercadoPTA;
      if (total > 0 && allocated === 0) {
        newErrors.allocation = 'Please allocate the donation amount';
      } else if (Math.abs(total - allocated) > 0.01) {
        newErrors.allocation = `Total allocation (₱${allocated.toFixed(2)}) must equal donation amount (₱${total.toFixed(2)})`;
      } else if (formData.allocation.generalSPTA < 0 || formData.allocation.mercadoPTA < 0) {
        newErrors.allocation = 'Allocation amounts cannot be negative';
      }
    }

    if (formData.donationMode === 'ewallet' && !formData.receipt) {
      newErrors.receipt = 'Receipt required for e-wallet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleAllocationChange = (field: 'generalSPTA' | 'mercadoPTA', value: string) => {
    const numValue = parseFloat(value || '0');
    setFormData(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [field]: numValue
      }
    }));
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB for mobile)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Please use a smaller image (under 5MB).');
        return;
      }
      setFormData(prev => ({ ...prev, receipt: file }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const referenceNumber = `PTA-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Prepare attachment
      let attachmentFile = null;
      let attachmentFilename = null;
      
      if (formData.receipt) {
        try {
          attachmentFile = await fileToBase64(formData.receipt);
          attachmentFilename = formData.receipt.name;
        } catch (error) {
          console.error('File conversion error:', error);
          alert('Error processing file. Please try a different image.');
          setIsSubmitting(false);
          return;
        }
      }

      const donationData = {
        referenceNumber,
        parentName: formData.parentName,
        studentName: formData.studentName,
        donationMode: formData.donationMode === 'ewallet' ? 'e-wallet' : formData.donationMode,
        amount: formData.amount,
        eSignature: formData.eSignature,
        comments: formData.comments,
        submissionDate: new Date().toISOString().split('T')[0],
        submissionTime: new Date().toLocaleTimeString(),
        submissionTimestamp: new Date().toISOString(),
        allocation: formData.allocation,
        attachmentFile,
        attachmentFilename,
        isMobile,
        userAgent: navigator.userAgent
      };

      console.log('🚀 Submitting clean donation:', donationData);
      
      // Direct Supabase submission
      const result = await centralizedDB.submitDonation(donationData);
      
      console.log('📋 Result:', result);

      if (result && result.success) {
        console.log('✅ Success! Showing satisfaction survey first');
        setSuccessData({
          referenceNumber,
          parentName: formData.parentName,
          amount: formData.amount,
          allocation: formData.allocation
        });
        setShowSatisfactionSurvey(true);
        
        // Trigger donation success callback
        onDonationSuccess({
          amount: parseFloat(formData.amount),
          allocation: formData.allocation,
          donorName: formData.parentName,
          studentName: formData.studentName,
          referenceNumber,
          submissionDate: new Date().toISOString().split('T')[0],
          donationMode: formData.donationMode
        });
      } else {
        console.error('❌ Submission failed:', result);
        alert('❌ Submission Failed\n\n' + (result?.error || 'Please try again or contact admin.'));
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('❌ Error submitting donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Satisfaction Survey Screen
  if (showSatisfactionSurvey && successData) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col",
        "fixed inset-0 bg-black z-50 flex flex-col"
      )}>
        <div className={getContrastClass(
          "bg-blue-500 p-4 text-center",
          "bg-gray-900 border-b-2 border-yellow-400 p-4 text-center"
        )}>
          <h1 className={getContrastClass("text-xl font-bold text-white", "text-xl font-bold text-yellow-400")}>
            We Value Your Feedback!
          </h1>
        </div>
        
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className={getContrastClass(
            "bg-white rounded-xl p-6 shadow-lg border max-w-md w-full",
            "bg-gray-900 rounded-xl p-6 shadow-lg border-2 border-yellow-400 max-w-md w-full"
          )}>
            <h2 className={getContrastClass("text-xl font-bold text-gray-900 mb-4 text-center", "text-xl font-bold text-yellow-400 mb-4 text-center")}>
              How satisfied are you with our donation form?
            </h2>
            <p className={getContrastClass("text-gray-600 text-center mb-6", "text-yellow-200 text-center mb-6")}>
              Your feedback helps us improve the experience for everyone
            </p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSatisfactionRating(rating)}
                  className={`p-2 transition-colors ${
                    satisfactionRating >= rating 
                      ? 'text-yellow-400' 
                      : getContrastClass('text-gray-300 hover:text-yellow-400', 'text-gray-600 hover:text-yellow-400')
                  }`}
                >
                  <Star 
                    size={32} 
                    fill={satisfactionRating >= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center mb-6">
              <p className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-300")}>
                {satisfactionRating === 0 && "Please rate your experience"}
                {satisfactionRating === 1 && "😞 We'll work to improve"}
                {satisfactionRating === 2 && "😐 Thanks for the feedback"}
                {satisfactionRating === 3 && "🙂 Good to know"}
                {satisfactionRating === 4 && "😊 Great! Thank you"}
                {satisfactionRating === 5 && "🎉 Excellent! We're thrilled"}
              </p>
            </div>
            
            <button
              onClick={() => {
                console.log(`User satisfaction rating: ${satisfactionRating}/5`);
                setShowSatisfactionSurvey(false);
                setShowSuccess(true);
              }}
              disabled={satisfactionRating === 0}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                satisfactionRating === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {satisfactionRating === 0 ? 'Please select a rating' : 'Continue to Receipt'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen (after survey)
  if (showSuccess && successData) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col",
        "fixed inset-0 bg-black z-50 flex flex-col"
      )}>
        <div className={getContrastClass(
          "bg-green-500 p-4 text-center",
          "bg-green-700 p-4 text-center"
        )}>
          <CheckCircle size={48} className="mx-auto mb-2 text-white" />
          <h1 className="text-2xl font-bold text-white">Success!</h1>
        </div>
        
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className={getContrastClass(
            "bg-white rounded-xl p-6 shadow-lg border max-w-md w-full",
            "bg-gray-900 rounded-xl p-6 shadow-lg border-2 border-yellow-400 max-w-md w-full"
          )}>
            <h2 className={getContrastClass("text-xl font-bold text-gray-900 mb-4", "text-xl font-bold text-yellow-400 mb-4")}>
              Donation Confirmed
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Reference:</span> {successData.referenceNumber}</p>
              <p><span className="font-medium">Donor:</span> {successData.parentName}</p>
              <p><span className="font-medium">Amount:</span> ₱{successData.amount}</p>
              <p><span className="font-medium">General SPTA:</span> ₱{successData.allocation.generalSPTA}</p>
              <p><span className="font-medium">11Mercado PTA:</span> ₱{successData.allocation.mercadoPTA}</p>
            </div>
            
            {satisfactionRating > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Thank you for rating us {satisfactionRating}/5 stars! 
                  {satisfactionRating >= 4 ? ' Your positive feedback motivates us!' : ' We appreciate your honest feedback and will continue improving.'}
                </p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode Modal
  if (showEditMode) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
        <div className={getContrastClass(
          "bg-white rounded-3xl max-w-md w-full p-6",
          "bg-gray-900 rounded-3xl max-w-md w-full p-6 border-2 border-yellow-400"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
              Edit Existing Entry
            </h2>
            <button
              onClick={() => setShowEditMode(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className={getContrastClass("text-sm text-gray-600 mb-4", "text-sm text-yellow-200 mb-4")}>
            Enter your reference number to edit an existing donation entry. Reference numbers start with "PTA-".
          </p>
          
          <div className="mb-4">
            <label className={getContrastClass("block text-sm font-medium mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
              Reference Number
            </label>
            <input
              type="text"
              value={editReferenceNumber}
              onChange={(e) => setEditReferenceNumber(e.target.value)}
              className={`w-full p-3 border rounded-lg ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')} border-gray-300`}
              placeholder="PTA-XXXXXXXXX-XXX"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!editReferenceNumber.trim()) {
                  alert('Please enter a reference number');
                  return;
                }
                
                // Simulate loading existing data (you would implement the actual loading logic here)
                alert('Edit functionality will load the existing entry data based on the reference number. This feature requires backend integration to fetch and update existing records.');
                setShowEditMode(false);
                setEditReferenceNumber('');
              }}
              disabled={!editReferenceNumber.trim()}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                !editReferenceNumber.trim() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Load Entry
            </button>
            <button
              onClick={() => {
                setShowEditMode(false);
                setEditReferenceNumber('');
              }}
              className={getContrastClass(
                "px-4 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white",
                "px-4 py-3 rounded-lg font-medium bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400"
              )}
            >
              Cancel
            </button>
          </div>
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
        "bg-blue-500 p-4 flex items-center justify-between",
        "bg-gray-900 border-b-2 border-yellow-400 p-4 flex items-center justify-between"
      )}>
        <div className="flex items-center gap-3">
          {isMobile && <Smartphone size={20} className="text-white" />}
          <h1 className={getContrastClass("text-xl font-bold text-white", "text-xl font-bold text-yellow-400")}>
            New Donation Form v2.0
          </h1>
          {isMobile && <span className="text-xs text-yellow-300 bg-green-600 px-2 py-1 rounded">Mobile</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditMode(true)}
            className={getContrastClass(
              "flex items-center gap-1 text-white hover:bg-blue-600 px-3 py-1 rounded text-sm",
              "flex items-center gap-1 text-yellow-400 hover:bg-gray-800 px-3 py-1 rounded text-sm border border-yellow-400"
            )}
            title="Edit existing entry using reference number"
          >
            <Edit size={16} />
            Edit
          </button>
          <button onClick={onClose} className="text-white p-1">
            <X size={24} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Parent Name */}
        <div>
          <label className={getContrastClass("block text-sm font-medium mb-1", "block text-sm font-medium text-yellow-400 mb-1")}>
            Parent/Guardian Name *
          </label>
          <input
            type="text"
            value={formData.parentName}
            onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
            className={`w-full p-3 border rounded-lg ${errors.parentName ? 'border-red-500' : 'border-gray-300'} ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')}`}
            placeholder="Enter full name"
          />
          {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>}
        </div>

        {/* Student Name */}
        <div>
          <label className={getContrastClass("block text-sm font-medium mb-1", "block text-sm font-medium text-yellow-400 mb-1")}>
            Student Name *
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className={`w-full p-3 border rounded-lg ${errors.studentName ? 'border-red-500' : 'border-gray-300'} ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')}`}
            placeholder="Enter student's full name"
          />
          {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
        </div>

        {/* Donation Mode */}
        <div>
          <label className={getContrastClass("block text-sm font-medium mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
            Donation Mode *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ewallet', label: 'E-wallet', desc: 'GCash/Maya' },
              { id: 'cash', label: 'Cash', desc: 'Physical cash' },
              { id: 'inkind', label: 'In-kind', desc: 'Items/goods' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, donationMode: mode.id as any }))}
                className={`p-3 text-center border rounded-lg text-sm ${
                  formData.donationMode === mode.id
                    ? getContrastClass('border-blue-500 bg-blue-50', 'border-yellow-400 bg-gray-800')
                    : getContrastClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-900')
                }`}
              >
                <div className={getContrastClass(
                  formData.donationMode === mode.id ? 'font-bold text-blue-600' : 'text-gray-600',
                  formData.donationMode === mode.id ? 'font-bold text-yellow-400' : 'text-yellow-300'
                )}>
                  {mode.label}
                </div>
                <div className={getContrastClass('text-xs text-gray-500', 'text-xs text-yellow-400')}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        {formData.donationMode !== 'inkind' && (
          <div>
            <label className={getContrastClass("block text-sm font-medium mb-1", "block text-sm font-medium text-yellow-400 mb-1")}>
              Amount *
            </label>
            <div className="relative">
              <span className={getContrastClass("absolute left-3 top-3 text-gray-500", "absolute left-3 top-3 text-yellow-300")}>₱</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full pl-8 p-3 border rounded-lg ${errors.amount ? 'border-red-500' : 'border-gray-300'} ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            
            {/* Manual Allocation */}
            {formData.amount && (
              <div className={getContrastClass("mt-3 p-3 bg-gray-50 rounded-lg border", "mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600")}>
                <div className={getContrastClass("text-sm font-medium text-gray-700 mb-2", "text-sm font-medium text-yellow-400 mb-2")}>Allocation Distribution:</div>
                
                <div className="space-y-2">
                  <div>
                    <label className={getContrastClass("block text-xs text-gray-600", "block text-xs text-yellow-300")}>General SPTA:</label>
                    <div className="relative">
                      <span className={getContrastClass("absolute left-2 top-2 text-gray-500 text-sm", "absolute left-2 top-2 text-yellow-300 text-sm")}>₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.allocation.generalSPTA}
                        onChange={(e) => handleAllocationChange('generalSPTA', e.target.value)}
                        className={`w-full pl-6 py-2 text-sm border rounded ${getContrastClass('bg-white border-gray-300', 'bg-gray-900 border-gray-600 text-yellow-200')}`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={getContrastClass("block text-xs text-gray-600", "block text-xs text-yellow-300")}>11Mercado PTA:</label>
                    <div className="relative">
                      <span className={getContrastClass("absolute left-2 top-2 text-gray-500 text-sm", "absolute left-2 top-2 text-yellow-300 text-sm")}>₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.allocation.mercadoPTA}
                        onChange={(e) => handleAllocationChange('mercadoPTA', e.target.value)}
                        className={`w-full pl-6 py-2 text-sm border rounded ${getContrastClass('bg-white border-gray-300', 'bg-gray-900 border-gray-600 text-yellow-200')}`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className={`text-xs pt-1 ${getContrastClass('text-gray-600', 'text-yellow-300')}`}>
                    Total allocated: ₱{(formData.allocation.generalSPTA + formData.allocation.mercadoPTA).toFixed(2)} / ₱{formData.amount || '0.00'}
                  </div>
                </div>
                
                {errors.allocation && <p className="text-red-500 text-xs mt-2">{errors.allocation}</p>}
              </div>
            )}
          </div>
        )}

        {/* Receipt Upload for E-wallet */}
        {formData.donationMode === 'ewallet' && (
          <div>
            <label className={getContrastClass("block text-sm font-medium mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
              Upload Receipt *
            </label>
            <button
              type="button"
              onClick={handleFileUpload}
              className={`w-full p-4 border-2 border-dashed rounded-lg ${
                errors.receipt ? 'border-red-500' : 'border-gray-300'
              } ${getContrastClass('bg-gray-50 hover:bg-gray-100', 'bg-gray-800 hover:bg-gray-700')} transition-colors`}
            >
              <Upload size={24} className={getContrastClass("mx-auto mb-2 text-gray-400", "mx-auto mb-2 text-yellow-400")} />
              <p className={getContrastClass("font-medium", "font-medium text-yellow-200")}>
                {formData.receipt ? formData.receipt.name : 'Tap to upload receipt'}
              </p>
              <p className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                Max 5MB • JPG, PNG supported
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            {errors.receipt && <p className="text-red-500 text-xs mt-1">{errors.receipt}</p>}
          </div>
        )}

        {/* Comments/Special Instructions */}
        <div>
          <label className={getContrastClass("block text-sm font-medium mb-1", "block text-sm font-medium text-yellow-400 mb-1")}>
            Comments/Special Instructions (Optional)
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className={`w-full p-3 border rounded-lg ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')} border-gray-300 resize-none`}
            placeholder="Any special instructions, preferred allocation details, or additional notes..."
            rows={3}
            maxLength={500}
          />
          <div className={`text-xs mt-1 ${getContrastClass('text-gray-500', 'text-yellow-400')}`}>
            {formData.comments.length}/500 characters
          </div>
        </div>

        {/* E-signature */}
        <div>
          <label className={getContrastClass("block text-sm font-medium mb-1", "block text-sm font-medium text-yellow-400 mb-1")}>
            Electronic Signature *
          </label>
          <input
            type="text"
            value={formData.eSignature}
            onChange={(e) => setFormData(prev => ({ ...prev, eSignature: e.target.value }))}
            className={`w-full p-3 border rounded-lg ${errors.eSignature ? 'border-red-500' : 'border-gray-300'} ${getContrastClass('bg-white', 'bg-gray-900 text-yellow-200')} font-script`}
            placeholder="Type your full name"
          />
          {errors.eSignature && <p className="text-red-500 text-xs mt-1">{errors.eSignature}</p>}
        </div>

        {/* Agreement */}
        <div className={getContrastClass("bg-blue-50 p-4 rounded-lg border", "bg-gray-800 p-4 rounded-lg border border-yellow-400")}>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.agreementAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
              className="mt-1"
            />
            <label className={getContrastClass("text-sm text-blue-800", "text-sm text-yellow-200")}>
              <strong>I confirm this information is accurate and my donation will be used as specified.</strong>
            </label>
          </div>
          {errors.agreement && <p className="text-red-500 text-xs mt-2">{errors.agreement}</p>}
        </div>

        {/* Submit */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
              "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors",
              "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-lg transition-colors"
            )}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}