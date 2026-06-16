/**
 * Centralized query keys for TanStack Query
 * Ensures consistent cache key usage across the app
 */

export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: ['user'] as const,
  me: ['me'] as const,

  // Employees
  employees: (filters?: { page?: number; search?: string; departmentId?: string }) => 
    ['employees', filters] as const,
  employee: (id: string) => ['employee', id] as const,
  employeeProfile: ['employee', 'profile'] as const,

  // Departments
  departments: ['departments'] as const,
  department: (id: string) => ['department', id] as const,

  // Attendance
  attendance: (filters?: { employeeId?: string; date?: string; departmentId?: string }) =>
    ['attendance', filters] as const,
  myAttendance: ['attendance', 'my'] as const,

  // Leaves
  leaves: (filters?: { employeeId?: string; status?: string }) =>
    ['leaves', filters] as const,
  leaveTypes: ['leaveTypes'] as const,
  myLeaves: ['leaves', 'my'] as const,

  // Projects
  projects: (filters?: { page?: number; search?: string }) =>
    ['projects', filters] as const,
  project: (id: string) => ['project', id] as const,
  myProjects: ['projects', 'my'] as const,

  // Documents
  documents: (employeeId?: string) => ['documents', employeeId] as const,

  // Reports
  dashboardStats: ['dashboard', 'stats'] as const,
  attendanceReport: (filters?: any) => ['reports', 'attendance', filters] as const,
  leaveReport: (filters?: any) => ['reports', 'leave', filters] as const,
  employeeReport: (filters?: any) => ['reports', 'employee', filters] as const,

  // Analytics
  analytics: {
    overview: ['analytics', 'overview'] as const,
    employees: ['analytics', 'employees'] as const,
    attendance: ['analytics', 'attendance'] as const,
  },

  // Chat
  conversations: ['conversations'] as const,
  messages: (conversationId: string, page?: number) =>
    ['messages', conversationId, page] as const,

  // Notifications
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread'] as const,

  // Ticketing (ETMS)
  tickets: (filters?: Record<string, unknown>) => ['tickets', filters] as const,
  ticket: (id: string) => ['ticket', id] as const,
  ticketComments: (ticketId: string, includeInternal?: boolean) =>
    ['ticketComments', ticketId, includeInternal] as const,
  ticketAttachments: (ticketId: string) => ['ticketAttachments', ticketId] as const,
  ticketTimeline: (ticketId: string) => ['ticketTimeline', ticketId] as const,
  ticketSla: (ticketId: string) => ['ticketSla', ticketId] as const,
  ticketWatchers: (ticketId: string) => ['ticketWatchers', ticketId] as const,
  ticketCategories: ['ticketCategories'] as const,

  // Ticket Feedback (CSAT)
  ticketFeedback: (ticketId: string) => ['ticketFeedback', ticketId] as const,
  feedbackMetrics: (params?: Record<string, string>) => ['feedbackMetrics', params] as const,
  myFeedbackCount: () => ['myFeedbackCount'] as const,

  // Ticket Assignment (Phase 7.2)
  myAssignmentQueue: (params?: Record<string, unknown>) => ['assignmentQueue', 'my', params] as const,
  teamAssignmentQueue: (params?: Record<string, unknown>) => ['assignmentQueue', 'team', params] as const,
  unassignedQueue: (params?: Record<string, unknown>) => ['assignmentQueue', 'unassigned', params] as const,
  assignmentAnalytics: () => ['assignmentAnalytics'] as const,
  ticketAssignmentHistory: (ticketId: string) => ['ticketAssignmentHistory', ticketId] as const,
};




