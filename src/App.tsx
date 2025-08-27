import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  ArrowLeft,
  X,
  LogOut,
  Shield
} from 'lucide-react';

import MiniAppsGrid from './components/MiniAppsGrid';
import STEMTools from './components/STEMTools';
import WeatherApp from './components/WeatherApp';
import DonationUpload from './components/DonationUpload';
import CommunityApp from './components/CommunityApp';
import OfficersApp from './components/OfficersApp';
import CSANSCILinks from './components/CSANSCILinks';
import DonationTiles from './components/DonationTiles';
import AIChatBot from './components/AIChatBot';
import DonationForm from './components/DonationForm';
import EnhancedDonationForm from './components/EnhancedDonationForm';
import DonationTrackingSpreadsheet from './components/DonationTrackingSpreadsheet';
import ContactUs from './components/ContactUs';
import Projects from './components/Projects';
import { ChatBotBubbleWithPreview } from './components/ChatBotBubble';
import UserLimitGate from './components/UserLimitGate';
import AdminMonitor from './components/AdminMonitor';
import { useAdminSession } from './utils/adminSessionManager';
import UPCATQuizGenerator from './components/UPCATQuizGenerator';
import AIScientificCalculator from './components/AIScientificCalculator';
import HuggingFaceAI from './components/HuggingFaceAI';
import Legal from './components/Legal';
import PTASecretaryDashboard from './components/PTASecretaryDashboard';
import MiniTutorial from './components/MiniTutorial';
import SimpleLogin from './components/SimpleLogin';
import AdminDashboard from './components/AdminDashboard';
import FinancialOfficerDashboard from './components/FinancialOfficerDashboard';
import MaintenanceMode from './components/MaintenanceMode';
import NewDonationForm from './components/NewDonationForm';
// import { initDataSync } from './utils/dataSync'; // Disabled - using centralized database instead

export default function MobileApp() {
  // Check for admin monitor access via URL parameter
  let isAdminMode = false;
  try {
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      isAdminMode = urlParams.get('admin') === 'monitor';
    }
  } catch (error) {
    console.warn('Error checking URL parameters:', error);
    isAdminMode = false;
  }
  
  const [activeApp, setActiveApp] = useState(isAdminMode ? 'admin-monitor' : 'home');
  const [highContrast, setHighContrast] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [showTutorial, setShowTutorial] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const fileInputRef = useRef(null);
  
  // Admin session manager
  const { 
    requestAccess, 
    releaseSession, 
    updateActivity, 
    logActivity 
  } = useAdminSession();

  // New AI STEM Tools
  const [aiSTEMTools] = useState([
    {
      id: 1,
      name: "College Entrance Exam: Quiz Generator",
      description: "Generate personalized UPCAT practice quizzes with AI",
      icon: "🧠",
      category: "Test Prep",
      color: "from-purple-500 to-violet-600",
      subjects: ["Mathematics", "Science", "Reading Comprehension", "Language Proficiency"]
    },
    {
      id: 2,
      name: "AI Scientific Calculator",
      description: "Advanced calculator with AI-powered problem solving",
      icon: "🔢",
      category: "Mathematics",
      color: "from-blue-500 to-cyan-600",
      subjects: ["Calculus", "Algebra", "Trigonometry", "Statistics"]
    },
    {
      id: 3,
      name: "Research and STEM-GPT",
      description: "Combined AI for STEM subjects and research methodology",
      icon: "🧬",
      category: "AI Assistant",
      color: "from-purple-500 to-pink-600",
      subjects: ["STEM Subjects", "Research Methods", "Data Analysis", "All Sciences"]
    }
  ]);

  // Traditional STEM Links (moved from research tools)
  const [stemLinks] = useState([
    {
      id: 1,
      name: "Khan Academy",
      description: "Free online courses in math, science, and more",
      url: "https://www.khanacademy.org",
      category: "General Education",
      icon: "📚",
      subjects: ["Mathematics", "Science", "Computing"]
    },
    {
      id: 2,
      name: "NASA Education",
      description: "Educational resources and activities from NASA",
      url: "https://www.nasa.gov/audience/foreducators/",
      category: "Space & Science",
      icon: "🚀",
      subjects: ["Astronomy", "Physics", "Earth Science"]
    },
    {
      id: 3,
      name: "PhET Simulations",
      description: "Interactive science and math simulations",
      url: "https://phet.colorado.edu",
      category: "Interactive Learning",
      icon: "⚗️",
      subjects: ["Physics", "Chemistry", "Biology", "Mathematics"]
    },
    {
      id: 4,
      name: "Coursera (Free Courses)",
      description: "Free university-level courses",
      url: "https://www.coursera.org/courses?query=free",
      category: "Higher Learning",
      icon: "🎓",
      subjects: ["Computer Science", "Data Science", "Engineering"]
    },
    {
      id: 5,
      name: "MIT OpenCourseWare",
      description: "Free MIT course materials",
      url: "https://ocw.mit.edu",
      category: "Advanced Studies",
      icon: "🏛️",
      subjects: ["Engineering", "Science", "Technology"]
    },
    {
      id: 6,
      name: "Wolfram Alpha",
      description: "Computational knowledge engine",
      url: "https://www.wolframalpha.com",
      category: "Problem Solving",
      icon: "🧮",
      subjects: ["Mathematics", "Science", "Engineering"]
    }
  ]);

  // Initialize donation drives with localStorage persistence
  const [donationDrives, setDonationDrives] = useState(() => {
    const savedDrives = localStorage.getItem('donationDrives');
    if (savedDrives) {
      try {
        return JSON.parse(savedDrives);
      } catch (error) {
        console.warn('Failed to parse saved donation drives');
      }
    }
    
    // Default donation drives if none saved
    return [
      {
        id: 'general-fund',
        title: 'General SPTA Fund',
        currentAmount: 0,
        receipts: []
      },
      {
        id: 'mercado-projects',
        title: '11Mercado PTA Projects Fund',
        currentAmount: 0,
        receipts: []
      }
    ];
  });

  const [messages, setMessages] = useState([]);

  const handleLogin = async (loginData) => {
    try {
      // Register session with admin session manager
      const sessionResult = await requestAccess(loginData);
      
      if (sessionResult.success) {
        setUserInfo(loginData);
        setIsLoggedIn(true);
        setCurrentSessionId(sessionResult.sessionId);
        localStorage.setItem('11mercado_user', JSON.stringify(loginData));
        localStorage.setItem('11mercado_session_id', sessionResult.sessionId);
        
        // Show success notification
        setNotificationMessage(sessionResult.message);
        setNotificationType('success');
        setShowNotification(true);
      } else {
        // Show error if access denied
        setNotificationMessage(sessionResult.message);
        setNotificationType('error');
        setShowNotification(true);
        return; // Don't proceed with login
      }
    } catch (error) {
      console.error('Error registering session:', error);
      // Fallback: still allow login but without session tracking
      setUserInfo(loginData);
      setIsLoggedIn(true);
      localStorage.setItem('11mercado_user', JSON.stringify(loginData));
    }
    
    // Auto-open admin dashboard for admin users
    if (loginData.isAdmin) {
      setShowAdminDashboard(true);
    }
  };

  const handleLogout = () => {
    // Release session from admin session manager
    if (currentSessionId) {
      releaseSession(currentSessionId);
      localStorage.removeItem('11mercado_session_id');
    }
    
    setIsLoggedIn(false);
    setUserInfo(null);
    setCurrentSessionId(null);
    setActiveApp('home');
    setShowAdminDashboard(false);
    localStorage.removeItem('11mercado_user');
    localStorage.removeItem('11mercado_current_session');
  };

  // Check for existing login on component mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('11mercado_user');
    const savedSessionId = localStorage.getItem('11mercado_session_id');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserInfo(userData);
        setIsLoggedIn(true);
        
        // Restore session if it exists and is still valid
        if (savedSessionId) {
          setCurrentSessionId(savedSessionId);
          // Update activity to keep session alive
          updateActivity(savedSessionId);
        }
      } catch (error) {
        console.warn('Failed to parse saved user data');
        localStorage.removeItem('11mercado_user');
        localStorage.removeItem('11mercado_session_id');
      }
    }
  }, [updateActivity]);

  // Periodically update user activity to keep session alive
  React.useEffect(() => {
    if (currentSessionId && isLoggedIn) {
      const activityInterval = setInterval(() => {
        updateActivity(currentSessionId);
      }, 60000); // Update every minute
      
      return () => clearInterval(activityInterval);
    }
  }, [currentSessionId, isLoggedIn, updateActivity]);

  // Save donation drives to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('donationDrives', JSON.stringify(donationDrives));
  }, [donationDrives]);

  // Initialize centralized database system
  React.useEffect(() => {
    console.log('Centralized database system initialized');
    
    // Listen for sync events to update UI
    const handleDataSync = (event) => {
      const syncedData = event.detail;
      if (syncedData.donationDrives && syncedData.donationDrives.length > 0) {
        setDonationDrives(syncedData.donationDrives);
      }
      showNotificationMessage('Data synchronized across devices!', 'success');
    };
    
    window.addEventListener('dataSync', handleDataSync);
    
    return () => {
      window.removeEventListener('dataSync', handleDataSync);
    };
  }, []);

  const [weather, setWeather] = useState({
    location: "San Jose del Monte, Bulacan",
    temperature: "28°C",
    condition: "Partly Cloudy",
    humidity: "75%",
    windSpeed: "15 km/h",
    forecast: [
      { day: "Today", high: "32°C", low: "24°C", condition: "Partly Cloudy", icon: "⛅" },
      { day: "Tomorrow", high: "31°C", low: "23°C", condition: "Sunny", icon: "☀️" },
      { day: "Wednesday", high: "29°C", low: "22°C", condition: "Light Rain", icon: "🌦️" }
    ]
  });

  const [officers, setOfficers] = useState([
    {
      id: 1,
      name: "Cherwin Fernandez",
      position: "President",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👨‍💼",
      bio: "Dedicated leader committed to advancing educational excellence and community engagement."
    },
    {
      id: 2,
      name: "Dante Navarro",
      position: "Vice President",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👨‍💼",
      bio: "Experienced advocate for student welfare and parent-teacher collaboration."
    },
    {
      id: 3,
      name: "Laarni Gilles",
      position: "Secretary",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍📋",
      bio: "Organized professional ensuring transparent communication and accurate record-keeping."
    },
    {
      id: 4,
      name: "Cyndee Delmendo",
      position: "Treasurer",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍💰",
      bio: "Financial expert dedicated to responsible fund management and fiscal transparency."
    },
    {
      id: 5,
      name: "Gina Genido",
      position: "Auditor",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍💼",
      bio: "Meticulous auditor ensuring accountability and proper oversight of PTA operations."
    }
  ]);

  const getContrastClass = (baseClass, contrastClass) => {
    return highContrast ? contrastClass : baseClass;
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleReceiptUpload = (driveId) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const amount = Math.floor(Math.random() * 50000) + 10000;
          const newReceipt = {
            id: Date.now(),
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: file.name.replace(/\.[^/.]+$/, ""),
            uploadedBy: "Current User"
          };

          setDonationDrives(prev => prev.map(drive => 
            drive.id === driveId 
              ? { 
                  ...drive, 
                  currentAmount: drive.currentAmount + amount,
                  receipts: [...(drive.receipts || []), newReceipt]
                }
              : drive
          ));

          showNotificationMessage(`Receipt uploaded successfully! Amount ₱${amount.toLocaleString()} added to drive.`);
        }
      };
    }
  };

  const handleDonationSuccess = async (donationData) => {
    const { amount, allocation, donorName, studentName, referenceNumber, submissionDate, donationMode } = donationData;
    
    // Create receipt entries for the donation progress tracking
    const newReceipt = {
      id: Date.now(),
      amount: amount,
      date: submissionDate,
      description: `${donationMode.toUpperCase()} donation from ${donorName} (Student: ${studentName})`,
      uploadedBy: donorName,
      referenceNumber: referenceNumber
    };

    // Update donation drives based on allocation
    if (allocation) {
      setDonationDrives(prev => prev.map(drive => {
        if (drive.id === 'general-fund' && allocation.generalSPTA > 0) {
          return {
            ...drive,
            currentAmount: drive.currentAmount + allocation.generalSPTA,
            receipts: [...(drive.receipts || []), {
              ...newReceipt,
              id: Date.now() + 1,
              amount: allocation.generalSPTA,
              description: `${newReceipt.description} - General SPTA allocation`
            }]
          };
        } else if (drive.id === 'mercado-projects' && allocation.mercadoPTA > 0) {
          return {
            ...drive,
            currentAmount: drive.currentAmount + allocation.mercadoPTA,
            receipts: [...(drive.receipts || []), {
              ...newReceipt,
              id: Date.now() + 2,
              amount: allocation.mercadoPTA,
              description: `${newReceipt.description} - 11Mercado PTA Projects allocation`
            }]
          };
        }
        return drive;
      }));
    } else {
      // If no allocation specified, add to general fund by default
      setDonationDrives(prev => prev.map(drive => 
        drive.id === 'general-fund'
          ? {
              ...drive,
              currentAmount: drive.currentAmount + amount,
              receipts: [...drive.receipts, newReceipt]
            }
          : drive
      ));
    }

    // Send email notification to PTA
    try {
      const { sendEmailToPTA, formatDonationNotificationEmail } = await import('./utils/emailService');
      const emailData = formatDonationNotificationEmail({
        amount, allocation, donorName, studentName, referenceNumber, submissionDate, donationMode
      });
      
      // Attempt to send notification email
      const emailSent = await sendEmailToPTA(emailData);
      console.log(emailSent ? '✅ Donation notification email sent' : '⚠️ Email notification failed, using fallback');
    } catch (emailError) {
      console.warn('Email notification error:', emailError);
    }
    
    // Dispatch a custom event to notify other components of the update
    window.dispatchEvent(new CustomEvent('donationUpdated', { 
      detail: { amount, allocation, donorName, studentName, referenceNumber, submissionDate, donationMode }
    }));
    
    showNotificationMessage(`Donation of ₱${amount.toLocaleString()} successfully synced to donation progress!`, 'success');
  };

  const renderContent = () => {
    try {
      switch (activeApp) {
      case 'home':
        return <MiniAppsGrid 
          onAppSelect={setActiveApp}
          donationDrives={donationDrives}
          getContrastClass={getContrastClass}
          onShowTutorial={setShowTutorial}
          userFirstName={userInfo?.firstName}
        />;
      case 'stem-tools':
        return <STEMTools 
          aiSTEMTools={aiSTEMTools}
          stemLinks={stemLinks}
          getContrastClass={getContrastClass}
          onToolSelect={setActiveApp}
        />;
      case 'weather':
        return <WeatherApp 
          weather={weather}
          getContrastClass={getContrastClass}
        />;
      case 'donation-upload':
        return <NewDonationForm 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
          onDonationSuccess={handleDonationSuccess}
        />;
      case 'community':
        return <CommunityApp 
          messages={messages}
          setMessages={setMessages}
          getContrastClass={getContrastClass}
        />;
      case 'officers':
        return <OfficersApp 
          officers={officers}
          getContrastClass={getContrastClass}
        />;
      case 'csansci-links':
        return <CSANSCILinks 
          getContrastClass={getContrastClass}
        />;
      case 'donation-tiles':
        return <DonationTiles 
          donationDrives={donationDrives}
          getContrastClass={getContrastClass}
        />;
      case 'pta-chat':
        return <AIChatBot 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
        />;
      case 'contact-us':
        return <ContactUs 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
        />;
      case 'projects':
        return <Projects 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
        />;
      case 'admin-monitor':
        return <AdminMonitor 
          getContrastClass={getContrastClass}
        />;
      case 'upcat-quiz-generator':
        return <UPCATQuizGenerator 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('stem-tools')}
        />;
      case 'ai-scientific-calculator':
        return <AIScientificCalculator 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('stem-tools')}
        />;
      case 'ai-assistant':
        return <HuggingFaceAI 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('stem-tools')}
        />;
      case 'legal':
        return <Legal 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
        />;
      case 'donation-tracking':
        return <DonationTrackingSpreadsheet 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
        />;
      default:
        return <MiniAppsGrid 
          onAppSelect={setActiveApp}
          donationDrives={donationDrives}
          getContrastClass={getContrastClass}
          onShowTutorial={setShowTutorial}
          userFirstName={userInfo?.firstName}
        />;
      }
    } catch (error) {
      console.error('Error rendering app content:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">There was an error loading the application. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  // Show login screen if not logged in
  try {
    if (!isLoggedIn) {
      return (
        <SimpleLogin 
          onLogin={handleLogin}
          getContrastClass={getContrastClass}
        />
      );
    }

    // Show financial officer dashboard for financial officers
    if (userInfo?.isFinancialOfficer) {
      return (
        <FinancialOfficerDashboard
          getContrastClass={getContrastClass}
          onLogout={handleLogout}
          userInfo={userInfo}
        />
      );
    }

    // Show PTA Secretary dashboard for secretaries
    if (userInfo?.isSecretary) {
      return (
        <PTASecretaryDashboard
          getContrastClass={getContrastClass}
          onClose={handleLogout}
        />
      );
    }
  } catch (renderError) {
    console.error('Critical error in app rendering:', renderError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Error</h2>
          <p className="text-gray-600 mb-6">The application encountered a critical error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Refresh Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserLimitGate getContrastClass={getContrastClass}>
      <div className={getContrastClass(
        "min-h-screen bg-surface-50 pb-10",
        "min-h-screen bg-surface-900 pb-10"
      )}>
        {/* Material Design Snackbar */}
        {showNotification && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className={`p-4 rounded-material shadow-material-md max-w-sm ${
              notificationType === 'success' 
                ? 'bg-success-500 text-white' 
                : 'bg-error-500 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-body-medium font-medium">{notificationMessage}</span>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="ml-3 text-white/80 hover:text-white btn-text p-1 rounded-material"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Material Design Header */}
        <header className={getContrastClass(
          "glass border-b border-surface-300 sticky top-0 z-40 shadow-material",
          "glass-dark border-b border-surface-700 sticky top-0 z-40 shadow-material"
        )}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeApp !== 'home' && (
                  <button
                    onClick={() => setActiveApp('home')}
                    className={getContrastClass(
                      "btn-text state-layer p-3 rounded-material text-surface-700",
                      "btn-text state-layer p-3 rounded-material text-surface-300"
                    )}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-material flex items-center justify-center text-white text-lg">
                    🎓
                  </div>
                  <div>
                    <h1 className={getContrastClass(
                      "text-title-large text-surface-900",
                      "text-title-large text-surface-100"
                    )}>
                      11Mercado
                    </h1>
                    <p className={getContrastClass("text-body-small text-surface-600", "text-body-small text-surface-400")}>
                      {activeApp === 'home' ? `Welcome, ${userInfo?.firstName || 'Student'}!` : getAppTitle(activeApp)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {userInfo?.isAdmin && (
                  <button
                    onClick={() => setShowAdminDashboard(true)}
                    className={getContrastClass(
                      "btn-outlined state-layer flex items-center gap-2 py-2 px-3 text-body-small",
                      "btn-outlined state-layer flex items-center gap-2 py-2 px-3 text-body-small border-surface-600 text-surface-300"
                    )}
                    title="Admin Dashboard"
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className={getContrastClass(
                    "btn-text state-layer flex items-center gap-2 py-2 px-3 text-body-small text-error-500 hover:bg-error-50",
                    "btn-text state-layer flex items-center gap-2 py-2 px-3 text-body-small text-error-400 hover:bg-error-900/20"
                  )}
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-safe">
          {renderContent()}
        </main>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          className="hidden"
        />

        {/* Floating Chatbot Bubble - shows on all pages except when chat is open */}
        {activeApp !== 'pta-chat' && (
          <ChatBotBubbleWithPreview getContrastClass={getContrastClass} />
        )}

        {/* Mini Tutorial Modal */}
        {showTutorial && (
          <MiniTutorial
            appType={showTutorial}
            onClose={() => setShowTutorial(null)}
            getContrastClass={getContrastClass}
          />
        )}

        {/* Admin Dashboard Modal */}
        {showAdminDashboard && userInfo?.isAdmin && (
          <AdminDashboard
            getContrastClass={getContrastClass}
            onClose={() => setShowAdminDashboard(false)}
            onShowTutorial={setShowTutorial}
            onNavigate={(appId) => {
              setActiveApp(appId);
              setShowAdminDashboard(false);
            }}
          />
        )}

        {/* Material Design Footer */}
        <div className={getContrastClass(
          "fixed bottom-0 left-0 right-0 z-10 glass border-t border-surface-200",
          "fixed bottom-0 left-0 right-0 z-10 glass-dark border-t border-surface-700"
        )}>
          <div className={getContrastClass(
            "text-center text-body-small text-surface-500 py-3",
            "text-center text-body-small text-surface-400 py-3"
          )}>
            Designed and developed by Cherwin Fernandez / KreativLoops • v1.1
          </div>
        </div>
      </div>
    </UserLimitGate>
  );

  function getAppTitle(appId) {
    const titles = {
      'stem-tools': 'STEM Resources',
      'weather': 'Weather App',
      'donation-upload': 'Donation Form',
      'community': 'Community',
      'officers': 'Meet the Officers',
      'csansci-links': 'School Links',
      'donation-tiles': 'Donation Progress',
      'pta-chat': 'DepEd PTA Assistant',
      'contact-us': 'Contact Us',
      'projects': 'PTA Projects',
      'admin-monitor': 'Admin Monitor',
      'upcat-quiz-generator': 'College Entrance Exam: Quiz Generator',
      'ai-scientific-calculator': 'AI Scientific Calculator',
      'ai-assistant': 'Research and STEM-GPT',
      'legal': 'Legal Information',
      'donation-tracking': 'Donation Tracking Spreadsheet'
    };
    return titles[appId] || 'App';
  }
}