-- ================================================
-- BMS 2025 - Schema Updates for Orders System
-- Created: 2026-01-02
-- ================================================

-- ============================================
-- 1. Add customer_type to customers table
-- ============================================
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'business'; -- 'private' or 'business'

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS id_number VARCHAR(20); -- ת.ז או ח.פ

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS payer_name VARCHAR(100); -- שם משלם

-- ============================================
-- 2. Update order_items to support free-text products
-- ============================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_description TEXT; -- תיאור מוצר טקסט חופשי

ALTER TABLE order_items 
ALTER COLUMN product_id DROP NOT NULL; -- עכשיו product_id הוא אופציונלי

-- ============================================
-- 3. Update orders table for print shop workflow
-- ============================================
ALTER TABLE orders 
ALTER COLUMN tax_percent SET DEFAULT 18; -- מע"מ 18%

-- ============================================
-- 4. Create sequences for auto-numbering (starting from 1001)
-- ============================================

-- Customers sequence
CREATE SEQUENCE IF NOT EXISTS customers_number_seq START WITH 1001;

-- Orders sequence
CREATE SEQUENCE IF NOT EXISTS orders_number_seq START WITH 1001;

-- Invoices sequence
CREATE SEQUENCE IF NOT EXISTS invoices_number_seq START WITH 1001;

-- ============================================
-- 5. Create WhatsApp message templates table
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(50) UNIQUE NOT NULL,
  template_text TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default template for new order
INSERT INTO whatsapp_templates (template_name, template_text, description)
VALUES (
  'new_order',
  'שלום {customer_name}, נפתחה הזמנה מספר {order_number}. תודה שבחרת בנו!',
  'הודעה אוטומטית בעת פתיחת הזמנה חדשה'
)
ON CONFLICT (template_name) DO NOTHING;

-- Default template with PDF
INSERT INTO whatsapp_templates (template_name, template_text, description)
VALUES (
  'order_with_pdf',
  'שלום {customer_name}, מצורפת אישור הזמנה מספר {order_number}',
  'הודעה עם קובץ PDF מצורף'
)
ON CONFLICT (template_name) DO NOTHING;

-- ============================================
-- 6. Create function to generate order number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('orders_number_seq');
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create function to generate customer code
-- ============================================
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('customers_number_seq');
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Create function to generate invoice number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('invoices_number_seq');
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Add RLS for new table
-- ============================================
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create it
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for service role" ON whatsapp_templates;
    CREATE POLICY "Allow all for service role" ON whatsapp_templates FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Policy already exists, ignore error
END $$;

-- ============================================
-- 10. Add trigger for whatsapp_templates updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_whatsapp_templates_updated_at ON whatsapp_templates;
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- End of Updates
-- ============================================
