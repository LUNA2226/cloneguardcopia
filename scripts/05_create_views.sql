-- Script para criar views de analytics e reporting
-- Execute após criar todas as tabelas

-- View: Dashboard Overview
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT 
    -- Métricas gerais
    (SELECT COUNT(*) FROM clients WHERE status = 'active') as total_active_clients,
    (SELECT COUNT(*) FROM domains WHERE status = 'active') as total_active_domains,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as total_active_subscriptions,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE) as today_clone_attempts,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as week_clone_attempts,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as month_clone_attempts,
    
    -- Métricas financeiras
    (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE paid_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
    (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE paid_date >= CURRENT_DATE - INTERVAL '365 days') as yearly_revenue,
    
    -- Crescimento
    (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_this_month,
    (SELECT COUNT(*) FROM subscriptions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_subscriptions_this_month;

-- View: Client Analytics
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.company_name,
    c.status,
    c.created_at,
    c.last_login_at,
    
    -- Dados da assinatura
    s.status as subscription_status,
    p.display_name as plan_name,
    p.monthly_price,
    s.current_period_end,
    
    -- Métricas de domínios
    (SELECT COUNT(*) FROM domains d WHERE d.client_id = c.id AND d.status = 'active') as active_domains,
    (SELECT COUNT(*) FROM domains d WHERE d.client_id = c.id) as total_domains,
    
    -- Métricas de proteção
    (SELECT COUNT(*) FROM clone_attempts ca 
     JOIN domains d ON ca.original_domain_id = d.id 
     WHERE d.client_id = c.id AND ca.timestamp >= CURRENT_DATE - INTERVAL '30 days') as clone_attempts_last_30_days,
    
    (SELECT COUNT(*) FROM clone_attempts ca 
     JOIN domains d ON ca.original_domain_id = d.id 
     WHERE d.client_id = c.id AND ca.is_blocked = true AND ca.timestamp >= CURRENT_DATE - INTERVAL '30 days') as blocked_attempts_last_30_days,
    
    -- Valor do cliente
    (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices i WHERE i.client_id = c.id) as total_paid,
    (SELECT COUNT(*) FROM invoices i WHERE i.client_id = c.id AND i.status = 'paid') as total_invoices_paid

FROM clients c
LEFT JOIN subscriptions s ON c.id = s.client_id AND s.status = 'active'
LEFT JOIN plans p ON s.plan_id = p.id;

-- View: Clone Detection Analytics
CREATE OR REPLACE VIEW clone_detection_analytics AS
SELECT 
    DATE(ca.timestamp) as date,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE ca.is_blocked = true) as blocked_attempts,
    COUNT(DISTINCT ca.clone_domain) as unique_clone_domains,
    COUNT(DISTINCT ca.ip_address) as unique_ips,
    COUNT(DISTINCT ca.country_code) as unique_countries,
    
    -- Top países
    mode() WITHIN GROUP (ORDER BY ca.country_code) as top_country,
    
    -- Top navegadores
    mode() WITHIN GROUP (ORDER BY ca.browser) as top_browser,
    
    -- Top dispositivos
    mode() WITHIN GROUP (ORDER BY ca.device_type) as top_device,
    
    -- Distribuição por hora
    json_object_agg(
        EXTRACT(hour FROM ca.timestamp)::text, 
        COUNT(*)
    ) as hourly_distribution

FROM clone_attempts ca
WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ca.timestamp)
ORDER BY date DESC;

-- View: Subscription Metrics
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT 
    p.name as plan_name,
    p.display_name,
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE s.status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE s.status = 'canceled') as canceled_subscriptions,
    COUNT(*) FILTER (WHERE s.billing_cycle = 'monthly') as monthly_subscriptions,
    COUNT(*) FILTER (WHERE s.billing_cycle = 'yearly') as yearly_subscriptions,
    
    -- Receita
    SUM(CASE WHEN s.billing_cycle = 'monthly' THEN p.monthly_price ELSE p.yearly_price END) as total_mrr,
    AVG(CASE WHEN s.billing_cycle = 'monthly' THEN p.monthly_price ELSE p.yearly_price END) as avg_revenue_per_user,
    
    -- Churn
    COUNT(*) FILTER (WHERE s.canceled_at >= CURRENT_DATE - INTERVAL '30 days') as churned_last_30_days,
    COUNT(*) FILTER (WHERE s.created_at >= CURRENT_DATE - INTERVAL '30 days') as new_last_30_days

FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
GROUP BY p.id, p.name, p.display_name, p.monthly_price, p.yearly_price;

-- View: Domain Protection Summary
CREATE OR REPLACE VIEW domain_protection_summary AS
SELECT 
    d.id,
    d.domain_name,
    d.status,
    d.verification_status,
    d.created_at,
    c.name as client_name,
    c.email as client_email,
    
    -- Configurações de proteção
    ups.auto_redirect,
    ups.visual_interference,
    ups.replace_images,
    ups.fix_checkout_links,
    ups.redirect_links,
    
    -- Métricas de proteção
    (SELECT COUNT(*) FROM clone_attempts ca WHERE ca.original_domain_id = d.id) as total_clone_attempts,
    (SELECT COUNT(*) FROM clone_attempts ca WHERE ca.original_domain_id = d.id AND ca.timestamp >= CURRENT_DATE - INTERVAL '7 days') as clone_attempts_last_7_days,
    (SELECT COUNT(*) FROM clone_attempts ca WHERE ca.original_domain_id = d.id AND ca.is_blocked = true) as total_blocked_attempts,
    
    -- Último clone detectado
    (SELECT MAX(timestamp) FROM clone_attempts ca WHERE ca.original_domain_id = d.id) as last_clone_detected,
    (SELECT clone_domain FROM clone_attempts ca WHERE ca.original_domain_id = d.id ORDER BY timestamp DESC LIMIT 1) as last_clone_domain

FROM domains d
JOIN clients c ON d.client_id = c.id
LEFT JOIN user_protection_settings ups ON d.id = ups.domain_id
WHERE d.status != 'deleted';

-- View: Financial Reporting
CREATE OR REPLACE VIEW financial_reporting AS
SELECT 
    DATE_TRUNC('month', i.invoice_date) as month,
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE i.status = 'paid') as paid_invoices,
    COUNT(*) FILTER (WHERE i.status = 'open') as open_invoices,
    COUNT(*) FILTER (WHERE i.status = 'uncollectible') as failed_invoices,
    
    SUM(i.amount_due) as total_billed,
    SUM(i.amount_paid) as total_collected,
    SUM(i.amount_due - i.amount_paid) as outstanding_amount,
    
    -- Taxa de cobrança
    ROUND(
        (SUM(i.amount_paid) / NULLIF(SUM(i.amount_due), 0) * 100)::numeric, 2
    ) as collection_rate_percentage,
    
    -- Receita por plano
    json_object_agg(
        p.display_name, 
        SUM(i.amount_paid) FILTER (WHERE s.plan_id = p.id)
    ) as revenue_by_plan

FROM invoices i
LEFT JOIN subscriptions s ON i.subscription_id = s.id
LEFT JOIN plans p ON s.plan_id = p.id
WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', i.invoice_date)
ORDER BY month DESC;

-- View: Real-time Dashboard
CREATE OR REPLACE VIEW real_time_dashboard AS
SELECT 
    -- Atividade nas últimas 24 horas
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '24 hours') as clone_attempts_24h,
    (SELECT COUNT(*) FROM clone_attempts WHERE timestamp >= NOW() - INTERVAL '1 hour') as clone_attempts_1h,
    (SELECT COUNT(*) FROM script_executions WHERE execution_time >= NOW() - INTERVAL '24 hours') as script_executions_24h,
    
    -- Últimas atividades
    (SELECT json_agg(
        json_build_object(
            'domain', ca.clone_domain,
            'original', ca.original_domain,
            'timestamp', ca.timestamp,
            'country', ca.country_code,
            'blocked', ca.is_blocked
        ) ORDER BY ca.timestamp DESC
    ) FROM (
        SELECT * FROM clone_attempts 
        WHERE timestamp >= NOW() - INTERVAL '24 hours' 
        ORDER BY timestamp DESC 
        LIMIT 10
    ) ca) as recent_clone_attempts,
    
    -- Status do sistema
    (SELECT COUNT(*) FROM domains WHERE status = 'active') as active_domains,
    (SELECT COUNT(*) FROM scripts WHERE is_active = true) as active_scripts,
    (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
    
    -- Alertas
    (SELECT COUNT(*) FROM logs WHERE log_level IN ('error', 'critical') AND timestamp >= NOW() - INTERVAL '1 hour') as recent_errors;

-- Mensagem de sucesso
SELECT 'Views de analytics criadas com sucesso!' as status;
