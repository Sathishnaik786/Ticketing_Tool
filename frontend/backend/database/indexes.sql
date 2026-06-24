-- ============================================
-- PERFORMANCE INDEXES FOR YVI EWS
-- SAFE VERSION (NO INVALID COLUMNS)
-- ============================================


-- ============================================
-- EMPLOYEES TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_user_id
ON employees(user_id);

CREATE INDEX IF NOT EXISTS idx_employees_department_id
ON employees(department_id);

CREATE INDEX IF NOT EXISTS idx_employees_manager_id
ON employees(manager_id);

CREATE INDEX IF NOT EXISTS idx_employees_status
ON employees(status);

CREATE INDEX IF NOT EXISTS idx_employees_role
ON employees(role);

CREATE INDEX IF NOT EXISTS idx_employees_created_at
ON employees(created_at DESC);

-- Composite
CREATE INDEX IF NOT EXISTS idx_employees_department_status
ON employees(department_id, status);


-- ============================================
-- ATTENDANCE TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id
ON attendance(employee_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date
ON attendance(date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date
ON attendance(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_status
ON attendance(status);

-- Composite
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date_status
ON attendance(employee_id, date DESC, status);


-- ============================================
-- LEAVES TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id
ON leaves(employee_id);

CREATE INDEX IF NOT EXISTS idx_leaves_status
ON leaves(status);

CREATE INDEX IF NOT EXISTS idx_leaves_approved_by
ON leaves(approved_by);

CREATE INDEX IF NOT EXISTS idx_leaves_start_date
ON leaves(start_date DESC);

CREATE INDEX IF NOT EXISTS idx_leaves_created_at
ON leaves(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaves_leave_type_id
ON leaves(leave_type_id);

-- Composite
CREATE INDEX IF NOT EXISTS idx_leaves_employee_status
ON leaves(employee_id, status);

CREATE INDEX IF NOT EXISTS idx_leaves_status_created_at
ON leaves(status, created_at DESC);


-- ============================================
-- PROJECTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_manager_id
ON projects(manager_id);

CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects(status);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_client_id
ON projects(client_id);

-- Composite
CREATE INDEX IF NOT EXISTS idx_projects_manager_status
ON projects(manager_id, status);


-- ============================================
-- PROJECT MEMBERS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_members_project_id
ON project_members(project_id);

CREATE INDEX IF NOT EXISTS idx_project_members_employee_id
ON project_members(employee_id);

-- Composite
CREATE INDEX IF NOT EXISTS idx_project_members_project_employee
ON project_members(project_id, employee_id);


-- ============================================
-- CHAT TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user1_id
ON chat_conversations(user1_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user2_id
ON chat_conversations(user2_id);

-- Composite
CREATE INDEX IF NOT EXISTS idx_chat_conversations_users
ON chat_conversations(user1_id, user2_id);


CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id
ON chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id
ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id
ON chat_messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read
ON chat_messages(is_read);

-- Composite
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages(conversation_id, created_at DESC);


-- ============================================
-- NOTIFICATIONS TABLE INDEXES (FIXED)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON notifications(user_id, created_at DESC);


-- ============================================
-- DOCUMENTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_documents_employee_id
ON documents(employee_id);

CREATE INDEX IF NOT EXISTS idx_documents_created_at
ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_type
ON documents(type);


-- ============================================
-- DEPARTMENTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_departments_manager_id
ON departments(manager_id);

CREATE INDEX IF NOT EXISTS idx_departments_created_at
ON departments(created_at DESC);


-- ============================================
-- USERS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at DESC);


-- ============================================
-- PROJECT TASKS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id
ON project_tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to
ON project_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_project_tasks_status
ON project_tasks(status);

CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date
ON project_tasks(due_date);

-- Composite
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_status
ON project_tasks(project_id, status);


-- ============================================
-- PROJECT DOCUMENTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id
ON project_documents(project_id);

CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by
ON project_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_at
ON project_documents(uploaded_at DESC);


-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;
