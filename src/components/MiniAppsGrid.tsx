import React, { useState, useEffect } from 'react';
import { Calculator, Cloud, Upload, Users, UserCheck, ExternalLink, TrendingUp, BookOpen, Mail, FolderPlus, Shield, HelpCircle } from 'lucide-react';
import { getDonationStatsFromCentralDB } from '../utils/centralizedDatabase';

export default function MiniAppsGrid({ onAppSelect, donationDrives, getContrastClass, onShowTutorial, userFirstName }) {
  const [donationStats, setDonationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
      console.log('📊 Loading donation stats for home screen...');
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
  
  // Use centralized database stats instead of local drives
  const totalDonations = donationStats?.totalAmount || 0;
  const donationCount = donationStats?.totalDonations || 0;
  
  const apps = [
    {
      id: 'stem-tools',
      name: 'STEM Resources',
      description: 'AI tools and educational resources',
      icon: <Calculator size={24} />,
      color: 'from-purple-500 to-violet-600',
      stats: '10 Resources'
    },
    {
      id: 'weather',
      name: 'Weather App',
      description: 'Local weather information',
      icon: <Cloud size={24} />,
      color: 'from-blue-500 to-cyan-600',
      stats: 'Live Updates'
    },
    {
      id: 'donation-upload',
      name: 'Donation Form',
      description: 'Submit donation details with receipt',
      icon: <Upload size={24} />,
      color: 'from-green-500 to-emerald-600',
      stats: 'Complete Form'
    },
    {
      id: 'community',
      name: 'Community Hub',
      description: 'Social platform for thoughts & blog posts',
      icon: <Users size={24} />,
      color: 'from-orange-500 to-red-600',
      stats: 'Share & Connect'
    },
    {
      id: 'officers',
      name: 'Meet the Officers',
      description: 'Contact information',
      icon: <UserCheck size={24} />,
      color: 'from-indigo-500 to-purple-600',
      stats: '5 Officers'
    },
    {
      id: 'csansci-links',
      name: 'School Links',
      description: 'Official CSANSCI and LGU links',
      icon: <ExternalLink size={24} />,
      color: 'from-teal-500 to-cyan-600',
      stats: '3 Links'
    },
    {
      id: 'donation-tiles',
      name: 'Donation Progress',
      description: 'View donation campaigns',
      icon: <TrendingUp size={24} />,
      color: 'from-pink-500 to-rose-600',
      stats: totalDonations > 0 ? `₱${totalDonations.toLocaleString()}` : 'No campaigns yet'
    },
    {
      id: 'contact-us',
      name: 'Contact Us',
      description: 'Send message to PTA',
      icon: <Mail size={24} />,
      color: 'from-sky-500 to-blue-600',
      stats: 'Quick Message'
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Track PTA projects and submit proposals',
      icon: <FolderPlus size={24} />,
      color: 'from-violet-500 to-purple-600',
      stats: 'Submit Ideas'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className={getContrastClass(
        "bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30",
        "bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-yellow-400/50"
      )}>
        <h2 className={getContrastClass(
          "text-2xl font-light text-slate-900 mb-2",
          "text-2xl font-light text-yellow-400 mb-2"
        )}>
          Welcome to 11Mercado, {userFirstName || 'Student'}!
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Your personal portal for STEM tools and community engagement
        </p>
        <div className={getContrastClass(
          "mt-3 text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2",
          "mt-3 text-xs text-yellow-300 bg-gray-800 border border-yellow-400 rounded-lg px-3 py-2"
        )}>
          ⚡ Secure access with session management • AI-powered tools available
        </div>
      </div>

      {/* STEM Resources - Full Width */}
      <div className="mb-4">
        <div className="relative">
          <div
            onClick={() => onAppSelect('stem-tools')}
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
              AI tools and educational resources
            </p>
            <div className="text-white/60 text-xs">
              10 Resources
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowTutorial('stem-tools');
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            title="Show Tutorial"
          >
            <HelpCircle size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Donation Progress - Full Width */}
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

      {/* Row 1: Weather App + Donation Form */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          onClick={() => onAppSelect('weather')}
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
            onClick={() => onAppSelect('donation-upload')}
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
              onShowTutorial('donation-upload');
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
          onClick={() => onAppSelect('projects')}
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
          onClick={() => onAppSelect('officers')}
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
          onClick={() => onAppSelect('csansci-links')}
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
            onClick={() => onAppSelect('community')}
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
              onShowTutorial('community');
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            title="Show Tutorial"
          >
            <HelpCircle size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => onAppSelect('contact-us')}
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
          onClick={() => onAppSelect('legal')}
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
    </div>
  );
}