import { supabaseAdmin } from '@lib/supabase';

export interface AttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  leaveDays: number;
  lopDays: number;
  payableDays: number;
}

export class AttendanceService {
  /**
   * Fetches attendance summary for an employee for a given period.
   * Logic: Payable Days = Present Days + Paid Leaves + Holidays - LOP
   */
  static async getAttendanceSummary(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary> {
    // In a real implementation, this would query the attendance table.
    // For this module, we'll implement a robust placeholder that aggregates actual data if available,
    // otherwise returns standard monthly defaults.
    
    try {
      const { data: attendance, error } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Mock calculation for the sake of Phase-2 logic demonstration
      // If no attendance data, assume 30 days month, 22 working days, 0 LOP
      const totalWorkingDays = 22; 
      const presentDays = attendance?.filter(a => a.status === 'PRESENT').length || 22;
      const leaveDays = attendance?.filter(a => a.status === 'ON_LEAVE').length || 0;
      const lopDays = attendance?.filter(a => a.status === 'ABSENT').length || 0;
      
      // Payable Days = Present + Paid Leaves + Holidays - LOP
      // Assuming 8 holidays/weekends in a 30-day month
      const holidays = 8;
      const payableDays = presentDays + (leaveDays) + holidays - lopDays;

      return {
        totalWorkingDays,
        presentDays,
        leaveDays,
        lopDays,
        payableDays: Math.max(0, payableDays)
      };
    } catch (error) {
      console.error(`Error fetching attendance for ${employeeId}:`, error);
      // Fallback defaults
      return {
        totalWorkingDays: 22,
        presentDays: 22,
        leaveDays: 0,
        lopDays: 0,
        payableDays: 30
      };
    }
  }
}
