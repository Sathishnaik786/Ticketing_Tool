# Logo Audit — Phase 6.6

| File Path | Usage | Count (landing+login) | Replacement Risk |
|-----------|-------|----------------------|------------------|
| `frontend/public/logo.png` | Primary brand asset (91KB) | — | **Low** — keep path, update alt text only |
| `frontend/public/favicon.ico` | Browser tab icon | index.html (implicit) | Low — no change unless new favicon |
| `frontend/src/assest/logo.png` | Duplicate/unused? | 0 refs in landing/login | Low |
| `/logo.png` in `Landing.tsx` | Navbar, mobile drawer, footer | 4 | Low |
| `/logo.png` in `LoginGlassCard.tsx` | Login card header | 1 | Low |
| `/logo.png` in `GlassLoginLayout.tsx` | Left panel watermark | 1 | Low |

**Note:** No new logo asset provided. Phase 6.6 updates **alt text and brand labels** only; `/logo.png` reference unchanged to avoid layout breakage.
