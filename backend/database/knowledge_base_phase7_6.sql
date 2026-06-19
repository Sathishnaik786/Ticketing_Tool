/* ============================================================
   ETMS – Phase 7.6: Knowledge Base & Self-Service Portal
   Aparna Enterprises

   Apply order:
     1. ticketing_phase1.sql (prerequisite)
     2. Run this file

   Rollback:
     knowledge_base_phase7_6_rollback.sql

   Additive only – no ALTER on existing ETMS tables.
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- KNOWLEDGE CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL
    CHECK (category IN ('IT', 'HR', 'FINANCE', 'PROCUREMENT', 'FACILITIES', 'ADMINISTRATION')),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- KNOWLEDGE ARTICLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES knowledge_categories(id) ON DELETE RESTRICT,
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED')),
  author_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  current_version INT NOT NULL DEFAULT 1,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_title ON knowledge_articles USING gin(to_tsvector('english', title));

-- ------------------------------------------------------------
-- ARTICLE VERSIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  version_number INT NOT NULL CHECK (version_number >= 1),
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, version_number)
);

-- ------------------------------------------------------------
-- ARTICLE TAGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_article_tags_tag ON knowledge_article_tags(tag);

-- ------------------------------------------------------------
-- ARTICLE RATINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, employee_id)
);

-- ------------------------------------------------------------
-- ARTICLE VIEWS (includes search tracking; article_id NULL = failed search)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  search_query TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_article ON knowledge_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_search ON knowledge_article_views(search_query);

-- ------------------------------------------------------------
-- ARTICLE FEEDBACK
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  feedback_type VARCHAR(30) NOT NULL DEFAULT 'GENERAL'
    CHECK (feedback_type IN ('GENERAL', 'HELPFUL', 'NOT_HELPFUL', 'SUGGESTION')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_knowledge_categories_updated ON knowledge_categories;
CREATE TRIGGER trg_knowledge_categories_updated
  BEFORE UPDATE ON knowledge_categories
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_articles_updated ON knowledge_articles;
CREATE TRIGGER trg_knowledge_articles_updated
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_ratings_updated ON knowledge_article_ratings;
CREATE TRIGGER trg_knowledge_ratings_updated
  BEFORE UPDATE ON knowledge_article_ratings
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

-- ------------------------------------------------------------
-- SEED: Aparna Enterprises Knowledge Categories
-- ------------------------------------------------------------
INSERT INTO knowledge_categories (name, description, category, display_order)
VALUES
  ('IT Support', 'Hardware, software, and access guides', 'IT', 1),
  ('HR Policies', 'Leave, payroll, and employee services', 'HR', 2),
  ('Finance Procedures', 'Expense, invoice, and payment guides', 'FINANCE', 3),
  ('Procurement', 'Vendor and purchase request guides', 'PROCUREMENT', 4),
  ('Facilities', 'Office, travel, and meeting room guides', 'FACILITIES', 5),
  ('Administration', 'General admin and onboarding guides', 'ADMINISTRATION', 6)
ON CONFLICT DO NOTHING;

-- Seed sample published articles (uses first category per type)
DO $$
DECLARE
  cat_it UUID;
  cat_hr UUID;
  cat_fin UUID;
  art_id UUID;
BEGIN
  SELECT id INTO cat_it FROM knowledge_categories WHERE category = 'IT' LIMIT 1;
  SELECT id INTO cat_hr FROM knowledge_categories WHERE category = 'HR' LIMIT 1;
  SELECT id INTO cat_fin FROM knowledge_categories WHERE category = 'FINANCE' LIMIT 1;

  IF cat_it IS NOT NULL THEN
    INSERT INTO knowledge_articles (category_id, title, summary, content, status, published_at, current_version)
    VALUES (
      cat_it,
      'How to Reset Your Password',
      'Step-by-step guide to reset your Aparna Enterprises account password.',
      E'## Password Reset\n\n1. Go to the login page\n2. Click Forgot Password\n3. Enter your corporate email\n4. Follow the link in your email\n5. Set a new password meeting security requirements',
      'PUBLISHED',
      NOW(),
      1
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO art_id;

    IF art_id IS NOT NULL THEN
      INSERT INTO knowledge_article_tags (article_id, tag) VALUES
        (art_id, 'password'),
        (art_id, 'access'),
        (art_id, 'faq')
      ON CONFLICT DO NOTHING;

      INSERT INTO knowledge_article_versions (article_id, version_number, title, summary, content)
      SELECT id, 1, title, summary, content FROM knowledge_articles WHERE id = art_id
      ON CONFLICT DO NOTHING;
    END IF;

    INSERT INTO knowledge_articles (category_id, title, summary, content, status, published_at, current_version)
    VALUES (
      cat_it,
      'VPN Connection Troubleshooting',
      'Resolve common VPN connectivity issues on corporate devices.',
      E'## VPN Troubleshooting\n\n- Verify internet connection\n- Restart VPN client\n- Check credentials\n- Contact IT if error persists',
      'PUBLISHED',
      NOW(),
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_hr IS NOT NULL THEN
    INSERT INTO knowledge_articles (category_id, title, summary, content, status, published_at, current_version)
    VALUES (
      cat_hr,
      'Leave Application Process',
      'How to apply for leave through ETMS.',
      E'## Leave Application\n\n1. Open ETMS Leaves module\n2. Select leave type\n3. Choose dates\n4. Submit for manager approval',
      'PUBLISHED',
      NOW(),
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_fin IS NOT NULL THEN
    INSERT INTO knowledge_articles (category_id, title, summary, content, status, published_at, current_version)
    VALUES (
      cat_fin,
      'Expense Reimbursement Guide',
      'Submit expense claims for Aparna Enterprises reimbursements.',
      E'## Expense Reimbursement\n\n1. Collect receipts\n2. Submit via Finance portal\n3. Attach supporting documents\n4. Track approval status',
      'PUBLISHED',
      NOW(),
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
