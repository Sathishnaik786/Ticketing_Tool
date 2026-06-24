const { supabase } = require('@lib/supabase');

exports.getAll = async (req, res, next) => {
    try {
        // Get departments with manager info from the view
        const { data: departments, error: deptError } = await supabase
            .from('department_details')
            .select('*');
        
        if (deptError) throw deptError;

        // Get all employees to associate with departments
        const { data: allEmployees, error: empError } = await supabase
            .from('employees')
            .select('id, first_name, last_name, role, status, department_id');
        
        if (empError) throw empError;

        // Map departments with manager info from the view and add employees
        const departmentsWithDetails = departments.map(dept => {
            // Create manager object from the view data
            const manager = dept.manager_email ? {
                id: dept.manager_id,
                first_name: dept.manager_first_name,
                last_name: dept.manager_last_name,
                email: dept.manager_email,
                role: dept.manager_role,
                status: dept.manager_status
            } : null;
            
            // Filter employees for this department
            const employees = allEmployees.filter(emp => emp.department_id === dept.id);
            
            // Calculate employee count
            const employeeCount = employees.length;
            
            return {
                ...dept,
                manager: manager,
                employees: employees,
                employeeCount: employeeCount
            };
        });

        res.status(200).json({ success: true, data: departmentsWithDetails });
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Get department with manager info from the view
        const { data: department, error: deptError } = await supabase
            .from('department_details')
            .select('*')
            .eq('id', id)
            .single();
        
        if (deptError) throw deptError;
        
        // Create manager object from the view data
        const deptManager = department.manager_email ? {
            id: department.manager_id,
            first_name: department.manager_first_name,
            last_name: department.manager_last_name,
            email: department.manager_email,
            role: department.manager_role,
            status: department.manager_status
        } : null;
        
        // Get employees for this department
        const { data: departmentEmployees, error: empError } = await supabase
            .from('employees')
            .select('id, first_name, last_name, role, status')
            .eq('department_id', id);
        
        if (empError) throw empError;
        
        // Combine the data in application layer
        const combinedData = {
            ...department,
            manager: deptManager,
            employees: departmentEmployees
        };

        res.status(200).json({ success: true, data: combinedData });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        // STEP 1 - MAP PAYLOAD FIRST (CRITICAL)
        const { name, description, managerId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }
        
        const payload = {
            name,
            description: description ?? null,
            manager_id: managerId ?? null
        };
        
        // STEP 2 - ROLE CHECK (ADMIN + MANAGER ONLY)
        if (!['ADMIN', 'MANAGER'].includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create departments"
            });
        }
        
        // STEP 3 - OPTIONAL VALIDATION (SAFE)
        // Only if manager_id is provided:
        if (payload.manager_id) {
            const { data: manager, error: managerError } = await supabase
                .from('employees')
                .select('id')
                .eq('id', payload.manager_id)
                .single();
            
            if (!manager) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid manager selected"
                });
            }
        }
        
        // STEP 4 - INSERT (NO MORE VALIDATION)
        const { data, error } = await supabase
            .from('departments')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('DEPARTMENT INSERT ERROR:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('General error in department create:', err);
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        // Only ADMIN and MANAGER roles can update departments
        if (!['ADMIN', 'MANAGER'].includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage departments"
            });
        }
        
        const { id } = req.params;
        
        // STEP 1 - MAP PAYLOAD FIRST (CRITICAL)
        const { name, description, managerId } = req.body;
        
        const payload = {
            name,
            description: description ?? null,
            manager_id: managerId ?? null
        };
        
        // STEP 2 - ROLE CHECK (ADMIN + MANAGER ONLY)
        if (!['ADMIN', 'MANAGER'].includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update departments"
            });
        }
        
        // STEP 3 - OPTIONAL VALIDATION (SAFE)
        // Only if manager_id is provided:
        if (payload.manager_id) {
            const { data: manager, error: managerError } = await supabase
                .from('employees')
                .select('id')
                .eq('id', payload.manager_id)
                .single();
            
            if (!manager) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid manager selected"
                });
            }
        }
        
        console.log('Final payload for update:', payload);
        
        const { data, error } = await supabase
            .from('departments')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('DEPARTMENT UPDATE ERROR:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('General error in department update:', err);
        next(err);
    }
};
