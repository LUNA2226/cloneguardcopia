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

-- Índices
CREATE INDEX IF NOT EXISTS idx_stripe_events_client_id ON stripe_events(client_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_subscription_id ON stripe_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_events_is_processed ON stripe_events(is_processed);

-- Comentários
COMMENT ON TABLE stripe_events IS 'Registro de todos os webhooks recebidos do Stripe';
COMMENT ON COLUMN stripe_events.id IS 'ID do evento no Stripe';
COMMENT ON COLUMN stripe_events.client_id IS 'Referência ao cliente relacionado (se identificado)';
COMMENT ON COLUMN stripe_events.subscription_id IS 'Referência à assinatura relacionada (se aplicável)';
COMMENT ON COLUMN stripe_events.event_type IS 'Tipo do evento Stripe (ex: invoice.payment_succeeded)';
COMMENT ON COLUMN stripe_events.api_version IS 'Versão da API do Stripe';
COMMENT ON COLUMN stripe_events.created_at IS 'Data e hora de criação do evento no Stripe';
COMMENT ON COLUMN stripe_events.received_at IS 'Data e hora de recebimento do webhook';
COMMENT ON COLUMN stripe_events.processed_at IS 'Data e hora de processamento do evento';
COMMENT ON COLUMN stripe_events.is_processed IS 'Indica se o evento foi processado com sucesso';
COMMENT ON COLUMN stripe_events.processing_error IS 'Erro ocorrido durante o processamento (se houver)';
COMMENT ON COLUMN stripe_events.retry_count IS 'Número de tentativas de processamento';
COMMENT ON COLUMN stripe_events.last_retry_at IS 'Data e hora da última tentativa de processamento';
COMMENT ON COLUMN stripe_events.raw_data IS 'Dados brutos do evento em formato JSON';
COMMENT ON COLUMN stripe_events.metadata IS 'Dados adicionais do evento em formato JSON';
