-- View para métricas de assinaturas e receita
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT 
    DATE_TRUNC('month', s.created_at) as month,
    
    -- Métricas de assinaturas
    COUNT(*) as new_subscriptions,
    COUNT(*) FILTER (WHERE s.status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE s.status = 'canceled') as canceled_subscriptions,
    COUNT(*) FILTER (WHERE s.trial_end IS NOT NULL AND s.trial_end > CURRENT_TIMESTAMP) as trial_subscriptions,
    
    -- Métricas por plano
    COUNT(*) FILTER (WHERE p.name = 'STARTER') as starter_subscriptions,
    COUNT(*) FILTER (WHERE p.name = 'PRO') as pro_subscriptions,
    COUNT(*) FILTER (WHERE p.name = 'ENTERPRISE') as enterprise_subscriptions,
    COUNT(*) FILTER (WHERE p.name = 'RETENTION') as retention_subscriptions,
    
    -- Métricas de receita
    SUM(CASE 
        WHEN s.billing_cycle = 'monthly' THEN p.monthly_price
        WHEN s.billing_cycle = 'yearly' THEN p.yearly_price / 12
    END) as monthly_recurring_revenue,
    
    SUM(CASE 
        WHEN s.billing_cycle = 'yearly' THEN p.yearly_price
        WHEN s.billing_cycle = 'monthly' THEN p.monthly_price * 12
    END) as annual_contract_value,
    
    -- Distribuição de ciclos de cobrança
    COUNT(*) FILTER (WHERE s.billing_cycle = 'monthly') as monthly_billing,
    COUNT(*) FILTER (WHERE s.billing_cycle = 'yearly') as yearly_billing,
    
    -- Taxa de conversão de trial
    CASE 
        WHEN COUNT(*) FILTER (WHERE s.trial_end IS NOT NULL) > 0
        THEN ROUND(
            COUNT(*) FILTER (WHERE s.trial_end IS NOT NULL AND s.status = 'active')::numeric /
            COUNT(*) FILTER (WHERE s.trial_end IS NOT NULL)::numeric * 100, 2
        )
        ELSE 0
    END as trial_conversion_rate,
    
    -- Valor médio por usuário
    ROUND(AVG(CASE 
        WHEN s.billing_cycle = 'monthly' THEN p.monthly_price
        WHEN s.billing_cycle = 'yearly' THEN p.yearly_price / 12
    END), 2) as average_revenue_per_user

FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;

COMMENT ON VIEW subscription_metrics IS 'Métricas mensais de assinaturas, receita e conversão';
