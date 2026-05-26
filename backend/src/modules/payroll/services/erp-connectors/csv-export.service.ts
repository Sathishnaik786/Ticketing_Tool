import { supabaseAdmin } from '@lib/supabase';

export class CsvExportService {
  /**
   * Generates a generic CSV export for payroll journal entries.
   */
  static async exportJournals(cycleId: string) {
    const { data: journal } = await supabaseAdmin
      .from('payroll_journal_entries')
      .select(`
        *,
        lines:payroll_journal_lines(
          *,
          account:payroll_ledger_accounts(*)
        )
      `)
      .eq('payroll_cycle_id', cycleId)
      .single();

    if (!journal) throw new Error('No posted journals found for this cycle');

    const headers = ['Posting Date', 'Account Code', 'Account Name', 'Type', 'Debit', 'Credit', 'Description'];
    const rows = journal.lines.map((l: any) => [
      journal.posting_date,
      l.account.account_code,
      l.account.account_name,
      l.entry_type,
      l.debit_amount,
      l.credit_amount,
      l.description
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const fileName = `Payroll_Journal_${cycleId}_${new Date().getTime()}.csv`;
    
    // In a real system, we'd upload this to S3/Supabase Storage
    return { fileName, content: csvContent };
  }
}
