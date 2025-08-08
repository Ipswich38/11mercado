import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Star,
  BookOpen,
  Target,
  Award,
  Play,
  Pause,
  CheckCircle,
  Plus,
  Lightbulb,
} from 'lucide-react';

const StudentProjects = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showProposalForm, setShowProposalForm] = useState(false);

  // Enhanced project data for demo
  const enhancedProjects = projects.map((project, index) => ({
    ...project,
    description: [
      'Build a sustainable garden ecosystem with smart monitoring',
      'Develop a mobile app for community environmental tracking',
      'Research renewable energy solutions for local businesses',
      'Create an interactive science museum exhibit',
    ][index % 4],
    difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][index % 4],
    duration: ['2 weeks', '1 month', '6 weeks', '3 months'][index % 4],
    points: [100, 250, 400, 600][index % 4],
    participants: Math.floor(Math.random() * 15) + 3,
    progress:
      project.status === 'completed'
        ? 100
        : project.status === 'active'
          ? Math.floor(Math.random() * 80) + 10
          : 0,
    category: ['Science', 'Technology', 'Engineering', 'Math'][index % 4],
    mentor: ['Dr. Smith', 'Prof. Johnson', 'Ms. Davis', 'Mr. Wilson'][
      index % 4
    ],
    nextDeadline: ['Feb 15', 'Feb 22', 'Mar 01', 'Mar 08'][index % 4],
  }));

  const filteredProjects = enhancedProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-orange-100 text-orange-800';
      case 'Expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'active':
        return <Play className="text-blue-500" size={20} />;
      case 'planning':
        return <Pause className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📚 My Projects</h1>
        <p className="text-white/90">
          Explore, learn, and grow through hands-on projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {enhancedProjects.filter((p) => p.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <Play className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {
                  enhancedProjects.filter((p) => p.status === 'completed')
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {enhancedProjects.filter((p) => p.status === 'planning').length}
              </p>
              <p className="text-sm text-gray-600">Planning</p>
            </div>
            <Target className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {enhancedProjects.reduce((sum, p) => sum + p.points, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            <Star className="text-purple-500" size={24} />
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
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'ghost'}
              onClick={() => setSelectedFilter('active')}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'ghost'}
              onClick={() => setSelectedFilter('completed')}
              size="sm"
            >
              Completed
            </Button>
            <Button
              variant={selectedFilter === 'planning' ? 'default' : 'ghost'}
              onClick={() => setSelectedFilter('planning')}
              size="sm"
            >
              Planning
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Proposal Card */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="text-yellow-300" size={28} />
              <h3 className="text-xl font-bold">Have a Project Idea?</h3>
            </div>
            <p className="text-white/90 mb-4">
              Share your innovative project proposal with the school community and get support to bring your ideas to life!
            </p>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>Collaborate with peers</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>Get mentorship</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={16} />
                <span>Earn recognition</span>
              </div>
            </div>
          </div>
          <div className="ml-6">
            <Button
              onClick={() => setShowProposalForm(true)}
              className="bg-white text-green-600 hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus size={20} className="mr-2" />
              Submit Your Proposal
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(project.status)}
                  <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}
              >
                {project.difficulty}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-purple-600">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar size={14} />
                  <span>Due: {project.nextDeadline}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={14} />
                  <span>{project.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users size={14} />
                  <span>{project.participants} participants</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star size={14} />
                  <span>{project.points} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mentor: {project.mentor}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-${project.category.toLowerCase()}-100 text-${project.category.toLowerCase()}-800`}
                >
                  {project.category}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button className="w-full group-hover:shadow-md transition-all">
              {project.status === 'completed'
                ? 'View Results'
                : project.status === 'active'
                  ? 'Continue Project'
                  : 'Start Project'}
              <ChevronRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-lg text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Project Proposal Form Modal */}
      <ProjectProposalForm 
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
      />
    </div>
  );
};

// Project Proposal Form Component
const ProjectProposalForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    grade: '',
    section: '',
    email: '',
    projectTitle: '',
    category: 'Science',
    description: '',
    objectives: '',
    methodology: '',
    expectedOutcome: '',
    resourcesNeeded: '',
    timeline: '',
    teamMembers: '',
    mentorPreference: '',
    budget: '',
    sustainabilityPlan: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [proposalId, setProposalId] = useState('');

  const categories = [
    'Science', 'Technology', 'Engineering', 'Mathematics',
    'Arts & Design', 'Social Innovation', 'Environmental',
    'Health & Wellness', 'Community Service', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateProposalId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    return `PROP-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const proposalData = {
        ...formData,
        proposalId: generateProposalId(),
        timestamp: new Date().toISOString(),
        status: 'Under Review'
      };

      // Store locally (in real implementation, send to backend)
      const proposals = JSON.parse(localStorage.getItem('11m_proposals') || '[]');
      proposals.push(proposalData);
      localStorage.setItem('11m_proposals', JSON.stringify(proposals));

      setProposalId(proposalData.proposalId);
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      grade: '',
      section: '',
      email: '',
      projectTitle: '',
      category: 'Science',
      description: '',
      objectives: '',
      methodology: '',
      expectedOutcome: '',
      resourcesNeeded: '',
      timeline: '',
      teamMembers: '',
      mentorPreference: '',
      budget: '',
      sustainabilityPlan: ''
    });
    setSubmissionStatus(null);
    setProposalId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Lightbulb size={24} />
            <h2 className="text-2xl font-bold">Submit Project Proposal</h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Success State */}
        {submissionStatus === 'success' && (
          <div className="p-6 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Proposal Submitted Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your project proposal has been submitted for review.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Proposal ID:</div>
              <div className="text-lg font-mono font-bold text-green-700">
                {proposalId}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Save this ID to track your proposal status
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-full"
              >
                Submit Another Proposal
              </Button>
              
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {submissionStatus === 'error' && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Submission Failed
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error submitting your proposal. Please try again.
            </p>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form State */}
        {!submissionStatus && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level *
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Section name (if applicable)"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Give your project a compelling title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe your project idea in detail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Objectives *
                    </label>
                    <textarea
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="What do you hope to achieve?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Outcome *
                    </label>
                    <textarea
                      name="expectedOutcome"
                      value={formData.expectedOutcome}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="What will be the result?"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Details */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Methodology/Approach *
                  </label>
                  <textarea
                    name="methodology"
                    value={formData.methodology}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="How will you execute this project?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeline *
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 3 months, 1 semester"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Budget
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₱0 - ₱10,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resources Needed
                  </label>
                  <textarea
                    name="resourcesNeeded"
                    value={formData.resourcesNeeded}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Materials, equipment, software, etc."
                  />
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaboration & Support</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Members (Optional)
                  </label>
                  <textarea
                    name="teamMembers"
                    value={formData.teamMembers}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Names of classmates or friends who will help"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor Preference (Optional)
                  </label>
                  <input
                    type="text"
                    name="mentorPreference"
                    value={formData.mentorPreference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Preferred teacher or subject area for mentorship"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sustainability Plan
                  </label>
                  <textarea
                    name="sustainabilityPlan"
                    value={formData.sustainabilityPlan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="How will this project continue or impact others?"
                  />
                </div>
              </div>
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
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentProjects;
