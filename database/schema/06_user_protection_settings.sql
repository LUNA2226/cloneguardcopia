CREATE TABLE IF NOT EXISTS user_protection_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    auto_redirect BOOLEAN DEFAULT FALSE,
    visual_interference BOOLEAN DEFAULT FALSE,
    replace_images BOOLEAN DEFAULT FALSE,
    fix_checkout_links BOOLEAN DEFAULT FALSE,
    redirect_links BOOLEAN DEFAULT FALSE,
    replacement_image_url TEXT,
    original_checkout_url TEXT,
    original_site_domain TEXT,
    custom_js TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_modified_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_protection_settings_domain_id ON user_protection_settings(domain_id);
CREATE INDEX IF NOT EXISTS idx_protection_settings_client_id ON user_protection_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_protection_settings_is_active ON user_protection_settings(is_active);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_protection_settings_timestamp
BEFORE UPDATE ON user_protection_settings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE user_protection_settings IS 'Configurações de proteção definidas pelo usuário para cada domínio';
COMMENT ON COLUMN user_protection_settings.domain_id IS 'Referência ao domínio protegido';
COMMENT ON COLUMN user_protection_settings.client_id IS 'Referência ao cliente proprietário';
COMMENT ON COLUMN user_protection_settings.auto_redirect IS 'Ativa redirecionamento automático de clones';
COMMENT ON COLUMN user_protection_settings.visual_interference IS 'Ativa interferência visual em clones';
COMMENT ON COLUMN user_protection_settings.replace_images IS 'Ativa substituição de imagens em clones';
COMMENT ON COLUMN user_protection_settings.fix_checkout_links IS 'Ativa correção de links de checkout em clones';
COMMENT ON COLUMN user_protection_settings.redirect_links IS 'Ativa redirecionamento de links em clones';
COMMENT ON COLUMN user_protection_settings.replacement_image_url IS 'URL da imagem de substituição';
COMMENT ON COLUMN user_protection_settings.original_checkout_url IS 'URL do checkout original';
COMMENT ON COLUMN user_protection_settings.original_site_domain IS 'Domínio do site original para redirecionamento';
COMMENT ON COLUMN user_protection_settings.custom_js IS 'JavaScript personalizado para execução em clones';
COMMENT ON COLUMN user_protection_settings.last_modified_by IS 'Usuário que fez a última modificação';
COMMENT ON COLUMN user_protection_settings.is_active IS 'Indica se as configurações estão ativas';
COMMENT ON COLUMN user_protection_settings.metadata IS 'Dados adicionais das configurações em formato JSON';
