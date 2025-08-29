import React, { useState } from 'react';
import { Calculator, Cloud, Upload, Users, UserCheck, ExternalLink, TrendingUp, BookOpen, Mail, FolderPlus, Shield, Lock, LogIn } from 'lucide-react';
import SimpleLogin from './SimpleLogin';

export default function PublicHomepage({ getContrastClass, onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authFor, setAuthFor] = useState('');

  const handleProtectedClick = (section) => {
    setAuthFor(section);
    setShowAuth(true);
  };

  const handleLoginSuccess = (loginData) => {
    setShowAuth(false);
    onLogin(loginData);
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 space-y-4">
        <div className={getContrastClass(
          "bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30",
          "bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-yellow-400/50"
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
            Your community portal for STEM education and parent engagement
          </p>
          <div className={getContrastClass(
            "mt-4 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2",
            "mt-4 text-sm text-yellow-300 bg-gray-800 border border-yellow-400 rounded-lg px-3 py-2"
          )}>
            💡 Some sections require login with access code MERCADO80 and your name
          </div>
        </div>

        {/* Public Weather App - Full Width */}
        <div className="mb-4">
          <div
            onClick={() => window.location.href = "https://weather.com"}
            className={getContrastClass(
              `bg-gradient-to-br from-blue-500/90 to-cyan-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border border-white/20`,
              `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border-2 border-yellow-400/50`
            )}
          >
            <div className="text-white mb-4">
              <Cloud size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
              Weather Information
            </h3>
            <p className="text-white/80 text-sm mb-3">
              Get current weather updates for San Jose del Monte, Bulacan
            </p>
            <div className="text-white/60 text-xs">
              Click to view weather →
            </div>
          </div>
        </div>

        {/* School Information - Full Width */}
        <div className="mb-4">
          <div
            className={getContrastClass(
              `bg-gradient-to-br from-teal-500/90 to-cyan-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20`,
              `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border-2 border-teal-400/50`
            )}
          >
            <div className="text-white mb-4">
              <BookOpen size={20} />
            </div>
            
            <div className="text-center mb-4">
              <div className="text-headline-medium text-white mb-2">
                CSANSCI Mercado Elementary School
              </div>
              <div className="text-body-medium text-white/80">
                Supporting Excellence in Education
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-body-medium text-white/95 leading-relaxed">
                <span className="font-medium">Welcome to our community!</span> We're dedicated to providing quality education and fostering parent-teacher collaboration for our children's success.
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Protected STEM Resources + Protected Donation Form */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            onClick={() => handleProtectedClick('STEM Resources')}
            className={getContrastClass(
              `bg-gradient-to-br from-purple-500/90 to-violet-600/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border border-white/20 relative`,
              `bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 border-2 border-yellow-400/50 relative`
            )}
          >
            <div className="absolute top-3 right-3">
              <Lock size={16} className="text-white/80" />
            </div>
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
              🔒 Login Required
            </div>
          </div>

          <div
            onClick={() => handleProtectedClick('Donation Form')}
            className={getContrastClass(
              "card-elevated bg-gradient-to-br from-success-500 to-success-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] relative",
              "glass-dark bg-gradient-to-br from-success-600 to-success-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700 relative"
            )}
          >
            <div className="absolute top-3 right-3">
              <Lock size={16} className="text-white/80" />
            </div>
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
              🔒 Login Required
            </div>
          </div>
        </div>

        {/* Row 2: Protected Projects + Officers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => handleProtectedClick('PTA Projects')}
            className={getContrastClass(
              "card-elevated bg-gradient-to-br from-purple-500 to-purple-600 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] relative",
              "glass-dark bg-gradient-to-br from-purple-600 to-purple-700 p-6 cursor-pointer state-layer transform transition-all hover:scale-[1.02] hover:shadow-material-lg active:scale-[0.98] border border-surface-700 relative"
            )}
          >
            <div className="absolute top-3 right-3">
              <Lock size={16} className="text-white/80" />
            </div>
            <div className="text-white mb-4">
              <FolderPlus size={24} />
            </div>
            <h3 className="text-title-medium text-white mb-2">
              PTA Projects
            </h3>
            <p className="text-body-medium text-white/90 mb-3">
              Track PTA projects and submit proposals
            </p>
            <div className="text-body-small text-white/70">
              🔒 Login Required
            </div>
          </div>

          <div
            onClick={() => alert("Officer Information:\n\nPresident: Cherwin Fernandez\nVice President: Dante Navarro\nSecretary: Laarni Gilles\nTreasurer: Cyndee Delmendo\nAuditor: Gina Genido\n\nContact: 11mercado.pta@gmail.com")}
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
              PTA leadership contact information
            </p>
            <div className="text-body-small text-white/70">
              Tap to view details
            </div>
          </div>
        </div>

        {/* Row 3: School Links + Community Hub */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => alert("School Links:\n\n🏫 CSANSCI Official Website\n🏛️ San Jose del Monte LGU\n📧 School Email Contact\n\nFor more detailed access, please login with your access code.")}
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
              Tap for basic info
            </div>
          </div>

          <div
            onClick={() => alert("Community Hub is available for parents and teachers to share thoughts and connect. Please login with access code MERCADO80 and your name to access the full community features.")}
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
              Connect with other parents and teachers
            </p>
            <div className="text-body-small text-white/70">
              Public preview available
            </div>
          </div>
        </div>

        {/* Row 4: Contact Us + Legal */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => alert("Contact Information:\n\n📧 Email: 11mercado.pta@gmail.com\n📍 Location: CSANSCI Mercado Elementary School\n🕒 Office Hours: Monday-Friday, 8:00 AM - 4:00 PM\n\nFor detailed contact forms and messaging, please login with your access code.")}
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
              Get in touch with the PTA
            </p>
            <div className="text-body-small text-white/70">
              Basic info available
            </div>
          </div>

          <div
            onClick={() => alert("Legal Information:\n\n📋 Privacy Policy\n📄 Terms and Conditions\n⚠️ Disclaimers\n🔒 Data Protection\n\nThis platform is designed to support educational activities and parent-teacher collaboration. For full legal documentation, please login with your access code.")}
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
              Privacy, terms, and disclaimers
            </p>
            <div className="text-body-small text-white/70">
              Important information
            </div>
          </div>
        </div>

        {/* Login CTA */}
        <div className={getContrastClass(
          "bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-center shadow-xl",
          "bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-6 text-center shadow-xl border-2 border-yellow-400"
        )}>
          <div className="text-white mb-4">
            <LogIn size={32} className="mx-auto" />
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">
            Ready to Access All Features?
          </h3>
          <p className="text-white/90 text-sm mb-4">
            Login with access code MERCADO80 and your name to unlock STEM tools, donation forms, and community features.
          </p>
          <button
            onClick={() => handleProtectedClick('Full Access')}
            className="bg-white text-primary-600 font-semibold py-3 px-6 rounded-full hover:bg-gray-50 transition-colors"
          >
            Login Now
          </button>
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
                Enter access code MERCADO80 and your name to continue
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