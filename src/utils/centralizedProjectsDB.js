import { supabase } from './supabaseClient';

// Centralized Projects Management System
class CentralizedProjectsDB {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.MAX_PARENTS = 43;
    this.MIN_VOTES_FOR_APPROVAL = 22;
    
    // Listen for online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('🌐 Projects DB: Online');
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('🌐 Projects DB: Offline');
      });
    }
  }

  // Submit a new project proposal
  async submitProposal(proposalData) {
    try {
      const proposal = {
        title: proposalData.title.trim(),
        description: proposalData.description.trim(),
        proposed_by: proposalData.proposedBy.trim(),
        submission_timestamp: new Date().toISOString(),
        status: 'pending',
        yes_votes: 0,
        no_votes: 0,
        total_votes: 0,
        is_approved: false,
        created_at: new Date().toISOString()
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('project_proposals')
          .insert([proposal])
          .select();

        if (error) {
          console.error('Error submitting proposal to Supabase:', error);
          // Store locally for later sync
          this.storeProposalLocally(proposal);
          return { success: false, error: error.message };
        }

        console.log('✅ Proposal submitted to database:', data[0]);
        this.updateLocalCache('proposals', data[0]);
        return { success: true, data: data[0] };
      } else {
        // Store locally when offline
        this.storeProposalLocally(proposal);
        return { success: true, data: proposal, offline: true };
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all project proposals
  async getAllProposals() {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('project_proposals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching proposals:', error);
          return this.getLocalProposals();
        }

        // Update local cache
        this.updateLocalProposalsCache(data || []);
        return data || [];
      } else {
        return this.getLocalProposals();
      }
    } catch (error) {
      console.error('Error getting proposals:', error);
      return this.getLocalProposals();
    }
  }

  // Submit a vote for a project
  async submitVote(voteData) {
    try {
      const { proposalId, parentName, studentName, voteType } = voteData;

      // First check for duplicate vote
      const duplicateCheck = await this.checkForDuplicateVote(proposalId, parentName);
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          error: 'duplicate_vote',
          message: `⚠️ DUPLICATE VOTE DETECTED!\n\nParent "${parentName}" has already voted on this project.\n\nPrevious vote: ${duplicateCheck.existingVote.vote_type.toUpperCase()}\nSubmitted: ${new Date(duplicateCheck.existingVote.created_at).toLocaleString()}\n\nEach parent can only vote once per project.`
        };
      }

      // Check if we've reached the maximum number of parents
      const totalVotesForProposal = await this.getTotalVotesForProposal(proposalId);
      if (totalVotesForProposal >= this.MAX_PARENTS) {
        return {
          success: false,
          error: 'max_votes_reached',
          message: `⚠️ MAXIMUM VOTES REACHED!\n\nThis project has already received votes from all ${this.MAX_PARENTS} eligible parents.\n\nNo more votes can be accepted for this proposal.`
        };
      }

      const vote = {
        proposal_id: proposalId,
        parent_name: parentName.trim(),
        student_name: studentName.trim(),
        vote_type: voteType,
        submission_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      if (this.isOnline) {
        // Submit the vote
        const { data, error } = await supabase
          .from('project_votes')
          .insert([vote])
          .select();

        if (error) {
          console.error('Error submitting vote to Supabase:', error);
          return { success: false, error: error.message };
        }

        // Update proposal vote counts
        const updateResult = await this.updateProposalVoteCounts(proposalId);
        if (!updateResult.success) {
          console.error('Error updating vote counts:', updateResult.error);
        }

        console.log('✅ Vote submitted to database:', data[0]);
        return { success: true, data: data[0] };
      } else {
        // Store locally when offline
        this.storeVoteLocally(vote);
        return { success: true, data: vote, offline: true };
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for duplicate vote by the same parent
  async checkForDuplicateVote(proposalId, parentName) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('project_votes')
          .select('*')
          .eq('proposal_id', proposalId)
          .eq('parent_name', parentName.trim());

        if (error) {
          console.warn('Error checking for duplicate vote:', error);
          return { isDuplicate: false };
        }

        if (data && data.length > 0) {
          return {
            isDuplicate: true,
            existingVote: data[0]
          };
        }
      } else {
        // Check local storage when offline
        const localVotes = this.getLocalVotes();
        const existingVote = localVotes.find(v => 
          v.proposal_id === proposalId && 
          v.parent_name.trim().toLowerCase() === parentName.trim().toLowerCase()
        );
        
        if (existingVote) {
          return {
            isDuplicate: true,
            existingVote
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicate vote:', error);
      return { isDuplicate: false };
    }
  }

  // Get total votes for a specific proposal
  async getTotalVotesForProposal(proposalId) {
    try {
      if (this.isOnline) {
        const { count, error } = await supabase
          .from('project_votes')
          .select('*', { count: 'exact', head: true })
          .eq('proposal_id', proposalId);

        if (error) {
          console.error('Error getting vote count:', error);
          return 0;
        }

        return count || 0;
      } else {
        const localVotes = this.getLocalVotes();
        return localVotes.filter(v => v.proposal_id === proposalId).length;
      }
    } catch (error) {
      console.error('Error getting total votes:', error);
      return 0;
    }
  }

  // Get all votes for a specific proposal
  async getVotesForProposal(proposalId) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('project_votes')
          .select('*')
          .eq('proposal_id', proposalId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching votes for proposal:', error);
          return [];
        }

        return data || [];
      } else {
        const localVotes = this.getLocalVotes();
        return localVotes.filter(v => v.proposal_id === proposalId);
      }
    } catch (error) {
      console.error('Error getting votes for proposal:', error);
      return [];
    }
  }

  // Update proposal vote counts after a new vote
  async updateProposalVoteCounts(proposalId) {
    try {
      if (!this.isOnline) {
        return { success: true, offline: true };
      }

      // Get all votes for this proposal
      const { data: votes, error: votesError } = await supabase
        .from('project_votes')
        .select('vote_type')
        .eq('proposal_id', proposalId);

      if (votesError) {
        console.error('Error fetching votes for count update:', votesError);
        return { success: false, error: votesError.message };
      }

      const yesVotes = votes.filter(v => v.vote_type === 'yes').length;
      const noVotes = votes.filter(v => v.vote_type === 'no').length;
      const totalVotes = votes.length;
      const isApproved = yesVotes >= this.MIN_VOTES_FOR_APPROVAL;

      // Update the proposal
      const { data, error } = await supabase
        .from('project_proposals')
        .update({
          yes_votes: yesVotes,
          no_votes: noVotes,
          total_votes: totalVotes,
          is_approved: isApproved,
          status: isApproved ? 'approved' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .select();

      if (error) {
        console.error('Error updating proposal counts:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Proposal vote counts updated:', data[0]);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating proposal vote counts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get project proposal statistics
  async getProposalStats() {
    try {
      const proposals = await this.getAllProposals();
      
      return {
        totalProposals: proposals.length,
        pendingProposals: proposals.filter(p => p.status === 'pending').length,
        approvedProposals: proposals.filter(p => p.status === 'approved').length,
        rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
        totalVotes: proposals.reduce((sum, p) => sum + (p.total_votes || 0), 0),
        averageVotesPerProposal: proposals.length > 0 ? 
          (proposals.reduce((sum, p) => sum + (p.total_votes || 0), 0) / proposals.length).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error calculating proposal stats:', error);
      return {
        totalProposals: 0,
        pendingProposals: 0,
        approvedProposals: 0,
        rejectedProposals: 0,
        totalVotes: 0,
        averageVotesPerProposal: 0
      };
    }
  }

  // Local storage helper methods
  storeProposalLocally(proposal) {
    try {
      const localProposals = this.getLocalProposals();
      localProposals.push(proposal);
      localStorage.setItem('projectProposals', JSON.stringify(localProposals));
    } catch (error) {
      console.error('Error storing proposal locally:', error);
    }
  }

  storeVoteLocally(vote) {
    try {
      const localVotes = this.getLocalVotes();
      localVotes.push(vote);
      localStorage.setItem('projectVotes', JSON.stringify(localVotes));
    } catch (error) {
      console.error('Error storing vote locally:', error);
    }
  }

  getLocalProposals() {
    try {
      return JSON.parse(localStorage.getItem('projectProposals') || '[]');
    } catch (error) {
      console.error('Error reading local proposals:', error);
      return [];
    }
  }

  getLocalVotes() {
    try {
      return JSON.parse(localStorage.getItem('projectVotes') || '[]');
    } catch (error) {
      console.error('Error reading local votes:', error);
      return [];
    }
  }

  updateLocalCache(type, data) {
    try {
      if (type === 'proposals') {
        const existing = this.getLocalProposals();
        existing.push(data);
        localStorage.setItem('projectProposals', JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Error updating local cache:', error);
    }
  }

  updateLocalProposalsCache(proposals) {
    try {
      localStorage.setItem('projectProposals', JSON.stringify(proposals));
    } catch (error) {
      console.error('Error updating local proposals cache:', error);
    }
  }

  // Export all project data for debugging
  async exportAllProjectData() {
    try {
      const proposals = await this.getAllProposals();
      const stats = await this.getProposalStats();
      
      const exportData = {
        proposals,
        stats,
        exportTimestamp: new Date().toISOString(),
        maxParents: this.MAX_PARENTS,
        minVotesForApproval: this.MIN_VOTES_FOR_APPROVAL
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pta-projects-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return exportData;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const centralizedProjectsDB = new CentralizedProjectsDB();

// Helper functions for easy access
export const submitProjectProposal = (proposalData) => centralizedProjectsDB.submitProposal(proposalData);
export const getAllProjectProposals = () => centralizedProjectsDB.getAllProposals();
export const submitProjectVote = (voteData) => centralizedProjectsDB.submitVote(voteData);
export const getProjectVotes = (proposalId) => centralizedProjectsDB.getVotesForProposal(proposalId);
export const getProjectStats = () => centralizedProjectsDB.getProposalStats();
export const exportProjectData = () => centralizedProjectsDB.exportAllProjectData();