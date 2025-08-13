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
    
    const isValidUser = accessCode.toUpperCase() === MASTER_CODE;
    const isValidAdmin = accessCode.toUpperCase() === ADMIN_CODE;
    const isValidFinancial = accessCode.toUpperCase() === FINANCIAL_CODE;
    
    if (isValidUser || isValidAdmin || isValidFinancial) {
      let userType = 'student';
      let isAdmin = false;
      let isFinancialOfficer = false;
      
      if (isValidAdmin) {
        userType = 'admin';
        isAdmin = true;
      } else if (isValidFinancial) {
        userType = 'financial';
        isFinancialOfficer = true;
      }
      
      onLogin({ 
        firstName, 
        accessCode, 
        isAdmin,
        isFinancialOfficer,
        userType
      });
    } else {
      alert('Invalid access code. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className={getContrastClass(
      "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4",
      "min-h-screen bg-black flex items-center justify-center p-4"
    )}>
      <div className={getContrastClass(
        "bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-md",
        "bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400/50 w-full max-w-md"
      )}>
        {/* Header with Logo */}
        <div className="text-center p-8 pb-6">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className={getContrastClass(
              "text-2xl font-light text-slate-900 mb-2",
              "text-2xl font-light text-yellow-400 mb-2"
            )}>
              11Mercado
            </h1>
            <p className={getContrastClass(
              "text-slate-600 text-sm",
              "text-yellow-200 text-sm"
            )}>
              Access to Integrated Platform
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          {/* Access Code Input */}
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Access Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className={getContrastClass("h-5 w-5 text-gray-400", "h-5 w-5 text-yellow-400")} />
              </div>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter your access code"
                className={getContrastClass(
                  "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm",
                  "w-full pl-10 pr-4 py-3 border border-yellow-400 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800/70 backdrop-blur-sm text-yellow-100"
                )}
                required
              />
            </div>
          </div>

          {/* First Name Input */}
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={getContrastClass("h-5 w-5 text-gray-400", "h-5 w-5 text-yellow-400")} />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className={getContrastClass(
                  "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm",
                  "w-full pl-10 pr-4 py-3 border border-yellow-400 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800/70 backdrop-blur-sm text-yellow-100"
                )}
                required
              />
            </div>
          </div>

          {/* Get Started Button */}
          <button
            type="submit"
            disabled={!accessCode.trim() || !firstName.trim() || isLoading}
            className={getContrastClass(
              "w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg",
              "w-full flex items-center justify-center gap-3 bg-yellow-400 text-black py-3 px-6 rounded-xl font-medium hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
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

      </div>
    </div>
  );
}