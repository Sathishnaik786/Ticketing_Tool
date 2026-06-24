const { supabase } = require('@lib/supabase');

exports.getDashboardStats = async (req, res, next) => {
    try {
        // Aggregation logic for dashboard
        const { count: totalEmployees } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        const { count: pendingLeaves } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');

        // Today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { count: presentToday } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees: totalEmployees ?? 0,
                pendingLeaves: pendingLeaves ?? 0,
                presentToday: presentToday ?? 0,
                attendanceRate: totalEmployees && totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAttendanceReport = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { count: totalEmployees } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        const { count: presentToday } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today);
        const { count: lateToday } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'LATE');
        
        // Get on-leave count from leaves table
        const { count: onLeaveToday } = await supabase.from('leaves').select('*', { count: 'exact', head: true })
            .eq('status', 'APPROVED')
            .lte('start_date', today)
            .gte('end_date', today);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees: totalEmployees ?? 0,
                presentToday: presentToday ?? 0,
                absentToday: Math.max(0, (totalEmployees ?? 0) - (presentToday ?? 0)),
                late: lateToday ?? 0,
                onLeave: onLeaveToday ?? 0,
                averageWorkHours: 8.5,
                attendanceRate: totalEmployees && totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
                monthlyTrend: [
                    { month: 'Jan', value: 92 },
                    { month: 'Feb', value: 95 },
                    { month: 'Mar', value: 93 }
                ]
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getLeaveReport = async (req, res, next) => {
    try {
        const { count: total } = await supabase.from('leaves').select('*', { count: 'exact', head: true });
        const { count: pending } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
        const { count: approved } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED');
        const { count: rejected } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED');

        res.status(200).json({
            success: true,
            data: {
                totalRequests: total ?? 0,
                pending: pending ?? 0,
                approved: approved ?? 0,
                rejected: rejected ?? 0,
                byType: [
                    { type: 'Sick Leave', count: 10 },
                    { type: 'Casual Leave', count: 5 }
                ],
                monthlyTrend: [
                    { month: 'Jan', value: 5 },
                    { month: 'Feb', value: 8 }
                ]
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getEmployeeReport = async (req, res, next) => {
    try {
        const { count: total } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        const { count: active } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');

        res.status(200).json({
            success: true,
            data: {
                totalEmployees: total ?? 0,
                activeEmployees: active ?? 0,
                newHires: 2,
                terminations: 0,
                byDepartment: [],
                byRole: []
            }
        });
    } catch (err) {
        next(err);
    }
};
