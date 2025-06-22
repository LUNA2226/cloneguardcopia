-- View para analytics de detecção de clones
CREATE OR REPLACE VIEW clone_detection_analytics AS
SELECT 
    DATE(ca.timestamp) as detection_date,
    ca.original_domain,
    d.client_id,
    c.name as client_name,
    
    -- Métricas de detecção
    COUNT(*) as total_attempts,
    COUNT(DISTINCT ca.clone_domain) as unique_clone_domains,
    COUNT(DISTINCT ca.ip_address) as unique_visitors,
    COUNT(*) FILTER (WHERE ca.is_blocked = true) as blocked_attempts,
    
    -- Distribuição geográfica
    COUNT(DISTINCT ca.country_code) as countries_count,
    MODE() WITHIN GROUP (ORDER BY ca.country_code) as top_country,
    
    -- Distribuição de dispositivos
    COUNT(*) FILTER (WHERE ca.device_type = 'mobile') as mobile_attempts,
    COUNT(*) FILTER (WHERE ca.device_type = 'desktop') as desktop_attempts,
    COUNT(*) FILTER (WHERE ca.device_type = 'tablet') as tablet_attempts,
    
    -- Distribuição de navegadores
    MODE() WITHIN GROUP (ORDER BY ca.browser) as top_browser,
    
    -- Horários de pico
    EXTRACT(HOUR FROM ca.timestamp) as peak_hour,
    
    -- Ações tomadas
    COUNT(*) FILTER (WHERE ca.actions_taken::text LIKE '%redirect%') as redirects,
    COUNT(*) FILTER (WHERE ca.actions_taken::text LIKE '%sabotage%') as sabotages,
    COUNT(*) FILTER (WHERE ca.actions_taken::text LIKE '%block%') as blocks,
    
    -- Taxa de bloqueio
    ROUND(
        COUNT(*) FILTER (WHERE ca.is_blocked = true)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as block_rate_percentage

FROM clone_attempts ca
JOIN domains d ON ca.original_domain_id = d.id
JOIN clients c ON d.client_id = c.id
WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 
    DATE(ca.timestamp), 
    ca.original_domain, 
    d.client_id, 
    c.name,
    EXTRACT(HOUR FROM ca.timestamp)
ORDER BY detection_date DESC, total_attempts DESC;

COMMENT ON VIEW clone_detection_analytics IS 'Analytics detalhadas de detecção e bloqueio de clones';
