-- Inserir dados de demonstração para testar o sistema

-- Inserir cliente demo se não existir
INSERT INTO clients (name, email, status, created_at)
VALUES ('Demo User', 'demo@example.com', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Buscar ID do cliente demo
DO $$
DECLARE
    demo_client_id UUID;
    domain_id_1 UUID;
    domain_id_2 UUID;
    domain_id_3 UUID;
BEGIN
    -- Buscar cliente demo
    SELECT id INTO demo_client_id FROM clients WHERE email = 'demo@example.com';
    
    -- Inserir domínios demo
    INSERT INTO domains (client_id, domain_name, api_key, status, checkout_url, replacement_image_url, created_at)
    VALUES 
        (demo_client_id, 'minhapagina.com.br', encode(gen_random_bytes(16), 'hex'), 'active', 'https://minhapagina.com.br/checkout', '/placeholder.svg?height=200&width=200', NOW()),
        (demo_client_id, 'ofertaespecial.com', encode(gen_random_bytes(16), 'hex'), 'active', 'https://ofertaespecial.com/pay', '/placeholder.svg?height=200&width=200', NOW()),
        (demo_client_id, 'cursoonline.net', encode(gen_random_bytes(16), 'hex'), 'active', 'https://cursoonline.net/subscribe', '/placeholder.svg?height=200&width=200', NOW())
    ON CONFLICT (domain_name) DO NOTHING;
    
    -- Buscar IDs dos domínios
    SELECT id INTO domain_id_1 FROM domains WHERE domain_name = 'minhapagina.com.br';
    SELECT id INTO domain_id_2 FROM domains WHERE domain_name = 'ofertaespecial.com';
    SELECT id INTO domain_id_3 FROM domains WHERE domain_name = 'cursoonline.net';
    
    -- Inserir configurações de proteção
    INSERT INTO user_protection_settings (client_id, domain_id, auto_redirect, visual_interference, replace_images, fix_checkout_links, redirect_links, email_alerts, created_at)
    VALUES 
        (demo_client_id, domain_id_1, false, true, true, true, true, true, NOW()),
        (demo_client_id, domain_id_2, true, false, true, true, true, true, NOW()),
        (demo_client_id, domain_id_3, false, true, false, true, true, false, NOW())
    ON CONFLICT (client_id, domain_id) DO NOTHING;
    
END $$;

-- Verificar se os dados foram inseridos
SELECT 
    c.name as client_name,
    d.domain_name,
    d.api_key,
    ups.auto_redirect,
    ups.visual_interference,
    ups.email_alerts
FROM clients c
JOIN domains d ON c.id = d.client_id
LEFT JOIN user_protection_settings ups ON d.id = ups.domain_id
WHERE c.email = 'demo@example.com'
ORDER BY d.domain_name;
