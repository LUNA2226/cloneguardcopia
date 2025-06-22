CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Comentários
COMMENT ON TABLE invoice_items IS 'Itens individuais de cada fatura';
COMMENT ON COLUMN invoice_items.invoice_id IS 'Referência à fatura';
COMMENT ON COLUMN invoice_items.description IS 'Descrição do item';
COMMENT ON COLUMN invoice_items.quantity IS 'Quantidade';
COMMENT ON COLUMN invoice_items.unit_price IS 'Preço unitário';
COMMENT ON COLUMN invoice_items.amount IS 'Valor total do item';
COMMENT ON COLUMN invoice_items.discount_amount IS 'Valor do desconto';
COMMENT ON COLUMN invoice_items.tax_amount IS 'Valor do imposto';
COMMENT ON COLUMN invoice_items.period_start IS 'Data de início do período de serviço';
COMMENT ON COLUMN invoice_items.period_end IS 'Data de término do período de serviço';
COMMENT ON COLUMN invoice_items.metadata IS 'Dados adicionais do item em formato JSON';
