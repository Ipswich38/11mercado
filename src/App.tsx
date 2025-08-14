import React, { useState, useRef } from 'react';
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
import UPCATQuizGenerator from './components/UPCATQuizGenerator';
import AIScientificCalculator from './components/AIScientificCalculator';
import HuggingFaceAI from './components/HuggingFaceAI';
import Legal from './components/Legal';
import MiniTutorial from './components/MiniTutorial';
import SimpleLogin from './components/SimpleLogin';
import AdminDashboard from './components/AdminDashboard';
import FinancialOfficerDashboard from './components/FinancialOfficerDashboard';

export default function MobileApp() {
  // Check for admin monitor access via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminMode = urlParams.get('admin') === 'monitor';
  
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
  const fileInputRef = useRef(null);

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

  const [donationDrives, setDonationDrives] = useState([]);

  const [messages, setMessages] = useState([]);

  const handleLogin = (loginData) => {
    setUserInfo(loginData);
    setIsLoggedIn(true);
    localStorage.setItem('11mercado_user', JSON.stringify(loginData));
    
    // Auto-open admin dashboard for admin users
    if (loginData.isAdmin) {
      setShowAdminDashboard(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setActiveApp('home');
    setShowAdminDashboard(false);
    localStorage.removeItem('11mercado_user');
    localStorage.removeItem('11mercado_current_session');
  };

  // Check for existing login on component mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('11mercado_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserInfo(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.warn('Failed to parse saved user data');
        localStorage.removeItem('11mercado_user');
      }
    }
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
                  receipts: [...drive.receipts, newReceipt]
                }
              : drive
          ));

          showNotificationMessage(`Receipt uploaded successfully! Amount ₱${amount.toLocaleString()} added to drive.`);
        }
      };
    }
  };

  const renderContent = () => {
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
        return <EnhancedDonationForm 
          getContrastClass={getContrastClass}
          onClose={() => setActiveApp('home')}
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
  };

  // Show login screen if not logged in
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

  return (
    <UserLimitGate getContrastClass={getContrastClass}>
      <div className={getContrastClass(
        "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-10",
        "min-h-screen bg-black pb-10"
      )}>
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{notificationMessage}</span>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <header className={getContrastClass(
          "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-xl sticky top-0 z-40",
          "bg-black/80 backdrop-blur-xl border-b-2 border-yellow-400/50 sticky top-0 z-40"
        )}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeApp !== 'home' && (
                  <button
                    onClick={() => setActiveApp('home')}
                    className="p-2 rounded-xl text-slate-600 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="text-2xl">🎓</div>
                <div>
                  <h1 className={getContrastClass(
                    "text-lg font-light tracking-tight text-slate-900",
                    "text-lg font-light tracking-tight text-yellow-400"
                  )}>
                    11Mercado
                  </h1>
                  <p className={getContrastClass("text-xs text-slate-600", "text-xs text-yellow-200")}>
                    {activeApp === 'home' ? `Welcome, ${userInfo?.firstName || 'Student'}!` : getAppTitle(activeApp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {userInfo?.isAdmin && (
                  <button
                    onClick={() => setShowAdminDashboard(true)}
                    className={getContrastClass(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-400 hover:bg-blue-900/20 hover:text-blue-400 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                    )}
                    title="Admin Dashboard"
                  >
                    <Shield size={16} />
                    <span className="text-xs font-medium">Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className={getContrastClass(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-400 hover:bg-red-900/20 hover:text-red-400 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                  )}
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="text-xs font-medium">Logout</span>
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

        {/* Developer Credit Footer */}
        <div className={getContrastClass(
          "fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-t border-gray-200",
          "fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-t border-yellow-400/20"
        )}>
          <div className={getContrastClass(
            "text-center text-xs text-gray-400 py-2",
            "text-center text-xs text-yellow-500/60 py-2"
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