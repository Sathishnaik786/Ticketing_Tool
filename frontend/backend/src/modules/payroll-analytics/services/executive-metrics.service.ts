import { supabaseAdmin } from '@lib/supabase';

export class ExecutiveMetricsService {
  /**
   * Aggregates enterprise-wide payroll KPIs.
   */
  static async getExecutiveSummary() {
    // 1. Fetch latest commit summary
    const { data: latestBatch, error } = await supabaseAdmin
      .from('payroll_bulk_commitments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // 2. Fetch Department-wise Cost Aggregation
    const { data: deptMetrics, error: deptError } = await supabaseAdmin
      .from('employees')
      .select('department_id, salary')
      .not('department_id', 'is', null);

    if (deptError) throw deptError;

    // 3. Process Trends (Mocking historical data for Phase 5)
    const trends = [
        { month: 'Jan', burn: 850000 },
        { month: 'Feb', burn: 890000 },
        { month: 'Mar', burn: 950000 },
        { month: 'Apr', burn: 1100000 },
        { month: 'May', burn: latestBatch?.gross_total || 0 }
    ];

    return {
      totalBurn: latestBatch?.gross_total || 0,
      netPayout: latestBatch?.net_total || 0,
      headcount: latestBatch?.total_committed || 0,
      avgSalary: latestBatch ? (latestBatch.gross_total / latestBatch.total_committed) : 0,
      trends,
      departmentStats: this.aggregateByDept(deptMetrics)
    };
  }

  private static aggregateByDept(data: any[]) {
    const stats: any = {};
    data.forEach(emp => {
        const dept = emp.department_id || 'Unassigned';
        if (!stats[dept]) stats[dept] = { totalCost: 0, headcount: 0 };
        stats[dept].totalCost += Number(emp.salary) || 0;
        stats[dept].headcount += 1;
    });
    return stats;
  }
}
