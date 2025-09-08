import React, { useState } from 'react';
import { Shield, AlertTriangle, X } from 'lucide-react';

interface SecureConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  actionType: 'update' | 'delete' | 'create';
  confirmationCode?: string;
  getContrastClass: (baseClass: string, contrastClass: string) => string;
}

export default function SecureConfirmation({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  actionType,
  confirmationCode = 'FINANCE2025',
  getContrastClass 
}: SecureConfirmationProps) {
  const [step, setStep] = useState(1); // 1: explanation, 2: confirmation code
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleStepOne = () => {
    setStep(2);
    setError('');
  };

  const handleConfirm = () => {
    if (inputCode.trim().toUpperCase() !== confirmationCode) {
      setError('Incorrect confirmation code. Please try again.');
      return;
    }
    
    // Reset state and confirm
    setStep(1);
    setInputCode('');
    setError('');
    onConfirm();
  };

  const handleCancel = () => {
    setStep(1);
    setInputCode('');
    setError('');
    onClose();
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'delete':
        return 'text-red-600';
      case 'update':
        return 'text-yellow-600';
      case 'create':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const getActionBgColor = () => {
    switch (actionType) {
      case 'delete':
        return getContrastClass('bg-red-50 border-red-200', 'bg-red-900 bg-opacity-20 border-red-400');
      case 'update':
        return getContrastClass('bg-yellow-50 border-yellow-200', 'bg-yellow-900 bg-opacity-20 border-yellow-400');
      case 'create':
        return getContrastClass('bg-green-50 border-green-200', 'bg-green-900 bg-opacity-20 border-green-400');
      default:
        return getContrastClass('bg-blue-50 border-blue-200', 'bg-blue-900 bg-opacity-20 border-blue-400');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className={getContrastClass(
        "bg-white rounded-xl max-w-md w-full p-6 shadow-xl",
        "bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield size={24} className={getContrastClass("text-red-600", "text-red-400")} />
            <h2 className={getContrastClass("text-xl font-bold text-gray-900", "text-xl font-bold text-yellow-400")}>
              Security Confirmation
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className={getContrastClass(
              "p-2 hover:bg-gray-100 rounded-full",
              "p-2 hover:bg-gray-800 rounded-full text-yellow-400"
            )}
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <>
            <div className={`mb-4 p-4 rounded-lg border ${getActionBgColor()}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className={getActionColor()} />
                <div>
                  <h3 className={`font-semibold ${getActionColor()} ${getContrastClass('', 'text-opacity-90')}`}>
                    {title}
                  </h3>
                  <p className={getContrastClass("text-gray-700 text-sm mt-1", "text-yellow-200 text-sm mt-1")}>
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className={getContrastClass(
              "bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4",
              "bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4"
            )}>
              <h4 className={getContrastClass("font-medium text-gray-900 mb-2", "font-medium text-yellow-400 mb-2")}>
                Security Notice:
              </h4>
              <ul className={getContrastClass("text-sm text-gray-700 space-y-1", "text-sm text-yellow-200 space-y-1")}>
                <li>• This action requires administrative authorization</li>
                <li>• You will be asked to enter a confirmation code</li>
                <li>• All actions are logged for security purposes</li>
                <li>• Incorrect actions can affect financial data integrity</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStepOne}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  actionType === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : actionType === 'update'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                I Understand, Continue
              </button>
              <button
                onClick={handleCancel}
                className={getContrastClass(
                  "px-4 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white",
                  "px-4 py-3 rounded-lg font-medium bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400"
                )}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={getContrastClass(
              "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",
              "bg-blue-900 bg-opacity-20 border border-blue-400 rounded-lg p-4 mb-4"
            )}>
              <h3 className={getContrastClass("font-semibold text-blue-800 mb-2", "font-semibold text-blue-400 mb-2")}>
                Final Confirmation Required
              </h3>
              <p className={getContrastClass("text-blue-700 text-sm", "text-blue-200 text-sm")}>
                To proceed with this {actionType} operation, please enter the confirmation code below.
              </p>
            </div>

            <div className="mb-4">
              <label className={getContrastClass(
                "block text-sm font-medium text-gray-700 mb-2",
                "block text-sm font-medium text-yellow-400 mb-2"
              )}>
                Confirmation Code *
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setError('');
                }}
                className={`w-full p-3 border rounded-lg font-mono text-center text-lg tracking-wider ${
                  error ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
                } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter code"
                maxLength={20}
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              <p className={getContrastClass("text-gray-500 text-xs mt-1", "text-yellow-300 text-xs mt-1")}>
                Contact the administrator if you don't have the code
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={!inputCode.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  !inputCode.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : actionType === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : actionType === 'update'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Confirm {actionType === 'delete' ? 'Delete' : actionType === 'update' ? 'Update' : 'Create'}
              </button>
              <button
                onClick={handleCancel}
                className={getContrastClass(
                  "px-4 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white",
                  "px-4 py-3 rounded-lg font-medium bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400"
                )}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}