CREATE TABLE IF NOT EXISTS clone_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    original_domain VARCHAR(255) NOT NULL,
    clone_domain VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
    actions_taken JSONB DEFAULT '{}'::jsonb,
    is_blocked BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clone_attempts_original_domain_id ON clone_attempts(original_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_original_domain ON clone_attempts(original_domain);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_clone_domain ON clone_attempts(clone_domain);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_timestamp ON clone_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_ip_address ON clone_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_country_code ON clone_attempts(country_code);

-- Particionamento por tempo (opcional para grandes volumes)
-- Esta é uma sugestão para implementação futura se o volume de dados crescer
-- CREATE TABLE clone_attempts_partitioned (LIKE clone_attempts) PARTITION BY RANGE (timestamp);
-- CREATE TABLE clone_attempts_y2023m01 PARTITION OF clone_attempts_partitioned FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
-- ...

-- Comentários
COMMENT ON TABLE clone_attempts IS 'Registro de tentativas de acesso a sites clonados';
COMMENT ON COLUMN clone_attempts.original_domain_id IS 'Referência ao domínio original protegido';
COMMENT ON COLUMN clone_attempts.original_domain IS 'Nome do domínio original';
COMMENT ON COLUMN clone_attempts.clone_domain IS 'Nome do domínio clonado';
COMMENT ON COLUMN clone_attempts.url IS 'URL completa acessada no clone';
COMMENT ON COLUMN clone_attempts.ip_address IS 'Endereço IP do visitante';
COMMENT ON COLUMN clone_attempts.user_agent IS 'User Agent do navegador do visitante';
COMMENT ON COLUMN clone_attempts.country_code IS 'Código do país do visitante';
COMMENT ON COLUMN clone_attempts.city IS 'Cidade do visitante';
COMMENT ON COLUMN clone_attempts.browser IS 'Navegador utilizado';
COMMENT ON COLUMN clone_attempts.device_type IS 'Tipo de dispositivo (desktop, mobile, tablet)';
COMMENT ON COLUMN clone_attempts.operating_system IS 'Sistema operacional do visitante';
COMMENT ON COLUMN clone_attempts.referrer IS 'URL de referência';
COMMENT ON COLUMN clone_attempts.timestamp IS 'Data e hora da tentativa';
COMMENT ON COLUMN clone_attempts.script_id IS 'Referência ao script que detectou a tentativa';
COMMENT ON COLUMN clone_attempts.actions_taken IS 'Ações tomadas contra o clone em formato JSON';
COMMENT ON COLUMN clone_attempts.is_blocked IS 'Indica se a tentativa foi bloqueada';
COMMENT ON COLUMN clone_attempts.metadata IS 'Dados adicionais da tentativa em formato JSON';
