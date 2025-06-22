CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    event_type VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    execution_time_ms INTEGER,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_logs_client_id ON logs(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_domain_id ON logs(domain_id);
CREATE INDEX IF NOT EXISTS idx_logs_script_id ON logs(script_id);
CREATE INDEX IF NOT EXISTS idx_logs_log_level ON logs(log_level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type);

-- Particionamento por tempo (recomendado para logs)
-- Esta é uma sugestão para implementação futura
-- CREATE TABLE logs_partitioned (LIKE logs) PARTITION BY RANGE (timestamp);
-- CREATE TABLE logs_y2023m01 PARTITION OF logs_partitioned FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
-- ...

-- Comentários
COMMENT ON TABLE logs IS 'Registro de eventos e erros do sistema CloneGuard';
COMMENT ON COLUMN logs.client_id IS 'Referência ao cliente relacionado (se aplicável)';
COMMENT ON COLUMN logs.domain_id IS 'Referência ao domínio relacionado (se aplicável)';
COMMENT ON COLUMN logs.script_id IS 'Referência ao script relacionado (se aplicável)';
COMMENT ON COLUMN logs.log_level IS 'Nível de severidade do log';
COMMENT ON COLUMN logs.message IS 'Mensagem do log';
COMMENT ON COLUMN logs.source IS 'Fonte/componente que gerou o log';
COMMENT ON COLUMN logs.event_type IS 'Tipo de evento registrado';
COMMENT ON COLUMN logs.timestamp IS 'Data e hora do evento';
COMMENT ON COLUMN logs.ip_address IS 'Endereço IP relacionado ao evento';
COMMENT ON COLUMN logs.user_agent IS 'User Agent relacionado ao evento';
COMMENT ON COLUMN logs.request_path IS 'Caminho da requisição que gerou o evento';
COMMENT ON COLUMN logs.request_method IS 'Método HTTP da requisição';
COMMENT ON COLUMN logs.response_status IS 'Código de status HTTP da resposta';
COMMENT ON COLUMN logs.execution_time_ms IS 'Tempo de execução em milissegundos';
COMMENT ON COLUMN logs.stack_trace IS 'Stack trace do erro (se aplicável)';
COMMENT ON COLUMN logs.user_id IS 'Usuário que realizou a ação (se aplicável)';
COMMENT ON COLUMN logs.metadata IS 'Dados adicionais do log em formato JSON';
