CREATE TABLE IF NOT EXISTS script_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    clone_attempt_id UUID REFERENCES clone_attempts(id) ON DELETE SET NULL,
    execution_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    url TEXT,
    referrer TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    execution_status VARCHAR(50) DEFAULT 'success' CHECK (execution_status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    actions_executed JSONB,
    execution_duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_script_executions_script_id ON script_executions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_domain_id ON script_executions(domain_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_clone_attempt_id ON script_executions(clone_attempt_id);
CREATE INDEX IF NOT EXISTS idx_script_executions_execution_time ON script_executions(execution_time);
CREATE INDEX IF NOT EXISTS idx_script_executions_ip_address ON script_executions(ip_address);
CREATE INDEX IF NOT EXISTS idx_script_executions_country_code ON script_executions(country_code);

-- Comentários
COMMENT ON TABLE script_executions IS 'Registro detalhado de execuções de scripts de proteção';
COMMENT ON COLUMN script_executions.script_id IS 'Referência ao script executado';
COMMENT ON COLUMN script_executions.domain_id IS 'Referência ao domínio protegido';
COMMENT ON COLUMN script_executions.clone_attempt_id IS 'Referência à tentativa de clone relacionada';
COMMENT ON COLUMN script_executions.execution_time IS 'Data e hora da execução';
COMMENT ON COLUMN script_executions.ip_address IS 'Endereço IP do visitante';
COMMENT ON COLUMN script_executions.user_agent IS 'User Agent do navegador';
COMMENT ON COLUMN script_executions.url IS 'URL onde o script foi executado';
COMMENT ON COLUMN script_executions.referrer IS 'URL de referência';
COMMENT ON COLUMN script_executions.country_code IS 'Código do país do visitante';
COMMENT ON COLUMN script_executions.city IS 'Cidade do visitante';
COMMENT ON COLUMN script_executions.browser IS 'Navegador utilizado';
COMMENT ON COLUMN script_executions.device_type IS 'Tipo de dispositivo';
COMMENT ON COLUMN script_executions.operating_system IS 'Sistema operacional';
COMMENT ON COLUMN script_executions.execution_status IS 'Status da execução';
COMMENT ON COLUMN script_executions.error_message IS 'Mensagem de erro (se houver)';
COMMENT ON COLUMN script_executions.actions_executed IS 'Ações executadas em formato JSON';
COMMENT ON COLUMN script_executions.execution_duration_ms IS 'Duração da execução em milissegundos';
COMMENT ON COLUMN script_executions.metadata IS 'Dados adicionais da execução em formato JSON';
