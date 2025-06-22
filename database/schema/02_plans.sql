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

-- Índices
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_is_public ON plans(is_public);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_plans_timestamp
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Inserir planos padrão
INSERT INTO plans (name, display_name, description, monthly_price, yearly_price, max_domains, features, stripe_monthly_price_id, stripe_yearly_price_id, sort_order)
VALUES 
('STARTER', 'Starter', 'Ideal para pequenos negócios e profissionais', 99, 79, 3, 
 '{"protection_basic": true, "real_time_detection": true, "notifications": true, "support_24_7": true}'::jsonb,
 'price_starter_monthly', 'price_starter_yearly', 10),
 
('PRO', 'Pro', 'Perfeito para empresas em crescimento', 299, 239, 25, 
 '{"protection_basic": true, "protection_advanced": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true}'::jsonb,
 'price_pro_monthly', 'price_pro_yearly', 20),
 
('ENTERPRISE', 'Enterprise', 'Para grandes empresas com necessidades específicas', 499, 399, 100, 
 '{"protection_basic": true, "protection_advanced": true, "protection_multi_layer": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true, "custom_domain": true}'::jsonb,
 'price_enterprise_monthly', 'price_enterprise_yearly', 30),
 
('RETENTION', 'Oferta Especial', 'Oferta especial de retenção', 149, 119, 25, 
 '{"protection_basic": true, "protection_advanced": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true}'::jsonb,
 'price_retention_monthly', 'price_retention_yearly', 15);

-- Comentários
COMMENT ON TABLE plans IS 'Catálogo de planos disponíveis no CloneGuard';
COMMENT ON COLUMN plans.name IS 'Nome interno do plano (STARTER, PRO, etc.)';
COMMENT ON COLUMN plans.display_name IS 'Nome do plano exibido para os clientes';
COMMENT ON COLUMN plans.monthly_price IS 'Preço mensal do plano';
COMMENT ON COLUMN plans.yearly_price IS 'Preço anual do plano (com desconto)';
COMMENT ON COLUMN plans.max_domains IS 'Número máximo de domínios permitidos neste plano';
COMMENT ON COLUMN plans.features IS 'Lista de recursos incluídos no plano em formato JSON';
COMMENT ON COLUMN plans.is_active IS 'Indica se o plano está ativo e disponível para compra';
COMMENT ON COLUMN plans.is_public IS 'Indica se o plano deve ser exibido publicamente';
COMMENT ON COLUMN plans.stripe_monthly_price_id IS 'ID do preço mensal no Stripe';
COMMENT ON COLUMN plans.stripe_yearly_price_id IS 'ID do preço anual no Stripe';
COMMENT ON COLUMN plans.sort_order IS 'Ordem de exibição do plano na interface';
COMMENT ON COLUMN plans.retention_discount_percentage IS 'Percentual de desconto para retenção';
COMMENT ON COLUMN plans.trial_days IS 'Número de dias de teste gratuito';
