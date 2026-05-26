import { supabaseAdmin } from '@lib/supabase';

export class PayrollNotificationService {
  static async send(recipientId: string, type: string, title: string, message: string, ref?: { type: string, id: string }) {
    const { error } = await supabaseAdmin
      .from('payroll_notifications')
      .insert([{
        recipient_id: recipientId,
        notification_type: type,
        title,
        message,
        reference_type: ref?.type,
        reference_id: ref?.id
      }]);
    
    if (error) console.error('Failed to send notification:', error);
  }

  static async notifyApprovers(cycleId: string, stepName: string, approverRole: string) {
    // 1. Fetch users with the role
    const { data: users } = await supabaseAdmin
        .from('users') // Assuming a users table with roles or a link to employees
        .select('id')
        .eq('role', approverRole); // This is simplified, in real RBAC we check specific permissions

    if (!users) return;

    for (const user of users) {
      await this.send(
        user.id,
        'APPROVAL_REQUEST',
        'Payroll Approval Required',
        `The payroll cycle for this month is ready for ${stepName}.`,
        { type: 'PAYROLL_CYCLE', id: cycleId }
      );
    }
  }
}
