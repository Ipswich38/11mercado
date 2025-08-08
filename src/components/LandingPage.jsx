import React from 'react';
import { Button } from './ui/button';

const LandingPage = ({ onGetStarted, onAdminLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-2xl">11M</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to 11Mercado
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Exclusive beta platform access
        </p>

        <div className="space-y-4">
          <Button onClick={onGetStarted} size="lg" className="w-full max-w-xs">
            Get Started
          </Button>

          <Button
            onClick={onAdminLogin}
            variant="outline"
            size="lg"
            className="w-full max-w-xs"
          >
            Admin Login
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Beta Platform - Exclusive Access Required
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
