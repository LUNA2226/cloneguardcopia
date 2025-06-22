-- Script para inserir dados padrão
-- Execute após criar todas as tabelas

-- Inserir planos padrão
INSERT INTO plans (name, display_name, description, monthly_price, yearly_price, max_domains, features, stripe_monthly_price_id, stripe_yearly_price_id, sort_order)
VALUES 
('STARTER', 'Starter', 'Ideal para pequenos negócios e profissionais', 99, 79, 3, 
 '{"protection_basic": true, "real_time_detection": true, "notifications": true, "support_24_7": true}'::jsonb,
 'price_starter_monthly', 'price_starter_yearly', 10),
 
('PRO', 'Pro', 'Perfeito para empresas em crescimento', 299, 239, 25, 
 '{"protection_basic": true, "protection_advanced": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true}'::jsonb,
 'price_pro_monthly', 'price_pro_yearly', 20),
 
('ENTERPRISE', 'Enterprise', 'Para grandes empresas com necessidades específicas', 499, 399, 100, 
 '{"protection_basic": true, "protection_advanced": true, "protection_multi_layer": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true, "custom_domain": true}'::jsonb,
 'price_enterprise_monthly', 'price_enterprise_yearly', 30),
 
('RETENTION', 'Oferta Especial', 'Oferta especial de retenção', 149, 119, 25, 
 '{"protection_basic": true, "protection_advanced": true, "real_time_detection": true, "notifications": true, "priority_support": true, "google_analytics": true}'::jsonb,
 'price_retention_monthly', 'price_retention_yearly', 15)
ON CONFLICT (name) DO NOTHING;

-- Inserir templates de notificação padrão
INSERT INTO notification_templates (name, description, notification_type, subject_template, content_template, variables)
VALUES 
('clone_detected', 'Notificação de detecção de clone', 'email', 
 '🚨 Clone Detectado: {{clone_domain}}', 
 '<h1>Clone Detectado</h1><p>Olá {{client_name}},</p><p>Detectamos um clone do seu site {{original_domain}} em <strong>{{clone_domain}}</strong>.</p><p>Ações tomadas: {{actions_taken}}</p><p>Acesse seu painel para mais detalhes.</p>', 
 '["client_name", "original_domain", "clone_domain", "actions_taken"]'::jsonb),
 
('subscription_renewal', 'Lembrete de renovação de assinatura', 'email', 
 'Sua assinatura CloneGuard será renovada em breve', 
 '<h1>Renovação de Assinatura</h1><p>Olá {{client_name}},</p><p>Sua assinatura do plano {{plan_name}} será renovada em {{renewal_date}}.</p><p>Valor: R$ {{renewal_amount}}</p>', 
 '["client_name", "plan_name", "renewal_date", "renewal_amount"]'::jsonb),
 
('domain_verification', 'Instruções de verificação de domínio', 'email', 
 'Verifique seu domínio no CloneGuard', 
 '<h1>Verificação de Domínio</h1><p>Olá {{client_name}},</p><p>Para verificar seu domínio {{domain_name}}, adicione o seguinte registro TXT ao seu DNS:</p><p><code>{{verification_token}}</code></p>', 
 '["client_name", "domain_name", "verification_token"]'::jsonb),

('welcome_email', 'Email de boas-vindas', 'email',
 'Bem-vindo ao CloneGuard! 🛡️',
 '<h1>Bem-vindo ao CloneGuard!</h1><p>Olá {{client_name}},</p><p>Obrigado por se juntar ao CloneGuard! Sua conta foi criada com sucesso.</p><p>Próximos passos:</p><ul><li>Adicione seu primeiro domínio</li><li>Configure suas proteções</li><li>Instale o script de proteção</li></ul><p>Se precisar de ajuda, nossa equipe está aqui para você!</p>',
 '["client_name"]'::jsonb),

('subscription_expired', 'Assinatura expirada', 'email',
 'Sua assinatura CloneGuard expirou',
 '<h1>Assinatura Expirada</h1><p>Olá {{client_name}},</p><p>Sua assinatura do plano {{plan_name}} expirou em {{expiry_date}}.</p><p>Para continuar protegendo seus domínios, renove sua assinatura agora.</p><p><a href="{{renewal_link}}">Renovar Assinatura</a></p>',
 '["client_name", "plan_name", "expiry_date", "renewal_link"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Mensagem de sucesso
SELECT 'Dados padrão inseridos com sucesso!' as status;
