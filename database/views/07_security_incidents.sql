-- View para análise de incidentes de segurança
CREATE OR REPLACE VIEW security_incidents AS
SELECT 
    DATE(ca.timestamp) as incident_date,
    ca.original_domain,
    ca.clone_domain,
    d.client_id,
    c.name as client_name,
    
    -- Detalhes do incidente
    ca.ip_address,
    ca.country_code,
    ca.city,
    ca.browser,
    ca.device_type,
    ca.operating_system,
    
    -- Classificação de risco
    CASE 
        WHEN ca.actions_taken::text LIKE '%block%' THEN 'HIGH'
        WHEN ca.actions_taken::text LIKE '%sabotage%' THEN 'MEDIUM'
        WHEN ca.actions_taken::text LIKE '%redirect%' THEN 'LOW'
        ELSE 'UNKNOWN'
    END as risk_level,
    
    -- Ações tomadas
    ca.actions_taken,
    ca.is_blocked,
    
    -- Contexto adicional
    ca.referrer,
    ca.url as clone_url,
    ca.timestamp as incident_time,
    
    -- Frequência do IP
    COUNT(*) OVER (PARTITION BY ca.ip_address) as ip_frequency,
    
    -- Frequência do domínio clone
    COUNT(*) OVER (PARTITION BY ca.clone_domain) as clone_domain_frequency,
    
    -- Primeira ocorrência deste clone
    MIN(ca.timestamp) OVER (PARTITION BY ca.clone_domain) as first_seen,
    
    -- Última ocorrência deste clone
    MAX(ca.timestamp) OVER (PARTITION BY ca.clone_domain) as last_seen

FROM clone_attempts ca
JOIN domains d ON ca.original_domain_id = d.id
JOIN clients c ON d.client_id = c.id
WHERE ca.timestamp >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY ca.timestamp DESC, risk_level DESC;

COMMENT ON VIEW security_incidents IS 'Análise detalhada de incidentes de segurança e tentativas de clonagem';
