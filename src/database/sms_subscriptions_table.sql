-- SMS Subscriptions Table for Globe Labs Integration
-- Stores parent phone numbers and their access tokens

CREATE TABLE IF NOT EXISTS sms_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  provider VARCHAR(20) DEFAULT 'globe-labs',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'suspended')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  app_id VARCHAR(50),
  webhook_data JSONB,
  student_id UUID REFERENCES students(id) NULL, -- Link to student record when available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_subscriptions_phone ON sms_subscriptions(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_subscriptions_status ON sms_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_sms_subscriptions_student ON sms_subscriptions(student_id);

-- RLS (Row Level Security) policies
ALTER TABLE sms_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow read/write access (adjust based on your auth requirements)
CREATE POLICY "Allow full access to sms_subscriptions" ON sms_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sms_subscriptions_updated_at
  BEFORE UPDATE ON sms_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();