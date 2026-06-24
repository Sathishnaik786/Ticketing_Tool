import { supabaseAdmin } from '@lib/supabase';

export class TDSEngineService {
  /**
   * Calculates monthly TDS based on projected annual income and declarations.
   */
  static async calculateMonthlyTDS(employeeId: string, monthlyGross: number) {
    // 1. Fetch Tax Profile & Declarations
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('employee_tax_profiles')
      .select('*, declarations:investment_declarations(*)')
      .eq('employee_id', employeeId)
      .single();

    if (profileError || !profile) {
      console.warn(`[TDS] No tax profile found for ${employeeId}. Using default 0 TDS.`);
      return 0;
    }

    // 2. Projected Annual Income
    const annualGross = monthlyGross * 12;
    const regime = profile.selected_regime;
    
    // 3. Apply Deductions (Old Regime only for simplicity in Phase 3 start)
    let taxableIncome = annualGross;
    if (regime === 'OLD_REGIME') {
        const declarations = profile.declarations?.[0] || {};
        const totalDeductions = 
            Math.min(Number(declarations.section_80c) || 0, 150000) + 
            Math.min(Number(declarations.section_80d) || 0, 25000) +
            50000; // Standard Deduction
        
        taxableIncome = Math.max(0, annualGross - totalDeductions);
    } else {
        taxableIncome = Math.max(0, annualGross - 50000); // Standard Deduction for New Regime too
    }

    // 4. Calculate Annual Tax (Simplified Indian Slabs)
    const annualTax = this.calculateSlabTax(taxableIncome, regime);
    
    // 5. Monthly TDS
    const monthlyTDS = annualTax / 12;

    // 6. Update Profile Projection
    await supabaseAdmin
      .from('employee_tax_profiles')
      .update({
        annual_taxable_income: taxableIncome,
        projected_tax_liability: annualTax,
        last_updated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId);

    return monthlyTDS;
  }

  private static calculateSlabTax(income: number, regime: string) {
    if (regime === 'NEW_REGIME') {
        // Simplified FY 2024-25 New Regime Slabs
        if (income <= 300000) return 0;
        if (income <= 600000) return (income - 300000) * 0.05;
        if (income <= 900000) return 15000 + (income - 600000) * 0.10;
        if (income <= 1200000) return 45000 + (income - 900000) * 0.15;
        return 90000 + (income - 1200000) * 0.20;
    } else {
        // Simplified Old Regime Slabs
        if (income <= 250000) return 0;
        if (income <= 500000) return (income - 250000) * 0.05;
        if (income <= 1000000) return 12500 + (income - 500000) * 0.20;
        return 112500 + (income - 1000000) * 0.30;
    }
  }
}
