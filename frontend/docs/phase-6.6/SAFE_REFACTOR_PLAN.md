# Safe Refactor Plan — Phase 6.6

## Allowed

- Text strings in `Landing.tsx`, login auth UI components, `index.html`
- Logo `alt` attributes (same `/logo.png` src)
- Testimonial quotes on login page
- SEO meta tags

## Forbidden

- CSS/class changes, layout, component structure
- Routes, AuthContext, API calls, form validation logic
- AppLayout, Dashboard, ETMS/EMS modules

## Implementation Order

1. `index.html` — SEO metadata
2. `Landing.tsx` — hero, branding strings, footer, FAQ YVI→EMTS
3. `LoginGlassCard.tsx` — Welcome Back + subtitle + alt
4. `GlassLoginLayout.tsx` — footer copyright + alt
5. `TestimonialCard.tsx` — quote branding
6. Validate build + Landing tests

## Brand Voice

- Platform: **Enterprise Management & Ticketing System (EMTS)**
- Positioning: **Unified Enterprise Operations Platform**
- Tagline: **Secure. Scalable. Enterprise Ready.**
