import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import AISTEMAssistant from './AISTEMAssistant';
import AIQuizGenerator from './AIQuizGenerator';
import DonationForm from './DonationForm';
import ContactUsForm from './ContactUsForm';
import { fetchWeatherData, fetchForecast } from '../utils/weatherService';
import {
  fetchFundingData,
  formatCurrency,
  calculateProgress,
  getDonationLink,
} from '../utils/fundingService';
import {
  fetchSchoolFeed,
  getPostTypeIcon,
  getSourceIcon,
} from '../utils/schoolFeedService';
import {
  BookOpen,
  Calendar,
  Trophy,
  Users,
  Bell,
  ChevronRight,
  Clock,
  Star,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  Cloud,
  Thermometer,
  DollarSign,
  Heart,
  ExternalLink,
  Brain,
  Zap,
  RefreshCw,
  MapPin,
  Wind,
  Eye,
  Droplets,
  CheckCircle,
  Edit3,
  Search,
  MessageSquare,
} from 'lucide-react';

const StudentDashboard = ({
  projects,
  researchTools,
  officers,
  bulletinItems,
  weather,
  userFirstName,
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [fundingData, setFundingData] = useState(null);
  const [schoolFeed, setSchoolFeed] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [activeAITool, setActiveAITool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Mock student data for demo
  const studentStats = {
    completedProjects: 3,
    activeProjects: 2,
    averageGrade: 'A-',
    totalPoints: 1250,
    rank: 12,
    streakDays: 7,
  };

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weatherResult, fundingResult, schoolFeedResult, forecastResult] =
        await Promise.all([
          fetchWeatherData(),
          fetchFundingData(),
          fetchSchoolFeed(),
          fetchForecast(),
        ]);

      setWeatherData(weatherResult);
      setFundingData(fundingResult);
      setSchoolFeed(schoolFeedResult);
      setForecast(forecastResult);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weatherResult, fundingResult] = await Promise.all([
        fetchWeatherData(),
        fetchFundingData(),
      ]);
      setWeatherData(weatherResult);
      setFundingData(fundingResult);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upcomingEvents = useMemo(() => [
    {
      id: 1,
      title: 'Science Fair Presentation',
      date: '2024-02-15',
      time: '10:00 AM',
      type: 'presentation',
    },
    {
      id: 2,
      title: 'Math Competition',
      date: '2024-02-18',
      time: '2:00 PM',
      type: 'competition',
    },
    {
      id: 3,
      title: 'Parent-Teacher Conference',
      date: '2024-02-20',
      time: '3:30 PM',
      type: 'meeting',
    },
  ], []);

  const recentAchievements = useMemo(() => [
    { id: 1, title: 'Perfect Attendance', icon: '🏆', date: '2 days ago' },
    { id: 2, title: 'Top Performer in Math', icon: '⭐', date: '1 week ago' },
    { id: 3, title: 'Community Helper', icon: '🤝', date: '2 weeks ago' },
  ], []);

  const quickActions = useMemo(() => [
    {
      title: 'View Assignments',
      icon: BookOpen,
      color: 'bg-blue-500',
      count: 3,
    },
    { title: 'Check Grades', icon: Trophy, color: 'bg-green-500', count: null },
    {
      title: 'Messages',
      icon: MessageCircle,
      color: 'bg-purple-500',
      count: 2,
    },
    { title: 'Calendar', icon: Calendar, color: 'bg-orange-500', count: 5 },
  ], []);

  if (activeAITool === 'stem') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            AI STEM Assistant
          </h2>
          <Button variant="outline" onClick={() => setActiveAITool(null)} aria-label="Return to main dashboard">
            Back to Dashboard
          </Button>
        </div>
        <AISTEMAssistant />
      </div>
    );
  }

  if (activeAITool === 'quiz') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            AI Quiz Generator
          </h2>
          <Button variant="outline" onClick={() => setActiveAITool(null)} aria-label="Return to main dashboard">
            Back to Dashboard
          </Button>
        </div>
        <AIQuizGenerator />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" role="banner">
                Welcome back, {userFirstName}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Ready to continue your learning journey?
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  🔥 {studentStats.streakDays} day streak!
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  🏆 Rank #{studentStats.rank}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="text-white hover:bg-white/20"
              aria-label={isLoading ? "Refreshing data" : "Refresh data"}
            >
              <RefreshCw
                className={`${isLoading ? 'animate-spin' : ''}`}
                size={16}
                aria-hidden="true"
              />
              <span className="sr-only">{isLoading ? "Refreshing data" : "Refresh data"}</span>
            </Button>
          </div>
        </div>
        <div className="absolute top-4 right-16 text-6xl opacity-20">📚</div>
      </div>

      {/* Real-time Weather Card */}
      {weatherData && (
        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cloud className="text-white" size={24} />
              <div>
                <h3 className="font-semibold">Current Weather</h3>
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <MapPin size={12} />
                  {weatherData.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {weatherData.temperature}°C
              </div>
              <div className="text-blue-100 text-sm">
                {weatherData.condition}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Thermometer size={16} className="mx-auto mb-1" />
              <div className="text-sm">Feels like</div>
              <div className="font-semibold">{weatherData.feelsLike}°C</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Droplets size={16} className="mx-auto mb-1" />
              <div className="text-sm">Humidity</div>
              <div className="font-semibold">{weatherData.humidity}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Wind size={16} className="mx-auto mb-1" />
              <div className="text-sm">Wind</div>
              <div className="font-semibold">{weatherData.windSpeed} km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="text-4xl">{weatherData.icon}</div>
            <div className="flex-1">
              <div className="text-xs text-blue-100 mb-1">5-Day Forecast</div>
              <div className="flex gap-2">
                {forecast.slice(0, 5).map((day, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded px-2 py-1 text-center"
                  >
                    <div className="text-xs">{day.date}</div>
                    <div className="text-lg">{day.icon}</div>
                    <div className="text-xs">{day.temperature}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-100 mt-3">
            Last updated: {weatherData.lastUpdated}
          </div>
        </div>
      )}

      {/* Fund Tracker */}
      {fundingData && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={20} />
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
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowDonationForm(true)}
                className="bg-green-500 hover:bg-green-600 flex-1"
              >
                <Heart size={14} className="mr-2" />
                Submit Proof of Donations Here!
              </Button>
              <Button
                size="sm"
                onClick={() => setShowEditForm(true)}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                <Edit3 size={14} className="mr-2" />
                Edit Entry
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(fundingData.currentAmount)} of{' '}
                {formatCurrency(fundingData.targetAmount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateProgress(fundingData.currentAmount, fundingData.targetAmount)}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>
                {Math.round(
                  calculateProgress(
                    fundingData.currentAmount,
                    fundingData.targetAmount,
                  ),
                )}
                % complete
              </span>
              <span>{fundingData.donorCount} donors</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Today's Goal</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(fundingData.dailyGoal)}
              </div>
              <div className="text-xs text-green-600">
                {Math.round(
                  (fundingData.todaysProgress / fundingData.dailyGoal) * 100,
                )}
                % achieved
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Recent Donations</div>
              <div className="text-xs space-y-1">
                {fundingData.recentDonations
                  .slice(0, 2)
                  .map((donation, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate">{donation.donor}</span>
                      <span className="font-medium">
                        {formatCurrency(donation.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <ExternalLink size={12} className="inline mr-1" />
            Connected to Google Forms • Last updated: {fundingData.lastUpdated}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="text-yellow-500" size={24} />
            <span className="text-xs text-gray-500 font-medium">GRADE</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {studentStats.averageGrade}
          </p>
          <p className="text-sm text-gray-600">Average</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-500" size={24} />
            <span className="text-xs text-gray-500 font-medium">PROJECTS</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {studentStats.activeProjects}
          </p>
          <p className="text-sm text-gray-600">Active</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Star className="text-purple-500" size={24} />
            <span className="text-xs text-gray-500 font-medium">POINTS</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {studentStats.totalPoints}
          </p>
          <p className="text-sm text-gray-600">Total</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-500" size={24} />
            <span className="text-xs text-gray-500 font-medium">COMPLETED</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {studentStats.completedProjects}
          </p>
          <p className="text-sm text-gray-600">Projects</p>
        </div>
      </div>

      {/* AI Tools Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🤖 AI Learning Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveAITool('stem')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">AI STEM Assistant</h4>
                <p className="text-sm text-gray-600">
                  Grade 11 Physics, Chemistry, Biology & Math
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Zap size={14} />
              <span>Ask questions, get instant help</span>
            </div>
          </button>

          <button
            onClick={() => setActiveAITool('quiz')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">AI Quiz Generator</h4>
                <p className="text-sm text-gray-600">
                  College entrance exam practice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <Target size={14} />
              <span>Math, Science, English, Abstract Reasoning</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="relative bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-all duration-200 hover:scale-105 group"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="text-white" size={20} />
              </div>
              <p className="font-medium text-gray-900">{action.title}</p>
              {action.count && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {action.count}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Project Status Cards */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            📋 Project Status
          </h3>
          <Button variant="ghost" size="sm">
            View All <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={16} />
              </div>
              <span className="text-sm font-medium text-yellow-700">
                Proposed
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {projects.filter((p) => p.status === 'planning').length}
            </div>
            <p className="text-sm text-gray-600">Awaiting approval</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="text-white" size={16} />
              </div>
              <span className="text-sm font-medium text-blue-700">Ongoing</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {projects.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">In progress</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={16} />
              </div>
              <span className="text-sm font-medium text-green-700">
                Accomplished
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {projects.filter((p) => p.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Successfully completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    Status: {project.status}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      project.status === 'completed'
                        ? '100%'
                        : project.status === 'active'
                          ? '65%'
                          : '30%',
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Due: Feb 20, 2024</span>
                <span className="font-medium text-purple-600">
                  {project.status === 'completed'
                    ? '100%'
                    : project.status === 'active'
                      ? '65%'
                      : '30%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* School News Feed */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            🏫 School Updates
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live feed</span>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {schoolFeed.slice(0, 5).map((post) => (
            <div
              key={post.id}
              className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPostTypeIcon(post.type)}</span>
                  <span className="text-lg">{getSourceIcon(post.source)}</span>
                  <span className="text-xs text-gray-500">
                    {post.timestamp}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(post.link, '_blank')}
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 11Mercado Exclusive Bulletin */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bell className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold">11Mercado Exclusive</h3>
            <p className="text-purple-100 text-sm">
              For parents, students & teachers only
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {bulletinItems.length > 0 ? (
            bulletinItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-purple-100 text-sm leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-purple-100">
                No exclusive announcements at this time.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Upcoming Events
            </h3>
            <Button variant="ghost" size="sm">
              View All <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock size={14} className="mr-1" />
                      {event.date} at {event.time}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.type === 'presentation'
                        ? 'bg-blue-100 text-blue-800'
                        : event.type === 'competition'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {event.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Achievements
            </h3>
            <Button variant="ghost" size="sm">
              View All <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600">{achievement.date}</p>
                </div>
                <Award className="text-yellow-500" size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Active Projects
          </h3>
          <Button variant="ghost" size="sm">
            View All <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    Status: {project.status}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      project.status === 'completed'
                        ? '100%'
                        : project.status === 'active'
                          ? '65%'
                          : '30%',
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Due: Feb 20, 2024</span>
                <span className="font-medium text-purple-600">
                  {project.status === 'completed'
                    ? '100%'
                    : project.status === 'active'
                      ? '65%'
                      : '30%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      {bulletinItems.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              📢 Announcements
            </h3>
            <Bell className="text-gray-400" size={20} />
          </div>
          <div className="space-y-3">
            {bulletinItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-gray-700">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Form Modal */}
      <DonationForm
        isOpen={showDonationForm}
        onClose={() => setShowDonationForm(false)}
        onDonationSuccess={() => {
          // Refresh funding data after successful donation
          loadFundingData();
        }}
      />

      {/* Edit Donation Form Modal */}
      <EditDonationForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onEditSuccess={() => {
          // Refresh funding data after successful edit
          loadFundingData();
        }}
      />

      {/* Contact Us Form Modal */}
      <ContactUsForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </div>
  );
};

// Edit Donation Form Component
const EditDonationForm = ({ isOpen, onClose, onEditSuccess }) => {
  const [controlNumber, setControlNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundDonation, setFoundDonation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [proofFile, setProofFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const searchDonation = async () => {
    if (!controlNumber.trim()) {
      alert('Please enter a control number');
      return;
    }

    setIsSearching(true);
    try {
      // Search in localStorage (in real implementation, search in database)
      const donations = JSON.parse(localStorage.getItem('11m_donations') || '[]');
      const found = donations.find(donation => 
        donation.controlNumber && donation.controlNumber.toLowerCase() === controlNumber.toLowerCase()
      );

      if (found) {
        setFoundDonation(found);
        setFormData({
          parentFirstName: found.parentFirstName || '',
          studentFullName: found.studentFullName || '',
          donationType: found.donationType || 'GCash',
          totalAmount: found.totalAmount || '',
          sptaAmount: found.sptaAmount || '',
          classroomPtaAmount: found.classroomPtaAmount || '',
          inkindItems: found.inkindItems || '',
          cashEntrustedTo: found.cashEntrustedTo || '',
          cashEntrustedDate: found.cashEntrustedDate || '',
          cashEntrustedTime: found.cashEntrustedTime || '',
          message: found.message || ''
        });
        setEditMode(true);
      } else {
        alert('No donation found with that control number. Please check and try again.');
        setFoundDonation(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for donation. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllocationChange = (field, value) => {
    const total = parseFloat(formData.totalAmount) || 0;
    const numValue = parseFloat(value) || 0;
    
    if (numValue <= total) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateRemaining = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    const spta = parseFloat(formData.sptaAmount) || 0;
    const classroom = parseFloat(formData.classroomPtaAmount) || 0;
    return total - spta - classroom;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, WebP) or PDF file.');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      setProofFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate allocation for monetary donations
    if (formData.donationType !== 'In-Kind' && formData.totalAmount) {
      const remaining = calculateRemaining();
      if (remaining !== 0) {
        alert(`Please ensure the allocation amounts add up to your total donation. ${remaining > 0 ? `You have ₱${remaining.toLocaleString('en-PH')} remaining to allocate.` : `You have over-allocated by ₱${Math.abs(remaining).toLocaleString('en-PH')}.`}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Convert uploaded file to base64 if present
      let fileData = null;
      if (proofFile) {
        try {
          fileData = {
            name: proofFile.name,
            type: proofFile.type,
            size: proofFile.size,
            data: await convertFileToBase64(proofFile)
          };
        } catch (fileError) {
          console.error('File conversion error:', fileError);
        }
      }

      // Update the donation data
      const updatedDonation = {
        ...foundDonation,
        ...formData,
        totalAmount: (formData.donationType !== 'In-Kind' && formData.totalAmount) ? parseFloat(formData.totalAmount) : null,
        sptaAmount: (formData.donationType !== 'In-Kind' && formData.sptaAmount) ? parseFloat(formData.sptaAmount) : null,
        classroomPtaAmount: (formData.donationType !== 'In-Kind' && formData.classroomPtaAmount) ? parseFloat(formData.classroomPtaAmount) : null,
        lastModified: new Date().toISOString(),
        proofFile: fileData || foundDonation.proofFile || null
      };

      // Update in localStorage (in real implementation, update in database)
      const donations = JSON.parse(localStorage.getItem('11m_donations') || '[]');
      const index = donations.findIndex(donation => donation.controlNumber === controlNumber);
      
      if (index !== -1) {
        donations[index] = updatedDonation;
        localStorage.setItem('11m_donations', JSON.stringify(donations));
        
        setSubmissionStatus('success');
        if (onEditSuccess) {
          onEditSuccess();
        }
      } else {
        throw new Error('Donation not found for update');
      }
    } catch (error) {
      console.error('Update error:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setControlNumber('');
    setFoundDonation(null);
    setEditMode(false);
    setFormData({});
    setProofFile(null);
    setFilePreview(null);
    setSubmissionStatus(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Edit3 className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Edit Donation Entry</h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Success State */}
        {submissionStatus === 'success' && (
          <div className="p-6 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Donation Updated Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your donation entry has been updated.
            </p>
            <Button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}

        {/* Error State */}
        {submissionStatus === 'error' && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              ×
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Update Failed
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error updating your donation. Please try again.
            </p>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Search State */}
        {!submissionStatus && !editMode && (
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Enter your control number from your donation receipt to edit your entry.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Control Number *
                  </label>
                  <input
                    type="text"
                    value={controlNumber}
                    onChange={(e) => setControlNumber(e.target.value)}
                    placeholder="e.g., 11M-20250108-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <Button
                  onClick={searchDonation}
                  disabled={isSearching}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Search size={16} className="mr-2" />
                  {isSearching ? 'Searching...' : 'Find Donation'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit State */}
        {!submissionStatus && editMode && foundDonation && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800 font-medium mb-1">
                Editing Donation: {foundDonation.controlNumber}
              </div>
              <div className="text-xs text-blue-700">
                Submitted: {new Date(foundDonation.timestamp).toLocaleString('en-PH')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent First Name *
              </label>
              <input
                type="text"
                name="parentFirstName"
                value={formData.parentFirstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                name="studentFullName"
                value={formData.studentFullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Type *
              </label>
              <select
                name="donationType"
                value={formData.donationType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GCash">GCash</option>
                <option value="Maya">Maya (PayMaya)</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="In-Kind">In-Kind Donation</option>
              </select>
            </div>

            {/* Dynamic fields based on donation type */}
            {(formData.donationType === 'GCash' || formData.donationType === 'Maya' || formData.donationType === 'Bank Transfer' || formData.donationType === 'Cash') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Donation Amount (PHP) *
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    min="50"
                    step="50"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SPTA Amount (PHP)
                        </label>
                        <input
                          type="number"
                          name="sptaAmount"
                          value={formData.sptaAmount}
                          onChange={(e) => handleAllocationChange('sptaAmount', e.target.value)}
                          min="0"
                          step="50"
                          max={formData.totalAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Classroom PTA Amount (PHP)
                        </label>
                        <input
                          type="number"
                          name="classroomPtaAmount"
                          value={formData.classroomPtaAmount}
                          onChange={(e) => handleAllocationChange('classroomPtaAmount', e.target.value)}
                          min="0"
                          step="50"
                          max={formData.totalAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {calculateRemaining() !== 0 && (
                      <div className={`text-sm p-2 rounded ${calculateRemaining() > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {calculateRemaining() > 0 
                          ? `⚠️ Remaining to allocate: ₱${calculateRemaining().toLocaleString('en-PH')}`
                          : `❌ Over-allocated by: ₱${Math.abs(calculateRemaining()).toLocaleString('en-PH')}`
                        }
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {formData.donationType === 'In-Kind' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Donated *
                </label>
                <textarea
                  name="inkindItems"
                  value={formData.inkindItems}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.donationType === 'Cash' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cash Given To (Optional)
                  </label>
                  <input
                    type="text"
                    name="cashEntrustedTo"
                    value={formData.cashEntrustedTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formData.cashEntrustedTo && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Entrusted *
                      </label>
                      <input
                        type="date"
                        name="cashEntrustedDate"
                        value={formData.cashEntrustedDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Entrusted (Optional)
                      </label>
                      <input
                        type="time"
                        name="cashEntrustedTime"
                        value={formData.cashEntrustedTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* File Upload for Proof of Payment */}
            {(formData.donationType === 'GCash' || formData.donationType === 'Maya' || formData.donationType === 'Bank Transfer' || formData.donationType === 'Cash') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Proof of Payment (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="text-xs text-gray-500">
                    Upload new image (JPG, PNG, WebP) or PDF file. Max size: 5MB
                  </div>
                  
                  {/* File Preview */}
                  {proofFile && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-green-700 text-sm font-medium">
                            📎 {proofFile.name}
                          </div>
                          <div className="text-xs text-green-600">
                            ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProofFile(null);
                            setFilePreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Image Preview */}
                      {filePreview && (
                        <div className="mt-2">
                          <img 
                            src={filePreview} 
                            alt="Payment proof preview" 
                            className="max-w-full h-32 object-contain rounded border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {isSubmitting ? 'Updating...' : 'Update Donation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
