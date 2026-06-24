import { Request, Response } from 'express';
import { ComplianceRuleService } from '../services/compliance/compliance-rule.service';
import { supabaseAdmin } from '@lib/supabase';

export class ComplianceController {
  static async getRules(req: Request, res: Response) {
    try {
      const rules = await ComplianceRuleService.getAllRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createRule(req: Request, res: Response) {
    try {
      const rule = await ComplianceRuleService.createRule(req.body);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateRule(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('compliance_rules')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
