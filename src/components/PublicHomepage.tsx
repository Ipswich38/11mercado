import React, { useState, useEffect } from 'react';
import { Calculator, Cloud, Upload, Users, UserCheck, ExternalLink, TrendingUp, Mail, FolderPlus, Shield, Lock, LogIn, HelpCircle } from 'lucide-react';
import SimpleLogin from './SimpleLogin';
import ContactUs from './ContactUs';
import { getDonationStatsFromCentralDB } from '../utils/centralizedDatabase';

// Import the same components used in authenticated version
import WeatherApp from './WeatherApp';
import CommunityHub from './CommunityHub';
import Officers from './Officers';
import CSANSCILinks from './CSANSCILinks';
import Legal from './Legal';
import MiniTutorial from './MiniTutorial';

export default function PublicHomepage({ getContrastClass, onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authFor, setAuthFor] = useState('');
  const [donationStats, setDonationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactUs, setShowContactUs] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadDonationStats();
    // Refresh stats every 30 seconds to keep them current
    const interval = setInterval(loadDonationStats, 30000);
    
    // Listen for donation update events
    const handleDonationUpdate = () => {
      console.log('🔄 Donation updated, refreshing stats...');
      loadDonationStats();
    };
    
    const handleCentralizedDataSync = () => {
      console.log('🔄 Centralized data synced, refreshing stats...');
      loadDonationStats();
    };
    
    window.addEventListener('donationUpdated', handleDonationUpdate);
    window.addEventListener('centralizedDataSync', handleCentralizedDataSync);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('donationUpdated', handleDonationUpdate);
      window.removeEventListener('centralizedDataSync', handleCentralizedDataSync);
    };
  }, []);
  
  const loadDonationStats = async () => {
    try {
      console.log('📊 Loading donation stats for public homepage...');
      const stats = await getDonationStatsFromCentralDB();
      setDonationStats(stats);
      setIsLoading(false);
      console.log('✅ Donation stats loaded:', stats);
    } catch (error) {
      console.error('Error loading donation stats:', error);
      setDonationStats({
        totalAmount: 0,
        totalDonations: 0,
        totalGeneralSPTA: 0,
        totalMercadoPTA: 0
      });
      setIsLoading(false);
    }
  };

  const handleProtectedClick = (section) => {
    setAuthFor(section);
    setShowAuth(true);
  };

  const handleLoginSuccess = (loginData) => {
    setShowAuth(false);
    onLogin(loginData);
  };

  // Use centralized database stats
  const totalDonations = donationStats?.totalAmount || 0;

  // Add the same state variables as the authenticated version
  const [activeApp, setActiveApp] = useState('mini-apps');
  const [showTutorial, setShowTutorial] = useState(null);

  // Copy the exact same app selection logic as authenticated version
  const handleAppSelect = (appId) => {
    // Protected apps that require login
    const protectedApps = ['stem-resources', 'donation-upload', 'projects'];
    
    if (protectedApps.includes(appId)) {
      handleProtectedClick(appId === 'stem-resources' ? 'STEM Resources' : 
                          appId === 'donation-upload' ? 'Donation Form' : 'PTA Projects');
      return;
    }
    
    // For public apps, use exact same logic as authenticated version
    setActiveApp(appId);
  };

  const handleShowTutorial = (appType) => {
    setShowTutorial(appType);
  };

  // Render specific apps when selected (same as authenticated version)
  if (activeApp === 'weather') {
    return (
      <WeatherApp 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
      />
    );
  }

  if (activeApp === 'community') {
    return (
      <CommunityHub 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
        onShowTutorial={handleShowTutorial}
      />
    );
  }

  if (activeApp === 'officers') {
    return (
      <Officers 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
      />
    );
  }

  if (activeApp === 'csansci-links') {
    return (
      <CSANSCILinks 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
      />
    );
  }

  if (activeApp === 'legal') {
    return (
      <Legal 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
      />
    );
  }

  if (activeApp === 'contact-us') {
    return (
      <ContactUs 
        onClose={() => setActiveApp('mini-apps')}
        getContrastClass={getContrastClass}
      />
    );
  }

  // Helper function to handle protected access
  const handleProtectedAccess = (appId, fallback = null) => {
    const protectedApps = ['stem-resources', 'donation-upload', 'projects'];
    
    if (protectedApps.includes(appId)) {
      handleProtectedClick(appId === 'stem-resources' ? 'STEM Resources' : 
                          appId === 'donation-upload' ? 'Donation Form' : 'PTA Projects');
    } else if (fallback) {
      fallback();
    } else {
      handleAppSelect(appId);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Header - EXACT COPY FROM MiniAppsGrid */}
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <h2 className={getContrastClass(
          "text-2xl font-light text-slate-900 mb-2",
          "text-2xl font-light text-yellow-400 mb-2"
        )}>
          Welcome to 11Mercado PTA
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Your community portal for STEM education and parent engagement • AI-powered tools and educational resources for STEM learning
        </p>
        <div className={getContrastClass(
          "mt-4 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2",
          "mt-4 text-sm text-yellow-300 bg-gray-800 border border-yellow-400 rounded-lg px-3 py-2"
        )}>
          ⚡ Secure access with session management • AI-powered tools available
        </div>
      </div>

      {/* Donation Progress - EXACT COPY FROM MiniAppsGrid */}
      <div className="mb-4">
        <div
          className={getContrastClass(
            `bg-gradient-to-br from-teal-500/90 to-cyan-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20`,
            `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border-2 border-teal-400/50`
          )}
        >
          <div className="text-white mb-4">
            <TrendingUp size={20} />
          </div>
          
          {/* Amount Display - Center but smaller */}
          <div className="text-center mb-4">
            {isLoading ? (
              <div className="text-lg text-white/80 mb-2">
                Loading...
              </div>
            ) : (
              <>
                <div className="text-headline-medium text-white mb-2">
                  ₱{totalDonations.toLocaleString()}
                </div>
                <div className="text-body-medium text-white/80">
                  Total Raised So Far
                </div>
              </>
            )}
          </div>
          
          {/* Dynamic Message - Center but smaller text */}
          <div className="text-center">
            {totalDonations > 0 ? (
              <p className="text-body-medium text-white/95 leading-relaxed">
                <span className="font-medium">Thank you amazing parents!</span> Your support makes a real difference in our children's education.
              </p>
            ) : (
              <p className="text-body-medium text-white/95 leading-relaxed">
                <span className="font-medium">Dear Parents,</span> help us support our children's education! Every contribution creates lasting impact.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Weather App + Donation Form - EXACT COPY FROM MiniAppsGrid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          onClick={() => handleAppSelect('weather')}
          className={getContrastClass(
            `bg-gradient-to-br from-blue-500/90 to-cyan-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border border-white/20`,
            `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border-2 border-yellow-400/50`
          )}
        >
          <div className="text-white mb-4">
            <Cloud size={24} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
            Weather App
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Local weather information
          </p>
          <div className="text-white/60 text-xs">
            Live Updates
          </div>
        </div>

        <div className="relative">
          <div
            onClick={() => handleProtectedAccess('donation-upload')}
            className={getContrastClass(
              "card-elevated bg-gradient-to-br from-success-500 to-success-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
              "glass-dark bg-gradient-to-br from-success-600 to-success-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
            )}
          >
            <div className="text-white mb-4">
              <Upload size={24} />
            </div>
            <h3 className="text-title-medium text-white mb-2">
              Donation Form
            </h3>
            <p className="text-body-medium text-white/90 mb-3">
              Submit donation details with receipt
            </p>
            <div className="text-body-small text-white/70">
              Complete Form
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert("💡 Donation Form Tutorial:\n\n📋 Submit donations with receipt uploads\n💰 Automatic allocation between General SPTA and 11Mercado PTA\n📱 Mobile-optimized file upload\n✅ Electronic signature validation\n📧 Email confirmation with reference number\n\nLogin required for Mercado community members!");
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            title="Show Tutorial"
          >
            <HelpCircle size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          onClick={() => handleProtectedAccess('projects')}
          className={getContrastClass(
            "card-elevated bg-gradient-to-br from-purple-500 to-purple-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
            "glass-dark bg-gradient-to-br from-purple-600 to-purple-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
          )}
        >
          <div className="text-white mb-4">
            <FolderPlus size={24} />
          </div>
          <h3 className="text-title-medium text-white mb-2">
            Projects
          </h3>
          <p className="text-body-medium text-white/90 mb-3">
            Track PTA projects and submit proposals
          </p>
          <div className="text-body-small text-white/70">
            Submit Ideas
          </div>
        </div>

        <div
          onClick={() => handleProtectedAccess('officers')}
          className={getContrastClass(
            "card-elevated bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
            "glass-dark bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
          )}
        >
          <div className="text-white mb-4">
            <UserCheck size={24} />
          </div>
          <h3 className="text-title-medium text-white mb-2">
            Meet the Officers
          </h3>
          <p className="text-body-medium text-white/90 mb-3">
            Contact information
          </p>
          <div className="text-body-small text-white/70">
            5 Officers
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          onClick={() => handleProtectedAccess('csansci-links')}
          className={getContrastClass(
            "card-elevated bg-gradient-to-br from-primary-500 to-primary-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
            "glass-dark bg-gradient-to-br from-primary-600 to-primary-800 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
          )}
        >
          <div className="text-white mb-4">
            <ExternalLink size={24} />
          </div>
          <h3 className="text-title-medium text-white mb-2">
            School Links
          </h3>
          <p className="text-body-medium text-white/90 mb-3">
            Official CSANSCI and LGU links
          </p>
          <div className="text-body-small text-white/70">
            3 Links
          </div>
        </div>

        <div className="relative">
          <div
            onClick={() => handleProtectedAccess('community')}
            className={getContrastClass(
              "card-elevated bg-gradient-to-br from-warning-500 to-warning-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
              "glass-dark bg-gradient-to-br from-warning-600 to-error-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
            )}
          >
            <div className="text-white mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-title-medium text-white mb-2">
              Community Hub
            </h3>
            <p className="text-body-medium text-white/90 mb-3">
              Social platform for thoughts & blog posts
            </p>
            <div className="text-body-small text-white/70">
              Share & Connect
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert("💡 Community Hub Tutorial:\n\n📝 Share thoughts and ideas with other parents\n💬 Comment and discuss education topics\n📚 Access educational resources\n🎯 Get PTA updates and announcements\n\nClick the card to see a preview, or login for full access!");
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            title="Show Tutorial"
          >
            <HelpCircle size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          onClick={() => handleProtectedAccess('contact-us', () => setShowContactUs(true))}
          className={getContrastClass(
            "card-elevated bg-gradient-to-br from-primary-400 to-primary-500 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
            "glass-dark bg-gradient-to-br from-primary-500 to-primary-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
          )}
        >
          <div className="text-white mb-4">
            <Mail size={24} />
          </div>
          <h3 className="text-title-medium text-white mb-2">
            Contact Us
          </h3>
          <p className="text-body-medium text-white/90 mb-3">
            Send message to PTA
          </p>
          <div className="text-body-small text-white/70">
            Quick Message
          </div>
        </div>

        <div
          onClick={() => handleProtectedAccess('legal')}
          className={getContrastClass(
            "card-elevated bg-gradient-to-br from-surface-600 to-surface-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98]",
            "glass-dark bg-gradient-to-br from-surface-700 to-surface-800 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700"
          )}
        >
          <div className="text-white mb-4">
            <Shield size={24} />
          </div>
          <h3 className="text-title-medium text-white mb-2">
            Legal
          </h3>
          <p className="text-body-medium text-white/90 mb-3">
            Privacy, T&Cs, disclaimers
          </p>
          <div className="text-body-small text-white/70">
            Important Info
          </div>
        </div>
      </div>

      {/* STEM Tools Section - EXACT COPY FROM STEMTools */}
      <div className="mb-6">
        <div
          onClick={() => handleProtectedAccess('stem-resources')}
          className={getContrastClass(
            `bg-gradient-to-br from-purple-500/90 to-violet-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border border-white/20`,
            `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border-2 border-yellow-400/50`
          )}
        >
          <div className="text-white mb-4">
            <Calculator size={24} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
            STEM Resources
          </h3>
          <p className="text-white/80 text-sm mb-3">
            🤖 AI-powered tools including College Entrance Exam Quiz Generator, AI Scientific Calculator, and AI Assistant for STEM learning
          </p>
          <div className="text-white/60 text-xs">
            AI Tools Available
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Login Required - {authFor}
                </h2>
                <button
                  onClick={() => setShowAuth(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter your access code and name to continue
              </p>
            </div>
            <div className="p-0">
              <SimpleLogin 
                onLogin={handleLoginSuccess}
                getContrastClass={(normal, contrast) => normal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}