import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Search,
  Filter,
  BookOpen,
  Video,
  FileText,
  Globe,
  Download,
  Bookmark,
  Share,
  Eye,
  ThumbsUp,
  Clock,
  Tag,
  TrendingUp,
  Lightbulb,
  Microscope,
  Calculator,
  Atom,
} from 'lucide-react';

const StudentResearch = ({ researchTools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced research tools data
  const enhancedTools = researchTools.map((tool, index) => ({
    ...tool,
    description: [
      'Interactive simulations for physics experiments and theoretical concepts',
      'Advanced data analysis platform with AI-powered insights',
      'Virtual laboratory for chemistry experiments and molecular modeling',
      'Mathematical modeling tools for complex problem solving',
    ][index % 4],
    type: ['Simulation', 'Analytics', 'Virtual Lab', 'Calculator'][index % 4],
    rating: (4.2 + index * 0.3).toFixed(1),
    users: Math.floor(Math.random() * 5000) + 1000,
    lastUpdated: ['2 days ago', '1 week ago', '3 days ago', '5 days ago'][
      index % 4
    ],
    difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][index % 4],
    features: [
      ['3D Visualization', 'Real-time Simulation', 'Interactive Controls'],
      ['Data Import/Export', 'Statistical Analysis', 'Custom Charts'],
      ['Safe Experiments', 'Chemical Database', '3D Molecules'],
      ['Graphing Calculator', 'Equation Solver', 'Step-by-step Solutions'],
    ][index % 4],
    subjects: [
      ['Physics', 'Chemistry'],
      ['Mathematics', 'Statistics'],
      ['Chemistry', 'Biology'],
      ['Mathematics', 'Engineering'],
    ][index % 4],
  }));

  const categories = ['all', 'analysis', 'simulation', 'data'];
  const subjects = [
    'All',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Engineering',
  ];

  const filteredTools = enhancedTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Simulation':
        return <Microscope className="text-blue-500" size={20} />;
      case 'Analytics':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'Virtual Lab':
        return <Atom className="text-purple-500" size={20} />;
      case 'Calculator':
        return <Calculator className="text-orange-500" size={20} />;
      default:
        return <BookOpen className="text-gray-500" size={20} />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Advanced':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const featuredTool = enhancedTools[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🔬 Research Hub</h1>
        <p className="text-white/90">
          Discover powerful tools to enhance your learning and research
        </p>
      </div>

      {/* Featured Tool */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-start gap-2 mb-3">
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            ⭐ Featured
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(featuredTool.difficulty)}`}
          >
            {featuredTool.difficulty}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              {getTypeIcon(featuredTool.type)}
              <h3 className="text-2xl font-bold text-gray-900">
                {featuredTool.name}
              </h3>
            </div>
            <p className="text-gray-700 mb-4">{featuredTool.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {featuredTool.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{featuredTool.users.toLocaleString()} users</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                <span>{featuredTool.rating} rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Updated {featuredTool.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Video size={16} className="mr-2" />
                Watch Demo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bookmark size={16} className="mr-2" />
                Save for Later
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share size={16} className="mr-2" />
                Share Tool
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-1">
                {featuredTool.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search research tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            {/* Tool Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(tool.type)}
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {tool.name}
                  </h3>
                </div>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(tool.difficulty)} mb-2`}
                >
                  {tool.difficulty}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.features.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {tool.features.length > 2 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    +{tool.features.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{tool.users.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                <span>{tool.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{tool.lastUpdated}</span>
              </div>
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {tool.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1 group-hover:shadow-md transition-all">
                <Lightbulb size={16} className="mr-2" />
                Explore
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-lg text-center">
          <Microscope className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tools found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-yellow-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              💡 Research Tips
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Start with beginner-friendly tools to build confidence</li>
              <li>• Bookmark useful tools for quick access later</li>
              <li>
                • Watch demo videos before diving into complex simulations
              </li>
              <li>• Ask your teacher for guidance on advanced tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResearch;
