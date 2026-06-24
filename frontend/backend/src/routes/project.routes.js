const express = require('express');
const router = express.Router();
const projectController = require('@controllers/project.controller');
const authenticateToken = require('@middlewares/auth.middleware');
const checkRole = require('@middlewares/role.middleware');

// Apply authentication to all routes
router.use(authenticateToken);

// Project routes
router.get('/', projectController.getAllProjects);
router.get('/my-projects', projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', checkRole(['ADMIN', 'MANAGER']), projectController.createProject);
router.patch('/:id', checkRole(['ADMIN', 'MANAGER']), projectController.updateProject);
router.delete('/:id', checkRole(['ADMIN']), projectController.deleteProject);

// Project members routes
router.post('/:id/members', checkRole(['ADMIN', 'MANAGER']), projectController.addProjectMember);
router.delete('/:id/members/:employeeId', checkRole(['ADMIN', 'MANAGER']), projectController.removeProjectMember);

// Project documents routes
router.post('/:id/documents', checkRole(['ADMIN', 'MANAGER']), projectController.uploadProjectDocument);
router.get('/:id/documents', projectController.getProjectDocuments);

// Project tasks routes
router.post('/:id/tasks', checkRole(['ADMIN', 'MANAGER']), projectController.createProjectTask);
router.get('/:id/tasks', projectController.getProjectTasks);
router.patch('/tasks/:id', projectController.updateProjectTask);

// Project meetings routes
router.post('/:id/meetings', checkRole(['ADMIN', 'MANAGER']), projectController.createProjectMeeting);
router.get('/:id/meetings', projectController.getProjectMeetings);

// Project todos routes
router.post('/:id/todos', projectController.createProjectTodo);
router.patch('/todos/:id', projectController.updateProjectTodo);

// Project updates routes
router.post('/:id/updates', projectController.createProjectUpdate);
router.get('/:id/updates', projectController.getProjectUpdates);

module.exports = router;