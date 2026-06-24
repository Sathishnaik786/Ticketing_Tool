-- =========================================================
-- EMPLOYEE UPDATES FEATURE (PHASE-0 + PHASE-1 SAFE SCRIPT)
-- =========================================================

-- 1. TABLE: employee_updates
CREATE TABLE IF NOT EXISTS public.employee_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  update_type text NOT NULL CHECK (update_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  title text,
  content jsonb NOT NULL,
  project_id uuid NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- UPDATED_AT TRIGGER (SAFE RE-CREATION)
-- ---------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_employee_updates_updated'
  ) THEN
    DROP TRIGGER trg_employee_updates_updated
    ON public.employee_updates;
  END IF;
END $$;

CREATE TRIGGER trg_employee_updates_updated
BEFORE UPDATE ON public.employee_updates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 2. TABLE: employee_update_feedback
CREATE TABLE IF NOT EXISTS public.employee_update_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id uuid NOT NULL REFERENCES public.employee_updates(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);


-- 3. TABLE: employee_update_visibility
CREATE TABLE IF NOT EXISTS public.employee_update_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id uuid NOT NULL REFERENCES public.employee_updates(id) ON DELETE CASCADE,
  visible_to_user_id uuid NOT NULL
);


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================
ALTER TABLE public.employee_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_update_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_update_visibility ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- RLS POLICIES: employee_updates
-- =========================================================

-- Drop existing policies safely (idempotent)
DROP POLICY IF EXISTS "User can create own update" ON public.employee_updates;
DROP POLICY IF EXISTS "View allowed updates" ON public.employee_updates;

-- Policy: User can create own update
CREATE POLICY "User can create own update"
ON public.employee_updates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Helper function to break recursion in RLS
CREATE OR REPLACE FUNCTION public.check_update_ownership(u_id uuid, check_user_id uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_updates
    WHERE id = u_id AND user_id = check_user_id
  );
$$;

-- Policy: View allowed updates
CREATE POLICY "View allowed updates"
ON public.employee_updates
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.employee_update_visibility v
    WHERE v.update_id = employee_updates.id
      AND v.visible_to_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1
    FROM public.employees e_author
    JOIN public.employees e_manager
      ON e_author.manager_id = e_manager.id
    WHERE e_author.user_id = employee_updates.user_id
      AND e_manager.user_id = auth.uid()
  )
);


-- =========================================================
-- RLS POLICIES: employee_update_feedback
-- =========================================================

DROP POLICY IF EXISTS "Feedback if visible" ON public.employee_update_feedback;
DROP POLICY IF EXISTS "View feedback if visible" ON public.employee_update_feedback;

-- Policy: Insert feedback if update is visible
CREATE POLICY "Feedback if visible"
ON public.employee_update_feedback
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.employee_updates u
    WHERE u.id = update_id
      AND (
        u.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.employee_update_visibility v
          WHERE v.update_id = u.id
            AND v.visible_to_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1
          FROM public.users usr
          WHERE usr.id = auth.uid()
            AND usr.role = 'ADMIN'
        )
        OR EXISTS (
          SELECT 1
          FROM public.employees e_author
          JOIN public.employees e_manager
            ON e_author.manager_id = e_manager.id
          WHERE e_author.user_id = u.user_id
            AND e_manager.user_id = auth.uid()
        )
      )
  )
);

-- Policy: View feedback if update is visible
CREATE POLICY "View feedback if visible"
ON public.employee_update_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.employee_updates u
    WHERE u.id = update_id
      AND (
        u.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.employee_update_visibility v
          WHERE v.update_id = u.id
            AND v.visible_to_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1
          FROM public.users usr
          WHERE usr.id = auth.uid()
            AND usr.role = 'ADMIN'
        )
        OR EXISTS (
          SELECT 1
          FROM public.employees e_author
          JOIN public.employees e_manager
            ON e_author.manager_id = e_manager.id
          WHERE e_author.user_id = u.user_id
            AND e_manager.user_id = auth.uid()
        )
      )
  )
);


-- =========================================================
-- RLS POLICIES: employee_update_visibility
-- =========================================================

DROP POLICY IF EXISTS "Users can see visibility for their own updates"
ON public.employee_update_visibility;

CREATE POLICY "Users can see visibility for their own updates"
ON public.employee_update_visibility
FOR SELECT
USING (
  visible_to_user_id = auth.uid()
  OR public.check_update_ownership(update_id, auth.uid())
);
