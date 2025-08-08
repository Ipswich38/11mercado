import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, KeyRound } from 'lucide-react';

const AccessCodeForm = ({ onAccessGranted, onBackToLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate access code validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for valid access codes
    const validCodes = ['MERCADO112025', 'ADMIN2025MERCADO'];
    
    if (validCodes.includes(accessCode)) {
      const isAdmin = accessCode === 'ADMIN2025MERCADO';
      onAccessGranted({ 
        sessionId: 'session-' + Date.now(), 
        firstName,
        isAdmin 
      });
    } else {
      alert('Invalid access code. Use MERCADO112025 for users or ADMIN2025MERCADO for admin.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Access Code Required
            </h2>
            <p className="text-gray-600 mt-2">
              Enter your exclusive access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                placeholder="Enter access code"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Validating...' : 'Access Platform'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onBackToLogin}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeForm;
