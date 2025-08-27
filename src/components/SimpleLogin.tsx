import React, { useState } from 'react';
import { LogIn, User, Key } from 'lucide-react';

export default function SimpleLogin({ onLogin, getContrastClass }) {
  const [accessCode, setAccessCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessCode.trim() || !firstName.trim()) return;
    
    setIsLoading(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Access codes for different user types
    const MASTER_CODE = 'MERCADO80';
    const ADMIN_CODE = 'ADMIN2025';
    const FINANCIAL_CODE = 'FINANCE2025';
    const SECRETARY_CODE = 'NOTE2025';
    
    const isValidUser = accessCode.toUpperCase() === MASTER_CODE;
    const isValidAdmin = accessCode.toUpperCase() === ADMIN_CODE;
    const isValidFinancial = accessCode.toUpperCase() === FINANCIAL_CODE;
    const isValidSecretary = accessCode.toUpperCase() === SECRETARY_CODE;
    
    if (isValidUser || isValidAdmin || isValidFinancial || isValidSecretary) {
      let userType = 'student';
      let isAdmin = false;
      let isFinancialOfficer = false;
      let isSecretary = false;
      
      if (isValidAdmin) {
        userType = 'admin';
        isAdmin = true;
      } else if (isValidFinancial) {
        userType = 'financial';
        isFinancialOfficer = true;
      } else if (isValidSecretary) {
        userType = 'secretary';
        isSecretary = true;
      }
      
      onLogin({ 
        firstName, 
        accessCode, 
        isAdmin,
        isFinancialOfficer,
        isSecretary,
        userType
      });
    } else {
      alert('Invalid access code. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className={getContrastClass(
      "min-h-screen bg-surface-50 flex items-center justify-center p-4",
      "min-h-screen bg-surface-900 flex items-center justify-center p-4"
    )}>
      <div className={getContrastClass(
        "card-elevated w-full max-w-md overflow-hidden",
        "glass-dark rounded-material-xl shadow-material-xl w-full max-w-md overflow-hidden border border-surface-700"
      )}>
        {/* Material Design Header */}
        <div className="text-center p-8 pb-6">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-material-xl mx-auto mb-6 flex items-center justify-center text-white text-2xl">
              🎓
            </div>
            <h1 className={getContrastClass(
              "text-headline-medium text-surface-900 mb-2",
              "text-headline-medium text-surface-100 mb-2"
            )}>
              11Mercado
            </h1>
            <p className={getContrastClass(
              "text-body-medium text-surface-600",
              "text-body-medium text-surface-400"
            )}>
              Access to Integrated Platform
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          {/* Material Design Input - Access Code */}
          <div>
            <label className={getContrastClass(
              "block text-title-small text-surface-700 mb-2",
              "block text-title-small text-surface-300 mb-2"
            )}>
              Access Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className={getContrastClass("h-5 w-5 text-surface-500", "h-5 w-5 text-surface-400")} />
              </div>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter your access code"
                className={getContrastClass(
                  "input-outlined w-full pl-12 text-surface-900",
                  "input-outlined w-full pl-12 text-surface-100 border-surface-600 focus:border-primary-400 bg-surface-800"
                )}
                required
              />
            </div>
          </div>

          {/* Material Design Input - First Name */}
          <div>
            <label className={getContrastClass(
              "block text-title-small text-surface-700 mb-2",
              "block text-title-small text-surface-300 mb-2"
            )}>
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className={getContrastClass("h-5 w-5 text-surface-500", "h-5 w-5 text-surface-400")} />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className={getContrastClass(
                  "input-outlined w-full pl-12 text-surface-900",
                  "input-outlined w-full pl-12 text-surface-100 border-surface-600 focus:border-primary-400 bg-surface-800"
                )}
                required
              />
            </div>
          </div>

          {/* Material Design Button */}
          <button
            type="submit"
            disabled={!accessCode.trim() || !firstName.trim() || isLoading}
            className={getContrastClass(
              "btn-filled w-full flex items-center justify-center gap-3 state-layer",
              "btn-filled w-full flex items-center justify-center gap-3 state-layer bg-primary-600 hover:bg-primary-700"
            )}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Get Started
              </>
            )}
          </button>
        </form>

        {/* Material Design Footer */}
        <div className="px-8 pb-6">
          <div className={getContrastClass(
            "text-center text-body-small text-surface-500 border-t border-surface-200 pt-4",
            "text-center text-body-small text-surface-400 border-t border-surface-700 pt-4"
          )}>
            Designed and developed by Cherwin Fernandez / KreativLoops • v1.1
          </div>
        </div>

      </div>
    </div>
  );
}