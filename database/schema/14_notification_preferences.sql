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

-- Índices
CREATE INDEX IF NOT EXISTS idx_notification_preferences_client_id ON notification_preferences(client_id);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_notification_preferences_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação dos clientes';
COMMENT ON COLUMN notification_preferences.client_id IS 'Referência ao cliente';
COMMENT ON COLUMN notification_preferences.email_clone_detection IS 'Receber emails sobre detecção de clones';
COMMENT ON COLUMN notification_preferences.email_subscription_renewal IS 'Receber emails sobre renovação de assinatura';
COMMENT ON COLUMN notification_preferences.email_subscription_expiry IS 'Receber emails sobre expiração de assinatura';
COMMENT ON COLUMN notification_preferences.email_weekly_report IS 'Receber relatórios semanais por email';
COMMENT ON COLUMN notification_preferences.sms_clone_detection IS 'Receber SMS sobre detecção de clones';
COMMENT ON COLUMN notification_preferences.push_clone_detection IS 'Receber notificações push sobre detecção de clones';
COMMENT ON COLUMN notification_preferences.webhook_clone_detection IS 'Enviar webhooks sobre detecção de clones';
COMMENT ON COLUMN notification_preferences.webhook_url IS 'URL para envio de webhooks';
COMMENT ON COLUMN notification_preferences.webhook_secret IS 'Chave secreta para assinatura de webhooks';
COMMENT ON COLUMN notification_preferences.metadata IS 'Dados adicionais das preferências em formato JSON';
