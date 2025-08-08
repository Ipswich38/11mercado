import React from 'react';

const TestDashboard = ({ userFirstName = 'Student' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userFirstName}! 👋
          </h1>
          <p className="text-white/90 text-lg">
            Testing the enhanced dashboard!
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🌤️ Weather
            </h3>
            <div className="text-center">
              <div className="text-4xl mb-2">☀️</div>
              <div className="text-2xl font-bold">28°C</div>
              <p className="text-gray-600">Sunny</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💰 Fund Drive
            </h3>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full w-2/3"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">₱25,000 of ₱50,000 raised</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🤖 AI Tools
            </h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                STEM Assistant
              </button>
              <button className="w-full bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors">
                Quiz Generator
              </button>
            </div>
          </div>
        </div>

        {/* Test Bulletin */}
        <div className="mt-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">📢 11Mercado Exclusive</h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2">
              Science Fair Registration Open
            </h4>
            <p className="text-purple-100 text-sm">
              Registration for the annual science fair is now open! Submit your
              project proposals by February 28th.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
