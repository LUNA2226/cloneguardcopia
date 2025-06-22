-- View para relatórios financeiros
CREATE OR REPLACE VIEW financial_reporting AS
SELECT 
    DATE_TRUNC('month', i.invoice_date) as billing_month,
    
    -- Métricas de faturamento
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE i.status = 'paid') as paid_invoices,
    COUNT(*) FILTER (WHERE i.status = 'open') as open_invoices,
    COUNT(*) FILTER (WHERE i.status = 'uncollectible') as uncollectible_invoices,
    
    -- Valores financeiros
    SUM(i.amount_due) as total_billed,
    SUM(i.amount_paid) as total_collected,
    SUM(i.amount_due - i.amount_paid) as outstanding_amount,
    
    -- Métricas por plano
    SUM(i.amount_due) FILTER (WHERE p.name = 'STARTER') as starter_revenue,
    SUM(i.amount_due) FILTER (WHERE p.name = 'PRO') as pro_revenue,
    SUM(i.amount_due) FILTER (WHERE p.name = 'ENTERPRISE') as enterprise_revenue,
    SUM(i.amount_due) FILTER (WHERE p.name = 'RETENTION') as retention_revenue,
    
    -- Distribuição de ciclos de cobrança
    SUM(i.amount_due) FILTER (WHERE s.billing_cycle = 'monthly') as monthly_revenue,
    SUM(i.amount_due) FILTER (WHERE s.billing_cycle = 'yearly') as yearly_revenue,
    
    -- Taxa de cobrança
    ROUND(
        SUM(i.amount_paid) / NULLIF(SUM(i.amount_due), 0) * 100, 2
    ) as collection_rate,
    
    -- Valor médio por fatura
    ROUND(AVG(i.amount_due), 2) as average_invoice_value,
    
    -- Tempo médio de pagamento
    ROUND(AVG(
        CASE 
            WHEN i.paid_date IS NOT NULL AND i.invoice_date IS NOT NULL
            THEN EXTRACT(DAYS FROM i.paid_date - i.invoice_date)
        END
    ), 1) as average_payment_days,
    
    -- Clientes únicos faturados
    COUNT(DISTINCT i.client_id) as unique_clients_billed

FROM invoices i
LEFT JOIN subscriptions s ON i.subscription_id = s.id
LEFT JOIN plans p ON s.plan_id = p.id
WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', i.invoice_date)
ORDER BY billing_month DESC;

COMMENT ON VIEW financial_reporting IS 'Relatórios financeiros mensais com métricas de faturamento e cobrança';
