import { supabaseAdmin } from '@lib/supabase';

export class DisbursementService {
  /**
   * Initializes disbursements for all records in a finalized payroll cycle.
   */
  static async initiateDisbursements(cycleId: string) {
    const { data: records } = await supabaseAdmin
      .from('payroll_records')
      .select('id, net_salary')
      .eq('payroll_cycle_id', cycleId)
      .eq('status', 'LOCKED');

    if (!records || records.length === 0) throw new Error('No locked payroll records found');

    const disbursements = records.map(r => ({
      payroll_record_id: r.id,
      amount: r.net_salary,
      disbursement_status: 'PENDING'
    }));

    const { error } = await supabaseAdmin
      .from('payroll_disbursements')
      .insert(disbursements);
    
    if (error) throw error;
  }

  /**
   * Simulates processing a batch (In real scenarios, this would hit a banking API/H2H).
   */
  static async processBatch(disbursementIds: string[]) {
    await supabaseAdmin
      .from('payroll_disbursements')
      .update({ disbursement_status: 'PROCESSING', scheduled_at: new Date().toISOString() })
      .in('id', disbursementIds);

    // Mock successful processing
    for (const id of disbursementIds) {
      await supabaseAdmin
        .from('payroll_disbursements')
        .update({ 
            disbursement_status: 'SUCCESS', 
            processed_at: new Date().toISOString(),
            bank_reference_no: `TXN-${new Date().getTime()}`
        })
        .eq('id', id);
    }
  }
}
