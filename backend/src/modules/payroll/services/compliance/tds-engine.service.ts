import { supabaseAdmin } from '@lib/supabase';

export class TDSEngineService {
  /**
   * Estimates monthly TDS based on annual income and tax slabs.
   */
  static async calculate(employeeId: string, monthlyGross: number) {
    // 1. Get Employee Tax Profile
    const { data: profile } = await supabaseAdmin
      .from('employee_tax_profiles')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    const regime = profile?.tax_regime || 'NEW';
    const annualGross = monthlyGross * 12;
    const deductions = profile?.declared_investments || 0;
    
    const taxableIncome = Math.max(0, annualGross - deductions);

    // 2. Fetch Slabs
    const { data: slabs } = await supabaseAdmin
      .from('tax_slabs')
      .select('*')
      .eq('regime_name', regime)
      .lte('minimum_income', taxableIncome)
      .order('minimum_income', { ascending: true });

    if (!slabs || slabs.length === 0) return { employee_amount: 0, employer_amount: 0, regime };

    // 3. Calculate Tax (Simplified Foundation)
    let totalTax = 0;
    for (const slab of slabs) {
        const slabMax = slab.maximum_income || taxableIncome;
        const incomeInSlab = Math.min(taxableIncome, slabMax) - slab.minimum_income;
        if (incomeInSlab > 0) {
            totalTax += incomeInSlab * (slab.tax_percentage / 100);
        }
    }

    // Add Cess (Standard 4%)
    totalTax += totalTax * 0.04;

    return {
      employee_amount: Math.round(totalTax / 12),
      employer_amount: 0,
      tax_regime: regime,
      annual_estimate: totalTax
    };
  }
}
