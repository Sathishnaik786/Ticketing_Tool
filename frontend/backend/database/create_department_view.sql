-- Create a view that properly joins departments, employees, and users
-- This view returns data in a format compatible with the existing API
CREATE OR REPLACE VIEW department_details AS
SELECT 
    d.id,
    d.name,
    d.description,
    d.manager_id,
    d.created_at,
    d.updated_at,
    CASE 
        WHEN e.id IS NOT NULL THEN 
            json_build_object(
                'id', e.id,
                'first_name', e.first_name,
                'last_name', e.last_name,
                'email', e.email,
                'role', e.role
            )
        ELSE NULL
    END AS manager
FROM departments d
LEFT JOIN employees e ON d.manager_id = e.id;