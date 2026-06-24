const ProjectService = require('./project.service');

// Get all projects with pagination
const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const result = await ProjectService.getAllProjects(userId, role, page, limit, search, sortBy, sortOrder);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get projects assigned to current user
const getMyProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const result = await ProjectService.getAllProjects(userId, role, page, limit, search, sortBy, sortOrder);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching my projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const data = await ProjectService.getProjectById(id, userId, role);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    let { name, description, project_type, start_date, end_date, manager_id, client_id } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Sanitize input data - convert empty strings to null for UUID fields
    manager_id = manager_id && manager_id !== '' ? manager_id : null;
    client_id = client_id && client_id !== '' ? client_id : null;

    const data = await ProjectService.createProject({
      name,
      description,
      project_type,
      start_date,
      end_date,
      manager_id,
      client_id
    }, userId, role);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, project_type, status, start_date, end_date, manager_id, client_id } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Sanitize input data - convert empty strings to null for UUID fields
    manager_id = manager_id && manager_id !== '' ? manager_id : null;
    client_id = client_id && client_id !== '' ? client_id : null;

    const data = await ProjectService.updateProject(id, {
      name,
      description,
      project_type,
      status,
      start_date,
      end_date,
      manager_id,
      client_id
    }, userId, role);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const result = await ProjectService.deleteProject(id, userId, role);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add member to project
const addProjectMember = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { employee_id, role: memberRole } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.addProjectMember(projectId, {
      employee_id,
      role: memberRole
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding project member:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

// Remove member from project
const removeProjectMember = async (req, res) => {
  try {
    const { id: projectId, employeeId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await ProjectService.removeProjectMember(projectId, employeeId, userId, userRole);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload project document
const uploadProjectDocument = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { file_name, file_url } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.uploadProjectDocument(projectId, {
      file_name,
      file_url
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error uploading project document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get project documents
const getProjectDocuments = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.getProjectDocuments(projectId, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create project task
const createProjectTask = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.createProjectTask(projectId, {
      title,
      description,
      assigned_to,
      status,
      priority,
      due_date
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get project tasks
const getProjectTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.getProjectTasks(projectId, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update project task
const updateProjectTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.updateProjectTask(taskId, {
      title,
      description,
      assigned_to,
      status,
      priority,
      due_date
    }, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating project task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create project meeting
const createProjectMeeting = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title, meeting_date, meeting_link, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.createProjectMeeting(projectId, {
      title,
      meeting_date,
      meeting_link,
      notes
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get project meetings
const getProjectMeetings = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.getProjectMeetings(projectId, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project meetings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create project todo
const createProjectTodo = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.createProjectTodo(projectId, {
      title
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update project todo
const updateProjectTodo = async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const { is_completed } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.updateProjectTodo(todoId, {
      is_completed
    }, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating project todo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create project update
const createProjectUpdate = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.createProjectUpdate(projectId, {
      message
    }, userId, userRole);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get project updates
const getProjectUpdates = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const data = await ProjectService.getProjectUpdates(projectId, userId, userRole);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project updates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  uploadProjectDocument,
  getProjectDocuments,
  createProjectTask,
  getProjectTasks,
  updateProjectTask,
  createProjectMeeting,
  getProjectMeetings,
  createProjectTodo,
  updateProjectTodo,
  createProjectUpdate,
  getProjectUpdates
};
