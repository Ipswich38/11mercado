-- 11Mercado PTA Clean Database Schema
-- This version handles existing objects gracefully

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
DROP TRIGGER IF EXISTS update_donation_drives_updated_at ON donation_drives;

-- Create function only if it doesn't exist (safe for existing databases)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reference_number TEXT UNIQUE,
    parent_name TEXT NOT NULL,
    student_name TEXT,
    donation_mode TEXT NOT NULL CHECK (donation_mode IN ('cash', 'e-wallet', 'in-kind', 'bank')),
    amount DECIMAL(10,2),
    e_signature TEXT,
    submission_date DATE,
    submission_time TIME,
    submission_timestamp TIMESTAMP,
    allocation JSONB DEFAULT '{}',
    attachment_file TEXT, -- base64 encoded file
    attachment_filename TEXT,
    handed_to TEXT,
    items TEXT,
    has_receipt BOOLEAN DEFAULT false,
    has_photo BOOLEAN DEFAULT false,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create donation drives table
CREATE TABLE IF NOT EXISTS donation_drives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) DEFAULT 0,
    current_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create expenses table for expense tracking
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reference_number TEXT UNIQUE,
    expense_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('office_supplies', 'utilities', 'transportation', 'food_catering', 'maintenance', 'events', 'educational', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    vendor_name TEXT,
    receipt_number TEXT,
    expense_date DATE NOT NULL,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by TEXT,
    approval_date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank', 'ewallet', 'check')),
    fund_source TEXT DEFAULT 'general' CHECK (fund_source IN ('general', 'mercado', 'special')),
    attachment_file TEXT,
    attachment_filename TEXT,
    has_receipt BOOLEAN DEFAULT false,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Drop expense trigger after table exists (safe approach)
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_name TEXT,
    ip_address TEXT,
    login_timestamp TIMESTAMP,
    last_activity TIMESTAMP DEFAULT NOW(),
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS idx_donations_parent_name ON donations(parent_name);
CREATE INDEX IF NOT EXISTS idx_donations_student_name ON donations(student_name);
CREATE INDEX IF NOT EXISTS idx_donations_reference_number ON donations(reference_number);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_drives_status ON donation_drives(status);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_login ON admin_sessions(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_reference_number ON expenses(reference_number);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_expenses_fund_source ON expenses(fund_source);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- Create fresh triggers
CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_drives_updated_at
    BEFORE UPDATE ON donation_drives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access on donations" ON donations;
DROP POLICY IF EXISTS "Allow public insert on donations" ON donations;
DROP POLICY IF EXISTS "Allow public read access on donation_drives" ON donation_drives;
DROP POLICY IF EXISTS "Allow public insert on donation_drives" ON donation_drives;
DROP POLICY IF EXISTS "Allow public insert on admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Allow public read access on admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Allow public read access on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public insert on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public update on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public delete on expenses" ON expenses;

-- Create fresh policies
CREATE POLICY "Allow public read access on donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on donation_drives" ON donation_drives FOR SELECT USING (true);
CREATE POLICY "Allow public insert on donation_drives" ON donation_drives FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on admin_sessions" ON admin_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on admin_sessions" ON admin_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expenses" ON expenses FOR DELETE USING (true);

-- Create or replace view for donation statistics
CREATE OR REPLACE VIEW donation_stats AS
SELECT
    COUNT(*) as total_donations,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(SUM((allocation->>'generalSPTA')::decimal), 0) as total_general_spta,
    COALESCE(SUM((allocation->>'mercadoPTA')::decimal), 0) as total_mercado_pta,
    COUNT(CASE WHEN donation_mode = 'cash' THEN 1 END) as cash_donations,
    COUNT(CASE WHEN donation_mode = 'e-wallet' THEN 1 END) as ewallet_donations,
    COUNT(CASE WHEN donation_mode = 'in-kind' THEN 1 END) as inkind_donations,
    MAX(created_at) as last_donation_date
FROM donations;

-- Create view for expense statistics
CREATE OR REPLACE VIEW expense_stats AS
SELECT
    COUNT(*) as total_expenses,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN approval_status = 'approved' THEN amount ELSE 0 END), 0) as approved_amount,
    COALESCE(SUM(CASE WHEN approval_status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN fund_source = 'general' THEN amount ELSE 0 END), 0) as general_fund_expenses,
    COALESCE(SUM(CASE WHEN fund_source = 'mercado' THEN amount ELSE 0 END), 0) as mercado_fund_expenses,
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_count,
    MAX(created_at) as last_expense_date
FROM expenses;

-- Create combined financial view for dashboard
CREATE OR REPLACE VIEW financial_overview AS
SELECT
    d.total_amount as total_income,
    COALESCE(e.approved_amount, 0) as total_expenses,
    d.total_amount - COALESCE(e.approved_amount, 0) as net_balance,
    d.total_general_spta - COALESCE(e.general_fund_expenses, 0) as general_fund_balance,
    d.total_mercado_pta - COALESCE(e.mercado_fund_expenses, 0) as mercado_fund_balance,
    d.total_donations,
    COALESCE(e.total_expenses, 0) as expense_count,
    COALESCE(e.pending_count, 0) as pending_expenses
FROM donation_stats d
CROSS JOIN expense_stats e;

-- Grant permissions
GRANT SELECT ON donation_stats TO anon, authenticated;
GRANT SELECT ON expense_stats TO anon, authenticated;
GRANT SELECT ON financial_overview TO anon, authenticated;

-- Insert initial donation drives (ON CONFLICT DO NOTHING prevents duplicates)
INSERT INTO donation_drives (title, description, target_amount) VALUES 
('General School Fund', 'Funds for general school improvements and activities', 50000.00),
('11Mercado PTA Fund', 'Specific funds for 11Mercado Elementary School PTA activities', 30000.00)
ON CONFLICT DO NOTHING;

-- Insert a test donation to verify connection
INSERT INTO donations (reference_number, parent_name, student_name, donation_mode, amount, e_signature, submission_date, allocation, created_at)
VALUES (
    'SETUP-TEST-' || extract(epoch from now()),
    'Database Setup Test',
    'Test Student',
    'e-wallet',
    240.00,
    'Setup Verification',
    CURRENT_DATE,
    '{"generalSPTA": 120.00, "mercadoPTA": 120.00}',
    NOW()
) ON CONFLICT (reference_number) DO NOTHING;

-- Insert a test expense to verify expense tracking
INSERT INTO expenses (reference_number, expense_name, category, amount, description, expense_date, fund_source, approval_status, created_by)
VALUES (
    'EXP-SETUP-' || extract(epoch from now()),
    'Database Setup Test Expense',
    'office_supplies',
    50.00,
    'Test expense for verifying expense tracking system',
    CURRENT_DATE,
    'general',
    'pending',
    'System Setup'
) ON CONFLICT (reference_number) DO NOTHING;

-- Success confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Database schema setup completed successfully!';
    RAISE NOTICE '✅ Tables created: donations, donation_drives, admin_sessions';
    RAISE NOTICE '✅ Policies configured for public access';
    RAISE NOTICE '✅ Test donation inserted for verification';
    RAISE NOTICE '🚀 Your centralized donation system is now ready!';
END $$;