CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clone_attempts INTEGER DEFAULT 0,
    blocked_attempts INTEGER DEFAULT 0,
    unique_clone_domains INTEGER DEFAULT 0,
    redirects INTEGER DEFAULT 0,
    visual_sabotage INTEGER DEFAULT 0,
    image_replacements INTEGER DEFAULT 0,
    link_fixes INTEGER DEFAULT 0,
    top_clone_domains JSONB DEFAULT '[]'::jsonb,
    top_countries JSONB DEFAULT '[]'::jsonb,
    top_browsers JSONB DEFAULT '[]'::jsonb,
    top_devices JSONB DEFAULT '[]'::jsonb,
    hourly_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(client_id, domain_id, date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analytics_client_id ON analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_domain_id ON analytics(domain_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_analytics_timestamp
BEFORE UPDATE ON analytics
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE analytics IS 'Dados analíticos agregados diariamente';
COMMENT ON COLUMN analytics.client_id IS 'Referência ao cliente';
COMMENT ON COLUMN analytics.domain_id IS 'Referência ao domínio';
COMMENT ON COLUMN analytics.date IS 'Data dos dados analíticos';
COMMENT ON COLUMN analytics.clone_attempts IS 'Número total de tentativas de clone';
COMMENT ON COLUMN analytics.blocked_attempts IS 'Número de tentativas bloqueadas';
COMMENT ON COLUMN analytics.unique_clone_domains IS 'Número de domínios clones únicos';
COMMENT ON COLUMN analytics.redirects IS 'Número de redirecionamentos realizados';
COMMENT ON COLUMN analytics.visual_sabotage IS 'Número de sabotagens visuais aplicadas';
COMMENT ON COLUMN analytics.image_replacements IS 'Número de substituições de imagem';
COMMENT ON COLUMN analytics.link_fixes IS 'Número de correções de links';
COMMENT ON COLUMN analytics.top_clone_domains IS 'Principais domínios clones em formato JSON';
COMMENT ON COLUMN analytics.top_countries IS 'Principais países de origem em formato JSON';
COMMENT ON COLUMN analytics.top_browsers IS 'Principais navegadores em formato JSON';
COMMENT ON COLUMN analytics.top_devices IS 'Principais dispositivos em formato JSON';
COMMENT ON COLUMN analytics.hourly_distribution IS 'Distribuição horária de tentativas em formato JSON';
COMMENT ON COLUMN analytics.metadata IS 'Dados adicionais em formato JSON';
