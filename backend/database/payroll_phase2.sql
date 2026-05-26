-- Payroll Module Schema - Phase 2 (Processing Engine)

-- 1. Payroll Cycles
CREATE TABLE IF NOT EXISTS payroll_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name VARCHAR NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'LOCKED')),
    is_locked BOOLEAN DEFAULT FALSE,
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year, cycle_name)
);

-- 2. Payroll Records (Employee-level results)
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    salary_assignment_id UUID REFERENCES employee_salary_assignments(id),
    
    gross_salary NUMERIC(15, 2) DEFAULT 0,
    total_earnings NUMERIC(15, 2) DEFAULT 0,
    total_deductions NUMERIC(15, 2) DEFAULT 0,
    net_salary NUMERIC(15, 2) DEFAULT 0,
    
    payable_days NUMERIC(5, 2) DEFAULT 0,
    lop_days NUMERIC(5, 2) DEFAULT 0,
    working_days NUMERIC(5, 2) DEFAULT 0,
    
    status VARCHAR NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED', 'LOCKED')),
    processing_error TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(payroll_cycle_id, employee_id)
);

-- 3. Payroll Component Values (Calculated breakdown)
CREATE TABLE IF NOT EXISTS payroll_component_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    component_id UUID REFERENCES salary_components(id),
    
    component_name VARCHAR NOT NULL,
    component_code VARCHAR NOT NULL,
    component_category VARCHAR NOT NULL,
    
    formula_snapshot TEXT,
    calculated_amount NUMERIC(15, 2) NOT NULL,
    sequence_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payroll Snapshots (Immutable archive)
CREATE TABLE IF NOT EXISTS payroll_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    
    salary_structure_snapshot JSONB NOT NULL,
    component_snapshot JSONB NOT NULL,
    formula_snapshot JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payroll Processing Logs
CREATE TABLE IF NOT EXISTS payroll_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    log_level VARCHAR NOT NULL, -- INFO, ERROR, WARN
    message TEXT NOT NULL,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_payroll_records_cycle ON payroll_records(payroll_cycle_id);
CREATE INDEX idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_component_values_record ON payroll_component_values(payroll_record_id);
CREATE INDEX idx_payroll_processing_logs_cycle ON payroll_processing_logs(payroll_cycle_id);

-- Triggers for updated_at
CREATE TRIGGER trg_payroll_cycles_updated BEFORE UPDATE ON payroll_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payroll_records_updated BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_component_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_processing_logs ENABLE ROW LEVEL SECURITY;
