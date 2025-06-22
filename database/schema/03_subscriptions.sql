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

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE subscriptions IS 'Assinaturas ativas dos clientes do CloneGuard';
COMMENT ON COLUMN subscriptions.client_id IS 'Referência ao cliente que possui a assinatura';
COMMENT ON COLUMN subscriptions.plan_id IS 'Referência ao plano assinado';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN subscriptions.status IS 'Status atual da assinatura';
COMMENT ON COLUMN subscriptions.billing_cycle IS 'Ciclo de cobrança: mensal ou anual';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Data de início do período atual';
COMMENT ON COLUMN subscriptions.current_period_end IS 'Data de término do período atual';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Indica se a assinatura será cancelada ao final do período';
COMMENT ON COLUMN subscriptions.canceled_at IS 'Data em que a assinatura foi cancelada';
COMMENT ON COLUMN subscriptions.trial_start IS 'Data de início do período de teste';
COMMENT ON COLUMN subscriptions.trial_end IS 'Data de término do período de teste';
COMMENT ON COLUMN subscriptions.payment_method_id IS 'ID do método de pagamento no Stripe';
COMMENT ON COLUMN subscriptions.is_retention_offer IS 'Indica se é uma oferta especial de retenção';
COMMENT ON COLUMN subscriptions.retention_offer_expires_at IS 'Data de expiração da oferta de retenção';
COMMENT ON COLUMN subscriptions.metadata IS 'Dados adicionais da assinatura em formato JSON';
