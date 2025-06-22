-- View para resumo de proteção por domínio
CREATE OR REPLACE VIEW domain_protection_summary AS
SELECT 
    d.id as domain_id,
    d.domain_name,
    d.client_id,
    c.name as client_name,
    d.status as domain_status,
    d.verification_status,
    d.created_at as protection_since,
    
    -- Scripts ativos
    COUNT(DISTINCT sc.id) as active_scripts,
    MAX(sc.updated_at) as last_script_update,
    
    -- Estatísticas de proteção (últimos 30 dias)
    COALESCE(recent_stats.total_attempts, 0) as attempts_30d,
    COALESCE(recent_stats.blocked_attempts, 0) as blocked_30d,
    COALESCE(recent_stats.unique_clones, 0) as unique_clones_30d,
    COALESCE(recent_stats.countries, 0) as countries_30d,
    
    -- Estatísticas históricas
    COALESCE(total_stats.total_attempts, 0) as total_attempts,
    COALESCE(total_stats.total_blocked, 0) as total_blocked,
    COALESCE(total_stats.total_unique_clones, 0) as total_unique_clones,
    
    -- Taxa de bloqueio
    CASE 
        WHEN COALESCE(recent_stats.total_attempts, 0) > 0
        THEN ROUND(recent_stats.blocked_attempts::numeric / recent_stats.total_attempts::numeric * 100, 2)
        ELSE 0
    END as block_rate_30d,
    
    -- Última atividade
    COALESCE(recent_stats.last_attempt, d.last_activity_at) as last_activity,
    
    -- Configurações de proteção
    ups.protection_basic,
    ups.protection_advanced,
    ups.protection_multi_layer,
    ups.real_time_detection,
    ups.notifications_enabled

FROM domains d
JOIN clients c ON d.client_id = c.id
LEFT JOIN scripts sc ON d.id = sc.domain_id AND sc.status = 'active'
LEFT JOIN user_protection_settings ups ON d.client_id = ups.client_id
LEFT JOIN (
    SELECT 
        ca.original_domain_id,
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE ca.is_blocked = true) as blocked_attempts,
        COUNT(DISTINCT ca.clone_domain) as unique_clones,
        COUNT(DISTINCT ca.country_code) as countries,
        MAX(ca.timestamp) as last_attempt
    FROM clone_attempts ca
    WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ca.original_domain_id
) recent_stats ON d.id = recent_stats.original_domain_id
LEFT JOIN (
    SELECT 
        ca.original_domain_id,
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE ca.is_blocked = true) as total_blocked,
        COUNT(DISTINCT ca.clone_domain) as total_unique_clones
    FROM clone_attempts ca
    GROUP BY ca.original_domain_id
) total_stats ON d.id = total_stats.original_domain_id
WHERE d.status != 'deleted'
GROUP BY 
    d.id, d.domain_name, d.client_id, c.name, d.status, d.verification_status, 
    d.created_at, d.last_activity_at, ups.protection_basic, ups.protection_advanced,
    ups.protection_multi_layer, ups.real_time_detection, ups.notifications_enabled,
    recent_stats.total_attempts, recent_stats.blocked_attempts, recent_stats.unique_clones,
    recent_stats.countries, recent_stats.last_attempt, total_stats.total_attempts,
    total_stats.total_blocked, total_stats.total_unique_clones
ORDER BY attempts_30d DESC, total_attempts DESC;

COMMENT ON VIEW domain_protection_summary IS 'Resumo completo de proteção e atividade por domínio';
