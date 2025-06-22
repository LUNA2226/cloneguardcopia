# Configuração do Stripe - Guia de Segurança

## ⚠️ IMPORTANTE: Segurança das Credenciais

### 🧪 Ambiente de Teste (Desenvolvimento)
- Use SEMPRE credenciais de teste (`sk_test_`, `pk_test_`)
- Credenciais de teste são seguras para desenvolvimento
- Não processam pagamentos reais

### 🚀 Ambiente de Produção
- **NUNCA** coloque credenciais de produção diretamente no código
- Use SEMPRE variáveis de ambiente
- Credenciais de produção começam com `sk_live_`, `pk_live_`

## Configuração Passo a Passo

### 1. Criar Conta no Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta
3. Ative o modo de teste

### 2. Obter Credenciais de Teste
1. No Dashboard do Stripe, vá em **Developers > API Keys**
2. Copie a **Secret Key** (sk_test_...)
3. Copie a **Publishable Key** (pk_test_...)

### 3. Criar Produtos e Preços
1. Vá em **Products** no Dashboard
2. Crie 3 produtos: STARTER, PRO, ENTERPRISE
3. Para cada produto, crie 2 preços:
   - Mensal (recurring monthly)
   - Anual (recurring yearly)
4. Copie os Price IDs (price_...)

### 4. Configurar Webhook
1. Vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/stripe/webhooks`
4. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Webhook Secret** (whsec_...)

### 5. Configurar Variáveis de Ambiente

#### Desenvolvimento (.env.local)
\`\`\`env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
# ... outras variáveis
\`\`\`

#### Produção (Vercel/Servidor)
1. **Vercel**: Project Settings > Environment Variables
2. **Outros**: Configure no painel do seu provedor
3. **NUNCA** commite credenciais de produção no git

## Validação de Segurança

O sistema inclui validações automáticas:

- ✅ Verifica formato das credenciais
- ✅ Detecta uso de credenciais de teste em produção
- ✅ Valida presença de todas as variáveis necessárias
- ✅ Logs de segurança no console

## Migração para Produção

### Quando estiver pronto para produção:

1. **Ative sua conta Stripe** (verificação de identidade)
2. **Obtenha credenciais live** (sk_live_, pk_live_)
3. **Recrie produtos e preços** no modo live
4. **Configure webhook** para produção
5. **Atualize variáveis de ambiente** com credenciais live
6. **Teste completamente** antes do lançamento

### Checklist de Segurança:
- [ ] Credenciais de produção estão em variáveis de ambiente
- [ ] Credenciais não estão no código fonte
- [ ] Webhook está configurado corretamente
- [ ] Todos os preços estão criados no modo live
- [ ] Testou fluxo completo em ambiente de staging

## Troubleshooting

### Erro: "Missing required Stripe environment variables"
- Verifique se todas as variáveis estão definidas
- Confirme que não há espaços extras nos valores

### Erro: "Invalid signature" no webhook
- Verifique se o STRIPE_WEBHOOK_SECRET está correto
- Confirme que a URL do webhook está acessível

### Erro: "No such price"
- Verifique se os Price IDs estão corretos
- Confirme que está usando IDs do ambiente correto (test/live)

## Suporte

Para dúvidas sobre configuração do Stripe:
- [Documentação oficial](https://stripe.com/docs)
- [Suporte Stripe](https://support.stripe.com)
