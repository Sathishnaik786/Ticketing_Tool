/* ============================================================
   ETMS – Ticketing Module (Sprint 1: Row-Level Security)
   Apply AFTER ticketing_phase1.sql

   Pattern: role from employees.role or users.role (schema-compatible)
   Rollback: included in ticketing_phase1_rollback.sql
   ============================================================ */

-- ------------------------------------------------------------
-- RLS HELPER FUNCTIONS (SECURITY DEFINER – avoids recursion)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION ticketing_get_employee_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION ticketing_get_employee_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_has_employee_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'employees'
      AND column_name = 'role'
  ) INTO v_has_employee_role;

  IF v_has_employee_role THEN
    SELECT e.role INTO v_role
    FROM employees e
    WHERE e.user_id = auth.uid()
    LIMIT 1;
  END IF;

  IF v_role IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role'
  ) THEN
    SELECT u.role INTO v_role
    FROM users u
    WHERE u.id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN COALESCE(UPPER(v_role), 'EMPLOYEE');
END;
$$;

CREATE OR REPLACE FUNCTION ticketing_get_manager_department_ids()
RETURNS SETOF UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_id UUID;
  v_has_dept_manager_id BOOLEAN;
BEGIN
  v_employee_id := ticketing_get_employee_id();
  IF v_employee_id IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'departments'
      AND column_name = 'manager_id'
  ) INTO v_has_dept_manager_id;

  IF v_has_dept_manager_id THEN
    RETURN QUERY
      SELECT d.id
      FROM departments d
      WHERE d.manager_id = v_employee_id;
  END IF;

  RETURN QUERY
    SELECT e.department_id
    FROM employees e
    WHERE e.id = v_employee_id
      AND e.department_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION ticketing_can_view_ticket(p_ticket_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.id = p_ticket_id
    AND (
      ticketing_get_employee_role() IN ('ADMIN', 'HR')
      OR t.requester_id = ticketing_get_employee_id()
      OR t.assignee_id = ticketing_get_employee_id()
      OR EXISTS (
        SELECT 1 FROM ticket_watchers tw
        WHERE tw.ticket_id = t.id
        AND tw.employee_id = ticketing_get_employee_id()
      )
      OR (
        ticketing_get_employee_role() = 'MANAGER'
        AND t.department_id IN (
          SELECT ticketing_get_manager_department_ids()
        )
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION ticketing_can_manage_ticket(p_ticket_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.id = p_ticket_id
    AND (
      ticketing_get_employee_role() IN ('ADMIN', 'HR')
      OR t.assignee_id = ticketing_get_employee_id()
      OR (
        ticketing_get_employee_role() = 'MANAGER'
        AND t.department_id IN (
          SELECT ticketing_get_manager_department_ids()
        )
      )
    )
  );
$$;

-- ------------------------------------------------------------
-- ENABLE RLS ON ALL TICKETING TABLES
-- ------------------------------------------------------------
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_escalations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- GRANTS FOR AUTHENTICATED ROLE
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ticket_categories TO authenticated;
GRANT SELECT ON ticket_subcategories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_comments TO authenticated;
GRANT SELECT, INSERT ON ticket_attachments TO authenticated;
GRANT SELECT ON ticket_activities TO authenticated;
GRANT SELECT ON ticket_assignments TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_watchers TO authenticated;
GRANT SELECT ON ticket_sla_rules TO authenticated;
GRANT SELECT ON ticket_escalations TO authenticated;

-- ------------------------------------------------------------
-- ticket_categories (read-only for authenticated users)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_categories_select" ON ticket_categories;
CREATE POLICY "ticketing_categories_select"
ON ticket_categories FOR SELECT TO authenticated
USING (is_active = TRUE OR ticketing_get_employee_role() IN ('ADMIN', 'HR'));

DROP POLICY IF EXISTS "ticketing_categories_admin_all" ON ticket_categories;
CREATE POLICY "ticketing_categories_admin_all"
ON ticket_categories FOR ALL TO authenticated
USING (ticketing_get_employee_role() IN ('ADMIN', 'HR'))
WITH CHECK (ticketing_get_employee_role() IN ('ADMIN', 'HR'));

-- ------------------------------------------------------------
-- ticket_subcategories
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_subcategories_select" ON ticket_subcategories;
CREATE POLICY "ticketing_subcategories_select"
ON ticket_subcategories FOR SELECT TO authenticated
USING (is_active = TRUE OR ticketing_get_employee_role() IN ('ADMIN', 'HR'));

DROP POLICY IF EXISTS "ticketing_subcategories_admin_all" ON ticket_subcategories;
CREATE POLICY "ticketing_subcategories_admin_all"
ON ticket_subcategories FOR ALL TO authenticated
USING (ticketing_get_employee_role() IN ('ADMIN', 'HR'))
WITH CHECK (ticketing_get_employee_role() IN ('ADMIN', 'HR'));

-- ------------------------------------------------------------
-- tickets
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_tickets_select" ON tickets;
CREATE POLICY "ticketing_tickets_select"
ON tickets FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(id));

DROP POLICY IF EXISTS "ticketing_tickets_insert" ON tickets;
CREATE POLICY "ticketing_tickets_insert"
ON tickets FOR INSERT TO authenticated
WITH CHECK (
  requester_id = ticketing_get_employee_id()
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "ticketing_tickets_update" ON tickets;
CREATE POLICY "ticketing_tickets_update"
ON tickets FOR UPDATE TO authenticated
USING (ticketing_can_manage_ticket(id) OR requester_id = ticketing_get_employee_id())
WITH CHECK (ticketing_can_manage_ticket(id) OR requester_id = ticketing_get_employee_id());

-- ------------------------------------------------------------
-- ticket_comments
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_comments_select" ON ticket_comments;
CREATE POLICY "ticketing_comments_select"
ON ticket_comments FOR SELECT TO authenticated
USING (
  ticketing_can_view_ticket(ticket_id)
  AND (
    is_internal = FALSE
    OR ticketing_get_employee_role() IN ('ADMIN', 'HR', 'MANAGER')
    OR EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND t.assignee_id = ticketing_get_employee_id()
    )
  )
);

DROP POLICY IF EXISTS "ticketing_comments_insert" ON ticket_comments;
CREATE POLICY "ticketing_comments_insert"
ON ticket_comments FOR INSERT TO authenticated
WITH CHECK (
  author_id = ticketing_get_employee_id()
  AND ticketing_can_view_ticket(ticket_id)
  AND (
    is_internal = FALSE
    OR ticketing_get_employee_role() IN ('ADMIN', 'HR', 'MANAGER')
    OR EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND t.assignee_id = ticketing_get_employee_id()
    )
  )
);

-- ------------------------------------------------------------
-- ticket_attachments
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_attachments_select" ON ticket_attachments;
CREATE POLICY "ticketing_attachments_select"
ON ticket_attachments FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(ticket_id));

DROP POLICY IF EXISTS "ticketing_attachments_insert" ON ticket_attachments;
CREATE POLICY "ticketing_attachments_insert"
ON ticket_attachments FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = ticketing_get_employee_id()
  AND ticketing_can_view_ticket(ticket_id)
);

-- ------------------------------------------------------------
-- ticket_activities (read-only audit trail)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_activities_select" ON ticket_activities;
CREATE POLICY "ticketing_activities_select"
ON ticket_activities FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(ticket_id));

-- ------------------------------------------------------------
-- ticket_assignments
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_assignments_select" ON ticket_assignments;
CREATE POLICY "ticketing_assignments_select"
ON ticket_assignments FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(ticket_id));

-- ------------------------------------------------------------
-- ticket_watchers
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_watchers_select" ON ticket_watchers;
CREATE POLICY "ticketing_watchers_select"
ON ticket_watchers FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(ticket_id));

DROP POLICY IF EXISTS "ticketing_watchers_insert" ON ticket_watchers;
CREATE POLICY "ticketing_watchers_insert"
ON ticket_watchers FOR INSERT TO authenticated
WITH CHECK (
  employee_id = ticketing_get_employee_id()
  AND ticketing_can_view_ticket(ticket_id)
);

DROP POLICY IF EXISTS "ticketing_watchers_delete" ON ticket_watchers;
CREATE POLICY "ticketing_watchers_delete"
ON ticket_watchers FOR DELETE TO authenticated
USING (employee_id = ticketing_get_employee_id());

-- ------------------------------------------------------------
-- ticket_sla_rules (read for all; manage for admin/hr)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_sla_select" ON ticket_sla_rules;
CREATE POLICY "ticketing_sla_select"
ON ticket_sla_rules FOR SELECT TO authenticated
USING (is_active = TRUE OR ticketing_get_employee_role() IN ('ADMIN', 'HR'));

DROP POLICY IF EXISTS "ticketing_sla_admin_all" ON ticket_sla_rules;
CREATE POLICY "ticketing_sla_admin_all"
ON ticket_sla_rules FOR ALL TO authenticated
USING (ticketing_get_employee_role() IN ('ADMIN', 'HR'))
WITH CHECK (ticketing_get_employee_role() IN ('ADMIN', 'HR'));

-- ------------------------------------------------------------
-- ticket_escalations
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "ticketing_escalations_select" ON ticket_escalations;
CREATE POLICY "ticketing_escalations_select"
ON ticket_escalations FOR SELECT TO authenticated
USING (ticketing_can_view_ticket(ticket_id));

DROP POLICY IF EXISTS "ticketing_escalations_manage" ON ticket_escalations;
CREATE POLICY "ticketing_escalations_manage"
ON ticket_escalations FOR ALL TO authenticated
USING (
  ticketing_get_employee_role() IN ('ADMIN', 'HR', 'MANAGER')
  OR escalated_to = ticketing_get_employee_id()
)
WITH CHECK (
  ticketing_get_employee_role() IN ('ADMIN', 'HR', 'MANAGER')
  OR escalated_to = ticketing_get_employee_id()
);
