const { supabase } = require('@lib/supabase');
const NotificationService = require('./notification.service');

const mapLeave = (leave) => {
    if (!leave) return null;
    return {
        ...leave,
        employeeId: leave.employee_id,
        leaveTypeId: leave.leave_type_id,
        startDate: leave.start_date,
        endDate: leave.end_date,
        totalDays: leave.total_days,
        approvedBy: leave.approved_by,
        employee: leave.employees ? {
            ...leave.employees,
            firstName: leave.employees.first_name,
            lastName: leave.employees.last_name,
        } : undefined,
        leaveType: leave.leave_types ? {
            ...leave.leave_types,
            daysAllowed: leave.leave_types.days_allowed,
            carryForward: leave.leave_types.carry_forward
        } : undefined
    };
};

exports.apply = async (req, res, next) => {
    try {
        const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const { data, error } = await supabase
            .from('leaves')
            .insert([{
                employee_id: employeeId,
                leave_type_id: leaveTypeId,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                reason,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) throw error;

        // Get the employee's manager and HR recipients to notify them of the new leave request
        const managerRecipients = await NotificationService.getManagerRecipients(employeeId);
        const hrRecipients = await NotificationService.getHrRecipients();
        const allRecipients = [...new Set([...managerRecipients, ...hrRecipients])]; // Remove duplicates

        // Notify managers and HR about the new leave request
        for (const recipientId of allRecipients) {
            await NotificationService.notifyLeaveRequest(data.id, data.employee_id, [recipientId]);
        }

        res.status(201).json({ success: true, data: mapLeave(data) });
    } catch (err) {
        next(err);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const { status, employeeId } = req.query;
        let query = supabase
            .from('leaves')
            .select('*, employee:employees!leaves_employee_id_fkey(*), leave_type:leave_types!leaves_leave_type_id_fkey(*), approver:employees!leaves_approved_by_fkey(*)')

        if (req.user.role === 'ADMIN') {
            // Admin can see all leaves
            if (status) query = query.eq('status', status);
            if (employeeId) query = query.eq('employee_id', employeeId);
        } else {
            if (status) query = query.eq('status', status);
            if (employeeId) {
                // Only allow users to see their own data or if they have permission
                if (req.user.role === 'EMPLOYEE' && employeeId !== req.user.employeeId) {
                    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
                }
                query = query.eq('employee_id', employeeId);
            } else {
                // Non-admin users only see their own leaves by default
                if (!req.user.employeeId) {
                    return res.status(400).json({ success: false, message: 'User employee ID not found' });
                }
                query = query.eq('employee_id', req.user.employeeId);
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        res.status(200).json({ success: true, data: (data || []).map(mapLeave) });
    } catch (err) {
        next(err);
    }
};

exports.getTypes = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from('leave_types').select('*');
        if (error) throw error;
        res.status(200).json({
            success: true,
            data: data.map(lt => ({
                ...lt,
                daysAllowed: lt.days_allowed,
                carryForward: lt.carry_forward
            }))
        });
    } catch (err) {
        next(err);
    }
};

exports.approve = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const { data, error } = await supabase
            .from('leaves')
            .update({
                status: 'APPROVED',
                approved_by: req.user.employee?.id || null,
                comments,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Notify the employee whose leave request was approved
        await NotificationService.notifyLeaveDecision(data.id, data.employee_id, 'APPROVED');

        res.status(200).json({ success: true, data: mapLeave(data) });
    } catch (err) {
        next(err);
    }
};

exports.reject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const { data, error } = await supabase
            .from('leaves')
            .update({
                status: 'REJECTED',
                approved_by: req.user.employee?.id || null,
                comments,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Notify the employee whose leave request was rejected
        await NotificationService.notifyLeaveDecision(data.id, data.employee_id, 'REJECTED');

        res.status(200).json({ success: true, data: mapLeave(data) });
    } catch (err) {
        next(err);
    }
};
