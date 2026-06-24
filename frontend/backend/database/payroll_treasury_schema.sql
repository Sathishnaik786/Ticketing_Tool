-- PHASE-4: Banking Integration & Treasury Operations

-- 1. Create employee_bank_accounts table
CREATE TABLE IF NOT EXISTS employee_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    account_holder_name VARCHAR(255) NOT NULL,
    account_number TEXT NOT NULL, -- To be encrypted/hashed if possible
    masked_account_number VARCHAR(20) NOT NULL, -- e.g., XXXXXX4582
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_type VARCHAR DEFAULT 'SAVINGS' CHECK (account_type IN ('SAVINGS', 'CURRENT')),
    
    is_primary BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'FAILED')),
    penny_drop_status VARCHAR DEFAULT 'NOT_STARTED' CHECK (penny_drop_status IN ('NOT_STARTED', 'INITIATED', 'SUCCESS', 'FAILED')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create salary_disbursement_batches table
CREATE TABLE IF NOT EXISTS salary_disbursement_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reconciliation_id UUID REFERENCES payroll_reconciliation_batches(id) ON DELETE CASCADE,
    
    batch_reference VARCHAR UNIQUE NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    employee_count INT NOT NULL,
    
    status VARCHAR DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'BANK_GENERATED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    
    maker_id UUID REFERENCES users(id),
    checker_id UUID REFERENCES users(id),
    treasury_releaser_id UUID REFERENCES users(id),
    
    approved_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create salary_disbursement_transactions table (Granular UTR tracking)
CREATE TABLE IF NOT EXISTS salary_disbursement_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES salary_disbursement_batches(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    amount NUMERIC(15, 2) NOT NULL,
    utr_number VARCHAR UNIQUE, -- Bank reference number
    
    status VARCHAR DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED')),
    failure_reason TEXT,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create treasury_audit_logs table
CREATE TABLE IF NOT EXISTS treasury_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES salary_disbursement_batches(id),
    action_type VARCHAR NOT NULL, -- 'BATCH_CREATED', 'APPROVED', 'RELEASED', 'REJECTED', 'UTR_UPDATED'
    
    performed_by UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add unique index for primary bank account per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_primary_bank_account ON employee_bank_accounts(employee_id) WHERE is_primary = TRUE;

-- 6. RLS Policies
ALTER TABLE employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_disbursement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_disbursement_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view/manage own bank accounts" ON employee_bank_accounts 
FOR ALL USING (auth.uid() = (SELECT user_id FROM employees WHERE id = employee_id));

CREATE POLICY "Treasury/Finance can view disbursement data" ON salary_disbursement_batches 
FOR ALL USING (true);
