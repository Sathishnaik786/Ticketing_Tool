import { supabaseAdmin } from '@lib/supabase';

export class JournalEngineService {
  /**
   * Generates double-entry journal lines for a payroll cycle.
   */
  static async generateCycleJournals(cycleId: string, postedBy: string) {
    // 1. Fetch Mapping
    const { data: mappings } = await supabaseAdmin
      .from('payroll_component_ledger_mapping')
      .select('*')
      .eq('organization_id', 'ORG_ID'); // Simplified

    if (!mappings) throw new Error('No GL mappings found');

    // 2. Fetch Payroll Totals (from snapshots/component_values)
    const { data: totals } = await supabaseAdmin
      .from('payroll_component_values')
      .select('component_code, calculated_amount, component_id')
      .filter('payroll_record_id', 'in', 
        supabaseAdmin.from('payroll_records').select('id').eq('payroll_cycle_id', cycleId)
      );

    if (!totals) throw new Error('No payroll data found for this cycle');

    // 3. Aggregate by Component
    const componentTotals = totals.reduce((acc, curr) => {
      acc[curr.component_id] = (acc[curr.component_id] || 0) + Number(curr.calculated_amount);
      return acc;
    }, {} as Record<string, number>);

    // 4. Create Journal Header
    const journalNumber = `JV-PR-${new Date().getTime()}`;
    const { data: journal } = await supabaseAdmin
      .from('payroll_journal_entries')
      .insert([{
        payroll_cycle_id: cycleId,
        journal_number: journalNumber,
        posting_date: new Date().toISOString().split('T')[0],
        journal_status: 'DRAFT'
      }])
      .select()
      .single();

    if (!journal) throw new Error('Failed to create journal header');

    // 5. Create Lines
    const lines = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const mapping of mappings) {
      const amount = componentTotals[mapping.component_id];
      if (!amount || amount === 0) continue;

      // Debit Entry (Expense)
      lines.push({
        journal_entry_id: journal.id,
        ledger_account_id: mapping.debit_account_id,
        entry_type: 'DEBIT',
        debit_amount: amount,
        credit_amount: 0,
        description: `Payroll Expense for component: ${mapping.component_id}`
      });
      totalDebit += amount;

      // Credit Entry (Liability/Payable)
      lines.push({
        journal_entry_id: journal.id,
        ledger_account_id: mapping.credit_account_id,
        entry_type: 'CREDIT',
        debit_amount: 0,
        credit_amount: amount,
        description: `Payroll Payable for component: ${mapping.component_id}`
      });
      totalCredit += amount;
    }

    // 6. Save Lines & Update Totals
    await supabaseAdmin.from('payroll_journal_lines').insert(lines);
    await supabaseAdmin
      .from('payroll_journal_entries')
      .update({ total_debit: totalDebit, total_credit: totalCredit })
      .eq('id', journal.id);

    return journal;
  }
}
