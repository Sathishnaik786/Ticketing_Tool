-- SAFE ENTERPRISE PAYSLIP TEMPLATE GOVERNANCE SCHEMA
-- PHASE 1: TEMPLATE & VERSION CONTROL INFRASTRUCTURE

-- 1. Create payslip_templates table
CREATE TABLE IF NOT EXISTS payslip_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    organization_name VARCHAR(150) DEFAULT 'YVI Enterprise EMS',
    logo_url TEXT,
    company_address TEXT DEFAULT '123 Enterprise Corporate Boulevard, Tech Park, Suite 400',
    footer_text TEXT DEFAULT 'This is a computer-generated document and does not require a physical signature.',
    watermark_text VARCHAR(50) DEFAULT 'CONFIDENTIAL',
    theme_colors JSONB DEFAULT '{"primary": "#0f172a", "secondary": "#475569", "accent": "#10b981"}'::jsonb,
    font_family VARCHAR(50) DEFAULT 'Inter',
    bank_section_enabled BOOLEAN DEFAULT TRUE,
    statutory_section_enabled BOOLEAN DEFAULT TRUE,
    signature_enabled BOOLEAN DEFAULT TRUE,
    qr_verification_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT FALSE,
    version_number INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payslip_document_versions table
CREATE TABLE IF NOT EXISTS payslip_document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_payslip_document_id UUID REFERENCES employee_payslip_documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    pdf_url TEXT NOT NULL,
    pdf_hash VARCHAR(255),
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replaced_at TIMESTAMP WITH TIME ZONE,
    reason_for_regeneration TEXT,
    previous_document_version_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add Indexes for template resolution performance
CREATE INDEX IF NOT EXISTS idx_payslip_templates_active ON payslip_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_payslip_doc_versions_doc_id ON payslip_document_versions(employee_payslip_document_id);

-- 4. Enable RLS
ALTER TABLE payslip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_document_versions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Admins/HR can manage templates" ON payslip_templates;
CREATE POLICY "Admins/HR can manage templates" ON payslip_templates 
FOR ALL USING (true);

DROP POLICY IF EXISTS "Employees can view active templates" ON payslip_templates;
CREATE POLICY "Employees can view active templates" ON payslip_templates 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins/HR can manage document versions" ON payslip_document_versions;
CREATE POLICY "Admins/HR can manage document versions" ON payslip_document_versions 
FOR ALL USING (true);

DROP POLICY IF EXISTS "Employees can view own document versions" ON payslip_document_versions;
CREATE POLICY "Employees can view own document versions" ON payslip_document_versions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employee_payslip_documents epd
    JOIN employees e ON e.id = epd.employee_id
    WHERE epd.id = payslip_document_versions.employee_payslip_document_id
    AND e.user_id = auth.uid()
  )
);

-- 6. Insert Default Active Template if none exists
INSERT INTO payslip_templates (
    template_name,
    organization_name,
    company_address,
    is_active,
    version_number
) 
SELECT 
    'Standard Corporate Blueprint', 
    'YVI Enterprise EMS', 
    '123 Enterprise Corporate Boulevard, Tech Park, Suite 400',
    TRUE,
    1
WHERE NOT EXISTS (SELECT 1 FROM payslip_templates WHERE is_active = TRUE);
