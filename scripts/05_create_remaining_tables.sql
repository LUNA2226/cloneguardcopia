-- Script para criar as tabelas restantes
-- Execute após o script 04_create_additional_tables_fixed.sql

-- 18. Tabela de analytics
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clone_attempts INTEGER DEFAULT 0,
    blocked_attempts INTEGER DEFAULT 0,
    unique_clone_domains INTEGER DEFAULT 0,
    redirects INTEGER DEFAULT 0,
    visual_sabotage INTEGER DEFAULT 0,
    image_replacements INTEGER DEFAULT 0,
    link_fixes INTEGER DEFAULT 0,
    top_clone_domains JSONB DEFAULT '[]'::jsonb,
    top_countries JSONB DEFAULT '[]'::jsonb,
    top_browsers JSONB DEFAULT '[]'::jsonb,
    top_devices JSONB DEFAULT '[]'::jsonb,
    hourly_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(client_id, domain_id, date)
);

-- 19. Tabela de faturas
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    invoice_number VARCHAR(100) UNIQUE,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
    billing_reason VARCHAR(50),
    invoice_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_method_details JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 20. Tabela de itens de fatura
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 21. Tabela de histórico de verificação de domínio
CREATE TABLE IF NOT EXISTS domain_verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('dns', 'file', 'meta')),
    verification_token VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    error_message TEXT,
    checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_automated BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 22. Tabela de ofertas de retenção
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

SELECT 'Tabelas restantes criadas com sucesso!' as status;
