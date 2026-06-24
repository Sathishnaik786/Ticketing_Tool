-- Create a view that joins departments with employees and users to get manager email
CREATE OR REPLACE VIEW department_details AS
SELECT 
    d.id,
    d.name,
    d.description,
    d.manager_id,
    d.created_at,
    d.updated_at,
    e.first_name AS manager_first_name,
    e.last_name AS manager_last_name,
    e.role AS manager_role,
    e.status AS manager_status,
    u.email AS manager_email
FROM departments d
LEFT JOIN employees e ON d.manager_id = e.id
LEFT JOIN users u ON e.user_id = u.id;