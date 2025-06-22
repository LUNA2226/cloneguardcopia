-- Add authorized_domains table to track which domains can use each script
CREATE TABLE IF NOT EXISTS authorized_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_config_id UUID REFERENCES domain_configs(id) ON DELETE CASCADE,
    authorized_domain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_authorized_domains_config_id ON authorized_domains(domain_config_id);
CREATE INDEX IF NOT EXISTS idx_authorized_domains_domain ON authorized_domains(authorized_domain);
CREATE INDEX IF NOT EXISTS idx_authorized_domains_active ON authorized_domains(is_active);

-- Enable RLS
ALTER TABLE authorized_domains ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized domains
CREATE POLICY "Allow access to authorized domains"
ON authorized_domains
FOR ALL
USING (true); -- Adjust based on your auth requirements

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER set_timestamp_authorized_domains
BEFORE UPDATE ON authorized_domains
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default authorized domains (each domain is authorized to use its own script)
INSERT INTO authorized_domains (domain_config_id, authorized_domain)
SELECT id, authorized_domain 
FROM domain_configs
ON CONFLICT DO NOTHING;

-- Add some additional authorized domains for testing (subdomains, www variants)
INSERT INTO authorized_domains (domain_config_id, authorized_domain)
SELECT dc.id, 'www.' || dc.authorized_domain
FROM domain_configs dc
WHERE NOT EXISTS (
    SELECT 1 FROM authorized_domains ad 
    WHERE ad.domain_config_id = dc.id 
    AND ad.authorized_domain = 'www.' || dc.authorized_domain
);

COMMENT ON TABLE authorized_domains IS 'Tracks which domains are authorized to use each protection script.';
COMMENT ON COLUMN authorized_domains.domain_config_id IS 'References the domain configuration.';
COMMENT ON COLUMN authorized_domains.authorized_domain IS 'Domain that is authorized to use the script.';
COMMENT ON COLUMN authorized_domains.is_active IS 'Whether this authorization is currently active.';
