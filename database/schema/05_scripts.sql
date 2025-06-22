CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    script_type VARCHAR(50) NOT NULL DEFAULT 'protection' CHECK (script_type IN ('protection', 'tracking', 'custom')),
    script_content TEXT NOT NULL,
    script_hash VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    obfuscation_level VARCHAR(20) DEFAULT 'high' CHECK (obfuscation_level IN ('low', 'medium', 'high', 'extreme')),
    size_bytes INTEGER,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    endpoint_path VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scripts_domain_id ON scripts(domain_id);
CREATE INDEX IF NOT EXISTS idx_scripts_client_id ON scripts(client_id);
CREATE INDEX IF NOT EXISTS idx_scripts_is_active ON scripts(is_active);
CREATE INDEX IF NOT EXISTS idx_scripts_api_key ON scripts(api_key);
CREATE INDEX IF NOT EXISTS idx_scripts_script_hash ON scripts(script_hash);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_scripts_timestamp
BEFORE UPDATE ON scripts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Função para gerar API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
    key TEXT;
BEGIN
    key := encode(gen_random_bytes(32), 'hex');
    RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar API key automaticamente
CREATE OR REPLACE FUNCTION set_default_api_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.api_key IS NULL THEN
        NEW.api_key := generate_api_key();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_scripts_api_key
BEFORE INSERT ON scripts
FOR EACH ROW
EXECUTE FUNCTION set_default_api_key();

-- Comentários
COMMENT ON TABLE scripts IS 'Scripts de proteção gerados para cada domínio';
COMMENT ON COLUMN scripts.domain_id IS 'Referência ao domínio protegido';
COMMENT ON COLUMN scripts.client_id IS 'Referência ao cliente proprietário';
COMMENT ON COLUMN scripts.script_type IS 'Tipo de script: protection, tracking ou custom';
COMMENT ON COLUMN scripts.script_content IS 'Conteúdo do script (obfuscado)';
COMMENT ON COLUMN scripts.script_hash IS 'Hash SHA-256 do conteúdo do script';
COMMENT ON COLUMN scripts.version IS 'Versão do script';
COMMENT ON COLUMN scripts.is_active IS 'Indica se o script está ativo';
COMMENT ON COLUMN scripts.last_generated_at IS 'Data da última geração do script';
COMMENT ON COLUMN scripts.obfuscation_level IS 'Nível de ofuscação aplicado: low, medium, high ou extreme';
COMMENT ON COLUMN scripts.size_bytes IS 'Tamanho do script em bytes';
COMMENT ON COLUMN scripts.api_key IS 'Chave de API única para este script';
COMMENT ON COLUMN scripts.endpoint_path IS 'Caminho do endpoint para este script';
COMMENT ON COLUMN scripts.metadata IS 'Dados adicionais do script em formato JSON';
