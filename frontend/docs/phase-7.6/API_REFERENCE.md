# Phase 7.6 — API Reference

Base: `/api/knowledge` | Auth required | Flag: `ENABLE_KNOWLEDGE_BASE=true`

## Categories

### GET /categories
Returns active knowledge categories.

## Articles

### GET /articles
Query: `category_id`, `status` (employees see PUBLISHED only)

### GET /articles/:id
Returns article, tags, versions, ratings summary. Records view for published articles.

### POST /articles
Create draft/review article. Body: `{ category_id, title, summary, content, tags[], status? }`

### PUT /articles/:id
Update article (creates new version on content change).

### POST /articles/:id/publish
Manager/Admin only. Sets status PUBLISHED.

### POST /articles/:id/archive
Manager/Admin only. Sets status ARCHIVED.

### POST /articles/:id/rate
Body: `{ rating: 1-5 }`

### POST /articles/:id/feedback
Body: `{ feedback_type, message }`

### GET /articles/:id/related
Related published articles by tag.

## Search & Analytics

### GET /search?q=...&category_id=...&limit=10
Search published articles. Logs search analytics.

### GET /analytics
Manager/HR/Admin only. Views, ratings, trends, deflection rate.
