import { supabaseAdmin } from '@lib/supabase';
import { PayrollNotificationService } from './payroll-notification.service';
import { VarianceDetectionService } from './variance-detection.service';

export class WorkflowEngineService {
  /**
   * Initializes a workflow for a payroll cycle after processing.
   */
  static async initiateCycleWorkflow(cycleId: string) {
    // 1. Run Variance Detection for all records in the cycle
    const { data: records } = await supabaseAdmin
      .from('payroll_records')
      .select('*')
      .eq('payroll_cycle_id', cycleId);

    if (records) {
      for (const record of records) {
        await VarianceDetectionService.detect(record);
      }
    }

    // 2. Fetch Workflow Definition (Default)
    const { data: workflow } = await supabaseAdmin
      .from('payroll_workflows')
      .select('*, steps:payroll_workflow_steps(*)')
      .eq('is_active', true)
      .order('step_order', { foreignTable: 'payroll_workflow_steps', ascending: true })
      .limit(1)
      .single();

    if (!workflow) throw new Error('No active payroll workflow defined');

    // 3. Initiate Step 1
    const firstStep = workflow.steps[0];
    await this.initiateStep(cycleId, firstStep);

    // 4. Update Cycle Status
    await supabaseAdmin
      .from('payroll_cycles')
      .update({ status: 'PENDING_APPROVAL' }) // New status for Phase 4
      .eq('id', cycleId);
  }

  private static async initiateStep(cycleId: string, step: any) {
    // Create approval instance
    await supabaseAdmin
      .from('payroll_approvals')
      .insert([{
        payroll_cycle_id: cycleId,
        workflow_step_id: step.id,
        approval_status: 'PENDING'
      }]);

    await PayrollNotificationService.notifyApprovers(cycleId, step.step_name, step.approver_role);
  }

  /**
   * Handles approval of a step.
   */
  static async approveStep(approvalId: string, userId: string, comments?: string) {
    // 1. Get Approval details
    const { data: approval, error } = await supabaseAdmin
      .from('payroll_approvals')
      .select(`
        *,
        step:payroll_workflow_steps(*),
        workflow:payroll_workflows(steps:payroll_workflow_steps(*))
      `)
      .eq('id', approvalId)
      .single();

    if (error || !approval) throw new Error('Approval instance not found');

    // 2. Mark Approved
    await supabaseAdmin
      .from('payroll_approvals')
      .update({
        approval_status: 'APPROVED',
        approver_id: userId,
        comments,
        approved_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    // 3. Check for Next Step
    const nextStep = (approval.workflow as any).steps.find((s: any) => s.step_order === approval.step.step_order + 1);

    if (nextStep) {
      await this.initiateStep(approval.payroll_cycle_id, nextStep);
    } else {
      // Final Approval Reached -> Ready for Locking
      await supabaseAdmin
        .from('payroll_cycles')
        .update({ status: 'APPROVED' })
        .eq('id', approval.payroll_cycle_id);
      
      await PayrollNotificationService.send(
        approval.approver_id, // To the final approver or admin
        'LOCKED',
        'Payroll Finalized',
        'All approval levels completed. Payroll is ready to be locked.',
        { type: 'PAYROLL_CYCLE', id: approval.payroll_cycle_id }
      );
    }
  }
}
