# Accessibility Audit V2

## WCAG 2.1 AA Gap Analysis (Pre-Fix)

| Criterion | Status | Notes |
|-----------|--------|-------|
| 2.3.3 Animation from Interactions | Fail | No reduced-motion support |
| 4.1.3 Status Messages | Partial | Notifications lacked live region |
| 2.4.3 Focus Order | Partial | Mobile drawer no focus trap |
| 1.3.1 Info and Relationships | Pass | Landmarks present (nav, main, skip link) |
| 2.1.1 Keyboard | Pass | Command palette, sidebar keyboard nav |

## Post-Fix Improvements

- `prefers-reduced-motion: reduce` in `index.css`
- Notification trigger `aria-live="polite"` region
- Mobile sidebar focus trap + Escape to close
- GlobalSearch `role="searchbox"`

## Remaining

- Table sort announcements (not implemented — low traffic pages)
- Focus return after mobile drawer close (partial — Escape closes)
- Full axe CI integration recommended
