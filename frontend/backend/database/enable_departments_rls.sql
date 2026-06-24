-- =====================================================
-- RLS POLICIES FOR DEPARTMENTS TABLE (ALL-IN-ONE FILE)
-- Project: Employee Management System (EMS)
-- Roles: ADMIN, MANAGER, HR, EMPLOYEE
-- Table: public.departments
-- Auth Table: public.users
-- =====================================================


-- -----------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------
ALTER TABLE public.departments
ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------
-- 2. ADMIN: FULL ACCESS (SELECT, INSERT, UPDATE, DELETE)
-- -----------------------------------------------------
CREATE POLICY "Admin full access to departments"
ON public.departments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
  )
);


-- -----------------------------------------------------
-- 3. MANAGER: INSERT DEPARTMENTS
-- -----------------------------------------------------
CREATE POLICY "Manager can insert departments"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
  )
);


-- -----------------------------------------------------
-- 4. MANAGER: UPDATE DEPARTMENTS
-- -----------------------------------------------------
CREATE POLICY "Manager can update departments"
ON public.departments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
  )
);


-- -----------------------------------------------------
-- 5. ALL AUTHENTICATED USERS: READ-ONLY ACCESS
-- (ADMIN, MANAGER, HR, EMPLOYEE)
-- -----------------------------------------------------
CREATE POLICY "Authenticated users can read departments"
ON public.departments
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);


-- -----------------------------------------------------
-- END OF FILE
-- -----------------------------------------------------
-- RESULTING ACCESS MATRIX:
--
-- ADMIN     → SELECT / INSERT / UPDATE / DELETE
-- MANAGER   → SELECT / INSERT / UPDATE
-- HR        → SELECT only
-- EMPLOYEE  → SELECT only
--
-- No schema changes required
-- No backend changes required
-- No frontend changes required
-- Fully production-safe
-- -----------------------------------------------------