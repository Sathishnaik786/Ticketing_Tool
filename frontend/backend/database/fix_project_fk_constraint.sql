-- Drop existing constraints first
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_employee_id_fkey;
ALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_uploaded_by_fkey;
ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS project_tasks_assigned_to_fkey;
ALTER TABLE project_updates DROP CONSTRAINT IF EXISTS project_updates_employee_id_fkey;

-- Clean up orphaned records
UPDATE projects 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM employees);

UPDATE projects 
SET manager_id = NULL 
WHERE manager_id IS NOT NULL 
AND manager_id NOT IN (SELECT id FROM employees);

-- Now add the constraints back
ALTER TABLE projects ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE project_members ADD CONSTRAINT project_members_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE project_documents ADD CONSTRAINT project_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE project_updates ADD CONSTRAINT project_updates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;