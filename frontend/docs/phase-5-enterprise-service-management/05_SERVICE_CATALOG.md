# 05 — Service Catalog
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The Service Catalog transforms Ticketra into a self-service portal where employees can browse available services, submit structured requests, and track their status — replacing free-form ticket creation for common service types.

---

## 2. Catalog Hierarchy

```
Service Catalog
└── Category (e.g., "IT Services")
    └── Catalog Item (e.g., "Laptop Request")
        ├── Custom Form (dynamic fields)
        ├── Workflow Mapping → Workflow Engine
        ├── SLA Mapping → SLA Policy Engine
        ├── RBAC Rules (who can request)
        └── Approver Matrix
```

---

## 3. Example Catalog Items

| Category | Item | Typical Workflow | SLA |
|---|---|---|---|
| IT Access | VPN Access Request | Manager → IT Security → IT Ops | P2 (8h) |
| IT Hardware | Laptop Request | Manager → Procurement → IT | P3 (24h) |
| IT Software | Software License | Manager → IT | P3 (24h) |
| HR | New Employee Onboarding | HR → IT → Facilities | P2 |
| HR | Employee Exit Process | Manager → HR → IT → Finance | P1 |
| Facilities | Office Access Card | Manager → Security | P3 |
| Finance | Purchase Order | Manager → Finance | P2 |
| Travel | Travel Authorization | Manager → Finance | P3 |

---

## 4. Database Schema

```sql
-- Catalog categories
CREATE TABLE catalog_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  icon            VARCHAR(100),          -- Lucide icon name
  color           VARCHAR(50),           -- Tailwind color class
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Service catalog items
CREATE TABLE service_catalogs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  category_id     UUID NOT NULL REFERENCES catalog_categories(id),
  name            VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  short_description VARCHAR(500),
  icon            VARCHAR(100),
  image_url       TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- DRAFT | ACTIVE | RETIRED
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  request_count   INTEGER NOT NULL DEFAULT 0,
  -- Mappings
  workflow_id     UUID REFERENCES workflows(id),
  sla_policy_id   UUID REFERENCES sla_policies(id),
  default_priority VARCHAR(50) NOT NULL DEFAULT 'P3',
  default_assignee_group VARCHAR(100),
  -- Visibility
  visible_to_roles JSONB DEFAULT '["EMPLOYEE","MANAGER","ADMIN"]',
  department_restriction UUID[],         -- NULL = all departments
  -- Metadata
  tags            TEXT[],
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Dynamic form definitions
CREATE TABLE catalog_forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id      UUID NOT NULL REFERENCES service_catalogs(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL DEFAULT 1,
  is_current      BOOLEAN NOT NULL DEFAULT TRUE,
  name            VARCHAR(255) NOT NULL,
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Individual form fields
CREATE TABLE catalog_fields (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES catalog_forms(id) ON DELETE CASCADE,
  field_key       VARCHAR(100) NOT NULL,
  field_type      VARCHAR(50) NOT NULL,
  -- text | textarea | number | date | datetime | select | multi_select
  -- checkbox | radio | file_upload | user_picker | department_picker
  label           VARCHAR(255) NOT NULL,
  placeholder     TEXT,
  help_text       TEXT,
  is_required     BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  validation_rules JSONB DEFAULT '{}',
  -- { min: 1, max: 100, pattern: "^[A-Z]", message: "..." }
  options         JSONB DEFAULT '[]',
  -- [{value: 'mac', label: 'MacBook Pro'}, ...]
  conditional_logic JSONB DEFAULT '{}',
  -- { show_if: { field_key: 'device_type', operator: 'eq', value: 'laptop' } }
  UNIQUE(form_id, field_key)
);

-- Service request submissions
CREATE TABLE service_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id      UUID NOT NULL REFERENCES service_catalogs(id),
  form_id         UUID NOT NULL REFERENCES catalog_forms(id),
  requester_id    UUID NOT NULL REFERENCES employees(id),
  request_number  VARCHAR(50) UNIQUE,    -- SR-2026-001234
  status          VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  -- SUBMITTED | IN_WORKFLOW | APPROVED | IN_PROGRESS | COMPLETED | REJECTED | CANCELLED
  form_data       JSONB NOT NULL DEFAULT '{}', -- Submitted field values
  -- Links
  ticket_id       UUID REFERENCES tickets(id), -- Auto-created ticket
  workflow_execution_id UUID REFERENCES workflow_executions(id),
  -- SLA
  sla_assignment_id UUID REFERENCES sla_assignments(id),
  -- Metadata
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  rejection_reason TEXT,
  notes           TEXT
);

-- Indexes
CREATE INDEX idx_service_catalogs_category ON service_catalogs(category_id);
CREATE INDEX idx_service_catalogs_status ON service_catalogs(status);
CREATE INDEX idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_catalog ON service_requests(catalog_id);

-- Auto-generate request number
CREATE SEQUENCE service_request_seq START 1000;
```

---

## 5. API Contracts

```
# Categories
GET    /api/v2/catalog/categories         List categories
POST   /api/v2/catalog/categories         Create category (ADMIN)
PUT    /api/v2/catalog/categories/:id     Update
DELETE /api/v2/catalog/categories/:id     Soft delete

# Catalog Items
GET    /api/v2/catalog/items              Browse catalog (filterable by category, search)
GET    /api/v2/catalog/items/featured     Featured items
GET    /api/v2/catalog/items/:id          Get item + current form
POST   /api/v2/catalog/items              Create item (ADMIN)
PUT    /api/v2/catalog/items/:id          Update item
DELETE /api/v2/catalog/items/:id          Soft delete

# Forms
GET    /api/v2/catalog/items/:id/form     Get current form definition
POST   /api/v2/catalog/items/:id/form     Create new form version
PUT    /api/v2/catalog/forms/:id          Update form

# Service Requests
GET    /api/v2/service-requests           List (filtered by requester or admin)
POST   /api/v2/service-requests           Submit new request
GET    /api/v2/service-requests/:id       Get request detail
POST   /api/v2/service-requests/:id/cancel Cancel request
GET    /api/v2/service-requests/my        My submitted requests

# Analytics
GET    /api/v2/catalog/analytics          Request volume, avg completion time
```

---

## 6. Dynamic Form Engine

The form renderer supports conditional logic, validation, and field dependencies:

```typescript
// Field types supported
type FieldType =
  | 'text' | 'textarea' | 'number' | 'email' | 'phone'
  | 'date' | 'datetime'
  | 'select' | 'multi_select' | 'radio' | 'checkbox'
  | 'file_upload'
  | 'user_picker'      // Search employees
  | 'department_picker' // Select department
  | 'rich_text';

// Conditional logic example
const conditionalField = {
  show_if: {
    field_key: 'device_type',
    operator: 'eq',        // eq | ne | in | gt | lt
    value: 'laptop'
  }
};

// Validation example
const validation = {
  min_length: 10,
  max_length: 500,
  pattern: '^[a-zA-Z0-9 ]+$',
  message: 'Only alphanumeric characters allowed'
};
```

---

## 7. Service Request Lifecycle

```
1. Employee browses Service Catalog → selects item
2. Dynamic form rendered with conditional fields
3. Employee fills and submits form
4. System:
   a. Creates service_requests record
   b. Creates associated ticket (if workflow_id set)
   c. Applies SLA policy to ticket
   d. Starts workflow execution
   e. Sends confirmation notification to requester
5. Workflow processes approvals
6. On final approval → IT/team works on request
7. Agent marks request COMPLETED
8. Requester notified + CSAT survey triggered
```

---

## 8. Frontend Pages

| Page | Route | Access |
|---|---|---|
| `CatalogHomePage` | `/app/service-catalog` | All employees |
| `CatalogItemPage` | `/app/service-catalog/:id` | All employees |
| `ServiceRequestPage` | `/app/service-requests/new/:catalogId` | All employees |
| `MyRequestsPage` | `/app/service-requests/my` | All employees |
| `RequestDetailPage` | `/app/service-requests/:id` | Requester + Admin |
| `CatalogAdminPage` | `/app/admin/catalog` | ADMIN |
| `FormBuilderPage` | `/app/admin/catalog/:id/form` | ADMIN |

---

## 9. Feature Flag

```
VITE_ENABLE_SERVICE_CATALOG=true
ENABLE_SERVICE_CATALOG=true  # backend
```
