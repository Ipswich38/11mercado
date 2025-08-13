import React, { useState } from 'react';
import { 
  FolderPlus, 
  Clock, 
  Play, 
  Zap, 
  CheckCircle, 
  Plus, 
  ArrowLeft,
  Calendar,
  User,
  Target,
  FileText
} from 'lucide-react';
import { sendEmailToPTA, formatProjectProposalEmail } from '../utils/emailService';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'started' | 'ongoing' | 'accomplished';
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  progress?: number;
  category: string;
}

export default function Projects({ getContrastClass, onClose }) {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Projects data - empty initially
  const [projects] = useState<Project[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock size={20} className="text-blue-500" />;
      case 'started':
        return <Play size={20} className="text-yellow-500" />;
      case 'ongoing':
        return <Zap size={20} className="text-orange-500" />;
      case 'accomplished':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <FolderPlus size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'from-blue-500 to-blue-600';
      case 'started':
        return 'from-yellow-500 to-yellow-600';
      case 'ongoing':
        return 'from-orange-500 to-orange-600';
      case 'accomplished':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'started':
        return 'Started';
      case 'ongoing':
        return 'Ongoing';
      case 'accomplished':
        return 'Accomplished';
      default:
        return 'Unknown';
    }
  };

  const filteredProjects = selectedStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status === selectedStatus);

  const projectCounts = {
    planned: projects.filter(p => p.status === 'planned').length,
    started: projects.filter(p => p.status === 'started').length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    accomplished: projects.filter(p => p.status === 'accomplished').length,
  };

  if (showProposalForm) {
    return (
      <ProjectProposalForm 
        getContrastClass={getContrastClass}
        onClose={() => setShowProposalForm(false)}
        onBack={() => setShowProposalForm(false)}
      />
    );
  }

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      <div className={getContrastClass(
        "bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between mb-4">
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
            <FolderPlus size={24} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-xl font-bold text-white",
                "text-xl font-bold text-yellow-400"
              )}>
                PTA Projects
              </h1>
              <p className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                Track and manage community projects
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProposalForm(true)}
            className={getContrastClass(
              "bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              "bg-gray-800 border border-yellow-400 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-yellow-400"
            )}
          >
            <Plus size={16} />
            Propose
          </button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { status: 'planned', label: 'Planned', count: projectCounts.planned },
            { status: 'started', label: 'Started', count: projectCounts.started },
            { status: 'ongoing', label: 'Ongoing', count: projectCounts.ongoing },
            { status: 'accomplished', label: 'Done', count: projectCounts.accomplished },
          ].map((item) => (
            <button
              key={item.status}
              onClick={() => setSelectedStatus(selectedStatus === item.status ? 'all' : item.status)}
              className={`p-3 rounded-lg transition-all ${
                selectedStatus === item.status
                  ? getContrastClass('bg-white/30', 'bg-gray-700 border border-yellow-400')
                  : getContrastClass('bg-white/10 hover:bg-white/20', 'bg-gray-800 border border-gray-600 hover:bg-gray-700')
              }`}
            >
              <div className={getContrastClass(
                "text-white font-bold text-lg",
                selectedStatus === item.status ? "text-yellow-400 font-bold text-lg" : "text-yellow-200 font-bold text-lg"
              )}>
                {item.count}
              </div>
              <div className={getContrastClass(
                "text-white/80 text-xs",
                selectedStatus === item.status ? "text-yellow-300 text-xs" : "text-yellow-200 text-xs"
              )}>
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderPlus size={48} className={getContrastClass("mx-auto mb-4 text-gray-400", "mx-auto mb-4 text-yellow-400")} />
            <h3 className={getContrastClass("text-lg font-medium text-gray-600", "text-lg font-medium text-yellow-400")}>
              No projects found
            </h3>
            <p className={getContrastClass("text-gray-500", "text-yellow-200")}>
              {selectedStatus === 'all' ? 'No projects available' : `No ${selectedStatus} projects`}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className={getContrastClass(
                "bg-white rounded-3xl p-6 shadow-lg border border-gray-200",
                "bg-gray-900 rounded-3xl p-6 shadow-lg border-2 border-yellow-400"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(project.status)}
                  <div>
                    <h3 className={getContrastClass(
                      "text-lg font-semibold text-gray-900",
                      "text-lg font-semibold text-yellow-400"
                    )}>
                      {project.title}
                    </h3>
                    <span className={getContrastClass(
                      "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700",
                      "text-xs px-2 py-1 rounded-full bg-gray-800 border border-yellow-400 text-yellow-300"
                    )}>
                      {project.category}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(project.status)} text-white font-medium`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              <p className={getContrastClass(
                "text-gray-600 text-sm mb-4 leading-relaxed",
                "text-yellow-200 text-sm mb-4 leading-relaxed"
              )}>
                {project.description}
              </p>

              {/* Progress Bar (for started/ongoing projects) */}
              {(project.status === 'started' || project.status === 'ongoing' || project.status === 'accomplished') && project.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={getContrastClass("text-gray-600", "text-yellow-300")}>Progress</span>
                    <span className={getContrastClass("text-gray-900 font-medium", "text-yellow-400 font-medium")}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className={getContrastClass("bg-gray-200 rounded-full h-2", "bg-gray-700 rounded-full h-2")}>
                    <div
                      className={`bg-gradient-to-r ${getStatusColor(project.status)} h-2 rounded-full transition-all`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className={getContrastClass("text-gray-400", "text-yellow-400")} />
                  <div>
                    <div className={getContrastClass("text-gray-500", "text-yellow-300")}>Start Date</div>
                    <div className={getContrastClass("text-gray-900 font-medium", "text-yellow-200 font-medium")}>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className={getContrastClass("text-gray-400", "text-yellow-400")} />
                  <div>
                    <div className={getContrastClass("text-gray-500", "text-yellow-300")}>Assigned To</div>
                    <div className={getContrastClass("text-gray-900 font-medium", "text-yellow-200 font-medium")}>
                      {project.assignedTo || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              {project.endDate && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <div>
                    <span className={getContrastClass("text-gray-500", "text-yellow-300")}>Completed: </span>
                    <span className={getContrastClass("text-gray-900 font-medium", "text-yellow-200 font-medium")}>
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <button
          onClick={() => setShowProposalForm(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Submit New Project Proposal
        </button>
      </div>
    </div>
  );
}

// Project Proposal Form Component
function ProjectProposalForm({ getContrastClass, onClose, onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    proposedBy: '',
    email: '',
    timeline: '',
    budget: '',
    justification: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    'Infrastructure',
    'Education',
    'Technology',
    'Environment',
    'Community',
    'Health & Safety',
    'Sports & Recreation',
    'Arts & Culture'
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.proposedBy.trim()) newErrors.proposedBy = 'Your name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.justification.trim()) newErrors.justification = 'Justification is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const proposalData = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: `PROP-${Date.now()}`
      };

      const emailData = formatProjectProposalEmail(proposalData);
      const success = await sendEmailToPTA(emailData);
      
      if (success) {
        // Store locally for demo purposes
        const existingProposals = JSON.parse(localStorage.getItem('projectProposals') || '[]');
        existingProposals.push(proposalData);
        localStorage.setItem('projectProposals', JSON.stringify(existingProposals));
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      } else {
        alert('There was an error submitting your proposal. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center",
        "fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
      )}>
        <div className="text-center p-8">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h2 className={getContrastClass(
            "text-2xl font-bold text-gray-900 mb-2",
            "text-2xl font-bold text-yellow-400 mb-2"
          )}>
            Proposal Submitted Successfully!
          </h2>
          <p className={getContrastClass(
            "text-gray-600 mb-4",
            "text-yellow-200 mb-4"
          )}>
            Thank you for your project proposal. We'll review it and get back to you.
          </p>
          <p className={getContrastClass(
            "text-sm text-gray-500",
            "text-sm text-yellow-300"
          )}>
            Sent to: 11mercado.pta@gmail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      <div className={getContrastClass(
        "bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={getContrastClass(
              "p-2 rounded-lg hover:bg-white/20 transition-colors",
              "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <FileText size={24} className={getContrastClass("text-white", "text-yellow-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-xl font-bold text-white",
              "text-xl font-bold text-yellow-400"
            )}>
              Project Proposal
            </h1>
            <p className={getContrastClass(
              "text-sm text-white/80",
              "text-sm text-yellow-200"
            )}>
              Submit your project idea or proposal
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Project Title */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Project Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.title ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Enter a clear, descriptive title for your project"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Project Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.category ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Project Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.description ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500 resize-none`}
            rows={4}
            placeholder="Describe your project in detail. What will it accomplish and how will it benefit the school community?"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Proposer Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Your Name *
            </label>
            <input
              type="text"
              value={formData.proposedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, proposedBy: e.target.value }))}
              className={`w-full p-3 rounded-xl border ${
                errors.proposedBy ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Your full name"
            />
            {errors.proposedBy && <p className="text-red-500 text-xs mt-1">{errors.proposedBy}</p>}
          </div>

          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full p-3 rounded-xl border ${
                errors.email ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Timeline and Budget */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Proposed Timeline (Optional)
            </label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
              className={`w-full p-3 rounded-xl border ${getContrastClass('border-gray-300', 'border-gray-600')} ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="e.g., 3 months, 1 semester, ongoing"
            />
          </div>

          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Estimated Budget (Optional)
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              className={`w-full p-3 rounded-xl border ${getContrastClass('border-gray-300', 'border-gray-600')} ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="e.g., ₱50,000 - ₱100,000"
            />
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Project Justification *
          </label>
          <textarea
            value={formData.justification}
            onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.justification ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500 resize-none`}
            rows={4}
            placeholder="Why is this project important? What problems will it solve? How will it benefit students, parents, and the school community?"
          />
          {errors.justification && <p className="text-red-500 text-xs mt-1">{errors.justification}</p>}
        </div>

        {/* Email Info */}
        <div className={getContrastClass(
          "bg-green-50 border border-green-200 rounded-xl p-4",
          "bg-gray-900 border border-yellow-400 rounded-xl p-4"
        )}>
          <h3 className={getContrastClass(
            "font-semibold text-green-800 mb-2",
            "font-semibold text-yellow-400 mb-2"
          )}>
            📧 Your proposal will be sent to:
          </h3>
          <p className={getContrastClass(
            "text-green-700 font-medium",
            "text-yellow-200 font-medium"
          )}>
            11mercado.pta@gmail.com
          </p>
          <p className={getContrastClass(
            "text-green-600 text-sm mt-1",
            "text-yellow-300 text-sm mt-1"
          )}>
            The PTA committee will review your proposal and contact you with feedback.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Proposal...
              </>
            ) : (
              <>
                <Target size={20} />
                Submit Proposal
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className={getContrastClass(
              "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors",
              "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            )}
          >
            Back to Projects
          </button>
        </div>
      </form>
    </div>
  );
}