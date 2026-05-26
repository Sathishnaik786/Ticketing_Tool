import { supabaseAdmin } from '@lib/supabase';
import { AttendanceService } from './attendance.service';
import { PayrollCalculatorService } from './payroll-calculator.service';

export class PayrollPreviewService {
  /**
   * Generates a payroll preview for an employee without saving to DB.
   */
  static async preview(employeeId: string, startDate: string, endDate: string) {
    // 1. Fetch Salary Assignment
    const { data: assignment, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .select(`
        *,
        structure:salary_structures(
          *,
          components:salary_structure_components(
            *,
            component:salary_components(*)
          )
        )
      `)
      .eq('employee_id', employeeId)
      .eq('status', 'ACTIVE')
      .single();

    if (error || !assignment) throw new Error('Active salary assignment not found');

    // 2. Fetch Attendance (Mock/Real)
    const attendance = await AttendanceService.getAttendanceSummary(employeeId, startDate, endDate);

    // 3. Calculate
    const results = PayrollCalculatorService.calculate(
      assignment,
      assignment.structure.components,
      attendance
    );

    return {
      employee_id: employeeId,
      period: { startDate, endDate },
      attendance,
      results
    };
  }
}
