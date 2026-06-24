const { supabase } = require('@lib/supabase');
const NotificationService = require('./notification.service');

class ProjectService {
  static async getAllProjects(userId, role, page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc') {
    const offset = (page - 1) * limit;

    // Get the employee ID for the authenticated user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }

    // First, get projects based on role permissions
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    // Apply role-based filtering
    if (role === 'EMPLOYEE') {
      // For employees, we need to check both manager_id and project_members
      // This requires a more complex query using separate calls
      const projectIds = [];
      
      // Get projects where user is manager (using employee id)
      if (userEmployeeId) {
        const { data: managedProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('manager_id', userEmployeeId);
        
        projectIds.push(...managedProjects.map(p => p.id));
        
        // Get projects where user is a member (using employee id)
        const { data: memberProjects } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('employee_id', userEmployeeId);
        
        const memberProjectIds = memberProjects.map(p => p.project_id);
        projectIds.push(...memberProjectIds);
      }
      
      // Remove duplicates
      const uniqueProjectIds = [...new Set(projectIds)];
      
      if (uniqueProjectIds.length > 0) {
        query = query.in('id', uniqueProjectIds);
      } else {
        // If no projects found, return empty result
        return {
          data: [],
          meta: {
            total: 0,
            pages: 0,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        };
      }
    } else if (role === 'HR_MANAGER') {
      // HR managers can only see projects but not manage them
      // They can see all projects
    } else if (role === 'MANAGER') {
      // Managers can see all projects they manage or are members of
      const projectIds = [];
      
      // Get projects where user is manager (using employee id)
      if (userEmployeeId) {
        const { data: managedProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('manager_id', userEmployeeId);
        
        projectIds.push(...managedProjects.map(p => p.id));
        
        // Get projects where user is a member (using employee id)
        const { data: memberProjects } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('employee_id', userEmployeeId);
        
        const memberProjectIds = memberProjects.map(p => p.project_id);
        projectIds.push(...memberProjectIds);
      }
      
      // Remove duplicates
      const uniqueProjectIds = [...new Set(projectIds)];
      
      if (uniqueProjectIds.length > 0) {
        query = query.in('id', uniqueProjectIds);
      } else {
        // If no projects found, return empty result
        return {
          data: [],
          meta: {
            total: 0,
            pages: 0,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        };
      }
    }
    // ADMIN can see all projects

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: projectData, error: projectError, count } = await query;

    if (projectError) throw projectError;

    // Now fetch additional data separately to avoid relationship issues
    if (projectData && projectData.length > 0) {
      const projectIds = projectData.map(p => p.id);
      
      // Get project managers
      const managersMap = {};
      for (const project of projectData) {
        if (project.manager_id) {
          // Get employee details first
          const { data: employee } = await supabase
            .from('employees')
            .select('user_id, first_name, last_name')
            .eq('id', project.manager_id)
            .single();
          
          if (employee) {
            // Then get profile details
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, full_name, email')
              .eq('user_id', employee.user_id)
              .single();
            
            managersMap[project.manager_id] = profile || {
              user_id: employee.user_id,
              full_name: `${employee.first_name} ${employee.last_name}`
            };
          }
        }
      }
      
      // Get project clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', projectData.map(p => p.client_id).filter(id => id));
      
      const clientsMap = {};
      clientsData.forEach(client => {
        clientsMap[client.id] = client;
      });
      
      // Get project members
      const { data: membersData } = await supabase
        .from('project_members')
        .select('*')
        .in('project_id', projectIds);
      
      // Enhance project members with employee details
      const membersMap = {};
      for (const member of membersData || []) {
        if (!membersMap[member.project_id]) {
          membersMap[member.project_id] = [];
        }
        
        // Get employee details
        const { data: employee } = await supabase
          .from('employees')
          .select('user_id, first_name, last_name, email')
          .eq('id', member.employee_id)
          .single();
        
        if (employee) {
          // Get profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, email as profile_email')
            .eq('user_id', employee.user_id)
            .single();
          
          membersMap[member.project_id].push({
            ...member,
            employee: profile || {
              user_id: employee.user_id,
              full_name: `${employee.first_name} ${employee.last_name}`,
              email: employee.email
            }
          });
        } else {
          membersMap[member.project_id].push({
            ...member,
            employee: null
          });
        }
      }
      
      // Enhance project data
      const enhancedProjects = projectData.map(project => ({
        ...project,
        manager: managersMap[project.manager_id] || null,
        client: clientsMap[project.client_id] || null,
        project_members: membersMap[project.id] || []
      }));
      
      return {
        data: enhancedProjects,
        meta: {
          total: count,
          pages: Math.ceil(count / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      };
    }
    
    return {
      data: projectData || [],
      meta: {
        total: count,
        pages: Math.ceil(count / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }

  static async getProjectById(projectId, userId, role) {
    // First get the project details
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    // Check if user has access to this project based on role
    if (role !== 'ADMIN') {
      // For non-admins, check if they are manager or member
      let hasAccess = false;
      
      // Check if the authenticated user is the manager of this project
      // We need to check if the user_id (from auth) corresponds to the employee_id (in projects.manager_id)
      const { data: userEmployee, error: userEmployeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (userEmployee && !userEmployeeError && userEmployee.id === project.manager_id) {
        hasAccess = true;
      } else {
        // Check if user is a member of the project
        if (userEmployee && !userEmployeeError) {
          const { data: memberCheck, error: memberError } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('employee_id', userEmployee.id)
            .single();
            
          if (memberCheck && !memberError) {
            hasAccess = true;
          }
        }
      }
      
      if (role === 'EMPLOYEE' && !hasAccess) {
        throw new Error('Access denied: You are not a member of this project');
      }
    }

    // Fetch related data separately to avoid relationship issues
    const projectResult = { ...project };
    
    // Get manager details
    if (project.manager_id) {
      // Get the employee details and then their user profile
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name')
        .eq('id', project.manager_id)
        .single();
      
      if (employee) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('user_id', employee.user_id)
          .single();
        
        projectResult.manager = profile || {
          user_id: employee.user_id,
          full_name: `${employee.first_name} ${employee.last_name}`
        };
      } else {
        projectResult.manager = null;
      }
    } else {
      projectResult.manager = null;
    }
    
    // Get created_by user details (if exists)
    if (project.created_by) {
      // Get the employee details and then their user profile
      const { data: createdByEmployee } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name')
        .eq('id', project.created_by)
        .single();
      
      if (createdByEmployee) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('user_id', createdByEmployee.user_id)
          .single();
        
        projectResult.created_by_user = profile || {
          user_id: createdByEmployee.user_id,
          full_name: `${createdByEmployee.first_name} ${createdByEmployee.last_name}`
        };
      } else {
        projectResult.created_by_user = null;
      }
    } else {
      projectResult.created_by_user = null;
    }
    
    // Get client details
    if (project.client_id) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', project.client_id)
        .single();
      
      projectResult.client = clientData || null;
    } else {
      projectResult.client = null;
    }
    
    // Get project members
    const { data: membersData } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId);
    
    // Enhance project members with employee details
    const enhancedMembers = [];
    for (const member of membersData || []) {
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name, email')
        .eq('id', member.employee_id)
        .single();
      
      if (employee) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, full_name, email as profile_email')
          .eq('user_id', employee.user_id)
          .single();
        
        enhancedMembers.push({
          ...member,
          employee: profile || {
            user_id: employee.user_id,
            full_name: `${employee.first_name} ${employee.last_name}`,
            email: employee.email
          }
        });
      } else {
        enhancedMembers.push({
          ...member,
          employee: null
        });
      }
    }
    
    projectResult.project_members = enhancedMembers;
    
    // Get project documents
    const { data: documentsData } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId);
    
    // Enhance project documents with uploader details
    const enhancedDocuments = [];
    for (const doc of documentsData || []) {
      if (doc.uploaded_by) {
        const { data: employee } = await supabase
          .from('employees')
          .select('user_id, first_name, last_name')
          .eq('id', doc.uploaded_by)
          .single();
        
        if (employee) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .eq('user_id', employee.user_id)
            .single();
          
          enhancedDocuments.push({
            ...doc,
            uploaded_by_user: profile || {
              user_id: employee.user_id,
              full_name: `${employee.first_name} ${employee.last_name}`
            }
          });
        } else {
          enhancedDocuments.push({
            ...doc,
            uploaded_by_user: null
          });
        }
      } else {
        enhancedDocuments.push({
          ...doc,
          uploaded_by_user: null
        });
      }
    }
    
    projectResult.project_documents = enhancedDocuments;
    
    // Get project tasks
    const { data: tasksData } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId);
    
    // Enhance project tasks with assigned user details
    const enhancedTasks = [];
    for (const task of tasksData || []) {
      if (task.assigned_to) {
        const { data: employee } = await supabase
          .from('employees')
          .select('user_id, first_name, last_name')
          .eq('id', task.assigned_to)
          .single();
        
        if (employee) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .eq('user_id', employee.user_id)
            .single();
          
          enhancedTasks.push({
            ...task,
            assigned_to_user: profile || {
              user_id: employee.user_id,
              full_name: `${employee.first_name} ${employee.last_name}`
            }
          });
        } else {
          enhancedTasks.push({
            ...task,
            assigned_to_user: null
          });
        }
      } else {
        enhancedTasks.push({
          ...task,
          assigned_to_user: null
        });
      }
    }
    
    projectResult.project_tasks = enhancedTasks;
    
    // Get project meetings
    const { data: meetingsData } = await supabase
      .from('project_meetings')
      .select('*')
      .eq('project_id', projectId);
    
    projectResult.project_meetings = meetingsData || [];
    
    // Get project todos
    const { data: todosData } = await supabase
      .from('project_todos')
      .select('*')
      .eq('project_id', projectId);
    
    projectResult.project_todos = todosData || [];
    
    // Get project updates
    const { data: updatesData } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', projectId);
    
    // Enhance project updates with employee details
    const enhancedUpdates = [];
    for (const update of updatesData || []) {
      if (update.employee_id) {
        const { data: employee } = await supabase
          .from('employees')
          .select('user_id, first_name, last_name')
          .eq('id', update.employee_id)
          .single();
        
        if (employee) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .eq('user_id', employee.user_id)
            .single();
          
          enhancedUpdates.push({
            ...update,
            employee: profile || {
              user_id: employee.user_id,
              full_name: `${employee.first_name} ${employee.last_name}`
            }
          });
        } else {
          enhancedUpdates.push({
            ...update,
            employee: null
          });
        }
      } else {
        enhancedUpdates.push({
          ...update,
          employee: null
        });
      }
    }
    
    projectResult.project_updates = enhancedUpdates;
    
    return projectResult;
  }

  static async createProject(projectData, userId, role) {
    if (!['ADMIN', 'MANAGER'].includes(role)) {
      throw new Error('Access denied: Only ADMIN and MANAGER can create projects');
    }

    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (userEmployeeError || !userEmployee) {
      throw new Error('User does not have an associated employee record');
    }
    
    const userEmployeeId = userEmployee.id;

    // Sanitize the input data, converting empty strings to null for UUID fields
    const { name, description, project_type, start_date, end_date, manager_id, client_id } = projectData;
    
    // Convert empty strings to null for UUID fields to avoid database errors
    const sanitizedManagerId = manager_id && manager_id !== '' ? manager_id : null;
    const sanitizedClientId = client_id && client_id !== '' ? client_id : null;

    // Check if the manager_id (employee id) exists in the employees table
    if (sanitizedManagerId) {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', sanitizedManagerId)
        .single();
      
      if (employeeError || !employee) {
        throw new Error('Manager ID does not correspond to a valid employee');
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        description,
        project_type,
        start_date,
        end_date,
        manager_id: sanitizedManagerId,
        client_id: sanitizedClientId,
        created_by: userEmployeeId  // Use employee ID instead of user ID
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async updateProject(projectId, updateData, userId, role) {
    // Check if user has permission to update this project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN or project manager to update project
    if (role !== 'ADMIN' && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can update project');
    }

    // Sanitize the update data, converting empty strings to null for UUID fields
    const sanitizedUpdateData = { ...updateData };
    
    // Convert empty strings to null for UUID fields to avoid database errors
    if (sanitizedUpdateData.manager_id === '') {
      sanitizedUpdateData.manager_id = null;
    }
    if (sanitizedUpdateData.client_id === '') {
      sanitizedUpdateData.client_id = null;
    }
    
    // Check if the manager_id (employee id) exists in the employees table
    if (sanitizedUpdateData.manager_id) {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', sanitizedUpdateData.manager_id)
        .single();
      
      if (employeeError || !employee) {
        throw new Error('Manager ID does not correspond to a valid employee');
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...sanitizedUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async deleteProject(projectId, userId, role) {
    // Check if user has permission to delete this project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Only ADMIN can delete projects
    if (role !== 'ADMIN') {
      throw new Error('Access denied: Only ADMIN can delete projects');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;

    return { message: 'Project deleted successfully' };
  }

  static async addProjectMember(projectId, memberData, userId, role) {
    // Check if user has permission to add members
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN or project manager to add members
    if (role !== 'ADMIN' && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can add members');
    }

    const { employee_id, role: member_role } = memberData;

    const { data, error } = await supabase
      .from('project_members')
      .insert([{
        project_id: projectId,
        employee_id,
        role: member_role
      }])
      .select()
      .single();

    if (error) {
      // Handle duplicate key error specifically
      if (error.code === '23505') { // PostgreSQL duplicate key error code
        const duplicateError = new Error('Employee is already a member of this project');
        duplicateError.status = 409; // Set status code for frontend handling
        throw duplicateError;
      }
      throw error;
    }

    return data;
  }

  static async removeProjectMember(projectId, employeeId, userId, role) {
    // Check if user has permission to remove members
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN or project manager to remove members
    if (role !== 'ADMIN' && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can remove members');
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('employee_id', employeeId);

    if (error) throw error;

    return { message: 'Project member removed successfully' };
  }

  static async uploadProjectDocument(projectId, documentData, userId, role) {
    // Check if user has access to project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (userEmployeeError || !userEmployee) {
      throw new Error('User does not have an associated employee record');
    }
    
    const userEmployeeId = userEmployee.id;

    // Allow ADMIN, MANAGER role, or project manager to upload documents
    if (!['ADMIN', 'MANAGER'].includes(role) && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can upload documents');
    }

    const { file_name, file_url } = documentData;

    const { data, error } = await supabase
      .from('project_documents')
      .insert([{
        project_id: projectId,
        file_name,
        file_url,
        uploaded_by: userEmployeeId  // Use employee ID instead of user ID
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getProjectDocuments(projectId, userId, role) {
    // Check if user has access to project
    await this.getProjectById(projectId, userId, role);

    const { data, error } = await supabase
      .from('project_documents')
      .select(`
        *,
        uploaded_by_user:profiles(user_id, full_name)
      `)
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  static async createProjectTask(projectId, taskData, userId, role) {
    // Check if user has access to project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN, MANAGER role, or project manager to create tasks
    if (!['ADMIN', 'MANAGER'].includes(role) && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can create tasks');
    }

    const { title, description, assigned_to, status, priority, due_date } = taskData;

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([{
        project_id: projectId,
        title,
        description,
        assigned_to,
        status,
        priority,
        due_date
      }])
      .select()
      .single();

    if (error) throw error;

    // If the task is assigned to someone, notify them
    if (assigned_to) {
      await NotificationService.notifyTaskAssigned(data.id, assigned_to, userEmployeeId);
    }

    return data;
  }

  static async getProjectTasks(projectId, userId, role) {
    // Check if user has access to project
    await this.getProjectById(projectId, userId, role);

    const { data, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_to_user:profiles(user_id, full_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  static async updateProjectTask(taskId, updateData, userId, role) {
    // First, get the task to check project access
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    // Check if user has access to the project
    await this.getProjectById(task.project_id, userId, role);

    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }

    // Allow ADMIN, MANAGER role, project manager, or assigned employee to update task
    const project = await this.getProjectById(task.project_id, userId, role);
    const isProjectManager = project.manager_id === userEmployeeId;
    const isAssignedEmployee = task.assigned_to === userEmployeeId;

    if (!['ADMIN', 'MANAGER'].includes(role) && !isProjectManager && !isAssignedEmployee) {
      throw new Error('Access denied: Only project manager, assigned employee, or ADMIN can update task');
    }

    // Sanitize the update data
    const sanitizedUpdateData = { ...updateData };
    
    // Convert empty strings to null for UUID fields
    if (sanitizedUpdateData.assigned_to === '') {
      sanitizedUpdateData.assigned_to = null;
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .update({
        ...sanitizedUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async createProjectMeeting(projectId, meetingData, userId, role) {
    // Check if user has access to project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN, MANAGER role, or project manager to create meetings
    if (!['ADMIN', 'MANAGER'].includes(role) && project.manager_id !== userEmployeeId) {
      throw new Error('Access denied: Only project manager or ADMIN can create meetings');
    }

    const { title, meeting_date, meeting_link, notes } = meetingData;

    const { data, error } = await supabase
      .from('project_meetings')
      .insert([{
        project_id: projectId,
        title,
        meeting_date,
        meeting_link,
        notes
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getProjectMeetings(projectId, userId, role) {
    // Check if user has access to project
    await this.getProjectById(projectId, userId, role);

    const { data, error } = await supabase
      .from('project_meetings')
      .select('*')
      .eq('project_id', projectId)
      .order('meeting_date', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  static async createProjectTodo(projectId, todoData, userId, role) {
    // Check if user has access to project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }
    
    // Allow ADMIN, MANAGER role, project manager, or project members to create todos
    const projectCheck = await this.getProjectById(projectId, userId, role);
    const isProjectManager = projectCheck.manager_id === userEmployeeId;
    
    // Check if user is a project member
    let isProjectMember = false;
    if (userEmployeeId) {
      const { data: memberCheck } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('employee_id', userEmployeeId)
        .single();
      
      isProjectMember = !!memberCheck;
    }
    
    if (!['ADMIN', 'MANAGER'].includes(role) && !isProjectManager && !isProjectMember) {
      throw new Error('Access denied: Only project manager, project members, or ADMIN can create todos');
    }

    const { title } = todoData;

    const { data, error } = await supabase
      .from('project_todos')
      .insert([{
        project_id: projectId,
        title,
        is_completed: false
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async updateProjectTodo(todoId, updateData, userId, role) {
    // First, get the todo to check project access
    const { data: todo, error: todoError } = await supabase
      .from('project_todos')
      .select('project_id')
      .eq('id', todoId)
      .single();

    if (todoError) throw todoError;

    // Check if user has access to the project
    await this.getProjectById(todo.project_id, userId, role);

    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let userEmployeeId = null;
    if (userEmployee && !userEmployeeError) {
      userEmployeeId = userEmployee.id;
    }

    // Allow ADMIN, MANAGER role, project manager, or project members to update todos
    const project = await this.getProjectById(todo.project_id, userId, role);
    const isProjectManager = project.manager_id === userEmployeeId;
    
    // Check if user is a project member
    let isProjectMember = false;
    if (userEmployeeId) {
      const { data: memberCheck } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', todo.project_id)
        .eq('employee_id', userEmployeeId)
        .single();
      
      isProjectMember = !!memberCheck;
    }
    
    if (!['ADMIN', 'MANAGER'].includes(role) && !isProjectManager && !isProjectMember) {
      throw new Error('Access denied: Only project manager, project members, or ADMIN can update todos');
    }

    const { data, error } = await supabase
      .from('project_todos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', todoId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async createProjectUpdate(projectId, updateData, userId, role) {
    // Check if user has access to project
    const project = await this.getProjectById(projectId, userId, role);
    
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (userEmployeeError || !userEmployee) {
      throw new Error('User does not have an associated employee record');
    }
    
    const userEmployeeId = userEmployee.id;

    // Allow ADMIN, MANAGER role, project manager, or project members to create updates
    const isProjectManager = project.manager_id === userEmployeeId;
    
    // Check if user is a project member
    let isProjectMember = false;
    if (userEmployeeId) {
      const { data: memberCheck } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('employee_id', userEmployeeId)
        .single();
      
      isProjectMember = !!memberCheck;
    }
    
    if (!['ADMIN', 'MANAGER'].includes(role) && !isProjectManager && !isProjectMember) {
      throw new Error('Access denied: Only project manager, project members, or ADMIN can create updates');
    }

    const { message } = updateData;

    const { data, error } = await supabase
      .from('project_updates')
      .insert([{
        project_id: projectId,
        employee_id: userEmployeeId,  // Use employee ID instead of user ID
        message
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getProjectUpdates(projectId, userId, role) {
    // Check if user has access to project
    await this.getProjectById(projectId, userId, role);

    const { data, error } = await supabase
      .from('project_updates')
      .select(`
        *,
        employee:profiles(user_id, full_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }
}

module.exports = ProjectService;