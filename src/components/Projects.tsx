import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  ArrowLeft,
  Plus,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { submitProjectProposal, getAllProjectProposals, submitProjectVote, getProjectVotes } from '../utils/centralizedProjectsDB';

interface ProjectProposal {
  id: string;
  title: string;
  description: string;
  proposed_by: string;
  submission_timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  yes_votes: number;
  no_votes: number;
  total_votes: number;
  is_approved: boolean;
  created_at: string;
}

interface ProjectVote {
  id: string;
  proposal_id: string;
  parent_name: string;
  student_name: string;
  vote_type: 'yes' | 'no';
  submission_timestamp: string;
  created_at: string;
}

export default function Projects({ getContrastClass, onClose }) {
  const [view, setView] = useState<'main' | 'propose' | 'list'>('main');
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);
  const [showVotersList, setShowVotersList] = useState(false);
  const [votersList, setVotersList] = useState<ProjectVote[]>([]);

  // Load proposals on component mount
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getAllProjectProposals();
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowVoters = async (proposal: ProjectProposal) => {
    setLoading(true);
    try {
      const votes = await getProjectVotes(proposal.id);
      setVotersList(votes);
      setSelectedProposal(proposal);
      setShowVotersList(true);
    } catch (error) {
      console.error('Error loading voters:', error);
      alert('Error loading voters list');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'propose') {
    return (
      <ProposeProjectForm 
        getContrastClass={getContrastClass}
        onBack={() => setView('main')}
        onSuccess={() => {
          setView('main');
          loadProposals();
        }}
      />
    );
  }

  if (view === 'list') {
    return (
      <ProposalsList 
        getContrastClass={getContrastClass}
        onBack={() => setView('main')}
        proposals={proposals}
        loading={loading}
        onVote={(proposal) => {
          setSelectedProposal(proposal);
          setShowVoteModal(true);
        }}
        onShowVoters={handleShowVoters}
        onRefresh={loadProposals}
      />
    );
  }

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
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
                Democratic project proposal and voting system
              </p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass(
              "text-white font-bold text-lg",
              "text-yellow-400 font-bold text-lg"
            )}>
              {proposals.length}
            </div>
            <div className={getContrastClass(
              "text-white/80 text-xs",
              "text-yellow-200 text-xs"
            )}>
              Total Proposals
            </div>
          </div>
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass(
              "text-white font-bold text-lg",
              "text-yellow-400 font-bold text-lg"
            )}>
              {proposals.filter(p => p.is_approved).length}
            </div>
            <div className={getContrastClass(
              "text-white/80 text-xs",
              "text-yellow-200 text-xs"
            )}>
              Approved
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Welcome Message */}
        <div className={getContrastClass(
          "bg-blue-50 border border-blue-200 rounded-xl p-4",
          "bg-gray-900 border border-yellow-400 rounded-xl p-4"
        )}>
          <h3 className={getContrastClass(
            "font-semibold text-blue-800 mb-2",
            "font-semibold text-yellow-400 mb-2"
          )}>
            🗳️ Democratic Project Voting
          </h3>
          <p className={getContrastClass(
            "text-blue-700 text-sm",
            "text-yellow-200 text-sm"
          )}>
            Anyone can propose a project. All 43 parents can vote. Projects need at least 22 "Yes" votes to be approved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setView('propose')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Propose Project
          </button>

          <button
            onClick={() => setView('list')}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            View & Vote on Proposals
          </button>
        </div>

        {/* Recent Proposals Preview */}
        {proposals.length > 0 && (
          <div>
            <h3 className={getContrastClass(
              "text-lg font-semibold text-gray-900 mb-3",
              "text-lg font-semibold text-yellow-400 mb-3"
            )}>
              Recent Proposals
            </h3>
            <div className="space-y-2">
              {proposals.slice(0, 3).map((proposal) => (
                <div
                  key={proposal.id}
                  className={getContrastClass(
                    "bg-white border border-gray-200 rounded-lg p-3",
                    "bg-gray-900 border-2 border-yellow-400 rounded-lg p-3"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={getContrastClass(
                        "font-medium text-gray-900 text-sm",
                        "font-medium text-yellow-400 text-sm"
                      )}>
                        {proposal.title}
                      </h4>
                      <p className={getContrastClass(
                        "text-gray-600 text-xs",
                        "text-yellow-200 text-xs"
                      )}>
                        by {proposal.proposed_by}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <ThumbsUp size={12} />
                          {proposal.yes_votes}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <ThumbsDown size={12} />
                          {proposal.no_votes}
                        </span>
                      </div>
                      {proposal.is_approved && (
                        <span className="text-green-600 text-xs font-medium">
                          ✅ Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedProposal && (
        <VoteModal
          getContrastClass={getContrastClass}
          proposal={selectedProposal}
          onClose={() => {
            setShowVoteModal(false);
            setSelectedProposal(null);
          }}
          onSuccess={() => {
            setShowVoteModal(false);
            setSelectedProposal(null);
            loadProposals();
          }}
        />
      )}

      {/* Voters List Modal */}
      {showVotersList && selectedProposal && (
        <VotersListModal
          getContrastClass={getContrastClass}
          proposal={selectedProposal}
          voters={votersList}
          onClose={() => {
            setShowVotersList(false);
            setSelectedProposal(null);
            setVotersList([]);
          }}
        />
      )}
    </div>
  );
}

// Propose Project Form Component
function ProposeProjectForm({ getContrastClass, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedBy: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 500) newErrors.description = 'Description must be 500 characters or less';
    if (!formData.proposedBy.trim()) newErrors.proposedBy = 'Your name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await submitProjectProposal(formData);
      
      if (result.success) {
        alert('✅ Project proposal submitted successfully!\n\nYour proposal is now available for voting by all parents.');
        onSuccess();
      } else {
        alert(`❌ Error submitting proposal: ${result.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('❌ There was an error submitting your proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Plus size={24} className={getContrastClass("text-white", "text-yellow-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-xl font-bold text-white",
              "text-xl font-bold text-yellow-400"
            )}>
              Propose Project
            </h1>
            <p className={getContrastClass(
              "text-sm text-white/80",
              "text-sm text-yellow-200"
            )}>
              Submit your project idea for community voting
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
            placeholder="e.g., Buy printer for the class"
            maxLength={100}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          <p className={getContrastClass("text-gray-500 text-xs mt-1", "text-yellow-300 text-xs mt-1")}>
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Short Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.description ? 'border-red-500' : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-green-500 resize-none`}
            rows={3}
            placeholder="Brief description of the project and its benefits"
            maxLength={500}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          <p className={getContrastClass("text-gray-500 text-xs mt-1", "text-yellow-300 text-xs mt-1")}>
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Proposer Name */}
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
                <Plus size={20} />
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
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

// Proposals List Component
function ProposalsList({ getContrastClass, onBack, proposals, loading, onVote, onShowVoters, onRefresh }) {
  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      <div className={getContrastClass(
        "bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between">
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
                Project Proposals
              </h1>
              <p className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                Vote on community project proposals
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={getContrastClass(
              "bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-gray-800 border border-yellow-400 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-yellow-400"
            )}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className={getContrastClass("mx-auto mb-4 text-gray-400", "mx-auto mb-4 text-yellow-400")} />
            <h3 className={getContrastClass("text-lg font-medium text-gray-600", "text-lg font-medium text-yellow-400")}>
              No proposals yet
            </h3>
            <p className={getContrastClass("text-gray-500", "text-yellow-200")}>
              Be the first to propose a project!
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <ProjectCard
              key={proposal.id}
              proposal={proposal}
              getContrastClass={getContrastClass}
              onVote={() => onVote(proposal)}
              onShowVoters={() => onShowVoters(proposal)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ proposal, getContrastClass, onVote, onShowVoters }) {
  const progressPercentage = Math.round((proposal.yes_votes / 22) * 100);
  
  return (
    <div className={getContrastClass(
      "bg-white rounded-3xl p-6 shadow-lg border border-gray-200",
      "bg-gray-900 rounded-3xl p-6 shadow-lg border-2 border-yellow-400"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={getContrastClass(
            "text-lg font-semibold text-gray-900 mb-2",
            "text-lg font-semibold text-yellow-400 mb-2"
          )}>
            {proposal.title}
          </h3>
          <p className={getContrastClass(
            "text-gray-600 text-sm mb-2",
            "text-yellow-200 text-sm mb-2"
          )}>
            {proposal.description}
          </p>
          <p className={getContrastClass(
            "text-gray-500 text-xs",
            "text-yellow-300 text-xs"
          )}>
            Proposed by {proposal.proposed_by} • {new Date(proposal.created_at).toLocaleDateString()}
          </p>
        </div>
        {proposal.is_approved && (
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Approved
          </div>
        )}
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-lg">
            <ThumbsUp size={16} />
            {proposal.yes_votes}
          </div>
          <div className="text-xs text-gray-500">Yes</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-600 font-bold text-lg">
            <ThumbsDown size={16} />
            {proposal.no_votes}
          </div>
          <div className="text-xs text-gray-500">No</div>
        </div>
        <div className="text-center">
          <div className={getContrastClass(
            "font-bold text-lg text-gray-900",
            "font-bold text-lg text-yellow-400"
          )}>
            {proposal.total_votes}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <button
            onClick={onShowVoters}
            className={getContrastClass(
              "flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm",
              "flex items-center justify-center gap-1 text-yellow-400 hover:text-yellow-200 font-medium text-sm"
            )}
          >
            <Eye size={14} />
            Who Voted
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className={getContrastClass("text-gray-600", "text-yellow-300")}>
            Progress to Approval (22 votes needed)
          </span>
          <span className={getContrastClass("text-gray-900 font-medium", "text-yellow-400 font-medium")}>
            {progressPercentage}%
          </span>
        </div>
        <div className={getContrastClass("bg-gray-200 rounded-full h-2", "bg-gray-700 rounded-full h-2")}>
          <div
            className={`h-2 rounded-full transition-all ${
              proposal.is_approved ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onVote}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ThumbsUp size={16} />
          Vote Yes
        </button>
        <button
          onClick={onVote}
          className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ThumbsDown size={16} />
          Vote No
        </button>
      </div>

      {/* Status Messages */}
      {proposal.total_votes >= 43 && !proposal.is_approved && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <XCircle size={16} />
          <span>All parents have voted. Project not approved.</span>
        </div>
      )}
      {proposal.is_approved && (
        <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Project approved with {proposal.yes_votes} Yes votes!</span>
        </div>
      )}
    </div>
  );
}

// Vote Modal Component
function VoteModal({ getContrastClass, proposal, onClose, onSuccess }) {
  const [voteType, setVoteType] = useState<'yes' | 'no'>('yes');
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentName.trim() || !studentName.trim()) {
      alert('Please enter both parent name and student name');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitProjectVote({
        proposalId: proposal.id,
        parentName: parentName.trim(),
        studentName: studentName.trim(),
        voteType
      });

      if (result.success) {
        alert('✅ Vote submitted successfully!');
        onSuccess();
      } else {
        alert(result.message || `❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      alert('❌ There was an error submitting your vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={getContrastClass(
        "bg-white rounded-2xl p-6 max-w-md w-full",
        "bg-gray-900 border-2 border-yellow-400 rounded-2xl p-6 max-w-md w-full"
      )}>
        <h3 className={getContrastClass(
          "text-lg font-semibold text-gray-900 mb-4",
          "text-lg font-semibold text-yellow-400 mb-4"
        )}>
          Vote on: {proposal.title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vote Type Selection */}
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Your Vote
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVoteType('yes')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  voteType === 'yes'
                    ? 'bg-green-500 text-white'
                    : getContrastClass('bg-gray-200 text-gray-700 hover:bg-gray-300', 'bg-gray-800 text-yellow-200 hover:bg-gray-700 border border-yellow-400')
                }`}
              >
                <ThumbsUp size={16} className="inline mr-2" />
                Yes
              </button>
              <button
                type="button"
                onClick={() => setVoteType('no')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  voteType === 'no'
                    ? 'bg-red-500 text-white'
                    : getContrastClass('bg-gray-200 text-gray-700 hover:bg-gray-300', 'bg-gray-800 text-yellow-200 hover:bg-gray-700 border border-yellow-400')
                }`}
              >
                <ThumbsDown size={16} className="inline mr-2" />
                No
              </button>
            </div>
          </div>

          {/* Parent Name */}
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Parent/Guardian Name (E-signature)
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Student Name */}
          <div>
            <label className={getContrastClass(
              "block text-sm font-medium text-gray-700 mb-2",
              "block text-sm font-medium text-yellow-400 mb-2"
            )}>
              Student/Learner First Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Student's first name"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={getContrastClass(
                "flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors",
                "flex-1 bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 py-2 px-4 rounded-lg transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white ${
                voteType === 'yes' 
                  ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400'
                  : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-400'
              }`}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${voteType.toUpperCase()} Vote`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Voters List Modal Component
function VotersListModal({ getContrastClass, proposal, voters, onClose }) {
  const yesVoters = voters.filter(v => v.vote_type === 'yes');
  const noVoters = voters.filter(v => v.vote_type === 'no');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={getContrastClass(
        "bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden",
        "bg-gray-900 border-2 border-yellow-400 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={getContrastClass(
            "text-lg font-semibold text-gray-900",
            "text-lg font-semibold text-yellow-400"
          )}>
            Who Voted: {proposal.title}
          </h3>
          <button
            onClick={onClose}
            className={getContrastClass(
              "text-gray-500 hover:text-gray-700",
              "text-yellow-400 hover:text-yellow-200"
            )}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {/* Yes Voters */}
          <div>
            <h4 className="flex items-center gap-2 text-green-600 font-medium mb-2">
              <ThumbsUp size={16} />
              Yes Votes ({yesVoters.length})
            </h4>
            <div className="space-y-2">
              {yesVoters.map((voter, index) => (
                <div
                  key={voter.id}
                  className={getContrastClass(
                    "bg-green-50 border border-green-200 rounded-lg p-3",
                    "bg-gray-800 border border-green-400 rounded-lg p-3"
                  )}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>
                        {voter.parent_name}
                      </p>
                      <p className={getContrastClass("text-green-600 text-sm", "text-green-400 text-sm")}>
                        Student: {voter.student_name}
                      </p>
                    </div>
                    <div className={getContrastClass("text-green-600 text-xs", "text-green-400 text-xs")}>
                      {new Date(voter.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {yesVoters.length === 0 && (
                <p className={getContrastClass("text-gray-500 text-sm italic", "text-yellow-300 text-sm italic")}>
                  No yes votes yet
                </p>
              )}
            </div>
          </div>

          {/* No Voters */}
          <div>
            <h4 className="flex items-center gap-2 text-red-600 font-medium mb-2">
              <ThumbsDown size={16} />
              No Votes ({noVoters.length})
            </h4>
            <div className="space-y-2">
              {noVoters.map((voter, index) => (
                <div
                  key={voter.id}
                  className={getContrastClass(
                    "bg-red-50 border border-red-200 rounded-lg p-3",
                    "bg-gray-800 border border-red-400 rounded-lg p-3"
                  )}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className={getContrastClass("font-medium text-red-800", "font-medium text-red-300")}>
                        {voter.parent_name}
                      </p>
                      <p className={getContrastClass("text-red-600 text-sm", "text-red-400 text-sm")}>
                        Student: {voter.student_name}
                      </p>
                    </div>
                    <div className={getContrastClass("text-red-600 text-xs", "text-red-400 text-xs")}>
                      {new Date(voter.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {noVoters.length === 0 && (
                <p className={getContrastClass("text-gray-500 text-sm italic", "text-yellow-300 text-sm italic")}>
                  No no votes yet
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className={getContrastClass(
            "bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3 mt-4"
          )}>
            <p className={getContrastClass("text-blue-800 font-medium", "text-yellow-400 font-medium")}>
              Total Votes: {voters.length} / 43 parents
            </p>
            <p className={getContrastClass("text-blue-600 text-sm", "text-yellow-200 text-sm")}>
              {proposal.is_approved 
                ? `✅ Project approved with ${yesVoters.length} yes votes!`
                : `${22 - yesVoters.length} more yes votes needed for approval`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}