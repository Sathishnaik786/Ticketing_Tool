/* ============================================================
   ETMS – Phase 7.6 Rollback
   Drops Knowledge Base tables only (dependency order)
   ============================================================ */

DROP TABLE IF EXISTS knowledge_article_feedback CASCADE;
DROP TABLE IF EXISTS knowledge_article_views CASCADE;
DROP TABLE IF EXISTS knowledge_article_ratings CASCADE;
DROP TABLE IF EXISTS knowledge_article_tags CASCADE;
DROP TABLE IF EXISTS knowledge_article_versions CASCADE;
DROP TABLE IF EXISTS knowledge_articles CASCADE;
DROP TABLE IF EXISTS knowledge_categories CASCADE;

DROP FUNCTION IF EXISTS update_knowledge_updated_at() CASCADE;
