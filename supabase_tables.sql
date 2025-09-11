-- Create project_proposals table
CREATE TABLE public.project_proposals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    proposed_by text NOT NULL,
    submission_timestamp timestamp with time zone NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    yes_votes integer DEFAULT 0,
    no_votes integer DEFAULT 0,
    total_votes integer DEFAULT 0,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create project_votes table
CREATE TABLE public.project_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id uuid NOT NULL REFERENCES public.project_proposals(id) ON DELETE CASCADE,
    parent_name text NOT NULL,
    student_name text NOT NULL,
    vote_type text NOT NULL CHECK (vote_type IN ('yes', 'no')),
    submission_timestamp timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for project_proposals (allow all operations for now)
CREATE POLICY "Allow all operations on project_proposals" ON public.project_proposals
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for project_votes (allow all operations for now)
CREATE POLICY "Allow all operations on project_votes" ON public.project_votes
    FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_project_proposals_status ON public.project_proposals(status);
CREATE INDEX idx_project_proposals_created_at ON public.project_proposals(created_at);
CREATE INDEX idx_project_votes_proposal_id ON public.project_votes(proposal_id);
CREATE INDEX idx_project_votes_parent_name ON public.project_votes(parent_name);

-- Create a function to automatically update vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the vote counts in project_proposals
    UPDATE public.project_proposals 
    SET 
        yes_votes = (
            SELECT COUNT(*) FROM public.project_votes 
            WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
            AND vote_type = 'yes'
        ),
        no_votes = (
            SELECT COUNT(*) FROM public.project_votes 
            WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
            AND vote_type = 'no'
        ),
        total_votes = (
            SELECT COUNT(*) FROM public.project_votes 
            WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
    
    -- Check if proposal should be approved (22+ yes votes)
    UPDATE public.project_proposals 
    SET 
        is_approved = (yes_votes >= 22),
        status = CASE 
            WHEN yes_votes >= 22 THEN 'approved'
            ELSE 'pending'
        END
    WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update vote counts
CREATE TRIGGER trigger_update_vote_counts_insert
    AFTER INSERT ON public.project_votes
    FOR EACH ROW EXECUTE FUNCTION update_proposal_vote_counts();

CREATE TRIGGER trigger_update_vote_counts_update
    AFTER UPDATE ON public.project_votes
    FOR EACH ROW EXECUTE FUNCTION update_proposal_vote_counts();

CREATE TRIGGER trigger_update_vote_counts_delete
    AFTER DELETE ON public.project_votes
    FOR EACH ROW EXECUTE FUNCTION update_proposal_vote_counts();

-- Insert some sample data for testing (optional)
-- Uncomment the lines below if you want sample data

-- INSERT INTO public.project_proposals (title, description, proposed_by, submission_timestamp) VALUES
-- ('New Playground Equipment', 'Install modern playground equipment in the school yard for better student recreation.', 'Maria Santos', now()),
-- ('Science Lab Upgrade', 'Upgrade science laboratory equipment to enhance hands-on learning experiences.', 'John Dela Cruz', now()),
-- ('Library Expansion', 'Expand the school library with more books and reading spaces for students.', 'Ana Reyes', now());