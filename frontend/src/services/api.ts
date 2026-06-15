import {
  User,
  AuthResponse,
  Employee,
  Department,
  Attendance,
  LeaveType,
  LeaveRequest,
  Document,
  DocumentType,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  LoginFormData,
  EmployeeFormData,
  LeaveFormData,
  DepartmentFormData,
  WorkItem,
  WorkComment,
  WorkItemFormData,
  Project,
  ProjectMember,
  ProjectDocument,
  ProjectTask,
  ProjectMeeting,
  ProjectTodo,
  ProjectUpdate,
  ProjectFormData,
  AttendanceReport,
  LeaveReport,
  EmployeeReport,
  UserWithEmployee,
  Conversation,
  ChatMessage,
  Notification,
  ProjectMemberRole
} from '@/types';
import { clearAuthStorage, getAccessToken, tryRefreshSession } from '@/services/authSession';

// Base API URL - replace with your Express backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Helper function for API calls
export async function apiCall(
  url: string,
  method: string,
  body?: any,
  token?: string,
  retryOnUnauthorized = true
) {
  const isFormData = body instanceof FormData;
  
  const headers: any = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const dynamicToken = getAccessToken() || token;
  if (dynamicToken) {
    headers.Authorization = `Bearer ${dynamicToken}`;
  }

  console.log(`API [${method}] ${url} - initiating...`);
  const executeRequest = () => fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  let res = await executeRequest();

  if (res.status === 401 && retryOnUnauthorized && !url.startsWith('/auth/login')) {
    const refreshedToken = await refreshAccessTokenOnce();
    if (refreshedToken) {
      headers.Authorization = `Bearer ${refreshedToken}`;
      res = await executeRequest();
    } else {
      clearAuthStorage();
    }
  }

  console.log(`API [${method}] ${url} - Status: ${res.status}`);

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { message: await res.text() };
  }

  if (!res.ok) {
    const error = new Error(data.message || 'API Error');
    (error as any).status = res.status;
    (error as any).message = data.error || data.message || 'API Error';
    throw error;
  }

  return data;
}

// =====================
// AUTH API
// =====================
export const authApi = {
  checkEmailExists: async (email: string) => {
    return apiCall('/auth/check-email', 'POST', { email });
  },

  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', 'POST', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiCall('/auth/reset-password', 'POST', { token, password });
  },

  login: async (credentials: any) => {
    return apiCall('/auth/login', 'POST', credentials);
  },

  me: async (): Promise<ApiResponse<{ user: User }>> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/auth/me', 'GET', undefined, token);
  },

  createUser: async (userData: { email: string; role: string; departmentId?: string; managerId?: string }) => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/auth/admin/users', 'POST', userData, token);
  },
};

// =====================
// EMPLOYEES API
// =====================
export const employeesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; departmentId?: string; sortBy?: string; sortOrder?: string }): Promise<PaginatedResponse<Employee>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/employees?${queryParams.toString()}`, 'GET', undefined, token);

    // The backend returns { success: true, data: { data: [...], total: count, page: page, limit: limit, totalPages: totalPages } }
    // So response contains the full response object
    if (response.data && response.data.data && response.data.total !== undefined) {
      // Response is in paginated format
      return {
        data: (response.data.data || []) as Employee[],
        meta: {
          page: response.data.page || params?.page || 1,
          limit: response.data.limit || params?.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        }
      };
    } else {
      // Response is a simple array, wrap it in PaginatedResponse format
      return {
        data: (response.data || []) as Employee[],
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.data?.length || 0,
          totalPages: 1
        }
      };
    }
  },

  getById: async (id: string): Promise<Employee | undefined> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/employees/${id}`, 'GET', undefined, token);
    return response.data || response;
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/employees', 'POST', data, token);
    return response.data || response;
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/employees/${id}`, 'PUT', data, token);
    return response.data || response;
  },

  // Profile-specific endpoints
  getProfile: async (): Promise<Employee | undefined> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/employees/profile', 'GET', undefined, token);
    return response.data || response;
  },

  updateProfile: async (data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/employees/profile', 'PUT', data, token);
    return response.data || response;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token') || undefined;
    await apiCall(`/employees/${id}`, 'DELETE', undefined, token);
  },
};

// =====================
// DEPARTMENTS API
// =====================
export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/departments', 'GET', undefined, token);
    return response.data || [];
  },

  getById: async (id: string): Promise<Department | undefined> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/departments/${id}`, 'GET', undefined, token);
    return response.data || response;
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/departments', 'POST', data, token);
  },

  update: async (id: string, data: Partial<Department>): Promise<Department> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/departments/${id}`, 'PUT', data, token);
  },
};

// =====================
// ATTENDANCE API
// =====================
export const attendanceApi = {
  checkIn: async (employeeId: string): Promise<Attendance> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/attendance/check-in', 'POST', { employeeId }, token);
  },

  checkOut: async (attendanceId: string): Promise<Attendance> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/attendance/check-out', 'POST', { attendanceId }, token);
  },

  getMyAttendance: async (employeeId: string, params?: { startDate?: string; endDate?: string }): Promise<Attendance[]> => {
    const queryParams = new URLSearchParams({ employeeId });
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/attendance/me?${queryParams.toString()}`, 'GET', undefined, token);
    return response.data || [];
  },

  getReport: async (params?: { date?: string; departmentId?: string; employeeId?: string }): Promise<ApiResponse<Attendance[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/attendance/report?${queryParams.toString()}`, 'GET', undefined, token);
    return {
      success: response.success,
      data: response.data || []
    };
  },
};

// =====================
// LEAVES API
// =====================
export const leavesApi = {
  apply: async (data: { employeeId: string; leaveTypeId: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/leaves/apply', 'POST', data, token);
  },

  getAll: async (params?: { status?: string; employeeId?: string }): Promise<ApiResponse<LeaveRequest[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/leaves?${queryParams.toString()}`, 'GET', undefined, token);
    return {
      success: response.success,
      data: response.data || []
    };
  },

  approve: async (id: string, approverId: string, comments?: string): Promise<LeaveRequest> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/leaves/${id}/approve`, 'PUT', { approverId, comments }, token);
  },

  reject: async (id: string, approverId: string, comments?: string): Promise<LeaveRequest> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/leaves/${id}/reject`, 'PUT', { approverId, comments }, token);
  },

  getTypes: async (): Promise<LeaveType[]> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/leaves/types', 'GET', undefined, token);
  },
};

// =====================
// DOCUMENTS API
// =====================
export const documentsApi = {
  upload: async (employeeId: string, file: File, type: string): Promise<Document> => {
    // Note: Simple JSON upload for now as per controller logic
    // In a full implementation, use FormData
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/documents/upload', 'POST', {
      employeeId,
      name: file.name,
      type,
      fileSize: file.size,
      mimeType: file.type
    }, token);
  },

  getByEmployee: async (employeeId: string): Promise<Document[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/documents/${employeeId}`, 'GET', undefined, token);
    return response.data || [];
  },
};

// =====================
// CHAT API
// =====================
export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/chat/conversations', 'GET', undefined, token);
    return response.data || [];
  },

  getMessages: async (conversationId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/chat/messages/${conversationId}?page=${page}&limit=${limit}`, 'GET', undefined, token);
    return response.data || [];
  },

  markMessagesRead: async (conversationId: string): Promise<void> => {
    const token = localStorage.getItem('token') || undefined;
    await apiCall(`/chat/read/${conversationId}`, 'POST', undefined, token);
  },
};

// =====================
// NOTIFICATIONS API
// =====================
export const notificationsApi = {
  getNotifications: async (page: number = 1, limit: number = 50): Promise<Notification[]> => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await apiCall(`/notifications?page=${page}&limit=${limit}`, 'GET', undefined, token);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token') || undefined;
      await apiCall(`/notifications/read/${id}`, 'POST', undefined, token);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllNotificationsRead: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token') || undefined;
      await apiCall('/notifications/read-all', 'POST', undefined, token);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await apiCall('/notifications/unread-count', 'GET', undefined, token);
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
};

// =====================
// REPORTS API
// =====================
export const reportsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/reports/dashboard', 'GET', undefined, token);
    return response.data || {};
  },

  getAttendanceReport: async (): Promise<ApiResponse<AttendanceReport>> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/reports/attendance', 'GET', undefined, token);
    return {
      success: response.success,
      data: response.data || null
    };
  },

  getLeaveReport: async (): Promise<LeaveReport> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/reports/leaves', 'GET', undefined, token);
    return response.data || null;
  },

  getEmployeeReport: async (): Promise<EmployeeReport> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/reports/employees', 'GET', undefined, token);
    return response.data || null;
  },
};

// =====================
// PROJECTS API
// =====================
export const projectsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<PaginatedResponse<Project>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects?${queryParams.toString()}`, 'GET', undefined, token);

    // The backend returns { data: [...], meta: { total, pages, page, limit } }
    return {
      data: (response.data || []) as Project[],
      meta: response.meta || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: response.data?.length || 0,
        totalPages: 1
      }
    };
  },

  getMyProjects: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<PaginatedResponse<Project>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/my-projects?${queryParams.toString()}`, 'GET', undefined, token);

    return {
      data: (response.data || []) as Project[],
      meta: response.meta || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: response.data?.length || 0,
        totalPages: 1
      }
    };
  },

  getById: async (id: string): Promise<Project | undefined> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/${id}`, 'GET', undefined, token);
    return response.data || response;
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/projects', 'POST', data, token);
  },

  update: async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${id}`, 'PATCH', data, token);
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token') || undefined;
    await apiCall(`/projects/${id}`, 'DELETE', undefined, token);
  },

  // Project members API
  addMember: async (projectId: string, data: { employee_id: string; role: ProjectMemberRole }): Promise<ProjectMember> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/members`, 'POST', data, token);
  },

  removeMember: async (projectId: string, employeeId: string): Promise<void> => {
    const token = localStorage.getItem('token') || undefined;
    await apiCall(`/projects/${projectId}/members/${employeeId}`, 'DELETE', undefined, token);
  },

  // Project documents API
  uploadDocument: async (projectId: string, data: { file_name: string; file_url: string }): Promise<ProjectDocument> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/documents`, 'POST', data, token);
  },

  getDocuments: async (projectId: string): Promise<ProjectDocument[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/${projectId}/documents`, 'GET', undefined, token);
    return response.data || [];
  },

  // Project tasks API
  createTask: async (projectId: string, data: Omit<ProjectTask, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<ProjectTask> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/tasks`, 'POST', data, token);
  },

  getTasks: async (projectId: string): Promise<ProjectTask[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/${projectId}/tasks`, 'GET', undefined, token);
    return response.data || [];
  },

  updateTask: async (taskId: string, data: Partial<Omit<ProjectTask, 'id' | 'project_id' | 'created_at' | 'updated_at'>>): Promise<ProjectTask> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/tasks/${taskId}`, 'PATCH', data, token);
  },

  // Project meetings API
  createMeeting: async (projectId: string, data: Omit<ProjectMeeting, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<ProjectMeeting> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/meetings`, 'POST', data, token);
  },

  getMeetings: async (projectId: string): Promise<ProjectMeeting[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/${projectId}/meetings`, 'GET', undefined, token);
    return response.data || [];
  },

  // Project todos API
  createTodo: async (projectId: string, data: Omit<ProjectTodo, 'id' | 'project_id' | 'created_at'>): Promise<ProjectTodo> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/todos`, 'POST', data, token);
  },

  updateTodo: async (todoId: string, data: Partial<Omit<ProjectTodo, 'id' | 'project_id' | 'created_at'>>): Promise<ProjectTodo> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/todos/${todoId}`, 'PATCH', data, token);
  },

  // Project updates API
  createUpdate: async (projectId: string, data: Omit<ProjectUpdate, 'id' | 'project_id' | 'created_at'>): Promise<ProjectUpdate> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall(`/projects/${projectId}/updates`, 'POST', data, token);
  },

  getUpdates: async (projectId: string): Promise<ProjectUpdate[]> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/projects/${projectId}/updates`, 'GET', undefined, token);
    return response.data || [];
  },
};

// =====================
// ANALYTICS API
// =====================
export const analyticsApi = {
  getAdminOverview: async (): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/analytics/admin/overview', 'GET', undefined, token);
  },

  getManagerTeamProgress: async (): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/analytics/manager/team-progress', 'GET', undefined, token);
  },

  getHRWorkforce: async (): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/analytics/hr/workforce', 'GET', undefined, token);
  },

  getEmployeeSelf: async (): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('token') || undefined;
    return apiCall('/analytics/employee/self', 'GET', undefined, token);
  },
};

// =====================
// MEETUPS API (frontend integration)
// =====================

export interface MeetupApiPayload {
  title: string;
  description?: string;
  type: string;
  platform: "TEAMS" | "GOOGLE_MEET";
  link?: string;
  date: string;       // ISO string for scheduled_at
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}

export interface MeetupApiModel {
  id: string;
  title: string;
  description?: string;
  type: string;
  platform: "TEAMS" | "GOOGLE_MEET";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  departmentId?: string;
  createdBy: string;
  date?: string;
  dateLabel?: string;
  timeLabel?: string;
  startTime?: string;
  endTime?: string;
  hostName?: string;
  requestedBy?: string;
  requesterName?: string;
  meet_link?: string;
  link?: string;
}

export const meetupsApi = {
  // GET /meetups - list all visible meetups (approved + own pending), scoped by backend
  getAll: async (): Promise<MeetupApiModel[]> => {
    const token = localStorage.getItem('token') || undefined;
    try {
      const response = await apiCall('/meetups', 'GET', undefined, token);
      return (response.data || []) as MeetupApiModel[];
    } catch (error: any) {
      // Graceful fallback when API route is not yet implemented
      if (error?.message?.includes('API Route not found')) {
        return [];
      }
      throw error;
    }
  },

  // POST /meetups/request - employee requests a meetup (status will be pending)
  request: async (payload: MeetupApiPayload): Promise<MeetupApiModel> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/meetups/request', 'POST', payload, token);
    return response.data as MeetupApiModel;
  },

  // POST /meetups/create - admin/manager creates an approved meetup
  create: async (payload: MeetupApiPayload): Promise<MeetupApiModel> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall('/meetups/create', 'POST', payload, token);
    return response.data as MeetupApiModel;
  },

  // POST /meetups/approve/:id - approve or reject a meetup
  approve: async (id: string, approved: boolean): Promise<MeetupApiModel> => {
    const token = localStorage.getItem('token') || undefined;
    const response = await apiCall(`/meetups/approve/${id}`, 'POST', { approved }, token);
    return response.data as MeetupApiModel;
  },
};

// =====================
// CALENDAR EVENTS API
// =====================

export interface CalendarEventApiModel {
  id: string;
  meetupId?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: "MEETUP";
  department_id?: string;
  created_by: string;
  platform?: "TEAMS" | "GOOGLE_MEET";
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  meet_link?: string;
}

export const calendarApi = {
  getEvents: async (): Promise<CalendarEventApiModel[]> => {
    const token = localStorage.getItem('token') || undefined;
    try {
      const response = await apiCall('/calendar-events', 'GET', undefined, token);
      return (response.data || []) as CalendarEventApiModel[];
    } catch (error: any) {
      // If calendar endpoint is not ready yet, fall back to empty list
      if (error?.message?.includes('API Route not found')) {
        return [];
      }
      throw error;
    }
  },
};
