CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_value VARCHAR(64) NOT NULL UNIQUE,
    key_prefix VARCHAR(8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    allowed_ips JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_api_keys_timestamp
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Função para gerar API key
CREATE OR REPLACE FUNCTION generate_client_api_key()
RETURNS TABLE(key_value TEXT, key_prefix TEXT) AS $$
DECLARE
    full_key TEXT;
    prefix TEXT;
BEGIN
    full_key := encode(gen_random_bytes(32), 'hex');
    prefix := substring(full_key from 1 for 8);
    RETURN QUERY SELECT full_key, prefix;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE api_keys IS 'Chaves de API para acesso programático ao sistema';
COMMENT ON COLUMN api_keys.client_id IS 'Referência ao cliente proprietário';
COMMENT ON COLUMN api_keys.key_name IS 'Nome descritivo da chave';
COMMENT ON COLUMN api_keys.key_value IS 'Valor da chave (hash)';
COMMENT ON COLUMN api_keys.key_prefix IS 'Prefixo da chave para identificação';
COMMENT ON COLUMN api_keys.is_active IS 'Indica se a chave está ativa';
COMMENT ON COLUMN api_keys.expires_at IS 'Data de expiração da chave';
COMMENT ON COLUMN api_keys.last_used_at IS 'Data do último uso da chave';
COMMENT ON COLUMN api_keys.created_by IS 'Usuário que criou a chave';
COMMENT ON COLUMN api_keys.permissions IS 'Permissões da chave em formato JSON';
COMMENT ON COLUMN api_keys.allowed_ips IS 'IPs permitidos para uso da chave em formato JSON';
COMMENT ON COLUMN api_keys.metadata IS 'Dados adicionais da chave em formato JSON';
