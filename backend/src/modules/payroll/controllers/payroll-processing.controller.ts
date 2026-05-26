import { Request, Response } from 'express';
import { PayrollCycleService } from '../services/payroll-processing/payroll-cycle.service';
import { PayrollProcessingService } from '../services/payroll-processing/payroll-processing.service';
import { PayrollLockService } from '../services/payroll-processing/payroll-lock.service';
import { ProcessingLogService } from '../services/payroll-processing/processing-log.service';

export class PayrollProcessingController {
  // Cycle Management
  static async getCycles(req: Request, res: Response) {
    try {
      const cycles = await PayrollCycleService.getAll();
      res.json(cycles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getCycleById(req: Request, res: Response) {
    try {
      const cycle = await PayrollCycleService.getById(req.params.id as string);
      res.json(cycle);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async createCycle(req: Request, res: Response) {
    try {
      const cycle = await PayrollCycleService.create(req.body);
      res.status(201).json(cycle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Processing Execution
  static async processPayroll(req: Request, res: Response) {
    try {
      const { cycleId, employeeIds } = req.body;
      // Note: In production, this should be an async job. For Phase-2, we process it and return.
      const result = await PayrollProcessingService.processCycle(cycleId, employeeIds);
      res.json({ message: 'Payroll processing triggered', result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Locking
  static async lockCycle(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await PayrollLockService.lockCycle(req.params.id as string, userId as string);
      res.json({ message: 'Payroll cycle locked successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Logs
  static async getLogs(req: Request, res: Response) {
    try {
      const logs = await ProcessingLogService.getLogs(req.params.cycleId as string);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
