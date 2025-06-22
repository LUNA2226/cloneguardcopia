CREATE TABLE IF NOT EXISTS retention_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('discount', 'extension', 'upgrade', 'custom')),
    discount_percentage INTEGER,
    extension_days INTEGER,
    upgraded_plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    custom_offer_details TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_retention_offers_client_id ON retention_offers(client_id);
CREATE INDEX IF NOT EXISTS idx_retention_offers_subscription_id ON retention_offers(subscription_id);
CREATE INDEX IF NOT EXISTS idx_retention_offers_status ON retention_offers(status);
CREATE
