import { Request, Response } from 'express';
import { SalaryAssignmentService } from '../services/salary-assignment.service';

export class SalaryAssignmentController {
  static async getAll(req: Request, res: Response) {
    try {
      const assignments = await SalaryAssignmentService.getAll();
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByEmployeeId(req: Request, res: Response) {
    try {
      const assignments = await SalaryAssignmentService.getByEmployeeId(req.params.employeeId);
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const assignment = await SalaryAssignmentService.create(req.body, (req as any).user.id);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async preview(req: Request, res: Response) {
    try {
      const { employeeId, annualCtc, structureId } = req.body;
      const preview = await SalaryAssignmentService.calculateSalaryPreview(employeeId, annualCtc, structureId);
      res.json(preview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
