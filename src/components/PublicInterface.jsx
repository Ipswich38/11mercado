import React, { useState } from 'react';
import { Button } from './ui/button';
import TestDashboard from './TestDashboard';
import StudentProjects from './StudentProjects';
import StudentResearch from './StudentResearch';
import StudentCommunity from './StudentCommunity';
import { Home, BookOpen, Microscope, Users } from 'lucide-react';

const PublicInterface = ({
  projects,
  researchTools,
  officers,
  donations,
  messages,
  weather,
  bulletinItems,
  getContrastClass,
  onDataUpdate,
  userFirstName = 'Student',
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: BookOpen },
    { id: 'research', label: 'Research', icon: Microscope },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return <StudentProjects projects={projects} />;

      case 'research':
        return <StudentResearch researchTools={researchTools} />;

      case 'community':
        return <StudentCommunity officers={officers} />;

      default:
        return <TestDashboard userFirstName={userFirstName} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-3 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'projects' && projects.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {projects.length}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default PublicInterface;
