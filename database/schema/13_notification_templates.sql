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

-- Índices
CREATE INDEX IF NOT EXISTS idx_notification_templates_notification_type ON notification_templates(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_notification_templates_timestamp
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Inserir templates padrão
INSERT INTO notification_templates (name, description, notification_type, subject_template, content_template, variables)
VALUES 
('clone_detected', 'Notificação de detecção de clone', 'email', 
 '🚨 Clone Detectado: {{clone_domain}}', 
 '<h1>Clone Detectado</h1><p>Olá {{client_name}},</p><p>Detectamos um clone do seu site {{original_domain}} em <strong>{{clone_domain}}</strong>.</p><p>Ações tomadas: {{actions_taken}}</p><p>Acesse seu painel para mais detalhes.</p>', 
 '["client_name", "original_domain", "clone_domain", "actions_taken"]'::jsonb),
 
('subscription_renewal', 'Lembrete de renovação de assinatura', 'email', 
 'Sua assinatura CloneGuard será renovada em breve', 
 '<h1>Renovação de Assinatura</h1><p>Olá {{client_name}},</p><p>Sua assinatura do plano {{plan_name}} será renovada em {{renewal_date}}.</p><p>Valor: R$ {{renewal_amount}}</p>', 
 '["client_name", "plan_name", "renewal_date", "renewal_amount"]'::jsonb),
 
('domain_verification', 'Instruções de verificação de domínio', 'email', 
 'Verifique seu domínio no CloneGuard', 
 '<h1>Verificação de Domínio</h1><p>Olá {{client_name}},</p><p>Para verificar seu domínio {{domain_name}}, adicione o seguinte registro TXT ao seu DNS:</p><p><code>{{verification_token}}</code></p>', 
 '["client_name", "domain_name", "verification_token"]'::jsonb);

-- Comentários
COMMENT ON TABLE notification_templates IS 'Templates para notificações enviadas pelo sistema';
COMMENT ON COLUMN notification_templates.name IS 'Nome único do template';
COMMENT ON COLUMN notification_templates.description IS 'Descrição do propósito do template';
COMMENT ON COLUMN notification_templates.notification_type IS 'Tipo de notificação: email, sms, push, webhook ou in_app';
COMMENT ON COLUMN notification_templates.subject_template IS 'Template para o assunto (para emails)';
COMMENT ON COLUMN notification_templates.content_template IS 'Template para o conteúdo da notificação';
COMMENT ON COLUMN notification_templates.variables IS 'Lista de variáveis utilizadas no template em formato JSON';
COMMENT ON COLUMN notification_templates.is_active IS 'Indica se o template está ativo';
COMMENT ON COLUMN notification_templates.created_by IS 'Usuário que criou o template';
COMMENT ON COLUMN notification_templates.last_modified_by IS 'Usuário que fez a última modificação';
COMMENT ON COLUMN notification_templates.metadata IS 'Dados adicionais do template em formato JSON';
