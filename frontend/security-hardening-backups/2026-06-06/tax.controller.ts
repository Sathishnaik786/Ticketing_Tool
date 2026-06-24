import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';

export class TaxController {
  static async getSlabs(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tax_slabs')
        .select('*')
        .order('minimum_income', { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createSlab(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tax_slabs')
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getEmployeeProfile(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('employee_tax_profiles')
        .select('*')
        .eq('employee_id', req.params.employeeId)
        .maybeSingle();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateEmployeeProfile(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('employee_tax_profiles')
        .upsert({ ...req.body, employee_id: req.params.employeeId }, { onConflict: 'employee_id' })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
