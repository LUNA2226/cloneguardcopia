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

-- Índices
CREATE INDEX IF NOT EXISTS idx_domains_client_id ON domains(client_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_verification_status ON domains(verification_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_client_domain ON domains(client_id, domain_name) WHERE status != 'deleted';

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_domains_timestamp
BEFORE UPDATE ON domains
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE domains IS 'Domínios protegidos pelo CloneGuard';
COMMENT ON COLUMN domains.client_id IS 'Referência ao cliente proprietário do domínio';
COMMENT ON COLUMN domains.domain_name IS 'Nome do domínio (sem http/https)';
COMMENT ON COLUMN domains.status IS 'Status do domínio: pending, active, suspended ou deleted';
COMMENT ON COLUMN domains.verification_status IS 'Status da verificação de propriedade do domínio';
COMMENT ON COLUMN domains.verification_method IS 'Método usado para verificação: dns, file ou meta';
COMMENT ON COLUMN domains.verification_token IS 'Token usado para verificação de propriedade';
COMMENT ON COLUMN domains.verification_checked_at IS 'Data da última verificação de propriedade';
COMMENT ON COLUMN domains.last_activity_at IS 'Data da última atividade detectada neste domínio';
COMMENT ON COLUMN domains.is_primary IS 'Indica se é o domínio principal do cliente';
COMMENT ON COLUMN domains.notes IS 'Notas adicionais sobre o domínio';
COMMENT ON COLUMN domains.metadata IS 'Dados adicionais do domínio em formato JSON';
