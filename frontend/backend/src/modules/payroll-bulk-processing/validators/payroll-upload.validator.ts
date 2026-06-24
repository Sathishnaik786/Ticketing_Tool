import { z } from 'zod';

export const PayrollRowSchema = z.object({
  employeeCode: z.string().min(1, "Employee Code is required"),
  month: z.number().int().min(1).max(12, "Month must be between 1 and 12"),
  year: z.number().int().min(2020).max(2100, "Invalid year"),
  
  // Operational Variables
  payableDays: z.number().min(0).max(31).default(30),
  lopDays: z.number().min(0).max(31).default(0),
  
  // Earnings
  basic: z.number().min(0).default(0),
  hra: z.number().min(0).default(0),
  specialAllowance: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  incentives: z.number().min(0).default(0),
  overtime: z.number().min(0).default(0),
  otherAdditions: z.number().min(0).default(0),

  // Deductions
  pf: z.number().min(0).default(0),
  pfEmployer: z.number().min(0).default(0),
  esi: z.number().min(0).default(0),
  esiEmployer: z.number().min(0).default(0),
  professionalTax: z.number().min(0).default(0),
  incomeTax: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),

  variablePay: z.number().min(0).default(0),
  gratuity: z.number().min(0).default(0),

  // Treasury & Identity
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  uan: z.string().optional().nullable(),

  grossSalary: z.number().optional().nullable(),
  netSalary: z.number().optional().nullable(),
});

export type PayrollRow = z.infer<typeof PayrollRowSchema>;
