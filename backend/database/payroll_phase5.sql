-- Payroll Module Schema - Phase 5 (Finance & Accounting)

-- 1. Ledger Accounts (Chart of Accounts for Payroll)
CREATE TABLE IF NOT EXISTS payroll_ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    account_code VARCHAR UNIQUE NOT NULL,
    account_name VARCHAR NOT NULL,
    account_type VARCHAR NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EXPENSE', 'INCOME', 'PAYABLE')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Component to GL Mapping
CREATE TABLE IF NOT EXISTS payroll_component_ledger_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    component_id UUID REFERENCES salary_components(id) ON DELETE CASCADE,
    debit_account_id UUID REFERENCES payroll_ledger_accounts(id),
    credit_account_id UUID REFERENCES payroll_ledger_accounts(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Journal Entry Headers
CREATE TABLE IF NOT EXISTS payroll_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    journal_number VARCHAR UNIQUE NOT NULL,
    posting_date DATE NOT NULL,
    journal_status VARCHAR DEFAULT 'DRAFT' CHECK (journal_status IN ('DRAFT', 'POSTED', 'REVERSED')),
    total_debit NUMERIC(15, 2) DEFAULT 0,
    total_credit NUMERIC(15, 2) DEFAULT 0,
    posted_by UUID REFERENCES public.users(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Journal Entry Lines (Double Entry)
CREATE TABLE IF NOT EXISTS payroll_journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES payroll_journal_entries(id) ON DELETE CASCADE,
    ledger_account_id UUID REFERENCES payroll_ledger_accounts(id),
    entry_type VARCHAR NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    description TEXT,
    debit_amount NUMERIC(15, 2) DEFAULT 0,
    credit_amount NUMERIC(15, 2) DEFAULT 0,
    cost_center_id UUID, -- Link to payroll_cost_centers
    department_id UUID, -- Link to departments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cost Centers
CREATE TABLE IF NOT EXISTS payroll_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    cost_center_code VARCHAR UNIQUE NOT NULL,
    cost_center_name VARCHAR NOT NULL,
    department_id UUID, -- Reference to existing departments
    allocation_percentage NUMERIC(5, 2) DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Salary Disbursements
CREATE TABLE IF NOT EXISTS payroll_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    bank_reference_no VARCHAR,
    payment_method VARCHAR DEFAULT 'BANK_TRANSFER',
    disbursement_status VARCHAR DEFAULT 'PENDING' CHECK (disbursement_status IN ('PENDING', 'SCHEDULED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED')),
    amount NUMERIC(15, 2) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Financial Reconciliations
CREATE TABLE IF NOT EXISTS payroll_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    reconciliation_status VARCHAR DEFAULT 'PENDING' CHECK (reconciliation_status IN ('PENDING', 'MATCHED', 'MISMATCHED')),
    expected_amount NUMERIC(15, 2) DEFAULT 0,
    actual_amount NUMERIC(15, 2) DEFAULT 0,
    difference_amount NUMERIC(15, 2) DEFAULT 0,
    remarks TEXT,
    reconciled_by UUID REFERENCES public.users(id),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ERP Exports
CREATE TABLE IF NOT EXISTS payroll_erp_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    export_type VARCHAR NOT NULL CHECK (export_type IN ('TALLY', 'SAP', 'ORACLE', 'CSV', 'EXCEL')),
    file_name VARCHAR NOT NULL,
    file_url TEXT,
    export_status VARCHAR DEFAULT 'COMPLETED',
    generated_by UUID REFERENCES public.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Finance Audit
CREATE TABLE IF NOT EXISTS payroll_finance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR NOT NULL,
    performed_by UUID REFERENCES public.users(id),
    old_state JSONB,
    new_state JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX idx_journal_lines_header ON payroll_journal_lines(journal_entry_id);
CREATE INDEX idx_disbursements_record ON payroll_disbursements(payroll_record_id);
CREATE INDEX idx_ledger_mapping_comp ON payroll_component_ledger_mapping(component_id);

-- Enable RLS
ALTER TABLE payroll_ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_component_ledger_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_erp_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_finance_audits ENABLE ROW LEVEL SECURITY;
