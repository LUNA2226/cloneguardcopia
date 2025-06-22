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

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_domain_id ON notifications(domain_id);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);

-- Trigger para atualizar o sent_at quando o status muda para 'sent'
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

CREATE TRIGGER update_notification_timestamps
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_sent_at();

-- Comentários
COMMENT ON TABLE notifications IS 'Registro das notificações enviadas aos clientes';
COMMENT ON COLUMN notifications.client_id IS 'Referência ao cliente destinatário';
COMMENT ON COLUMN notifications.domain_id IS 'Referência ao domínio relacionado (se aplicável)';
COMMENT ON COLUMN notifications.notification_type IS 'Tipo de notificação: email, sms, push, webhook ou in_app';
COMMENT ON COLUMN notifications.channel IS 'Canal específico usado para envio (ex: resend, twilio, firebase)';
COMMENT ON COLUMN notifications.subject IS 'Assunto da notificação (para emails)';
COMMENT ON COLUMN notifications.content IS 'Conteúdo da notificação';
COMMENT ON COLUMN notifications.recipient IS 'Destinatário da notificação (email, número, token)';
COMMENT ON COLUMN notifications.status IS 'Status atual da notificação';
COMMENT ON COLUMN notifications.sent_at IS 'Data e hora de envio';
COMMENT ON COLUMN notifications.delivered_at IS 'Data e hora de entrega';
COMMENT ON COLUMN notifications.opened_at IS 'Data e hora de abertura (se aplicável)';
COMMENT ON COLUMN notifications.clicked_at IS 'Data e hora de clique (se aplicável)';
COMMENT ON COLUMN notifications.error_message IS 'Mensagem de erro (se houver falha)';
COMMENT ON COLUMN notifications.retry_count IS 'Número de tentativas de envio';
COMMENT ON COLUMN notifications.last_retry_at IS 'Data e hora da última tentativa';
COMMENT ON COLUMN notifications.external_id IS 'ID externo no serviço de envio';
COMMENT ON COLUMN notifications.metadata IS 'Dados adicionais da notificação em formato JSON';
