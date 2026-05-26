// User & Authentication Types
export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  employeeId: string;
  role: Role;
  position?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  profile_image?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserWithEmployee extends User {
  employee?: Employee | null;
}

// Employee Types
export interface Employee {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  profile_image?: string;
  departmentId: string;
  department?: Department;
  position: string;
  role: Role;
  salary: number;
  dateOfBirth: string;
  dateOfJoining: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: EmployeeStatus;
  payroll_status: 'READY' | 'INCOMPLETE' | 'REVIEW_REQUIRED';
  salary_structure_type: 'AUTO_DERIVED' | 'CUSTOM_ENTERPRISE';
  monthly_gross_salary: number;
  annual_ctc: number;
  basic_salary_component: number;
  hra_component: number;
  special_allowance_component: number;
  pf_employee_component: number;
  pf_employer_component: number;
  gratuity_component: number;
  variable_pay_component: number;
  pf_eligible: boolean;
  pt_applicable: boolean;
  tax_regime: 'OLD' | 'NEW';
  pan_number?: string;
  uan_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  managerId?: string;
  manager?: Employee;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  presentToday: number;
  attendanceRate: number;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  manager?: Employee;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';

// Leave Types
export interface LeaveType {
  id: string;
  name: string;
  description: string;
  daysAllowed: number;
  carryForward: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveTypeId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approver?: Employee;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// Document Types
export interface Document {
  id: string;
  employeeId: string;
  employee?: Employee;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION' | 'EXPERIENCE' | 'CONTRACT' | 'OTHER';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  sourceId?: string;
  createdAt: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

// Chat Types
export interface Conversation {
  conversationId: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: Role;
  };
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Report Types
export interface AttendanceReport {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  late: number;
  averageWorkHours: number;
  attendanceRate: number;
  monthlyTrend: MonthlyTrendData[];
}

export interface LeaveReport {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: LeaveByTypeData[];
  monthlyTrend: MonthlyTrendData[];
}

export interface EmployeeReport {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  byDepartment: DepartmentData[];
  byRole: RoleData[];
}

export interface MonthlyTrendData {
  month: string;
  value: number;
}

export interface LeaveByTypeData {
  type: string;
  count: number;
}

export interface DepartmentData {
  department: string;
  count: number;
}

export interface RoleData {
  role: string;
  count: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  salary: number;
  dateOfBirth: string;
  dateOfJoining: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: EmployeeStatus;
  payroll_status: 'READY' | 'INCOMPLETE' | 'REVIEW_REQUIRED';
  salary_structure_type: 'AUTO_DERIVED' | 'CUSTOM_ENTERPRISE';
  monthly_gross_salary: number;
  annual_ctc: number;
  basic_salary_component: number;
  hra_component: number;
  special_allowance_component: number;
  pf_employee_component: number;
  pf_employer_component: number;
  gratuity_component: number;
  variable_pay_component: number;
  pf_eligible: boolean;
  pt_applicable: boolean;
  tax_regime: 'OLD' | 'NEW';
  pan_number?: string;
  uan_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  managerId?: string;
}

export interface LeaveFormData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface DepartmentFormData {
  name: string;
  description: string;
  managerId?: string;
}

// Work Item Types
export type WorkItemType = 'PROJECT' | 'TASK' | 'TODO' | 'MEETING' | 'ASSIGNMENT' | 'UPDATE';
export type WorkItemStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
export type WorkItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  createdBy: string;
  createdByName?: string;
  assignedTo?: string;
  assignedToName?: string;
  departmentId?: string;
  department?: Department;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkComment {
  id: string;
  workItemId: string;
  comment: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface WorkItemFormData {
  title: string;
  description?: string;
  type: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignedTo?: string;
  departmentId?: string;
  startDate?: string;
  dueDate?: string;
}

// Project Types
export type ProjectType = 'WEBSITE' | 'MOBILE_APP' | 'SOFTWARE_PRODUCT' | 'CLOUD' | 'DEVOPS' | 'INTERNAL' | 'CLIENT_PROJECT';

export type ProjectStatus = 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export type ProjectMemberRole = 'LEAD' | 'MEMBER';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role: ProjectMemberRole;
  employee?: Employee;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_by_user?: Employee;
  uploaded_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_to_user?: Employee;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMeeting {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTodo {
  id: string;
  project_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  employee_id: string;
  employee?: Employee;
  message: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  manager_id: string;
  manager?: Employee;
  client_id?: string;
  client?: Client;
  created_by: string;
  created_at: string;
  updated_at: string;
  project_members: ProjectMember[];
  project_documents: ProjectDocument[];
  project_tasks: ProjectTask[];
  project_meetings: ProjectMeeting[];
  project_todos: ProjectTodo[];
  project_updates: ProjectUpdate[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  manager_id: string;
  client_id?: string;
}

// Analytics Types
export interface AdminOverviewData {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  totalWorkItems: number;
  workItemsByStatus: Record<string, number>;
  presentToday: number;
  absentToday: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
}

export interface ManagerTeamProgressData {
  teamSize: number;
  teamMembers: Employee[];
  teamWorkItems: number;
  teamWorkByStatus: Record<string, number>;
  teamPresentToday: number;
  teamPendingLeaveRequests: number;
  teamCompletedWorkItems: number;
}

export interface HRWorkforceData {
  employeesByStatus: Record<string, number>;
  employeesByDepartment: Array<{ department: string; count: number }>;
  averageTenure: string;
  newHiresThisMonth: number;
  upcomingBirthdays: number;
  leaveRequestsByStatus: Record<string, number>;
}

export interface EmployeeSelfData {
  totalWorkItems: number;
  completedWorkItems: number;
  pendingWorkItems: number;
  inProgressWorkItems: number;
  completionRate: string;
  attendanceThisMonth: number;
  totalLeaveRequests: number;
  approvedLeaveRequests: number;
  pendingLeaveRequests: number;
}
