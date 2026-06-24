import { Employee, Department, Attendance, LeaveRequest, LeaveType, Document, AttendanceReport, LeaveReport, EmployeeReport } from '@/types';

// Mock Departments
export const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', description: 'Software development and engineering', managerId: '1', employeeCount: 24, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Human Resources', description: 'HR and talent management', managerId: '2', employeeCount: 8, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Marketing', description: 'Marketing and communications', managerId: '3', employeeCount: 12, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Finance', description: 'Financial operations and accounting', managerId: '4', employeeCount: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Sales', description: 'Sales and business development', managerId: '5', employeeCount: 18, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Operations', description: 'Operations and logistics', managerId: '6', employeeCount: 15, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

// Mock Employees
export const mockEmployees: Employee[] = [
  { id: '1', firstName: 'John', lastName: 'Mitchell', email: 'john.mitchell@company.com', phone: '+1-555-0101', departmentId: '1', position: 'Engineering Director', salary: 185000, dateOfBirth: '1985-03-15', dateOfJoining: '2019-06-01', address: '123 Tech Lane', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94102', emergencyContact: 'Sarah Mitchell', emergencyPhone: '+1-555-0102', status: 'ACTIVE', createdAt: '2019-06-01', updatedAt: '2024-01-15' },
  { id: '2', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@company.com', phone: '+1-555-0103', departmentId: '2', position: 'HR Manager', salary: 95000, dateOfBirth: '1988-07-22', dateOfJoining: '2020-02-15', address: '456 Oak Street', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94103', emergencyContact: 'Carlos Rodriguez', emergencyPhone: '+1-555-0104', status: 'ACTIVE', createdAt: '2020-02-15', updatedAt: '2024-01-10' },
  { id: '3', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@company.com', phone: '+1-555-0105', departmentId: '3', position: 'Marketing Director', salary: 140000, dateOfBirth: '1982-11-08', dateOfJoining: '2018-09-01', address: '789 Market St', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94104', emergencyContact: 'Lisa Chen', emergencyPhone: '+1-555-0106', status: 'ACTIVE', createdAt: '2018-09-01', updatedAt: '2024-01-12' },
  { id: '4', firstName: 'Sarah', lastName: 'Thompson', email: 'sarah.thompson@company.com', phone: '+1-555-0107', departmentId: '4', position: 'Finance Director', salary: 165000, dateOfBirth: '1980-05-30', dateOfJoining: '2017-04-15', address: '321 Financial Ave', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105', emergencyContact: 'David Thompson', emergencyPhone: '+1-555-0108', status: 'ACTIVE', createdAt: '2017-04-15', updatedAt: '2024-01-08' },
  { id: '5', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@company.com', phone: '+1-555-0109', departmentId: '5', position: 'Sales Director', salary: 155000, dateOfBirth: '1984-09-12', dateOfJoining: '2019-01-10', address: '654 Sales Blvd', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94106', emergencyContact: 'Amanda Wilson', emergencyPhone: '+1-555-0110', status: 'ACTIVE', createdAt: '2019-01-10', updatedAt: '2024-01-05' },
  { id: '6', firstName: 'Anna', lastName: 'Kowalski', email: 'anna.kowalski@company.com', phone: '+1-555-0111', departmentId: '6', position: 'Operations Manager', salary: 110000, dateOfBirth: '1990-02-28', dateOfJoining: '2021-03-22', address: '987 Ops Center', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94107', emergencyContact: 'Peter Kowalski', emergencyPhone: '+1-555-0112', status: 'ACTIVE', createdAt: '2021-03-22', updatedAt: '2024-01-14' },
  { id: '7', firstName: 'David', lastName: 'Kim', email: 'david.kim@company.com', phone: '+1-555-0113', departmentId: '1', position: 'Senior Software Engineer', salary: 145000, dateOfBirth: '1991-06-18', dateOfJoining: '2020-08-01', address: '159 Code Way', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94108', emergencyContact: 'Grace Kim', emergencyPhone: '+1-555-0114', status: 'ACTIVE', managerId: '1', createdAt: '2020-08-01', updatedAt: '2024-01-11' },
  { id: '8', firstName: 'Jessica', lastName: 'Brown', email: 'jessica.brown@company.com', phone: '+1-555-0115', departmentId: '1', position: 'Software Engineer', salary: 115000, dateOfBirth: '1993-12-05', dateOfJoining: '2022-01-15', address: '753 Dev Lane', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94109', emergencyContact: 'Michael Brown', emergencyPhone: '+1-555-0116', status: 'ON_LEAVE', managerId: '1', createdAt: '2022-01-15', updatedAt: '2024-01-09' },
  { id: '9', firstName: 'Robert', lastName: 'Martinez', email: 'robert.martinez@company.com', phone: '+1-555-0117', departmentId: '2', position: 'HR Specialist', salary: 72000, dateOfBirth: '1994-08-25', dateOfJoining: '2023-02-01', address: '852 People St', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94110', emergencyContact: 'Maria Martinez', emergencyPhone: '+1-555-0118', status: 'ACTIVE', managerId: '2', createdAt: '2023-02-01', updatedAt: '2024-01-13' },
  { id: '10', firstName: 'Laura', lastName: 'Anderson', email: 'laura.anderson@company.com', phone: '+1-555-0119', departmentId: '3', position: 'Marketing Specialist', salary: 78000, dateOfBirth: '1995-04-10', dateOfJoining: '2023-06-15', address: '426 Brand Ave', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94111', emergencyContact: 'Tom Anderson', emergencyPhone: '+1-555-0120', status: 'ACTIVE', managerId: '3', createdAt: '2023-06-15', updatedAt: '2024-01-07' },
  { id: '11', firstName: 'Christopher', lastName: 'Lee', email: 'chris.lee@company.com', phone: '+1-555-0121', departmentId: '5', position: 'Sales Representative', salary: 68000, dateOfBirth: '1996-01-20', dateOfJoining: '2023-09-01', address: '147 Deal Close', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94112', emergencyContact: 'Jennifer Lee', emergencyPhone: '+1-555-0122', status: 'ACTIVE', managerId: '5', createdAt: '2023-09-01', updatedAt: '2024-01-06' },
  { id: '12', firstName: 'Michelle', lastName: 'Taylor', email: 'michelle.taylor@company.com', phone: '+1-555-0123', departmentId: '4', position: 'Accountant', salary: 82000, dateOfBirth: '1992-10-15', dateOfJoining: '2021-11-01', address: '369 Ledger Lane', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94113', emergencyContact: 'Brian Taylor', emergencyPhone: '+1-555-0124', status: 'ACTIVE', managerId: '4', createdAt: '2021-11-01', updatedAt: '2024-01-04' },
];

// Mock Leave Types
export const mockLeaveTypes: LeaveType[] = [
  { id: '1', name: 'Annual Leave', description: 'Paid time off for vacation', daysAllowed: 20, carryForward: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Sick Leave', description: 'Leave for illness or medical appointments', daysAllowed: 12, carryForward: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Personal Leave', description: 'Leave for personal matters', daysAllowed: 5, carryForward: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Maternity Leave', description: 'Leave for new mothers', daysAllowed: 90, carryForward: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Paternity Leave', description: 'Leave for new fathers', daysAllowed: 14, carryForward: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

// Mock Leave Requests
export const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: '8', leaveTypeId: '1', startDate: '2024-01-15', endDate: '2024-01-19', totalDays: 5, reason: 'Family vacation', status: 'APPROVED', approvedBy: '1', comments: 'Approved. Enjoy your vacation!', createdAt: '2024-01-05', updatedAt: '2024-01-06' },
  { id: '2', employeeId: '7', leaveTypeId: '2', startDate: '2024-01-22', endDate: '2024-01-23', totalDays: 2, reason: 'Medical checkup', status: 'PENDING', createdAt: '2024-01-18', updatedAt: '2024-01-18' },
  { id: '3', employeeId: '10', leaveTypeId: '3', startDate: '2024-01-25', endDate: '2024-01-25', totalDays: 1, reason: 'Personal errands', status: 'PENDING', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
  { id: '4', employeeId: '11', leaveTypeId: '1', startDate: '2024-02-01', endDate: '2024-02-05', totalDays: 5, reason: 'Wedding attendance', status: 'APPROVED', approvedBy: '5', comments: 'Congratulations!', createdAt: '2024-01-15', updatedAt: '2024-01-16' },
  { id: '5', employeeId: '9', leaveTypeId: '2', startDate: '2024-01-10', endDate: '2024-01-11', totalDays: 2, reason: 'Flu symptoms', status: 'APPROVED', approvedBy: '2', createdAt: '2024-01-09', updatedAt: '2024-01-09' },
  { id: '6', employeeId: '12', leaveTypeId: '1', startDate: '2024-02-12', endDate: '2024-02-16', totalDays: 5, reason: 'Annual vacation', status: 'REJECTED', approvedBy: '4', comments: 'Critical deadline during this period. Please reschedule.', createdAt: '2024-01-25', updatedAt: '2024-01-26' },
];

// Mock Attendance (for today and recent days)
const today = new Date().toISOString().split('T')[0];
export const mockAttendance: Attendance[] = [
  { id: '1', employeeId: '1', date: today, checkIn: '08:45', checkOut: '18:15', status: 'PRESENT', workHours: 9.5, createdAt: today, updatedAt: today },
  { id: '2', employeeId: '2', date: today, checkIn: '09:00', checkOut: '17:30', status: 'PRESENT', workHours: 8.5, createdAt: today, updatedAt: today },
  { id: '3', employeeId: '3', date: today, checkIn: '08:30', checkOut: '18:00', status: 'PRESENT', workHours: 9.5, createdAt: today, updatedAt: today },
  { id: '4', employeeId: '4', date: today, checkIn: '09:15', status: 'PRESENT', workHours: 0, createdAt: today, updatedAt: today },
  { id: '5', employeeId: '5', date: today, checkIn: '09:30', status: 'LATE', workHours: 0, notes: 'Traffic delay', createdAt: today, updatedAt: today },
  { id: '6', employeeId: '6', date: today, checkIn: '08:55', checkOut: '17:45', status: 'PRESENT', workHours: 8.83, createdAt: today, updatedAt: today },
  { id: '7', employeeId: '7', date: today, checkIn: '08:40', status: 'PRESENT', workHours: 0, createdAt: today, updatedAt: today },
  { id: '8', employeeId: '8', date: today, status: 'ON_LEAVE', createdAt: today, updatedAt: today },
  { id: '9', employeeId: '9', date: today, checkIn: '09:05', checkOut: '17:30', status: 'PRESENT', workHours: 8.42, createdAt: today, updatedAt: today },
  { id: '10', employeeId: '10', date: today, status: 'ABSENT', notes: 'No call, no show', createdAt: today, updatedAt: today },
  { id: '11', employeeId: '11', date: today, checkIn: '08:50', status: 'PRESENT', workHours: 0, createdAt: today, updatedAt: today },
  { id: '12', employeeId: '12', date: today, checkIn: '09:00', checkOut: '17:00', status: 'PRESENT', workHours: 8, createdAt: today, updatedAt: today },
];

// Mock Documents
export const mockDocuments: Document[] = [
  { id: '1', employeeId: '1', name: 'Passport Copy', type: 'ID_PROOF', fileUrl: '/docs/passport_1.pdf', fileSize: 245000, mimeType: 'application/pdf', uploadedBy: '2', createdAt: '2019-06-01', updatedAt: '2019-06-01' },
  { id: '2', employeeId: '1', name: 'Employment Contract', type: 'CONTRACT', fileUrl: '/docs/contract_1.pdf', fileSize: 356000, mimeType: 'application/pdf', uploadedBy: '2', createdAt: '2019-06-01', updatedAt: '2019-06-01' },
  { id: '3', employeeId: '7', name: 'Masters Degree Certificate', type: 'EDUCATION', fileUrl: '/docs/degree_7.pdf', fileSize: 189000, mimeType: 'application/pdf', uploadedBy: '2', createdAt: '2020-08-01', updatedAt: '2020-08-01' },
  { id: '4', employeeId: '8', name: 'Previous Employment Letter', type: 'EXPERIENCE', fileUrl: '/docs/exp_8.pdf', fileSize: 125000, mimeType: 'application/pdf', uploadedBy: '2', createdAt: '2022-01-15', updatedAt: '2022-01-15' },
];

// Mock Reports
export const mockAttendanceReport: AttendanceReport = {
  totalEmployees: 87,
  presentToday: 72,
  absentToday: 5,
  onLeave: 8,
  late: 2,
  averageWorkHours: 8.2,
  attendanceRate: 94.5,
  monthlyTrend: [
    { month: 'Jul', value: 92 },
    { month: 'Aug', value: 94 },
    { month: 'Sep', value: 93 },
    { month: 'Oct', value: 95 },
    { month: 'Nov', value: 94 },
    { month: 'Dec', value: 91 },
    { month: 'Jan', value: 94 },
  ],
};

export const mockLeaveReport: LeaveReport = {
  totalRequests: 156,
  pending: 12,
  approved: 128,
  rejected: 16,
  byType: [
    { type: 'Annual Leave', count: 85 },
    { type: 'Sick Leave', count: 42 },
    { type: 'Personal Leave', count: 18 },
    { type: 'Other', count: 11 },
  ],
  monthlyTrend: [
    { month: 'Jul', value: 18 },
    { month: 'Aug', value: 22 },
    { month: 'Sep', value: 15 },
    { month: 'Oct', value: 20 },
    { month: 'Nov', value: 25 },
    { month: 'Dec', value: 32 },
    { month: 'Jan', value: 24 },
  ],
};

export const mockEmployeeReport: EmployeeReport = {
  totalEmployees: 87,
  activeEmployees: 82,
  newHires: 8,
  terminations: 2,
  byDepartment: [
    { department: 'Engineering', count: 24 },
    { department: 'Sales', count: 18 },
    { department: 'Operations', count: 15 },
    { department: 'Marketing', count: 12 },
    { department: 'Finance', count: 10 },
    { department: 'HR', count: 8 },
  ],
  byRole: [
    { role: 'Employee', count: 62 },
    { role: 'Manager', count: 18 },
    { role: 'Director', count: 6 },
    { role: 'Executive', count: 1 },
  ],
};
