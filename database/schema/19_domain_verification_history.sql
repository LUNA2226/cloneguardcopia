CREATE TABLE IF NOT EXISTS domain_verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('dns', 'file', 'meta')),
    verification_token VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    error_message TEXT,
    checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_automated BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_domain_verification_history_domain_id ON domain_verification_history(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_verification_history_status ON domain_verification_history(status);
CREATE INDEX IF NOT EXISTS idx_domain_verification_history_checked_at ON domain_verification_history(checked_at);

-- Comentários
COMMENT ON TABLE domain_verification_history IS 'Histórico de verificações de propriedade de domínios';
COMMENT ON COLUMN domain_verification_history.domain_id IS 'Referência ao domínio verificado';
COMMENT ON COLUMN domain_verification_history.verification_method IS 'Método usado para verificação';
COMMENT ON COLUMN domain_verification_history.verification_token IS 'Token usado para verificação';
COMMENT ON COLUMN domain_verification_history.status IS 'Resultado da verificação';
COMMENT ON COLUMN domain_verification_history.checked_at IS 'Data e hora da verificação';
COMMENT ON COLUMN domain_verification_history.error_message IS 'Mensagem de erro (se houver)';
COMMENT ON COLUMN domain_verification_history.checked_by IS 'Usuário que realizou a verificação (se manual)';
COMMENT ON COLUMN domain_verification_history.is_automated IS 'Indica se a verificação foi automatizada';
COMMENT ON COLUMN domain_verification_history.metadata IS 'Dados adicionais da verificação em formato JSON';
