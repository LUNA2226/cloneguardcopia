-- View para métricas de performance do sistema
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    DATE(l.timestamp) as metric_date,
    l.source,
    
    -- Métricas de performance
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE l.log_level = 'error') as error_count,
    COUNT(*) FILTER (WHERE l.log_level = 'warning') as warning_count,
    COUNT(*) FILTER (WHERE l.response_status >= 500) as server_errors,
    COUNT(*) FILTER (WHERE l.response_status >= 400 AND l.response_status < 500) as client_errors,
    COUNT(*) FILTER (WHERE l.response_status >= 200 AND l.response_status < 300) as successful_requests,
    
    -- Tempos de resposta
    ROUND(AVG(l.execution_time_ms), 2) as avg_response_time_ms,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.execution_time_ms), 2) as median_response_time_ms,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY l.execution_time_ms), 2) as p95_response_time_ms,
    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY l.execution_time_ms), 2) as p99_response_time_ms,
    MAX(l.execution_time_ms) as max_response_time_ms,
    
    -- Taxa de erro
    ROUND(
        COUNT(*) FILTER (WHERE l.log_level = 'error')::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as error_rate_percentage,
    
    -- Taxa de sucesso
    ROUND(
        COUNT(*) FILTER (WHERE l.response_status >= 200 AND l.response_status < 300)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as success_rate_percentage,
    
    -- Distribuição por método HTTP
    COUNT(*) FILTER (WHERE l.request_method = 'GET') as get_requests,
    COUNT(*) FILTER (WHERE l.request_method = 'POST') as post_requests,
    COUNT(*) FILTER (WHERE l.request_method = 'PUT') as put_requests,
    COUNT(*) FILTER (WHERE l.request_method = 'DELETE') as delete_requests,
    
    -- IPs únicos
    COUNT(DISTINCT l.ip_address) as unique_ips

FROM logs l
WHERE l.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    AND l.execution_time_ms IS NOT NULL
GROUP BY DATE(l.timestamp), l.source
ORDER BY metric_date DESC, total_requests DESC;

COMMENT ON VIEW performance_metrics IS 'Métricas de performance e saúde do sistema';
