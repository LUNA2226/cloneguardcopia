-- View para dashboard em tempo real
CREATE OR REPLACE VIEW real_time_dashboard AS
SELECT 
    -- Atividade em tempo real (última hora)
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '1 hour') as attempts_last_hour,
    (SELECT COUNT(DISTINCT clone_domain) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '1 hour') as unique_clones_last_hour,
    (SELECT COUNT(DISTINCT ip_address) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '1 hour') as unique_visitors_last_hour,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '1 hour' AND is_blocked = true) as blocked_last_hour,
    
    -- Atividade hoje
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE) as attempts_today,
    (SELECT COUNT(DISTINCT clone_domain) FROM clone_attempts WHERE timestamp >= CURRENT_DATE) as unique_clones_today,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE AND is_blocked = true) as blocked_today,
    
    -- Top países (última hora)
    (SELECT COALESCE(country_code, 'Unknown') FROM clone_attempts 
     WHERE timestamp >= NOW() - INTERVAL '1 hour' 
     GROUP BY country_code 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as top_country_last_hour,
    
    -- Top domínio clonado (última hora)
    (SELECT clone_domain FROM clone_attempts 
     WHERE timestamp >= NOW() - INTERVAL '1 hour' 
     GROUP BY clone_domain 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as top_clone_domain_last_hour,
    
    -- Clientes mais atacados (hoje)
    (SELECT c.name FROM clone_attempts ca
     JOIN domains d ON ca.original_domain_id = d.id
     JOIN clients c ON d.client_id = c.id
     WHERE ca.timestamp >= CURRENT_DATE
     GROUP BY c.id, c.name
     ORDER BY COUNT(*) DESC
     LIMIT 1) as most_attacked_client_today,
    
    -- Sistema de saúde
    (SELECT COUNT(*) FROM logs WHERE timestamp >= NOW() - INTERVAL '5 minutes' AND log_level = 'error') as errors_last_5min,
    (SELECT AVG(execution_time_ms) FROM logs WHERE timestamp >= NOW() - INTERVAL '15 minutes' AND execution_time_ms IS NOT NULL) as avg_response_time_15min,
    
    -- Estatísticas de scripts
    (SELECT COUNT(*) FROM scripts WHERE status = 'active') as active_scripts,
    (SELECT COUNT(*) FROM scripts WHERE updated_at >= NOW() - INTERVAL '1 hour') as scripts_updated_last_hour,
    
    -- Novos clientes e assinaturas
    (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE) as new_clients_today,
    (SELECT COUNT(*) FROM subscriptions WHERE created_at >= CURRENT_DATE) as new_subscriptions_today,
    
    -- Última atualização
    NOW() as last_updated;

COMMENT ON VIEW real_time_dashboard IS 'Métricas em tempo real para dashboard de monitoramento';
