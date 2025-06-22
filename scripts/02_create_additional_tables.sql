-- Script para criar tabelas adicionais do CloneGuard
-- Execute após o script 01_create_all_tables.sql

-- 11. Tabela de ações administrativas
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    is_automated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_client_id ON admin_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_domain_id ON admin_actions(domain_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_subscription_id ON admin_actions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_performed_at ON admin_actions(performed_at);

-- 12. Função para atualizar timestamps de notificação
CREATE OR REPLACE FUNCTION update_notification_sent_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
        NEW.sent_at = NOW();
    END IF;
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        NEW.delivered_at = NOW();
    END IF;
    IF NEW.status = 'opened' AND OLD.status != 'opened' THEN
        NEW.opened_at = NOW();
    END IF;
    IF NEW.status = 'clicked' AND OLD.status != 'clicked' THEN
        NEW.clicked_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('email', 'sms', 'push', 'webhook', 'in_app')),
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    external_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_domain_id ON notifications(domain_id);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);

-- Trigger para notifications
CREATE TRIGGER update_notification_timestamps
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_sent_at();

-- 14. Tabela de execuções de script
CREATE TABLE IF NOT EXISTS script_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    clone_attempt_id UUID REFERENCES clone_attempts(id) ON DELETE SET NULL,
    execution_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    url TEXT,
    referrer TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    execution_status VARCHAR(50) DEFAULT 'success' CHECK (execution_status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    actions_executed JSONB,
    execution_duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para script_executions
CREATE INDEX IF NOT EXISTS idx_script_executions_script_id ON script_executions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_domain_id ON script_executions(domain_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_clone_attempt_id ON script_executions(clone_attempt_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_execution_time ON script_executions(execution_time);
CREATE INDEX IF NOT EXISTS idx_script_executions_ip_address ON script_executions(ip_address);
CREATE INDEX IF NOT EXISTS idx_script_executions_country_code ON script_executions(country_code);

-- 15. Tabela de templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('email', 'sms', 'push', 'webhook', 'in_app')),
    subject_template TEXT,
    content_template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_notification_type ON notification_templates(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- Trigger para notification_templates
CREATE TRIGGER update_notification_templates_timestamp
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 16. Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email_clone_detection BOOLEAN DEFAULT TRUE,
    email_subscription_renewal BOOLEAN DEFAULT TRUE,
    email_subscription_expiry BOOLEAN DEFAULT TRUE,
    email_weekly_report BOOLEAN DEFAULT TRUE,
    sms_clone_detection BOOLEAN DEFAULT FALSE,
    push_clone_detection BOOLEAN DEFAULT TRUE,
    webhook_clone_detection BOOLEAN DEFAULT FALSE,
    webhook_url TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_client_id ON notification_preferences(client_id);

-- Trigger para notification_preferences
CREATE TRIGGER update_notification_preferences_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 17. Função para gerar API key de cliente
CREATE OR REPLACE FUNCTION generate_client_api_key()
RETURNS TABLE(key_value TEXT, key_prefix TEXT) AS $$
DECLARE
    full_key TEXT;
    prefix TEXT;
BEGIN
    full_key := encode(gen_random_bytes(32), 'hex');
    prefix := substring(full_key from 1 for 8);
    RETURN QUERY SELECT full_key, prefix;
END;
$$ LANGUAGE plpgsql;

-- 18. Tabela de chaves de API
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_value VARCHAR(64) NOT NULL UNIQUE,
    key_prefix VARCHAR(8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    allowed_ips JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Trigger para api_keys
CREATE TRIGGER update_api_keys_timestamp
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Mensagem de sucesso
SELECT 'Tabelas adicionais criadas com sucesso!' as status;
