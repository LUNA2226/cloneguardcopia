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

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_client_id ON admin_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_domain_id ON admin_actions(domain_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_subscription_id ON admin_actions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_performed_at ON admin_actions(performed_at);

-- Comentários
COMMENT ON TABLE admin_actions IS 'Registro de ações administrativas realizadas no sistema';
COMMENT ON COLUMN admin_actions.admin_id IS 'Referência ao usuário administrador que realizou a ação';
COMMENT ON COLUMN admin_actions.client_id IS 'Referência ao cliente afetado (se aplicável)';
COMMENT ON COLUMN admin_actions.domain_id IS 'Referência ao domínio afetado (se aplicável)';
COMMENT ON COLUMN admin_actions.subscription_id IS 'Referência à assinatura afetada (se aplicável)';
COMMENT ON COLUMN admin_actions.action_type IS 'Tipo de ação realizada';
COMMENT ON COLUMN admin_actions.description IS 'Descrição detalhada da ação';
COMMENT ON COLUMN admin_actions.performed_at IS 'Data e hora em que a ação foi realizada';
COMMENT ON COLUMN admin_actions.ip_address IS 'Endereço IP do administrador';
COMMENT ON COLUMN admin_actions.previous_state IS 'Estado anterior em formato JSON';
COMMENT ON COLUMN admin_actions.new_state IS 'Novo estado em formato JSON';
COMMENT ON COLUMN admin_actions.reason IS 'Motivo da ação';
COMMENT ON COLUMN admin_actions.is_automated IS 'Indica se a ação foi automatizada ou manual';
COMMENT ON COLUMN admin_actions.metadata IS 'Dados adicionais da ação em formato JSON';
