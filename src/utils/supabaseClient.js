import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://npsrxmdtzyebwetzynvf.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc3J4bWR0enllYndldHp5bnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTc1NTgsImV4cCI6MjA3MTU3MzU1OH0.IOmXTlFCz53kqlchApbFZp6_lJlfTeGJSqel7j8f2NQ'

console.log('🔧 Supabase Config:', { 
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  hasEnvUrl: !!process.env.REACT_APP_SUPABASE_URL,
  hasEnvKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table schemas we'll create:
/*
1. donations table:
   - id (uuid, primary key)
   - reference_number (text)
   - parent_name (text)
   - student_name (text)
   - donation_mode (text)
   - amount (decimal)
   - e_signature (text)
   - submission_date (date)
   - submission_time (time)
   - submission_timestamp (timestamp)
   - allocation (jsonb)
   - attachment_file (text, base64)
   - attachment_filename (text)
   - created_at (timestamp)
   - updated_at (timestamp)

2. donation_drives table:
   - id (uuid, primary key)
   - title (text)
   - description (text)
   - target_amount (decimal)
   - current_amount (decimal)
   - status (text)
   - created_at (timestamp)
   - updated_at (timestamp)

3. admin_sessions table:
   - id (uuid, primary key)
   - admin_name (text)
   - ip_address (text)
   - login_timestamp (timestamp)
   - last_activity (timestamp)
   - session_data (jsonb)
*/