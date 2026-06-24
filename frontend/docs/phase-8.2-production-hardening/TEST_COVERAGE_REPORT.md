# Test Coverage Report

## Summary

| Area | Tests | Status |
|------|-------|--------|
| Navigation utils | 7 | ✅ Pass |
| Feature flag matrix | 19 | ✅ Pass |
| Ticket scope utils | 7 | ✅ Pass |
| Notifications UI guard | 3 | ✅ Pass |
| RouteGuard | 3 | ✅ Pass |
| GlobalSearch registry | 2 | ✅ Pass |
| Module feature flags | 40+ | ✅ Pass (migrated from *.nav.ts) |
| TicketListPage | 2 | ✅ Pass |

## Totals

- **327 tests** in frontend suite
- **326 passing** (1 pre-existing Landing property-based test failure)
- E2E specs excluded from unit run (Playwright)

## Coverage Gaps

- Sidebar focus trap — no dedicated test
- Payroll RouteGuard — integration test deferred
- Dashboard service — mocked; API integration tests pending backend

## Target

80%+ on navigation/RBAC/flags — **met** for critical paths via dedicated test files.
