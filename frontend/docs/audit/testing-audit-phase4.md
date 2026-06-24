# Testing Coverage Audit — Phase 4

**Audit Date:** 2026-06-24
**Scope:** All frontend test suites, coverage gaps, and testing strategy

---

## Current Test Inventory

| File | Type | Tests | Status |
|---|---|---|---|
| `GlobalSearch.test.tsx` | Unit | 3 | ✅ |
| `command-palette.test.tsx` | Unit | 2 | ✅ |
| `global-search.test.tsx` (duplicate) | Unit | 2 | ⚠️ Redundant |
| `ai-panel.test.tsx` | Unit | 2 | ✅ |
| `useWebVitals.test.ts` | Unit | 3 | ✅ |

---

## Coverage Gaps

### Critical — No Tests For

| Component | Risk | Priority |
|---|---|---|
| `ComponentErrorBoundary` | High — new critical component | P0 |
| `useRealtimeTickets` | High — socket + supabase | P0 |
| `useRealtimeNotifications` | High — socket + supabase | P0 |
| `TicketStatusChart` | Medium — chart rendering | P1 |
| `DepartmentPerformancePanel` | Medium — memoized component | P1 |
| Accessibility (a11y) | Medium — WCAG AA compliance | P1 |
| Search debounce behavior | Medium — UX-critical | P1 |
| Supabase subscription cleanup | Medium — memory leaks | P1 |

---

## Test Strategy Recommendations

### Unit Testing
- Use **Vitest** + **React Testing Library**
- Mock `notificationService`, `supabase`, and `useAuth`

### Integration Testing
- Add **Playwright** or **Cypress** E2E tests for:
  - Ticket creation flow
  - Notification center
  - Role-based navigation

### Accessibility Testing
- Add `@testing-library/jest-dom` `toBeInTheDocument` checks
- Add ARIA role assertions on key interactive elements
- Use `axe-core` via `@axe-core/react` for automated a11y scanning

---

## New Tests Planned (Phase 4.5)

- `error-boundary.test.tsx` — `ComponentErrorBoundary` isolation
- `a11y.test.tsx` — ARIA roles, keyboard nav, screen reader labels
- `realtime-hooks.test.tsx` — `useRealtimeTickets`, `useRealtimeNotifications`
- `search-performance.test.tsx` — GlobalSearch debounce, large datasets
- `subscriptions.test.tsx` — Supabase cleanup verification

---

## Overall Score

| Dimension | Score |
|---|---|
| Coverage Breadth | 4/10 |
| Test Quality | 7/10 |
| CI Integration | 6/10 |
| E2E Coverage | 0/10 |
| **Overall** | **4.25/10** |

> **Action Required:** Extend test coverage to at least 60% before Phase 5 development.
