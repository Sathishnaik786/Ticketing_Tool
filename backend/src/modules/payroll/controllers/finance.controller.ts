import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { JournalEngineService } from '../services/finance/journal-engine.service';
import { ReconciliationService } from '../services/finance/reconciliation.service';
import { CsvExportService } from '../services/erp-connectors/csv-export.service';

export class FinanceController {
  // Ledger Management
  static async getLedgers(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_ledger_accounts')
        .select('*')
        .order('account_code', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createLedger(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_ledger_accounts')
        .insert([req.body])
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Journal Posting
  static async postJournal(req: Request, res: Response) {
    try {
      const { cycleId } = req.params;
      const userId = (req as any).user.id;
      const journal = await JournalEngineService.generateCycleJournals(cycleId as string, userId as string);
      res.status(201).json(journal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getJournals(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_journal_entries')
        .select(`
          *,
          lines:payroll_journal_lines(
            *,
            account:payroll_ledger_accounts(*)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Reconcile
  static async reconcile(req: Request, res: Response) {
    try {
      const { cycleId } = req.params;
      const userId = (req as any).user.id;
      const report = await ReconciliationService.runReconciliation(cycleId as string, userId as string);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Export
  static async exportToCsv(req: Request, res: Response) {
    try {
      const { cycleId } = req.params;
      const file = await CsvExportService.exportJournals(cycleId as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${file.fileName}`);
      res.send(file.content);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
