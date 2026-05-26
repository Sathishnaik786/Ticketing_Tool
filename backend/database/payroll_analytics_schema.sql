-- PHASE-5: Analytics, Workforce Cost Intelligence & Executive Finance Command Center

-- 1. Create payroll_analytics_snapshots table
CREATE TABLE IF NOT EXISTS payroll_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_type VARCHAR NOT NULL CHECK (snapshot_type IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
    period_key VARCHAR(20) NOT NULL, -- e.g., '2024-05', '2024-Q1'
    
    total_gross_payroll NUMERIC(15, 2) DEFAULT 0,
    total_net_payout NUMERIC(15, 2) DEFAULT 0,
    total_tax_liability NUMERIC(15, 2) DEFAULT 0,
    total_statutory_liability NUMERIC(15, 2) DEFAULT 0,
    
    employee_count INT DEFAULT 0,
    average_salary NUMERIC(15, 2) DEFAULT 0,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create department_payroll_metrics table
CREATE TABLE IF NOT EXISTS department_payroll_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES payroll_analytics_snapshots(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    
    total_cost NUMERIC(15, 2) DEFAULT 0,
    headcount INT DEFAULT 0,
    overtime_cost NUMERIC(15, 2) DEFAULT 0,
    incentive_cost NUMERIC(15, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payroll_forecasts table
CREATE TABLE IF NOT EXISTS payroll_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_type VARCHAR NOT NULL, -- 'TREASURY_OUTFLOW', 'TAX_LIABILITY', 'SALARY_GROWTH'
    target_period VARCHAR(20) NOT NULL,
    
    projected_amount NUMERIC(15, 2) NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 0, -- 0 to 100
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create payroll_executive_alerts table
CREATE TABLE IF NOT EXISTS payroll_executive_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR NOT NULL, -- 'BURN_SPIKE', 'COMPLIANCE_RISK', 'TREASURY_ANOMALY'
    severity VARCHAR DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    title TEXT NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_period ON payroll_analytics_snapshots(period_key);
CREATE INDEX IF NOT EXISTS idx_dept_metrics_snapshot ON department_payroll_metrics(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_forecast_type ON payroll_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_exec_alert_severity ON payroll_executive_alerts(severity);

-- 6. RLS Policies
ALTER TABLE payroll_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_payroll_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_executive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Finance can view analytics" ON payroll_analytics_snapshots FOR SELECT USING (true);
CREATE POLICY "Admins and Finance can view alerts" ON payroll_executive_alerts FOR SELECT USING (true);
