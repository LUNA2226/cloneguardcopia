-- View para score de saúde do cliente
CREATE OR REPLACE VIEW customer_health_score AS
SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email,
    c.created_at as client_since,
    
    -- Componentes do score
    CASE 
        WHEN s.status = 'active' THEN 25
        WHEN s.status = 'trialing' THEN 15
        ELSE 0
    END as subscription_score,
    
    CASE 
        WHEN domain_stats.active_domains >= 3 THEN 20
        WHEN domain_stats.active_domains >= 1 THEN 15
        ELSE 0
    END as domain_usage_score,
    
    CASE 
        WHEN protection_stats.attempts_30d >= 100 THEN 20
        WHEN protection_stats.attempts_30d >= 10 THEN 15
        WHEN protection_stats.attempts_30d >= 1 THEN 10
        ELSE 0
    END as protection_activity_score,
    
    CASE 
        WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 15
        WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '30 days' THEN 10
        WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '90 days' THEN 5
        ELSE 0
    END as engagement_score,
    
    CASE 
        WHEN ups.notifications_enabled = true THEN 10
        ELSE 0
    END as configuration_score,
    
    CASE 
        WHEN payment_stats.failed_payments = 0 THEN 10
        WHEN payment_stats.failed_payments <= 2 THEN 5
        ELSE 0
    END as payment_health_score,
    
    -- Score total (0-100)
    (
        CASE 
            WHEN s.status = 'active' THEN 25
            WHEN s.status = 'trialing' THEN 15
            ELSE 0
        END +
        CASE 
            WHEN domain_stats.active_domains >= 3 THEN 20
            WHEN domain_stats.active_domains >= 1 THEN 15
            ELSE 0
        END +
        CASE 
            WHEN protection_stats.attempts_30d >= 100 THEN 20
            WHEN protection_stats.attempts_30d >= 10 THEN 15
            WHEN protection_stats.attempts_30d >= 1 THEN 10
            ELSE 0
        END +
        CASE 
            WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 15
            WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '30 days' THEN 10
            WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '90 days' THEN 5
            ELSE 0
        END +
        CASE 
            WHEN ups.notifications_enabled = true THEN 10
            ELSE 0
        END +
        CASE 
            WHEN payment_stats.failed_payments = 0 THEN 10
            WHEN payment_stats.failed_payments <= 2 THEN 5
            ELSE 0
        END
    ) as total_health_score,
    
    -- Classificação de risco
    CASE 
        WHEN (
            CASE 
                WHEN s.status = 'active' THEN 25
                WHEN s.status = 'trialing' THEN 15
                ELSE 0
            END +
            CASE 
                WHEN domain_stats.active_domains >= 3 THEN 20
                WHEN domain_stats.active_domains >= 1 THEN 15
                ELSE 0
            END +
            CASE 
                WHEN protection_stats.attempts_30d >= 100 THEN 20
                WHEN protection_stats.attempts_30d >= 10 THEN 15
                WHEN protection_stats.attempts_30d >= 1 THEN 10
                ELSE 0
            END +
            CASE 
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 15
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '30 days' THEN 10
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '90 days' THEN 5
                ELSE 0
            END +
            CASE 
                WHEN ups.notifications_enabled = true THEN 10
                ELSE 0
            END +
            CASE 
                WHEN payment_stats.failed_payments = 0 THEN 10
                WHEN payment_stats.failed_payments <= 2 THEN 5
                ELSE 0
            END
        ) >= 80 THEN 'HEALTHY'
        WHEN (
            CASE 
                WHEN s.status = 'active' THEN 25
                WHEN s.status = 'trialing' THEN 15
                ELSE 0
            END +
            CASE 
                WHEN domain_stats.active_domains >= 3 THEN 20
                WHEN domain_stats.active_domains >= 1 THEN 15
                ELSE 0
            END +
            CASE 
                WHEN protection_stats.attempts_30d >= 100 THEN 20
                WHEN protection_stats.attempts_30d >= 10 THEN 15
                WHEN protection_stats.attempts_30d >= 1 THEN 10
                ELSE 0
            END +
            CASE 
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 15
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '30 days' THEN 10
                WHEN c.last_login_at >= CURRENT_DATE - INTERVAL '90 days' THEN 5
                ELSE 0
            END +
            CASE 
                WHEN ups.notifications_enabled = true THEN 10
                ELSE 0
            END +
            CASE 
                WHEN payment_stats.failed_payments = 0 THEN 10
                WHEN payment_stats.failed_payments <= 2 THEN 5
                ELSE 0
            END
        ) >= 60 THEN 'AT_RISK'
        ELSE 'CRITICAL'
    END as risk_category,
    
    -- Dados de apoio
    s.status as subscription_status,
    p.display_name as plan_name,
    domain_stats.active_domains,
    protection_stats.attempts_30d,
    c.last_login_at,
    payment_stats.failed_payments

FROM clients c
LEFT JOIN subscriptions s ON c.id = s.client_id AND s.status IN ('active', 'trialing')
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN user_protection_settings ups ON c.id = ups.client_id
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) FILTER (WHERE status = 'active') as active_domains
    FROM domains 
    WHERE status != 'deleted'
    GROUP BY client_id
) domain_stats ON c.id = domain_stats.client_id
LEFT JOIN (
    SELECT 
        d.client_id,
        COUNT(ca.*) as attempts_30d
    FROM clone_attempts ca
    JOIN domains d ON ca.original_domain_id = d.id
    WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY d.client_id
) protection_stats ON c.id = protection_stats.client_id
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) FILTER (WHERE status IN ('uncollectible', 'void')) as failed_payments
    FROM invoices
    WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY client_id
) payment_stats ON c.id = payment_stats.client_id
WHERE c.status = 'active'
ORDER BY total_health_score DESC, client_since ASC;

COMMENT ON VIEW customer_health_score IS 'Score de saúde do cliente baseado em múltiplos fatores de engajamento e uso';
