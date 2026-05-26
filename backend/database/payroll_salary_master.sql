-- Enterprise Payroll Salary Master Hardening
-- PHASE 1 & 2: Salary Structure & Normalization

-- 1. Add payroll status to employees to track readiness
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS payroll_status VARCHAR DEFAULT 'INCOMPLETE' 
CHECK (payroll_status IN ('INCOMPLETE', 'READY', 'ON_HOLD', 'TERMINATED'));

-- 2. Create a function to automatically calculate enterprise salary breakdown
-- Basic = 50%, HRA = 20%, Special Allowance = Remaining
CREATE OR REPLACE FUNCTION calculate_salary_breakdown(ctc NUMERIC)
RETURNS JSONB AS $$
DECLARE
    basic NUMERIC;
    hra NUMERIC;
    special NUMERIC;
BEGIN
    basic := ROUND((ctc * 0.5)::numeric, 2);
    hra := ROUND((ctc * 0.2)::numeric, 2);
    special := ROUND((ctc - basic - hra)::numeric, 2);
    
    RETURN jsonb_build_object(
        'basic', basic,
        'hra', hra,
        'special_allowance', special,
        'monthly_gross', ctc
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Update existing employees with salary to be READY
UPDATE employees 
SET payroll_status = 'READY' 
WHERE salary IS NOT NULL AND salary > 0;

-- 4. Create an audit table for salary changes (Institutional Security)
CREATE TABLE IF NOT EXISTS employee_salary_config_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    old_salary NUMERIC(15, 2),
    new_salary NUMERIC(15, 2),
    changed_by UUID REFERENCES public.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
