CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    referral_source VARCHAR(100),
    avatar_url TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_timestamp
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE clients IS 'Armazena informações dos clientes do CloneGuard';
COMMENT ON COLUMN clients.id IS 'Identificador único do cliente';
COMMENT ON COLUMN clients.user_id IS 'Referência ao usuário no sistema de autenticação';
COMMENT ON COLUMN clients.name IS 'Nome completo do cliente';
COMMENT ON COLUMN clients.email IS 'Email do cliente, usado para login e comunicações';
COMMENT ON COLUMN clients.company_name IS 'Nome da empresa do cliente (opcional)';
COMMENT ON COLUMN clients.phone IS 'Número de telefone do cliente';
COMMENT ON COLUMN clients.status IS 'Status do cliente: active, inactive ou suspended';
COMMENT ON COLUMN clients.metadata IS 'Dados adicionais do cliente em formato JSON';
COMMENT ON COLUMN clients.onboarding_completed IS 'Indica se o cliente completou o processo de onboarding';
COMMENT ON COLUMN clients.referral_source IS 'Como o cliente conheceu o CloneGuard';
