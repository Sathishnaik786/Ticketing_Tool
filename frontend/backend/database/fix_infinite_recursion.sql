-- =========================================================
-- FIX: INFINITE RECURSION IN RLS POLICIES
-- =========================================================

-- 1. Create a SECURITY DEFINER function to break the RLS recursion.
-- This function runs with the privileges of the creator (postgres) 
-- and bypasses RLS on the tables it queries.
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

-- 2. Add missing foreign key constraints to fix PostgREST relationship errors
-- This resolves: "Could not find a relationship between 'employee_updates' and 'user_id'"
DO $$
BEGIN
    -- Add FK to users for employee_updates.user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'employee_updates' AND constraint_name = 'employee_updates_user_id_fkey') THEN
        ALTER TABLE public.employee_updates 
        ADD CONSTRAINT employee_updates_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add FK to users for employee_updates.created_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'employee_updates' AND constraint_name = 'employee_updates_created_by_fkey') THEN
        ALTER TABLE public.employee_updates 
        ADD CONSTRAINT employee_updates_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Fix employee_update_visibility SELECT policy (The root cause of recursion)
DROP POLICY IF EXISTS "Users can see visibility for their own updates" ON public.employee_update_visibility;
CREATE POLICY "Users can see visibility for their own updates"
ON public.employee_update_visibility
FOR SELECT
USING (
  visible_to_user_id = auth.uid()
  OR check_update_ownership(update_id, auth.uid())
);

-- 4. Fix employee_updates SELECT policy
DROP POLICY IF EXISTS "View allowed updates" ON public.employee_updates;
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
  OR (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
  )
  OR (
    EXISTS (
        SELECT 1
        FROM public.employees e_author
        JOIN public.employees e_manager ON e_author.manager_id = e_manager.id
        WHERE e_author.user_id = employee_updates.user_id
          AND e_manager.user_id = auth.uid()
    )
  )
);

-- 5. Fix employee_update_feedback policies
DROP POLICY IF EXISTS "Feedback if visible" ON public.employee_update_feedback;
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
          SELECT 1 FROM public.users usr WHERE usr.id = auth.uid() AND usr.role = 'ADMIN'
        )
      )
  )
);

DROP POLICY IF EXISTS "View feedback if visible" ON public.employee_update_feedback;
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
          SELECT 1 FROM public.users usr WHERE usr.id = auth.uid() AND usr.role = 'ADMIN'
        )
      )
  )
);
