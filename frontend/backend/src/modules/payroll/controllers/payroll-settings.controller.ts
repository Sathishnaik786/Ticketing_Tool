import { Request, Response } from 'express';
import { PayrollSettingsService } from '../services/payroll-settings.service';

export class PayrollSettingsController {
  static async getAll(req: Request, res: Response) {
    try {
      const settings = await PayrollSettingsService.getAll();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { key, value } = req.body;
      const setting = await PayrollSettingsService.update(key, value, (req as any).user.id);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
