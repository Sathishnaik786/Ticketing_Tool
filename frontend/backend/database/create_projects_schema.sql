-- Projects Module Schema

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    project_type TEXT NOT NULL CHECK (
        project_type IN (
            'WEBSITE','MOBILE_APP','SOFTWARE_PRODUCT',
            'CLOUD','DEVOPS','INTERNAL','CLIENT_PROJECT'
        )
    ),

    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (
        status IN ('CREATED','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','ARCHIVED')
    ),

    start_date DATE,
    end_date DATE,

    manager_id UUID REFERENCES employees(id),
    client_id UUID REFERENCES clients(id),
    created_by UUID REFERENCES employees(id),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    role TEXT CHECK (role IN ('LEAD','MEMBER')) DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, employee_id)
);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES employees(id),
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES employees(id),

    status TEXT DEFAULT 'TODO' CHECK (
        status IN ('TODO','IN_PROGRESS','DONE')
    ),

    priority TEXT DEFAULT 'MEDIUM' CHECK (
        priority IN ('LOW','MEDIUM','HIGH','URGENT')
    ),

    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_meetings table
CREATE TABLE IF NOT EXISTS project_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_todos table
CREATE TABLE IF NOT EXISTS project_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_updates table
CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_employee ON project_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON project_tasks(assigned_to);

-- Enable Row Level Security (RLS) for projects module tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
CREATE POLICY "View projects"
ON projects FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id)
    OR EXISTS (
        SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN ('ADMIN','MANAGER','HR_MANAGER')
    )
);

CREATE POLICY "Create projects"
ON projects FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN ('ADMIN','MANAGER')
    )
);

CREATE POLICY "Update projects"
ON projects FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id)
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'ADMIN'
    )
);

CREATE POLICY "Delete projects"
ON projects FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Create RLS policies for clients table
CREATE POLICY "Clients are viewable by assigned members, managers, and admins" ON clients
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'HR_MANAGER')
    )
    OR EXISTS (
        SELECT 1 FROM projects WHERE client_id = clients.id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR auth.uid() IN (
                SELECT employee_id FROM project_members WHERE project_id = projects.id
            )
        )
    )
);

CREATE POLICY "Admin and Manager can manage clients" ON clients
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
);

-- Create RLS policies for project_members table
CREATE POLICY "Project members are viewable by project members, managers, and admins" ON project_members
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_members.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm2 JOIN employees e2 ON pm2.employee_id = e2.id WHERE pm2.project_id = projects.id AND e2.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Admin and project manager can manage project members" ON project_members
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_members.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

-- Create RLS policies for project_documents table
CREATE POLICY "Project documents are viewable by project members, managers, and admins" ON project_documents
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_documents.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Admin and project manager can manage project documents" ON project_documents
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_documents.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
            )
        )
    )
);

-- Create RLS policies for project_tasks table
CREATE POLICY "Project tasks are viewable by project members, managers, and admins" ON project_tasks
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Manager can create project tasks" ON project_tasks
FOR INSERT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

CREATE POLICY "Assigned employee, manager, or admin can update tasks" ON project_tasks
FOR UPDATE TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM employees WHERE id = project_tasks.assigned_to) 
    OR EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

CREATE POLICY "Admin can delete tasks" ON project_tasks
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
);

-- Create RLS policies for project_meetings table
CREATE POLICY "Project meetings are viewable by project members, managers, and admins" ON project_meetings
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_meetings.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Admin and project manager can manage project meetings" ON project_meetings
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_meetings.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

-- Create RLS policies for project_todos table
CREATE POLICY "Project todos are viewable by project members, managers, and admins" ON project_todos
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_todos.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Project members, manager, or admin can manage project todos" ON project_todos
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_todos.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

-- Create RLS policies for project_updates table
CREATE POLICY "Project updates are viewable by project members, managers, and admins" ON project_updates
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_updates.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members pm JOIN employees e ON pm.employee_id = e.id WHERE pm.project_id = projects.id AND e.user_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER')
    )
);

CREATE POLICY "Project members, manager, or admin can create project updates" ON project_updates
FOR INSERT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects WHERE id = project_updates.project_id AND (
            auth.uid() IN (SELECT user_id FROM employees WHERE id = project_updates.employee_id) 
            OR auth.uid() IN (SELECT user_id FROM employees WHERE id = projects.manager_id) 
            OR EXISTS (
                SELECT 1 FROM project_members WHERE project_id = projects.id AND employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
            )
            OR EXISTS (
                SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'
            )
        )
    )
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to projects table
CREATE TRIGGER trg_projects_updated
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated
BEFORE UPDATE ON project_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_meetings_updated
BEFORE UPDATE ON project_meetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();
