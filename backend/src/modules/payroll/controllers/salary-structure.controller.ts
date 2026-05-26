import { Request, Response } from 'express';
import { SalaryStructureService } from '../services/salary-structure.service';

export class SalaryStructureController {
  static async getAll(req: Request, res: Response) {
    try {
      const structures = await SalaryStructureService.getAll();
      res.json(structures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const structure = await SalaryStructureService.getById(req.params.id);
      res.json(structure);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const structure = await SalaryStructureService.create(req.body, (req as any).user.id);
      res.status(201).json(structure);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const structure = await SalaryStructureService.update(req.params.id, req.body, (req as any).user.id);
      res.json(structure);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await SalaryStructureService.delete(req.params.id, (req as any).user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
