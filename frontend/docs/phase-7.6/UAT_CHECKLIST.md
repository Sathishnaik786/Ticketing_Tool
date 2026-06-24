# Phase 7.6 — UAT Checklist

## Setup
- [ ] Run `knowledge_base_phase7_6.sql` on Supabase staging
- [ ] Enable `ENABLE_KNOWLEDGE_BASE` and `VITE_ENABLE_KNOWLEDGE_BASE`
- [ ] Redeploy Render + Netlify

## Knowledge Base
- [ ] `/app/knowledge-base` loads with seeded categories
- [ ] Search returns password reset article
- [ ] Article detail shows content, rating, feedback
- [ ] Category tabs filter articles

## Article Lifecycle
- [ ] Employee creates draft via `/app/article-editor`
- [ ] Manager publishes article via API
- [ ] Archived article not in employee list

## Self-Service
- [ ] Employee rates article (1–5 stars)
- [ ] Employee submits helpful/not helpful feedback

## Ticket Deflection
- [ ] Create ticket page shows "Possible Solutions Found" when title/description matches KB
- [ ] Clicking suggestion opens article in new tab
- [ ] Ticket creation flow unchanged when continuing

## Analytics
- [ ] `/app/kb-analytics` shows views, top rated, search trends
- [ ] Employee cannot access analytics (403)

## Feature Flag Off
- [ ] No KB routes/nav/suggestions after disable + redeploy

## Regression
- [ ] Auth, Ticketing, 7.1–7.5 modules unchanged
