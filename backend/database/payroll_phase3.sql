-- Payroll Module Schema - Phase 3 (Compliance & Payslips)

-- 1. Compliance Rules (Statutory configuration)
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID, -- Placeholder for multi-tenant support
    rule_code VARCHAR UNIQUE NOT NULL,
    rule_name VARCHAR NOT NULL,
    rule_type VARCHAR NOT NULL CHECK (rule_type IN ('PF', 'ESI', 'PT', 'TDS', 'GRATUITY', 'BONUS')),
    country_code VARCHAR DEFAULT 'IN',
    state_code VARCHAR,
    calculation_type VARCHAR NOT NULL CHECK (calculation_type IN ('FIXED', 'PERCENTAGE', 'FORMULA', 'SLAB')),
    formula TEXT,
    minimum_limit NUMERIC(15, 2) DEFAULT 0,
    maximum_limit NUMERIC(15, 2) DEFAULT 0,
    percentage_value NUMERIC(5, 2),
    fixed_amount NUMERIC(15, 2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tax Slabs
CREATE TABLE IF NOT EXISTS tax_slabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    regime_name VARCHAR NOT NULL, -- Old, New
    country_code VARCHAR DEFAULT 'IN',
    minimum_income NUMERIC(15, 2) NOT NULL,
    maximum_income NUMERIC(15, 2),
    tax_percentage NUMERIC(5, 2) NOT NULL,
    cess_percentage NUMERIC(5, 2) DEFAULT 4,
    surcharge_percentage NUMERIC(5, 2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employee Tax Profiles
CREATE TABLE IF NOT EXISTS employee_tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pan_number VARCHAR,
    aadhaar_number VARCHAR,
    tax_regime VARCHAR DEFAULT 'NEW' CHECK (tax_regime IN ('OLD', 'NEW')),
    declared_investments NUMERIC(15, 2) DEFAULT 0,
    other_income NUMERIC(15, 2) DEFAULT 0,
    tax_deductions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- 4. Statutory Deductions (Per Payroll Record)
CREATE TABLE IF NOT EXISTS statutory_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    deduction_type VARCHAR NOT NULL, -- PF, ESI, PT, TDS
    rule_snapshot JSONB NOT NULL,
    employee_amount NUMERIC(15, 2) DEFAULT 0,
    employer_amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Employer Contributions
CREATE TABLE IF NOT EXISTS employer_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    contribution_type VARCHAR NOT NULL, -- PF, ESI, LWF
    formula_snapshot JSONB NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payslips (Generated Documents)
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    payslip_number VARCHAR UNIQUE NOT NULL,
    file_url TEXT,
    file_name VARCHAR,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID REFERENCES public.users(id),
    is_signed BOOLEAN DEFAULT FALSE,
    document_hash VARCHAR,
    verification_token VARCHAR UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payroll Documents
CREATE TABLE IF NOT EXISTS payroll_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    document_type VARCHAR NOT NULL, -- PAYSLIP, TAX_FORM, SUMMARY
    document_name VARCHAR NOT NULL,
    document_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Yearly Payroll Summaries
CREATE TABLE IF NOT EXISTS yearly_payroll_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    financial_year VARCHAR NOT NULL, -- e.g. 2026-27
    total_earnings NUMERIC(15, 2) DEFAULT 0,
    total_deductions NUMERIC(15, 2) DEFAULT 0,
    total_tax NUMERIC(15, 2) DEFAULT 0,
    total_employer_contributions NUMERIC(15, 2) DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, financial_year)
);

-- Indices
CREATE INDEX idx_statutory_deductions_record ON statutory_deductions(payroll_record_id);
CREATE INDEX idx_employer_contributions_record ON employer_contributions(payroll_record_id);
CREATE INDEX idx_payslips_record ON payslips(payroll_record_id);
CREATE INDEX idx_payroll_documents_employee ON payroll_documents(employee_id);

-- Triggers for updated_at
CREATE TRIGGER trg_compliance_rules_updated BEFORE UPDATE ON compliance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_employee_tax_profiles_updated BEFORE UPDATE ON employee_tax_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutory_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_payroll_summaries ENABLE ROW LEVEL SECURITY;
