# PHASE 5.1 SERVICE CATALOG & AUTOMATION EXECUTION PLAN
# Self-Service catalog and Automation Rules Engine

---

## 1. Prerequisites & Dependencies
* **Workflow Engine (Phase 5.0):** Catalog items rely on workflows to handle approval routes.
* **SLA Engine (Phase 5.0):** Automation rules can trigger escalations based on SLA breach events.
* **Redis & BullMQ (Phase 5.0):** Automation tasks are processed asynchronously inside queues.

---

## 2. Module 1: Service Catalog

### Database (Data Layer)
* Deploy schema migrations for `service_catalog_categories`, `service_catalog_items`, and `service_requests`.
* Enable RLS: Items and categories are readable by all authenticated users, modifications require admin permissions.
* Add indexes to speed up category and category-item relationships.

### Backend
* Create `catalog.controller.js` and `service-request.service.js`.
* Develop Catalog request submission endpoints. Submitting a request triggers a ticket with variables mapped to `service_requests.form_responses` and associates the ticket with the catalog item's default workflow.

### Frontend
* Create Service Catalog browser (`/app/catalog`) with sidebar category search.
* Build dynamic request form rendering engine (`CatalogRequestForm.tsx`) parsing the catalog item’s JSON Schema form configuration.
* Add catalog item manager workspace for admins to customize catalog items and forms.

### RBAC Constraints
* **Create/Update Items:** Restricted to `ADMIN` and `MANAGER` roles.
* **Read Items & Submit Requests:** Open to all authenticated roles (`EMPLOYEE`, `MANAGER`, `HR`, `ADMIN`).

### Feature Flags
* Frontend route `/app/catalog` is guarded by `isCatalogEnabled`.
* Backend catalog endpoints are protected by `ENABLE_SERVICE_CATALOG` check middleware.

### Testing
* Integration tests verifying form input validation against JSON schemas.
* E2E flow test (Jordan submits hardware request -> ticket created -> approval workflow gets assigned).

---

## 3. Module 2: Automation Rules Engine

### Database (Data Layer)
* Deploy schema migrations for `automation_rules` and `automation_logs`.
* Index the rules table on trigger event type (`event_trigger`) to optimize search loops.

### Backend
* Create `automation.service.js` and `rule-evaluator.service.js`.
* Build event hooks in controllers (e.g. `ticket.created`, `ticket.updated`, `sla.breached`) emitting events to the evaluation listener.
* Design standard executor functions for supported actions: Assign Agent, Set Priority, Add Comment, Trigger Webhook.
* Enforce max execution limits to prevent circular rule infinite loops.

### Frontend
* Build visual Rule Builder canvas (`/app/admin/automation`) allowing admins to define Trigger (e.g. Ticket Status changed), Conditions (e.g. Category is IT and Priority is Urgent), and Actions (e.g. Assign to tier 2 group).
* Build execution run logs grid detailing rule match successes and errors.

### RBAC Constraints
* **Manage Rules:** Strictly restricted to the `ADMIN` role.
* **Execution Logs:** Read-only access for `ADMIN` and `MANAGER` roles.

### Feature Flags
* Visual Rule Builder route is guarded by `isAutomationEnabled`.
* Event trigger listeners ignore events if the backend flag `ENABLE_AUTOMATION` is set to `false`.

### Testing
* Unit test conditions evaluator (testing string matches, comparisons, and role memberships).
* Integration test asserting ticket attributes are updated by automation when trigger events fire.
