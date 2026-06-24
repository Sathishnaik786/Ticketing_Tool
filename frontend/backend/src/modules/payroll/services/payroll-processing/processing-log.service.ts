import { supabaseAdmin } from '@lib/supabase';

export class ProcessingLogService {
  static async log(
    cycleId: string,
    message: string,
    level: 'INFO' | 'ERROR' | 'WARN' = 'INFO',
    employeeId?: string,
    metadata?: any
  ) {
    const { error } = await supabaseAdmin
      .from('payroll_processing_logs')
      .insert([{
        payroll_cycle_id: cycleId,
        employee_id: employeeId,
        log_level: level,
        message,
        metadata
      }]);

    if (error) {
      console.error('Failed to write processing log:', error);
    }
  }

  static async getLogs(cycleId: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_processing_logs')
      .select('*')
      .eq('payroll_cycle_id', cycleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}
