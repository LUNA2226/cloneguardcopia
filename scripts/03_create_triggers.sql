-- Script para criar todos os triggers
-- Execute após o script 02_create_indexes.sql

-- Triggers para atualizar timestamps
CREATE TRIGGER update_clients_timestamp
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_plans_timestamp
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_domains_timestamp
BEFORE UPDATE ON domains
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scripts_timestamp
BEFORE UPDATE ON scripts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_protection_settings_timestamp
BEFORE UPDATE ON user_protection_settings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger para definir API key padrão nos scripts
CREATE TRIGGER set_scripts_api_key
BEFORE INSERT ON scripts
FOR EACH ROW
EXECUTE FUNCTION set_default_api_key();

SELECT 'Triggers criados com sucesso!' as status;
