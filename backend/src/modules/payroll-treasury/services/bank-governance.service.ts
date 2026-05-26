import { supabaseAdmin } from '@lib/supabase';

export class BankGovernanceService {
  /**
   * Securely adds a bank account for an employee with masking.
   */
  static async addBankAccount(employeeId: string, accountData: any) {
    const { accountNumber, ifscCode, accountHolderName, bankName } = accountData;

    // 1. Basic IFSC Validation
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      throw new Error('Invalid IFSC Code format');
    }

    // 2. Generate Masked Account
    const masked = `XXXXXX${accountNumber.slice(-4)}`;

    // 3. Persist
    const { data, error } = await supabaseAdmin
      .from('employee_bank_accounts')
      .insert({
        employee_id: employeeId,
        account_holder_name: accountHolderName,
        account_number: accountNumber, // In production, use crypto-encryption here
        masked_account_number: masked,
        ifsc_code: ifscCode,
        bank_name: bankName,
        is_primary: true,
        verification_status: 'VERIFIED' // Mocking auto-verification for Phase 4
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Validates a disbursement batch against bank account readiness.
   */
  static async validateBatchReadiness(employeeIds: string[]) {
    const { data: accounts, error } = await supabaseAdmin
      .from('employee_bank_accounts')
      .select('employee_id, verification_status')
      .in('employee_id', employeeIds)
      .eq('is_primary', true);

    if (error) throw error;

    const readyIds = accounts?.filter(a => a.verification_status === 'VERIFIED').map(a => a.employee_id) || [];
    const missingIds = employeeIds.filter(id => !readyIds.includes(id));

    return {
      isReady: missingIds.length === 0,
      missingCount: missingIds.length,
      missingIds
    };
  }
}
