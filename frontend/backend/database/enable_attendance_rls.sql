-- Enable Row Level Security for attendance table with proper policies
-- This allows users to access attendance data based on their role

-- Enable RLS on the attendance table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read attendance records
-- Admins can read all records, others can read based on their permissions
CREATE POLICY "Users can read attendance reports" ON attendance
FOR SELECT TO authenticated
USING (
    -- Admins can see all attendance records
    EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.user_id = auth.uid() 
        AND employees.role = 'ADMIN'
    )
    OR
    -- HR can see all attendance records
    EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.user_id = auth.uid() 
        AND employees.role = 'HR'
    )
    OR
    -- Managers can see attendance for their department
    EXISTS (
        SELECT 1 FROM employees e
        WHERE e.user_id = auth.uid() 
        AND e.role = 'MANAGER'
        AND e.id = (
            SELECT manager_id FROM departments 
            WHERE id = (
                SELECT department_id FROM employees emp 
                WHERE emp.id = attendance.employee_id
            )
        )
    )
    OR
    -- Regular employees can see only their own attendance
    EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.user_id = auth.uid() 
        AND employees.id = attendance.employee_id
    )
);

-- Ensure the authenticated role has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON attendance TO authenticated;
GRANT SELECT ON employees TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON departments TO authenticated;