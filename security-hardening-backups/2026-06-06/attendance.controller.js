const { supabase } = require('@lib/supabase');

const mapAttendance = (att) => {
    if (!att) return null;
    return {
        ...att,
        employeeId: att.employee_id,
        checkIn: att.check_in,
        checkOut: att.check_out,
        workHours: att.work_hours,
        employee: att.employees ? {
            ...att.employees,
            firstName: att.employees.first_name,
            lastName: att.employees.last_name,
            email: att.employees.users ? att.employees.users.email : null, // Get email from nested users object
            departmentId: att.employees.department_id,
            department: {
                id: att.employees.department_id,
                name: att.employees.department_name
            }
        } : undefined
    };
};

exports.checkIn = async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);

        const { data: existing } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', date)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already checked in for today' });
        }

        const status = now.getHours() >= 9 && now.getMinutes() > 15 ? 'LATE' : 'PRESENT';

        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                employee_id: employeeId,
                date,
                check_in: time,
                status
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data: mapAttendance(data) });
    } catch (err) {
        next(err);
    }
};

exports.checkOut = async (req, res, next) => {
    try {
        const { attendanceId } = req.body;
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);

        const { data: attendance } = await supabase
            .from('attendance')
            .select('*')
            .eq('id', attendanceId)
            .single();

        if (!attendance) return res.status(404).json({ success: false, message: 'Record not found' });

        const [checkInH, checkInM] = attendance.check_in.split(':').map(Number);
        const [checkOutH, checkOutM] = time.split(':').map(Number);
        const workHours = (checkOutH + checkOutM / 60) - (checkInH + checkInM / 60);

        const { data, error } = await supabase
            .from('attendance')
            .update({
                check_out: time,
                work_hours: parseFloat(workHours.toFixed(2))
            })
            .eq('id', attendanceId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ success: true, data: mapAttendance(data) });
    } catch (err) {
        next(err);
    }
};

exports.getMyAttendance = async (req, res, next) => {
    try {
        const { employeeId } = req.query;
        // Check if employeeId is provided or if we can use the authenticated user's employee ID
        const targetEmployeeId = employeeId || req.user.employee?.id;
        
        if (!targetEmployeeId) {
            return res.status(400).json({ success: false, message: 'Employee ID not provided and user employee ID not found' });
        }
        
        // For EMPLOYEE role, only allow access to their own data
        if (req.user.role === 'EMPLOYEE' && employeeId && employeeId !== req.user.employeeId) {
            return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
        }
        
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', targetEmployeeId)
            .order('date', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: (data || []).map(mapAttendance) });
    } catch (err) {
        next(err);
    }
};

exports.getReport = async (req, res, next) => {
    try {
        const { date, departmentId, employeeId } = req.query;
        let query = supabase
            .from('attendance')
            .select(`
                *,
                employees:employees!attendance_employee_id_fkey ( 
                    id,
                    first_name,
                    last_name,
                    user_id,
                    department_id,
                    department_name,
                    position,
                    status,
                    users:users!employees_user_id_fkey ( email )
                )
            `)

        if (req.user.role === 'ADMIN') {
            // Admin can see all attendance
            if (date) query = query.eq('date', date);
            if (employeeId) query = query.eq('employee_id', employeeId);
        } else {
            if (date) query = query.eq('date', date);
            if (employeeId) {
                // Only allow users to see their own data or if they have permission
                if (req.user.role === 'EMPLOYEE' && employeeId !== req.user.employeeId) {
                    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
                }
                query = query.eq('employee_id', employeeId);
            } else {
                // Non-admin users only see their own attendance by default
                query = query.eq('employee_id', req.user.employeeId);
            }
            if (departmentId && !employeeId && req.user.role !== 'EMPLOYEE') {
                const { data: employeesInDept } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('department_id', departmentId);
                if (employeesInDept && employeesInDept.length > 0) {
                    query = query.in('employee_id', employeesInDept.map(emp => emp.id));
                }
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        let filteredData = data || [];
        if (departmentId && !employeeId && req.user.role !== 'ADMIN') { // Only filter by department if not already filtered by employee and not admin
            filteredData = data.filter(a => a.employees && a.employees.department_id === departmentId);
        }

        res.status(200).json({ success: true, data: filteredData.map(mapAttendance) || [] });
    } catch (err) {
        next(err);
    }
};
