-- View principal para o dashboard executivo
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT 
    -- Métricas gerais
    (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM domains WHERE status = 'active') as protected_domains,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE) as today_clone_attempts,
    
    -- Métricas financeiras
    (SELECT COALESCE(SUM(
        CASE 
            WHEN s.billing_cycle = 'monthly' THEN p.monthly_price
            WHEN s.billing_cycle = 'yearly' THEN p.yearly_price / 12
        END
    ), 0) FROM subscriptions s 
    JOIN plans p ON s.plan_id = p.id 
    WHERE s.status = 'active') as monthly_recurring_revenue,
    
    -- Crescimento
    (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_30d,
    (SELECT COUNT(*) FROM subscriptions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_subscriptions_30d,
    
    -- Atividade recente
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as clone_attempts_7d,
    (SELECT COUNT(DISTINCT clone_domain) FROM clone_attempts WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as unique_clones_7d,
    
    -- Taxa de conversão
    CASE 
        WHEN (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') > 0
        THEN ROUND(
            (SELECT COUNT(*) FROM subscriptions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::numeric / 
            (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::numeric * 100, 2
        )
        ELSE 0
    END as conversion_rate_30d;

COMMENT ON VIEW dashboard_overview IS 'Visão geral das principais métricas para o dashboard executivo';
