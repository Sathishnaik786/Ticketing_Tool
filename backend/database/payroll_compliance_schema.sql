-- PHASE-3: Statutory Compliance, Tax Intelligence & Government Reporting

-- 1. Create employee_tax_profiles table
CREATE TABLE IF NOT EXISTS employee_tax_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    
    selected_regime VARCHAR DEFAULT 'NEW_REGIME' CHECK (selected_regime IN ('OLD_REGIME', 'NEW_REGIME')),
    pan_number VARCHAR(10) UNIQUE,
    aadhaar_number VARCHAR(12) UNIQUE,
    
    annual_taxable_income NUMERIC(15, 2) DEFAULT 0,
    projected_tax_liability NUMERIC(15, 2) DEFAULT 0,
    tds_deducted_ytd NUMERIC(15, 2) DEFAULT 0,
    
    declaration_status VARCHAR DEFAULT 'PENDING' CHECK (declaration_status IN ('PENDING', 'SUBMITTED', 'VERIFIED', 'REOPENED')),
    verification_status VARCHAR DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REJECTED')),
    
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create investment_declarations table
CREATE TABLE IF NOT EXISTS investment_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL, -- e.g., '2024-25'
    
    section_80c NUMERIC(15, 2) DEFAULT 0,
    section_80d NUMERIC(15, 2) DEFAULT 0,
    section_80g NUMERIC(15, 2) DEFAULT 0,
    section_24b NUMERIC(15, 2) DEFAULT 0, -- Housing Loan Interest
    hra_paid NUMERIC(15, 2) DEFAULT 0,
    nps_contribution NUMERIC(15, 2) DEFAULT 0,
    
    declaration_json JSONB DEFAULT '{}'::jsonb, -- Store detailed breakdowns
    
    status VARCHAR DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create employee_pf_profiles table
CREATE TABLE IF NOT EXISTS employee_pf_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    
    uan VARCHAR(20) UNIQUE,
    pf_eligible BOOLEAN DEFAULT TRUE,
    voluntary_pf_rate NUMERIC(5, 2) DEFAULT 0, -- VPF percentage
    
    pf_wage_ceiling_applicable BOOLEAN DEFAULT TRUE, -- Cap at 15k or actual
    employer_pf_contribution BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create employee_esi_profiles table
CREATE TABLE IF NOT EXISTS employee_esi_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    
    esi_number VARCHAR(20) UNIQUE,
    esi_eligible BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create payroll_compliance_audits table
CREATE TABLE IF NOT EXISTS payroll_compliance_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    
    audit_type VARCHAR NOT NULL, -- 'TAX_REGIME_CHANGE', 'INVESTMENT_APPROVAL', 'PF_REVISION'
    severity VARCHAR DEFAULT 'LOW',
    
    description TEXT,
    old_state JSONB,
    new_state JSONB,
    
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_tax_regime ON employee_tax_profiles(selected_regime);
CREATE INDEX IF NOT EXISTS idx_investment_status ON investment_declarations(status);
CREATE INDEX IF NOT EXISTS idx_pf_uan ON employee_pf_profiles(uan);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_type ON payroll_compliance_audits(audit_type);

-- 7. RLS Policies
ALTER TABLE employee_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_pf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_esi_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own tax profile" ON employee_tax_profiles FOR SELECT USING (auth.uid() = (SELECT user_id FROM employees WHERE id = employee_id));
CREATE POLICY "Employees can manage own declarations" ON investment_declarations FOR ALL USING (auth.uid() = (SELECT user_id FROM employees WHERE id = employee_id));
