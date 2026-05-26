import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { WorkflowEngineService } from '../services/workflow/workflow-engine.service';
import { WorkflowAuditService } from '../services/workflow/workflow-audit.service';

export class WorkflowController {
  // Workflow Definitions
  static async getWorkflows(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_workflows')
        .select('*, steps:payroll_workflow_steps(*)');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createWorkflow(req: Request, res: Response) {
    try {
      const { workflow, steps } = req.body;
      const { data: wf, error: wfError } = await supabaseAdmin
        .from('payroll_workflows')
        .insert([workflow])
        .select()
        .single();
      
      if (wfError) throw wfError;

      const stepsToInsert = steps.map((s: any, i: number) => ({
        ...s,
        workflow_id: wf.id,
        step_order: i + 1
      }));

      await supabaseAdmin.from('payroll_workflow_steps').insert(stepsToInsert);
      res.status(201).json(wf);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Approvals
  static async getPendingApprovals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      // In real system, check role-based pending approvals
      const { data, error } = await supabaseAdmin
        .from('payroll_approvals')
        .select(`
          *,
          cycle:payroll_cycles(*),
          step:payroll_workflow_steps(*)
        `)
        .eq('approval_status', 'PENDING');
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const userId = (req as any).user.id;
      
      await WorkflowEngineService.approveStep(id as string, userId as string, comments);
      
      await WorkflowAuditService.log({
        entity_type: 'APPROVAL',
        entity_id: id as string,
        action_type: 'APPROVE',
        performed_by: userId as string,
        new_state: { status: 'APPROVED', comments }
      });

      res.json({ message: 'Step approved successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
