# Phase 7.6 — Database Design

## New Tables (7)

No `ALTER` on existing ETMS tables.

| Table | Purpose |
|-------|---------|
| `knowledge_categories` | Category groupings (IT, HR, etc.) |
| `knowledge_articles` | Article master with status lifecycle |
| `knowledge_article_versions` | Version history |
| `knowledge_article_tags` | Tag associations |
| `knowledge_article_ratings` | 1–5 star ratings (unique per employee) |
| `knowledge_article_views` | View tracking + search analytics |
| `knowledge_article_feedback` | Helpful/not helpful/suggestions |

## Article Statuses

`DRAFT` | `REVIEW` | `PUBLISHED` | `ARCHIVED`

## Key Fields

**knowledge_articles:** title, summary, content, attachments (JSONB), author_id, reviewer_id, published_at, current_version

**knowledge_article_views:** article_id nullable (null = failed search), search_query for trend analytics

## Rollback

`knowledge_base_phase7_6_rollback.sql` drops all 7 tables.
