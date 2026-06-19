# Accessibility CI Report — Phase 8.3

## Tooling

- **Engine:** axe-core via `vitest-axe`
- **Command:** `npm run test:a11y`
- **CI gate:** Fail on critical violations > 0

## Scanned Components

| Component | Critical Violations | Status |
|-----------|--------------------|--------|
| Sidebar | 0 | PASS |
| Header | 0 | PASS |
| GlobalSearch | 0 | PASS |

## Test File

`frontend/src/accessibility.test.tsx`

## Rules

- Critical violations: **zero tolerance**
- Color contrast: disabled in jsdom (canvas limitation)
- Known combobox patterns: validated separately

## WCAG Target

WCAG 2.1 AA for scanned shell components.

## Recommendations

- Add axe to CI pipeline: `npm run test:a11y`
- Expand scans to CommandPalette and Dashboard when mounted with test providers
