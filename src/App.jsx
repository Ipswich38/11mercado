import React, { useEffect, useState } from 'react';
import ContactUsForm from './components/ContactUsForm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const userSession = localStorage.getItem('11m_user_session');
    const adminSession = localStorage.getItem('11m_admin_session');

    if (!userSession) {
      // Redirect to login page
      window.location.href = '/login.html';
      return;
    }

    try {
      const session = JSON.parse(userSession);
      const now = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes

      // Validate session structure and required fields
      if (!session || typeof session !== 'object' || !session.lastActivity || !session.id) {
        throw new Error('Invalid session structure');
      }

      // Check if session is still valid
      if (now - session.lastActivity < sessionTimeout) {
        // Update last activity with timestamp validation
        if (typeof session.lastActivity === 'number' && session.lastActivity > 0) {
          session.lastActivity = now;
          localStorage.setItem('11m_user_session', JSON.stringify(session));

          setIsAuthenticated(true);
          setIsAdmin(session.isAdmin || false);
          setLoading(false);
        } else {
          throw new Error('Invalid timestamp');
        }
      } else {
        // Session expired
        localStorage.removeItem('11m_user_session');
        localStorage.removeItem('11m_admin_session');
        window.location.href = '/login.html';
      }
    } catch (error) {
      // Invalid session data or parsing error
      console.error('Authentication error:', error);
      localStorage.removeItem('11m_user_session');
      localStorage.removeItem('11m_admin_session');
      window.location.href = '/login.html';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">11M</span>
          </div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Redirect admin users to admin dashboard
  if (isAdmin) {
    window.location.href = '/admin-dashboard.html';
    return null;
  }

  // For regular users, redirect to the enhanced dashboard
  window.location.href = '/standalone.html';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-2xl">11M</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          11Mercado Platform
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Enhanced Dashboard Loading...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Weather Card */}
          <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Current Weather</h3>
                <p className="text-blue-100 text-sm">Manila, Philippines</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">28°C</div>
                <div className="text-blue-100 text-sm">Sunny</div>
              </div>
            </div>
            <div className="text-4xl mb-2">☀️</div>
            <div className="text-xs text-blue-100">
              Real-time weather updates
            </div>
          </div>

          {/* Fund Tracker */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  11Mercado Fund Drive
                </h3>
                <p className="text-sm text-gray-600">
                  Supporting our school community
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full w-2/3"></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>67% complete</span>
                <span>₱33,500 raised</span>
              </div>
            </div>
            <button className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">
              Donate Now
            </button>
          </div>

          {/* AI Tools */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🤖 AI Learning Tools
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-lg hover:shadow-lg transition-all">
                🧠 AI STEM Assistant
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:shadow-lg transition-all">
                🏆 AI Quiz Generator
              </button>
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4">📋 Project Status</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/20 rounded-lg p-2">
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs">Proposed</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs">Ongoing</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="text-2xl font-bold">1</div>
                <div className="text-xs">Done</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 shadow-lg">
          <div className="text-center">
            <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <span className="text-2xl">💬</span>
              Need Help or Have Questions?
            </h4>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Contact the 11Mercado PTA team for support, feedback, or any questions about our platform.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <span className="text-lg">📧</span>
              Contact Us
            </button>
            <p className="text-xs text-gray-500 mt-3">
              We respond to all messages within 24-48 hours
            </p>
          </div>
        </div>
      </div>

      {showContactForm && (
        <ContactUsForm
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
}

export default App;
