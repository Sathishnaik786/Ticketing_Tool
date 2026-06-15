/* ============================================================
   ETMS – Ticketing Module (Sprint 1: Rollback)
   Reverses ticketing_phase1.sql and enable_ticketing_rls.sql

   WARNING: This permanently deletes all ticketing data.
   Run only after backup confirmation.

   Apply order:
     1. Run this file (drops RLS policies, tables, functions)
   ============================================================ */

-- ------------------------------------------------------------
-- DROP RLS POLICIES
-- ------------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename IN (
      'ticket_categories', 'ticket_subcategories', 'tickets',
      'ticket_comments', 'ticket_attachments', 'ticket_activities',
      'ticket_assignments', 'ticket_watchers', 'ticket_sla_rules',
      'ticket_escalations'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- DROP RLS HELPER FUNCTIONS
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS ticketing_can_view_ticket(UUID);
DROP FUNCTION IF EXISTS ticketing_can_manage_ticket(UUID);
DROP FUNCTION IF EXISTS ticketing_get_manager_department_ids();
DROP FUNCTION IF EXISTS ticketing_get_employee_id();
DROP FUNCTION IF EXISTS ticketing_get_employee_role();

-- ------------------------------------------------------------
-- DROP TRIGGERS (only if parent tables exist)
-- ------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'ticket_categories',
    'ticket_subcategories',
    'tickets',
    'ticket_comments',
    'ticket_sla_rules'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS trg_%I_updated ON %I',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- DROP TABLES (dependency order)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS ticket_escalations CASCADE;
DROP TABLE IF EXISTS ticket_sla_rules CASCADE;
DROP TABLE IF EXISTS ticket_watchers CASCADE;
DROP TABLE IF EXISTS ticket_assignments CASCADE;
DROP TABLE IF EXISTS ticket_activities CASCADE;
DROP TABLE IF EXISTS ticket_attachments CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_subcategories CASCADE;
DROP TABLE IF EXISTS ticket_categories CASCADE;

-- ------------------------------------------------------------
-- DROP SEQUENCE & FUNCTIONS
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS generate_ticket_number();
DROP SEQUENCE IF EXISTS ticket_number_seq;
