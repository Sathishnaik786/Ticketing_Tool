import { supabaseAdmin } from '@lib/supabase';

export interface ComplianceRule {
  id: string;
  rule_code: string;
  rule_name: string;
  rule_type: 'PF' | 'ESI' | 'PT' | 'TDS' | 'GRATUITY' | 'BONUS';
  calculation_type: 'FIXED' | 'PERCENTAGE' | 'FORMULA' | 'SLAB';
  formula?: string;
  minimum_limit: number;
  maximum_limit: number;
  percentage_value?: number;
  fixed_amount?: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
}

export class ComplianceRuleService {
  static async getActiveRules(type: string, date: string = new Date().toISOString().split('T')[0]): Promise<ComplianceRule[]> {
    const { data, error } = await supabaseAdmin
      .from('compliance_rules')
      .select('*')
      .eq('rule_type', type)
      .eq('is_active', true)
      .lte('effective_from', date)
      .or(`effective_to.is.null,effective_to.gte.${date}`);

    if (error) throw error;
    return data || [];
  }

  static async getAllRules() {
    const { data, error } = await supabaseAdmin
      .from('compliance_rules')
      .select('*')
      .order('effective_from', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createRule(data: any) {
    const { data: rule, error } = await supabaseAdmin
      .from('compliance_rules')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return rule;
  }
}
