-- SAFE ENTERPRISE PAYROLL CUSTOM SALARY STRUCTURE MIGRATION
-- PHASE 1 & 8: DATABASE EXTENSION & AUDIT INFRASTRUCTURE

-- 1. Extend Employees Table with Enterprise Payroll Columns
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS salary_structure_type VARCHAR(30) 
DEFAULT 'AUTO_DERIVED' 
CHECK (salary_structure_type IN ('AUTO_DERIVED', 'CUSTOM_ENTERPRISE'));

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS monthly_gross_salary NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS annual_ctc NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS basic_salary_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS hra_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS special_allowance_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS pf_employee_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS pf_employer_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS gratuity_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS variable_pay_component NUMERIC(15,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS payroll_status VARCHAR(30) 
DEFAULT 'INCOMPLETE' 
CHECK (payroll_status IN ('READY', 'INCOMPLETE', 'REVIEW_REQUIRED'));

-- 2. Create Statutory & Bank Profiles (Supporting Phase 5)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10),
ADD COLUMN IF NOT EXISTS uan_number VARCHAR(12),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(30),
ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);

-- 3. Create Audit Logs for Salary Configuration (Phase 8)
CREATE TABLE IF NOT EXISTS employee_salary_config_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    performed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS for Audit Logs
ALTER TABLE employee_salary_config_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_employees_payroll_status ON employees(payroll_status);
CREATE INDEX IF NOT EXISTS idx_employee_salary_config_logs_emp ON employee_salary_config_logs(employee_id);

-- 6. Trigger for Salary Logging (Optional/Automated via Backend if preferred)
-- We will handle logging in the backend for more granular control, but the table is ready.
