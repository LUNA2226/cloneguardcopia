-- Create email_preferences table to store user notification settings
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    email_address TEXT NOT NULL,
    
    -- Subscription status
    is_subscribed BOOLEAN DEFAULT true,
    
    -- Report frequency
    report_frequency TEXT DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    
    -- Content preferences
    include_summary_metrics BOOLEAN DEFAULT true,
    include_threat_analysis BOOLEAN DEFAULT true,
    include_daily_breakdown BOOLEAN DEFAULT true,
    include_top_domains BOOLEAN DEFAULT true,
    include_recent_activity BOOLEAN DEFAULT false,
    
    -- Alert thresholds
    alert_on_high_activity BOOLEAN DEFAULT true,
    high_activity_threshold INTEGER DEFAULT 50,
    alert_on_new_domains BOOLEAN DEFAULT true,
    alert_on_zero_activity BOOLEAN DEFAULT false,
    
    -- Delivery preferences
    preferred_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    
    -- Unsubscribe token for one-click unsubscribe
    unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(domain, email_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_domain ON email_preferences(domain);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribe_token ON email_preferences(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_email_preferences_subscribed ON email_preferences(is_subscribed) WHERE is_subscribed = true;

-- Enable Row Level Security
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for email preferences
CREATE POLICY "Users can manage their own email preferences"
ON email_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow public access for unsubscribe functionality
CREATE POLICY "Allow unsubscribe via token"
ON email_preferences
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE TRIGGER set_timestamp_email_preferences
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default preferences for existing domains
INSERT INTO email_preferences (user_id, domain, email_address)
SELECT 
    NULL as user_id,
    authorized_domain,
    CONCAT('admin@', authorized_domain) as email_address
FROM domain_configs
ON CONFLICT (domain, email_address) DO NOTHING;

COMMENT ON TABLE email_preferences IS 'Stores user email notification preferences and subscription settings.';
