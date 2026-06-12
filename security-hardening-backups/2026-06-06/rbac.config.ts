export const PAYROLL_PERMISSIONS = {
  FULL_ACCESS: 'payroll.full_access',
  VIEW: 'payroll.view',
  PROCESS: 'payroll.process',
  MANAGE_SALARY: 'payroll.manage_salary',
  GENERATE_PAYSLIP: 'payroll.generate_payslip',
  TEAM_VIEW: 'payroll.team_view',
  APPROVE_VARIABLE_PAY: 'payroll.approve_variable_pay',
  SELF_VIEW: 'payroll.self_view',
  DOWNLOAD_PAYSLIP: 'payroll.download_payslip',
} as const;

export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  ADMIN: [PAYROLL_PERMISSIONS.FULL_ACCESS],
  HR: [
    PAYROLL_PERMISSIONS.VIEW,
    PAYROLL_PERMISSIONS.PROCESS,
    PAYROLL_PERMISSIONS.MANAGE_SALARY,
    PAYROLL_PERMISSIONS.GENERATE_PAYSLIP
  ],
  MANAGER: [
    PAYROLL_PERMISSIONS.TEAM_VIEW,
    PAYROLL_PERMISSIONS.APPROVE_VARIABLE_PAY
  ],
  EMPLOYEE: [
    PAYROLL_PERMISSIONS.SELF_VIEW,
    PAYROLL_PERMISSIONS.DOWNLOAD_PAYSLIP
  ]
};

export const hasPermission = (role: string, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS_MAP[role.toUpperCase()] || [];
  if (permissions.includes(PAYROLL_PERMISSIONS.FULL_ACCESS)) return true;
  return permissions.includes(permission);
};
