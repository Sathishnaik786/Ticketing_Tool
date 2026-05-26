-- PHASE-4: Payroll Identity Standardization
-- Objective: Establish deterministic identity keys for error-free mapping

-- 1. Add payroll standardization columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS normalized_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS normalized_department VARCHAR(100),
ADD COLUMN IF NOT EXISTS normalized_designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS payroll_identity_key VARCHAR(500) UNIQUE,
ADD COLUMN IF NOT EXISTS payroll_eligible BOOLEAN DEFAULT TRUE;

-- 2. Create indexes for identity resolution performance
CREATE INDEX IF NOT EXISTS idx_employees_code_unique ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_payroll_key_unique ON employees(payroll_identity_key);
CREATE INDEX IF NOT EXISTS idx_employees_normalized_name ON employees(normalized_full_name);

-- 3. Add comment for governance
COMMENT ON COLUMN employees.employee_code IS 'Enterprise-safe payroll mapping key (e.g., YVI001)';
COMMENT ON COLUMN employees.payroll_identity_key IS 'Canonical resolution key: CODE|NORMALIZED_NAME';

-- 4. Create sequence for employee code generation if not exists
CREATE SEQUENCE IF NOT EXISTS employee_code_seq START 1;
