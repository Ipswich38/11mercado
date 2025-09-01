import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Clock, 
  BookOpen, 
  Brain, 
  CheckCircle,
  Plus,
  X,
  Lightbulb,
  TrendingUp,
  Award,
  Users,
  Zap
} from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';

interface StudyGoal {
  id: string;
  subject: string;
  topic: string;
  targetDate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeAllocation: number; // hours per week
  status: 'Not Started' | 'In Progress' | 'Completed';
  aiRecommendations?: string[];
  progress: number; // 0-100
}

interface StudySession {
  id: string;
  goalId: string;
  date: string;
  duration: number;
  topic: string;
  completed: boolean;
  aiInsights?: string;
}

interface AIStudyPlannerProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

export default function AIStudyPlanner({ getContrastClass, onClose }: AIStudyPlannerProps) {
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [currentView, setCurrentView] = useState<'overview' | 'goals' | 'sessions' | 'insights'>('overview');

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    subject: '',
    topic: '',
    targetDate: '',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    timeAllocation: 3
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'Engineering', 'Statistics', 'Research Methods'
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('ai_study_goals');
    const savedSessions = localStorage.getItem('ai_study_sessions');
    
    if (savedGoals) {
      try {
        setStudyGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading study goals:', error);
      }
    }
    
    if (savedSessions) {
      try {
        setStudySessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error('Error loading study sessions:', error);
      }
    }
  }, []);

  // Save data whenever goals or sessions change
  useEffect(() => {
    localStorage.setItem('ai_study_goals', JSON.stringify(studyGoals));
  }, [studyGoals]);

  useEffect(() => {
    localStorage.setItem('ai_study_sessions', JSON.stringify(studySessions));
  }, [studySessions]);

  const generateAIStudyPlan = async (goal: StudyGoal) => {
    setIsGeneratingPlan(true);
    
    const prompt = `Create a comprehensive study plan for:
    
Subject: ${goal.subject}
Topic: ${goal.topic}
Difficulty Level: ${goal.difficulty}
Target Date: ${goal.targetDate}
Time Available: ${goal.timeAllocation} hours per week

Generate specific recommendations including:
1. Learning milestones and checkpoints
2. Recommended study techniques for this subject
3. Practice exercises and assessment methods
4. Common challenges and how to overcome them
5. Additional resources and tools
6. Time management strategies

Focus on evidence-based learning techniques and practical applications.`;

    try {
      if (!groq || !isGroqConfigured) {
        throw new Error('AI service not configured');
      }
      
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational consultant and AI study planner v3.0. Create detailed, personalized study plans based on cognitive science principles and effective learning strategies. Provide actionable, specific recommendations that adapt to different learning styles and time constraints.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'deepseek-r1-distill-llama-70b',
        temperature: 0.4,
        max_tokens: 1500,
        stream: false
      });

      const recommendations = response.choices[0]?.message?.content || 'Unable to generate recommendations at this time.';
      
      // Update the goal with AI recommendations
      setStudyGoals(prev => prev.map(g => 
        g.id === goal.id 
          ? { ...g, aiRecommendations: recommendations.split('\n').filter(r => r.trim().length > 0) }
          : g
      ));
      
    } catch (error) {
      console.error('Error generating AI study plan:', error);
      // Add basic recommendations as fallback
      setStudyGoals(prev => prev.map(g => 
        g.id === goal.id 
          ? { 
            ...g, 
            aiRecommendations: [
              'Start with fundamental concepts before advancing',
              'Practice regularly with spaced repetition',
              'Use active learning techniques like teaching others',
              'Set specific, measurable learning objectives',
              'Review and assess your progress weekly'
            ]
          }
          : g
      ));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addStudyGoal = async () => {
    if (!newGoal.subject || !newGoal.topic || !newGoal.targetDate) return;

    const goal: StudyGoal = {
      id: Date.now().toString(),
      subject: newGoal.subject,
      topic: newGoal.topic,
      targetDate: newGoal.targetDate,
      difficulty: newGoal.difficulty,
      timeAllocation: newGoal.timeAllocation,
      status: 'Not Started',
      progress: 0
    };

    setStudyGoals(prev => [...prev, goal]);
    
    // Generate AI recommendations for the new goal
    await generateAIStudyPlan(goal);
    
    // Reset form
    setNewGoal({
      subject: '',
      topic: '',
      targetDate: '',
      difficulty: 'Intermediate',
      timeAllocation: 3
    });
    setShowAddGoal(false);
  };

  const generateOverallInsights = async () => {
    if (studyGoals.length === 0) return;

    setIsGeneratingPlan(true);
    
    const goalsData = studyGoals.map(g => 
      `${g.subject} - ${g.topic} (${g.difficulty}, ${g.progress}% complete)`
    ).join('; ');

    const prompt = `Analyze this student's study goals and provide personalized insights:

Current Goals: ${goalsData}
Total Active Goals: ${studyGoals.length}

Provide analysis on:
1. Learning load balance and time management
2. Subject integration opportunities
3. Potential synergies between different topics
4. Recommended focus areas based on progress
5. Study efficiency improvements
6. Motivation and engagement strategies

Give actionable advice for optimizing their learning journey.`;

    try {
      if (!groq || !isGroqConfigured) {
        throw new Error('AI service not configured');
      }
      
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI learning analytics expert v3.0. Analyze student learning patterns and provide data-driven insights for optimal academic performance. Focus on personalized recommendations based on learning science research.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'deepseek-r1-distill-llama-70b',
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      });

      const insights = response.choices[0]?.message?.content || 'Continue working on your study goals. Regular practice and consistent effort lead to success.';
      setAiInsights(insights);
      
    } catch (error) {
      console.error('Error generating insights:', error);
      setAiInsights('Keep up the great work! Consistent daily practice and regular review sessions will help you achieve your learning goals effectively.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setStudyGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { 
          ...g, 
          progress, 
          status: progress === 0 ? 'Not Started' : progress === 100 ? 'Completed' : 'In Progress' 
        }
        : g
    ));
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 30) return 'bg-red-400';
    if (progress < 70) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={getContrastClass(
          "bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30",
          "bg-gray-900 rounded-2xl p-4 shadow-lg border-2 border-yellow-400"
        )}>
          <div className="flex items-center gap-3">
            <div className={getContrastClass(
              "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center",
              "w-10 h-10 bg-gray-800 border border-yellow-400 rounded-xl flex items-center justify-center"
            )}>
              <Target size={20} className={getContrastClass("text-blue-600", "text-yellow-400")} />
            </div>
            <div>
              <div className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                {studyGoals.length}
              </div>
              <div className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                Active Goals
              </div>
            </div>
          </div>
        </div>

        <div className={getContrastClass(
          "bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30",
          "bg-gray-900 rounded-2xl p-4 shadow-lg border-2 border-yellow-400"
        )}>
          <div className="flex items-center gap-3">
            <div className={getContrastClass(
              "w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center",
              "w-10 h-10 bg-gray-800 border border-yellow-400 rounded-xl flex items-center justify-center"
            )}>
              <TrendingUp size={20} className={getContrastClass("text-green-600", "text-yellow-400")} />
            </div>
            <div>
              <div className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                {studyGoals.filter(g => g.status === 'Completed').length}
              </div>
              <div className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                Completed
              </div>
            </div>
          </div>
        </div>

        <div className={getContrastClass(
          "bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30",
          "bg-gray-900 rounded-2xl p-4 shadow-lg border-2 border-yellow-400"
        )}>
          <div className="flex items-center gap-3">
            <div className={getContrastClass(
              "w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center",
              "w-10 h-10 bg-gray-800 border border-yellow-400 rounded-xl flex items-center justify-center"
            )}>
              <Clock size={20} className={getContrastClass("text-purple-600", "text-yellow-400")} />
            </div>
            <div>
              <div className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                {studyGoals.reduce((total, g) => total + g.timeAllocation, 0)}h
              </div>
              <div className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                Weekly Hours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Goals */}
      <div className={getContrastClass(
        "bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30",
        "bg-gray-900 rounded-2xl p-6 shadow-lg border-2 border-yellow-400"
      )}>
        <h3 className={getContrastClass(
          "text-lg font-semibold text-gray-900 mb-4",
          "text-lg font-semibold text-yellow-400 mb-4"
        )}>
          Recent Study Goals
        </h3>
        
        {studyGoals.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={48} className={getContrastClass("text-gray-400 mx-auto mb-4", "text-yellow-600 mx-auto mb-4")} />
            <p className={getContrastClass("text-gray-600", "text-yellow-200")}>
              No study goals yet. Start by adding your first learning objective!
            </p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {studyGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className={getContrastClass(
                "bg-gray-50 rounded-xl p-4",
                "bg-gray-800 border border-yellow-400 rounded-xl p-4"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={getContrastClass(
                    "font-medium text-gray-900",
                    "font-medium text-yellow-400"
                  )}>
                    {goal.subject} - {goal.topic}
                  </h4>
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    goal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    goal.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <span className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                  <span className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                    {goal.timeAllocation}h/week
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={getContrastClass("flex-1 bg-gray-200 rounded-full h-2", "flex-1 bg-gray-700 rounded-full h-2")}>
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className={getContrastClass(
        "bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-200",
        "bg-gray-900 border-2 border-yellow-400 rounded-2xl p-6 shadow-lg"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={24} className={getContrastClass("text-blue-600", "text-yellow-400")} />
            <h3 className={getContrastClass(
              "text-lg font-semibold text-blue-900",
              "text-lg font-semibold text-yellow-400"
            )}>
              AI Learning Insights
            </h3>
          </div>
          <button
            onClick={generateOverallInsights}
            disabled={isGeneratingPlan || studyGoals.length === 0}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              studyGoals.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : getContrastClass(
                    'bg-blue-500 hover:bg-blue-600 text-white',
                    'bg-yellow-400 hover:bg-yellow-500 text-black'
                  )
            }`}
          >
            {isGeneratingPlan ? 'Analyzing...' : 'Get Insights'}
          </button>
        </div>
        
        {aiInsights ? (
          <div className={getContrastClass(
            "bg-white/60 rounded-xl p-4 text-blue-900",
            "bg-gray-800 rounded-xl p-4 text-yellow-200"
          )}>
            <p className="whitespace-pre-wrap">{aiInsights}</p>
          </div>
        ) : (
          <p className={getContrastClass("text-blue-700", "text-yellow-200")}>
            Add some study goals and generate personalized AI insights to optimize your learning journey.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-lg hover:bg-white/20 transition-colors",
              "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <Brain size={24} className={getContrastClass("text-white", "text-yellow-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-lg font-semibold text-white",
              "text-lg font-semibold text-yellow-400"
            )}>
              AI Study Planner v3.0
            </h1>
            <p className={getContrastClass(
              "text-sm text-white/80",
              "text-sm text-yellow-200"
            )}>
              Personalized learning path optimization
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={getContrastClass(
        "bg-white border-b border-gray-200 px-4 py-2",
        "bg-black border-b-2 border-yellow-400 px-4 py-2"
      )}>
        <div className="flex gap-1">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'goals', label: 'Goals', icon: Target },
            { key: 'sessions', label: 'Sessions', icon: Calendar },
            { key: 'insights', label: 'AI Insights', icon: Lightbulb }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === key
                  ? getContrastClass(
                      'bg-blue-100 text-blue-700',
                      'bg-gray-800 text-yellow-400 border border-yellow-400'
                    )
                  : getContrastClass(
                      'text-gray-600 hover:bg-gray-100',
                      'text-yellow-200 hover:bg-gray-800'
                    )
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentView === 'overview' && renderOverview()}
        
        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className={getContrastClass(
              "bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl",
              "bg-gray-900 border-2 border-yellow-400 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={getContrastClass(
                  "text-xl font-semibold text-gray-900",
                  "text-xl font-semibold text-yellow-400"
                )}>
                  Add Study Goal
                </h3>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className={getContrastClass(
                    "p-1 rounded-lg text-gray-500 hover:bg-gray-100",
                    "p-1 rounded-lg text-yellow-400 hover:bg-gray-800"
                  )}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={getContrastClass(
                    "block text-sm font-medium text-gray-700 mb-1",
                    "block text-sm font-medium text-yellow-300 mb-1"
                  )}>
                    Subject
                  </label>
                  <select
                    value={newGoal.subject}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, subject: e.target.value }))}
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
                      "w-full p-3 border border-gray-600 bg-gray-800 text-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                    )}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={getContrastClass(
                    "block text-sm font-medium text-gray-700 mb-1",
                    "block text-sm font-medium text-yellow-300 mb-1"
                  )}>
                    Topic
                  </label>
                  <input
                    type="text"
                    value={newGoal.topic}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Linear Algebra, Quantum Mechanics"
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
                      "w-full p-3 border border-gray-600 bg-gray-800 text-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                    )}
                  />
                </div>
                
                <div>
                  <label className={getContrastClass(
                    "block text-sm font-medium text-gray-700 mb-1",
                    "block text-sm font-medium text-yellow-300 mb-1"
                  )}>
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
                      "w-full p-3 border border-gray-600 bg-gray-800 text-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                    )}
                  />
                </div>
                
                <div>
                  <label className={getContrastClass(
                    "block text-sm font-medium text-gray-700 mb-1",
                    "block text-sm font-medium text-yellow-300 mb-1"
                  )}>
                    Difficulty Level
                  </label>
                  <select
                    value={newGoal.difficulty}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
                      "w-full p-3 border border-gray-600 bg-gray-800 text-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                    )}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className={getContrastClass(
                    "block text-sm font-medium text-gray-700 mb-1",
                    "block text-sm font-medium text-yellow-300 mb-1"
                  )}>
                    Weekly Hours: {newGoal.timeAllocation}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={newGoal.timeAllocation}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, timeAllocation: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className={getContrastClass(
                    "flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors",
                    "flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors border border-gray-600"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={addStudyGoal}
                  disabled={!newGoal.subject || !newGoal.topic || !newGoal.targetDate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddGoal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}