-- Payroll Module Schema - Phase 1

-- 1. Salary Components
CREATE TABLE salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    component_category VARCHAR NOT NULL CHECK (component_category IN ('EARNING', 'DEDUCTION', 'CONTRIBUTION')),
    calculation_type VARCHAR NOT NULL CHECK (calculation_type IN ('FIXED', 'FORMULA', 'PERCENTAGE')),
    formula TEXT,
    taxable BOOLEAN DEFAULT FALSE,
    affects_gross BOOLEAN DEFAULT TRUE,
    affects_net BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Salary Structures
CREATE TABLE salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Salary Structure Components (Mapping table)
CREATE TABLE salary_structure_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_structure_id UUID REFERENCES salary_structures(id) ON DELETE CASCADE,
    component_id UUID REFERENCES salary_components(id) ON DELETE CASCADE,
    sequence_order INT DEFAULT 0,
    formula_override TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    UNIQUE(salary_structure_id, component_id)
);

-- 4. Employee Salary Assignments
CREATE TABLE employee_salary_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id UUID REFERENCES salary_structures(id),
    annual_ctc NUMERIC(15, 2) NOT NULL,
    monthly_ctc NUMERIC(15, 2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payroll Settings
CREATE TABLE payroll_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payroll Audit Logs
CREATE TABLE payroll_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_salary_components_category ON salary_components(component_category);
CREATE INDEX idx_employee_salary_assignments_employee ON employee_salary_assignments(employee_id);
CREATE INDEX idx_employee_salary_assignments_status ON employee_salary_assignments(status);
CREATE INDEX idx_payroll_audit_logs_entity ON payroll_audit_logs(entity_type, entity_id);

-- Triggers for updated_at
CREATE TRIGGER trg_salary_components_updated BEFORE UPDATE ON salary_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_salary_structures_updated BEFORE UPDATE ON salary_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_employee_salary_assignments_updated BEFORE UPDATE ON employee_salary_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payroll_settings_updated BEFORE UPDATE ON payroll_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salary_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_audit_logs ENABLE ROW LEVEL SECURITY;

-- Initial Seed for common components (Optional but helpful for enterprise foundation)
INSERT INTO salary_components (code, name, component_category, calculation_type, formula, display_order) VALUES
('BASIC', 'Basic Salary', 'EARNING', 'PERCENTAGE', 'CTC * 0.4', 1),
('HRA', 'House Rent Allowance', 'EARNING', 'PERCENTAGE', 'BASIC * 0.5', 2),
('CA', 'Conveyance Allowance', 'EARNING', 'FIXED', NULL, 3),
('MA', 'Medical Allowance', 'EARNING', 'FIXED', NULL, 4),
('SA', 'Special Allowance', 'EARNING', 'FORMULA', 'gross - (BASIC + HRA + CA + MA)', 5),
('PF_EE', 'Provident Fund (Employee)', 'DEDUCTION', 'PERCENTAGE', 'BASIC * 0.12', 10),
('PT', 'Professional Tax', 'DEDUCTION', 'FIXED', NULL, 11);

-- Default Settings
INSERT INTO payroll_settings (setting_key, setting_value) VALUES
('payroll_cycle', '{"start_day": 1, "end_day": 31, "payout_day": 5}'),
('currency', '{"code": "INR", "symbol": "₹", "decimal_places": 2}'),
('rounding_rules', '{"method": "HALF_UP", "nearest": 1}');
