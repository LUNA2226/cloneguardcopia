-- Script para criar todos os índices
-- Execute após o script 01_create_all_tables_fixed.sql

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Índices para plans
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_is_public ON plans(is_public);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Índices para domains
CREATE INDEX IF NOT EXISTS idx_domains_client_id ON domains(client_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_verification_status ON domains(verification_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_client_domain ON domains(client_id, domain_name) WHERE status != 'deleted';

-- Índices para scripts
CREATE INDEX IF NOT EXISTS idx_scripts_domain_id ON scripts(domain_id);
CREATE INDEX IF NOT EXISTS idx_scripts_client_id ON scripts(client_id);
CREATE INDEX IF NOT EXISTS idx_scripts_is_active ON scripts(is_active);
CREATE INDEX IF NOT EXISTS idx_scripts_api_key ON scripts(api_key);
CREATE INDEX IF NOT EXISTS idx_scripts_script_hash ON scripts(script_hash);

-- Índices para user_protection_settings
CREATE INDEX IF NOT EXISTS idx_protection_settings_domain_id ON user_protection_settings(domain_id);
CREATE INDEX IF NOT EXISTS idx_protection_settings_client_id ON user_protection_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_protection_settings_is_active ON user_protection_settings(is_active);

-- Índices para clone_attempts
CREATE INDEX IF NOT EXISTS idx_clone_attempts_original_domain_id ON clone_attempts(original_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_original_domain ON clone_attempts(original_domain);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_clone_domain ON clone_attempts(clone_domain);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_timestamp ON clone_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_ip_address ON clone_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_country_code ON clone_attempts(country_code);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_client_id ON logs(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_domain_id ON logs(domain_id);
CREATE INDEX IF NOT EXISTS idx_logs_script_id ON logs(script_id);
CREATE INDEX IF NOT EXISTS idx_logs_log_level ON logs(log_level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type);

-- Índices para stripe_events
CREATE INDEX IF NOT EXISTS idx_stripe_events_client_id ON stripe_events(client_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_subscription_id ON stripe_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_events_is_processed ON stripe_events(is_processed);

SELECT 'Índices criados com sucesso!' as status;
