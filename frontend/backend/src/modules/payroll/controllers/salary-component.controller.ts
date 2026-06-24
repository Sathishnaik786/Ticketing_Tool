import { Request, Response } from 'express';
import { SalaryComponentService } from '../services/salary-component.service';

export class SalaryComponentController {
  static async getAll(req: Request, res: Response) {
    try {
      const components = await SalaryComponentService.getAll();
      res.json(components);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const component = await SalaryComponentService.getById(req.params.id);
      res.json(component);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const component = await SalaryComponentService.create(req.body, (req as any).user.id);
      res.status(201).json(component);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const component = await SalaryComponentService.update(req.params.id, req.body, (req as any).user.id);
      res.json(component);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await SalaryComponentService.delete(req.params.id, (req as any).user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
