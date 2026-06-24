-- RBAC SCHEMA FOR YVI_EWS APPLICATION
-- This schema defines the complete database structure with proper relationships

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table (identity management)
CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    role text DEFAULT 'EMPLOYEE'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_role_check CHECK (
        (role = ANY (ARRAY['ADMIN'::text, 'HR'::text, 'MANAGER'::text, 'EMPLOYEE'::text]))
    )
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees (id) ON DELETE SET NULL
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar text,
    department_id uuid,
    position text,
    salary numeric(15, 2),
    date_of_birth date,
    date_of_joining date,
    address text,
    city text,
    state text,
    country text,
    zip_code text,
    emergency_contact text,
    emergency_phone text,
    status text DEFAULT 'ACTIVE'::text,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role text DEFAULT 'EMPLOYEE'::text,
    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees (id) ON DELETE SET NULL,
    CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT employees_role_check CHECK (
        (role = ANY (ARRAY['ADMIN'::text, 'HR'::text, 'MANAGER'::text, 'EMPLOYEE'::text]))
    ),
    CONSTRAINT employees_status_check CHECK (
        (status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text, 'ON_LEAVE'::text, 'TERMINATED'::text]))
    )
);

-- Fix the departments table manager_id foreign key constraint after employees table is created
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_manager;
ALTER TABLE departments ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees (id) ON DELETE SET NULL;

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid,
    date date NOT NULL,
    check_in time without time zone,
    check_out time without time zone,
    status text DEFAULT 'PRESENT'::text,
    work_hours numeric(4, 2),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_pkey PRIMARY KEY (id),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date),
    CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT attendance_status_check CHECK (
        (status = ANY (ARRAY['PRESENT'::text, 'ABSENT'::text, 'HALF_DAY'::text, 'LATE'::text, 'ON_LEAVE'::text]))
    )
);

-- Leave Types table
CREATE TABLE IF NOT EXISTS leave_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    days_allowed integer NOT NULL,
    carry_forward boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT leave_types_pkey PRIMARY KEY (id)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid,
    leave_type_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text,
    status text DEFAULT 'PENDING'::text,
    approved_by uuid,
    comments text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT leaves_pkey PRIMARY KEY (id),
    CONSTRAINT leaves_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES employees (id) ON DELETE SET NULL,
    CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT leaves_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE CASCADE,
    CONSTRAINT check_leave_dates CHECK ((start_date <= end_date)),
    CONSTRAINT leaves_status_check CHECK (
        (status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'CANCELLED'::text]))
    )
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid,
    name text NOT NULL,
    type text DEFAULT 'OTHER'::text,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT documents_pkey PRIMARY KEY (id),
    CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES employees (id) ON DELETE SET NULL,
    CONSTRAINT documents_type_check CHECK (
        (type = ANY (ARRAY['ID_PROOF'::text, 'ADDRESS_PROOF'::text, 'EDUCATION'::text, 'EXPERIENCE'::text, 'CONTRACT'::text, 'OTHER'::text]))
    )
);

-- Work Items table
CREATE TABLE IF NOT EXISTS work_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    type text NOT NULL,
    status text DEFAULT 'OPEN'::text,
    priority text DEFAULT 'MEDIUM'::text,
    created_by uuid,
    assigned_to uuid,
    department_id uuid,
    start_date date,
    due_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_items_pkey PRIMARY KEY (id),
    CONSTRAINT work_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES employees (id),
    CONSTRAINT work_items_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT work_items_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES employees (id),
    CONSTRAINT work_items_priority_check CHECK (
        (priority = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'CRITICAL'::text]))
    ),
    CONSTRAINT work_items_status_check CHECK (
        (status = ANY (ARRAY['OPEN'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'BLOCKED'::text, 'CANCELLED'::text]))
    ),
    CONSTRAINT work_items_type_check CHECK (
        (type = ANY (ARRAY['PROJECT'::text, 'TASK'::text, 'TODO'::text, 'MEETING'::text, 'ASSIGNMENT'::text, 'UPDATE'::text]))
    )
);

-- Work Comments table
CREATE TABLE IF NOT EXISTS work_comments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    work_item_id uuid,
    comment text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_comments_pkey PRIMARY KEY (id),
    CONSTRAINT work_comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES employees (id),
    CONSTRAINT work_comments_work_item_id_fkey FOREIGN KEY (work_item_id) REFERENCES work_items (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance USING btree (employee_id, date);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees USING btree (department_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves USING btree (employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves USING btree (status);

-- Create triggers to update 'updated_at' columns
DROP TRIGGER IF EXISTS trg_attendance_updated ON attendance;
CREATE TRIGGER trg_attendance_updated 
BEFORE UPDATE ON attendance 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_departments_updated ON departments;
CREATE TRIGGER trg_departments_updated 
BEFORE UPDATE ON departments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_employees_updated ON employees;
CREATE TRIGGER trg_employees_updated 
BEFORE UPDATE ON employees 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_leaves_updated ON leaves;
CREATE TRIGGER trg_leaves_updated 
BEFORE UPDATE ON leaves 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default leave types if they don't exist
INSERT INTO leave_types (name, description, days_allowed, carry_forward) 
SELECT 'Sick Leave', 'Leave for medical reasons', 12, false
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Sick Leave');

INSERT INTO leave_types (name, description, days_allowed, carry_forward) 
SELECT 'Casual Leave', 'Leave for personal reasons', 12, false
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Casual Leave');

INSERT INTO leave_types (name, description, days_allowed, carry_forward) 
SELECT 'Earned Leave', 'Paid leave earned by working', 15, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Earned Leave');

-- Supabase Auth Trigger to sync public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'EMPLOYEE');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();