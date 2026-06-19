/* Rollback: Phase 7.5 Approval Workflow & Service Catalog Engine */

DROP TRIGGER IF EXISTS trg_ticket_approvals_updated_at ON ticket_approvals;
DROP TRIGGER IF EXISTS trg_approval_workflows_updated_at ON approval_workflows;
DROP TRIGGER IF EXISTS trg_service_catalog_items_updated_at ON service_catalog_items;
DROP TRIGGER IF EXISTS trg_service_catalogs_updated_at ON service_catalogs;

DROP TABLE IF EXISTS approval_history CASCADE;
DROP TABLE IF EXISTS ticket_approvals CASCADE;
DROP TABLE IF EXISTS approval_workflow_steps CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS service_catalog_items CASCADE;
DROP TABLE IF EXISTS service_catalogs CASCADE;
