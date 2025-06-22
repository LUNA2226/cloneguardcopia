-- Script corrigido para criar todas as tabelas do CloneGuard no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
    key TEXT;
BEGIN
    key := encode(gen_random_bytes(32), 'hex');
    RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Função para definir API key padrão
CREATE OR REPLACE FUNCTION set_default_api_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.api_key IS NULL THEN
        NEW.api_key := generate_api_key();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    referral_source VARCHAR(100),
    avatar_url TEXT
);

-- 2. Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    max_domains INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    stripe_monthly_price_id VARCHAR(100),
    stripe_yearly_price_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sort_order INTEGER DEFAULT 0,
    retention_discount_percentage INTEGER DEFAULT 0,
    trial_days INTEGER DEFAULT 0
);

-- 3. Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    payment_method_id VARCHAR(100),
    is_retention_offer BOOLEAN DEFAULT FALSE,
    retention_offer_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Tabela de domínios
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'failed')),
    verification_method VARCHAR(50) DEFAULT 'dns' CHECK (verification_method IN ('dns', 'file', 'meta')),
    verification_token VARCHAR(255),
    verification_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMPTZ,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Tabela de scripts
CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    script_type VARCHAR(50) NOT NULL DEFAULT 'protection' CHECK (script_type IN ('protection', 'tracking', 'custom')),
    script_content TEXT NOT NULL,
    script_hash VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    obfuscation_level VARCHAR(20) DEFAULT 'high' CHECK (obfuscation_level IN ('low', 'medium', 'high', 'extreme')),
    size_bytes INTEGER,
    api_key VARCHAR(64) UNIQUE NOT NULL DEFAULT generate_api_key(),
    endpoint_path VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Tabela de configurações de proteção
CREATE TABLE IF NOT EXISTS user_protection_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    auto_redirect BOOLEAN DEFAULT FALSE,
    visual_interference BOOLEAN DEFAULT FALSE,
    replace_images BOOLEAN DEFAULT FALSE,
    fix_checkout_links BOOLEAN DEFAULT FALSE,
    redirect_links BOOLEAN DEFAULT FALSE,
    replacement_image_url TEXT,
    original_checkout_url TEXT,
    original_site_domain TEXT,
    custom_js TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_modified_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. Tabela de tentativas de clone
CREATE TABLE IF NOT EXISTS clone_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    original_domain VARCHAR(255) NOT NULL,
    clone_domain VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
    actions_taken JSONB DEFAULT '{}'::jsonb,
    is_blocked BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Tabela de logs
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    event_type VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    execution_time_ms INTEGER,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 9. Tabela de eventos Stripe
CREATE TABLE IF NOT EXISTS stripe_events (
    id VARCHAR(255) PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    api_version VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    raw_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Mensagem de sucesso
SELECT 'Tabelas principais criadas com sucesso!' as status;
