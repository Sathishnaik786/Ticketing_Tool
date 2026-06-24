-- ETMS Phase 6.5: Category seed + legacy description backfill
-- Safe to run multiple times (idempotent inserts by name)

BEGIN;

INSERT INTO ticket_categories (id, name, description, display_order, is_active)
VALUES
  ('a1000001-0000-4000-8000-000000000001', 'IT', 'Information technology and systems support', 1, TRUE),
  ('a1000001-0000-4000-8000-000000000002', 'HR', 'Human resources and employee services', 2, TRUE),
  ('a1000001-0000-4000-8000-000000000003', 'Finance', 'Finance and accounting requests', 3, TRUE),
  ('a1000001-0000-4000-8000-000000000004', 'Payroll', 'Payroll and compensation support', 4, TRUE),
  ('a1000001-0000-4000-8000-000000000005', 'Infrastructure', 'Infrastructure and platform operations', 5, TRUE),
  ('a1000001-0000-4000-8000-000000000006', 'Security', 'Security and access management', 6, TRUE),
  ('a1000001-0000-4000-8000-000000000007', 'Facilities', 'Facilities and workplace services', 7, TRUE),
  ('a1000001-0000-4000-8000-000000000008', 'Administration', 'General administration and other requests', 8, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Backfill category_id from legacy description prefix: [Category: Label]
UPDATE tickets t
SET category_id = c.id,
    updated_at = CURRENT_TIMESTAMP
FROM ticket_categories c
WHERE t.category_id IS NULL
  AND t.description ILIKE '[Category: IT%'
  AND c.name = 'IT';

UPDATE tickets t
SET category_id = c.id,
    updated_at = CURRENT_TIMESTAMP
FROM ticket_categories c
WHERE t.category_id IS NULL
  AND t.description ILIKE '[Category: Human Resources%'
  AND c.name = 'HR';

UPDATE tickets t
SET category_id = c.id,
    updated_at = CURRENT_TIMESTAMP
FROM ticket_categories c
WHERE t.category_id IS NULL
  AND t.description ILIKE '[Category: Facilities%'
  AND c.name = 'Facilities';

UPDATE tickets t
SET category_id = c.id,
    updated_at = CURRENT_TIMESTAMP
FROM ticket_categories c
WHERE t.category_id IS NULL
  AND t.description ILIKE '[Category: Payroll%'
  AND c.name = 'Payroll';

UPDATE tickets t
SET category_id = c.id,
    updated_at = CURRENT_TIMESTAMP
FROM ticket_categories c
WHERE t.category_id IS NULL
  AND (
    t.description ILIKE '[Category: General Support%'
    OR t.description ILIKE '[Category: Other%'
  )
  AND c.name = 'Administration';

COMMIT;
