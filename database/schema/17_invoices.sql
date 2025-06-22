CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    invoice_number VARCHAR(100) UNIQUE,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
    billing_reason VARCHAR(50),
    invoice_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_method_details JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_invoices_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentários
COMMENT ON TABLE invoices IS 'Faturas geradas para os clientes';
COMMENT ON COLUMN invoices.client_id IS 'Referência ao cliente';
COMMENT ON COLUMN invoices.subscription_id IS 'Referência à assinatura relacionada';
COMMENT ON COLUMN invoices.stripe_invoice_id IS 'ID da fatura no Stripe';
COMMENT ON COLUMN invoices.invoice_number IS 'Número da fatura';
COMMENT ON COLUMN invoices.amount_due IS 'Valor total devido';
COMMENT ON COLUMN invoices.amount_paid IS 'Valor pago';
COMMENT ON COLUMN invoices.currency IS 'Moeda da fatura';
COMMENT ON COLUMN invoices.status IS 'Status da fatura';
COMMENT ON COLUMN invoices.billing_reason IS 'Motivo da cobrança';
COMMENT ON COLUMN invoices.invoice_date IS 'Data de emissão da fatura';
COMMENT ON COLUMN invoices.due_date IS 'Data de vencimento';
COMMENT ON COLUMN invoices.paid_date IS 'Data de pagamento';
COMMENT ON COLUMN invoices.billing_address IS 'Endereço de cobrança em formato JSON';
COMMENT ON COLUMN invoices.payment_method IS 'Método de pagamento';
COMMENT ON COLUMN invoices.payment_method_details IS 'Detalhes do método de pagamento em formato JSON';
COMMENT ON COLUMN invoices.pdf_url IS 'URL para o PDF da fatura';
COMMENT ON COLUMN invoices.metadata IS 'Dados adicionais da fatura em formato JSON';
