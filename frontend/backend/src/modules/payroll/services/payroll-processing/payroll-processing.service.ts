import { supabaseAdmin } from '@lib/supabase';
import { AttendanceService } from './attendance.service';
import { PayrollCalculatorService } from './payroll-calculator.service';
import { PayrollSnapshotService } from './payroll-snapshot.service';
import { ProcessingLogService } from './processing-log.service';
import { ComplianceOrchestrator } from '../compliance/compliance-orchestrator.service';

export class PayrollProcessingService {
  /**
   * Processes payroll for an entire cycle or specific employees within it.
   */
  static async processCycle(cycleId: string, employeeIds?: string[]) {
    // 1. Fetch Cycle Details
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('payroll_cycles')
      .select('*')
      .eq('id', cycleId)
      .single();

    if (cycleError || !cycle) throw new Error('Payroll cycle not found');
    if (cycle.is_locked) throw new Error('Cannot process a locked payroll cycle');

    await ProcessingLogService.log(cycleId, `Starting payroll processing for cycle: ${cycle.cycle_name}`);

    // 2. Fetch Employees with Active Salary Assignments
    let query = supabaseAdmin
      .from('employee_salary_assignments')
      .select(`
        *,
        employee:employees(*),
        structure:salary_structures(
          *,
          components:salary_structure_components(
            *,
            component:salary_components(*)
          )
        )
      `)
      .eq('status', 'ACTIVE');

    if (employeeIds && employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds);
    }

    const { data: assignments, error: assignError } = await query;
    if (assignError) throw assignError;

    await ProcessingLogService.log(cycleId, `Found ${assignments.length} employees to process`);

    // 3. Update Cycle Status
    await supabaseAdmin
      .from('payroll_cycles')
      .update({ status: 'PROCESSING' })
      .eq('id', cycleId);

    // 4. Batch Process
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const assignment of assignments) {
      try {
        await this.processEmployeePayroll(cycle, assignment);
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ employeeId: assignment.employee_id, error: err.message });
        await ProcessingLogService.log(
          cycleId, 
          `Failed to process employee ${assignment.employee_id}: ${err.message}`, 
          'ERROR', 
          assignment.employee_id
        );
      }
    }

    // 5. Finalize Cycle Status
    const finalStatus = results.failed > 0 ? 'FAILED' : 'COMPLETED';
    await supabaseAdmin
      .from('payroll_cycles')
      .update({ 
        status: finalStatus,
        processed_at: new Date().toISOString()
      })
      .eq('id', cycleId);

    await ProcessingLogService.log(cycleId, `Payroll processing finished. Success: ${results.success}, Failed: ${results.failed}`);

    return results;
  }

  /**
   * Internal logic for a single employee payroll record generation.
   */
  private static async processEmployeePayroll(cycle: any, assignment: any) {
    const employeeId = assignment.employee_id;

    // A. Fetch Attendance
    const attendance = await AttendanceService.getAttendanceSummary(
      employeeId,
      cycle.start_date,
      cycle.end_date
    );

    // B. Calculate Salary
    const calcResult = PayrollCalculatorService.calculate(
      assignment,
      assignment.structure.components,
      attendance
    );

    // B.1 Statutory & Compliance (NEW Phase-3)
    // Create temporary record ID for foreign key if not exists (upsert will handle later, but we need it now)
    // Actually, we'll save the record first with draft totals, then calculate compliance and update.

    // C. Save Payroll Record
    const { data: record, error: recordError } = await supabaseAdmin
      .from('payroll_records')
      .upsert({
        payroll_cycle_id: cycle.id,
        employee_id: employeeId,
        salary_assignment_id: assignment.id,
        gross_salary: calcResult.gross_salary,
        total_earnings: calcResult.total_earnings,
        total_deductions: calcResult.total_deductions,
        net_salary: calcResult.net_salary,
        payable_days: attendance.payableDays,
        lop_days: attendance.lopDays,
        working_days: attendance.totalWorkingDays,
        status: 'PROCESSED',
        processed_at: new Date().toISOString()
      }, { onConflict: 'payroll_cycle_id,employee_id' })
      .select()
      .single();

    if (recordError) throw recordError;

    // C.1 Process Compliance & Statutory (Phase-3)
    const complianceResult = await ComplianceOrchestrator.process(
      employeeId, 
      record.id, 
      calcResult.components.reduce((acc, c) => ({ ...acc, [c.code]: c.calculated_amount }), { CTC: assignment.monthly_ctc }),
      calcResult.gross_salary
    );

    // C.2 Update Record with Statutory Deductions
    const finalDeductions = calcResult.total_deductions + complianceResult.totalEmployeeDeductions;
    const finalNet = calcResult.total_earnings - finalDeductions;

    await supabaseAdmin
      .from('payroll_records')
      .update({
        total_deductions: finalDeductions,
        net_salary: Math.max(0, finalNet)
      })
      .eq('id', record.id);

    // D. Save Component Breakdown
    // Delete existing components if recalculating
    await supabaseAdmin
      .from('payroll_component_values')
      .delete()
      .eq('payroll_record_id', record.id);

    const componentValues = calcResult.components.map(c => ({
      payroll_record_id: record.id,
      component_id: c.component_id === 'LOP_AUTO' ? null : c.component_id,
      component_name: c.name,
      component_code: c.code,
      component_category: c.category,
      formula_snapshot: c.formula_snapshot,
      calculated_amount: c.calculated_amount,
      sequence_order: c.sequence_order
    }));

    const { error: compError } = await supabaseAdmin
      .from('payroll_component_values')
      .insert(componentValues);

    if (compError) throw compError;

    // E. Create Snapshot (Immutability)
    await PayrollSnapshotService.createSnapshot(
      record.id,
      assignment.structure,
      assignment.structure.components
    );

    await ProcessingLogService.log(cycle.id, `Payroll processed successfully for ${employeeId}`, 'INFO', employeeId);
  }
}
