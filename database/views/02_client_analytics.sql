-- View detalhada de analytics por cliente
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email as client_email,
    c.company_name,
    c.created_at as client_since,
    
    -- Informações da assinatura
    s.status as subscription_status,
    p.display_name as plan_name,
    s.billing_cycle,
    CASE 
        WHEN s.billing_cycle = 'monthly' THEN p.monthly_price
        WHEN s.billing_cycle = 'yearly' THEN p.yearly_price
    END as plan_price,
    s.current_period_end,
    
    -- Métricas de domínios
    COALESCE(domain_stats.total_domains, 0) as total_domains,
    COALESCE(domain_stats.active_domains, 0) as active_domains,
    COALESCE(domain_stats.verified_domains, 0) as verified_domains,
    
    -- Métricas de proteção (últimos 30 dias)
    COALESCE(protection_stats.total_attempts, 0) as clone_attempts_30d,
    COALESCE(protection_stats.blocked_attempts, 0) as blocked_attempts_30d,
    COALESCE(protection_stats.unique_clones, 0) as unique_clones_30d,
    COALESCE(protection_stats.countries, 0) as countries_30d,
    
    -- Valor do cliente
    CASE 
        WHEN s.billing_cycle = 'monthly' THEN p.monthly_price * 12
        WHEN s.billing_cycle = 'yearly' THEN p.yearly_price
        ELSE 0
    END as annual_value,
    
    -- Última atividade
    GREATEST(c.last_login_at, domain_stats.last_domain_activity) as last_activity

FROM clients c
LEFT JOIN subscriptions s ON c.id = s.client_id AND s.status = 'active'
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) as total_domains,
        COUNT(*) FILTER (WHERE status = 'active') as active_domains,
        COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_domains,
        MAX(last_activity_at) as last_domain_activity
    FROM domains 
    WHERE status != 'deleted'
    GROUP BY client_id
) domain_stats ON c.id = domain_stats.client_id
LEFT JOIN (
    SELECT 
        d.client_id,
        COUNT(ca.*) as total_attempts,
        COUNT(ca.*) FILTER (WHERE ca.is_blocked = true) as blocked_attempts,
        COUNT(DISTINCT ca.clone_domain) as unique_clones,
        COUNT(DISTINCT ca.country_code) as countries
    FROM clone_attempts ca
    JOIN domains d ON ca.original_domain_id = d.id
    WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY d.client_id
) protection_stats ON c.id = protection_stats.client_id
WHERE c.status = 'active'
ORDER BY annual_value DESC, clone_attempts_30d DESC;

COMMENT ON VIEW client_analytics IS 'Analytics detalhadas por cliente incluindo métricas de proteção e valor';
