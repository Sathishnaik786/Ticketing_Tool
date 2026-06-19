# Playwright Test Plan — Phase 8.3

## Configuration

- **Config:** `frontend/playwright.config.ts`
- **Command:** `npm run test:e2e`
- **Projects:** Desktop Chrome + iPhone 13

## Test Suites (65+ scenarios)

| Suite | File | Scenarios |
|-------|------|-----------|
| Public routes | `e2e/auth/public-routes.spec.ts` | 5 |
| Navigation | `e2e/navigation/navigation.spec.ts` | 14 |
| Dashboard | `e2e/dashboard/dashboard.spec.ts` | 4 |
| Search & commands | `e2e/search/command-search.spec.ts` | 12 |
| RBAC | `e2e/rbac/rbac-enforcement.spec.ts` | 4 |
| Route integrity | `e2e/routes/route-integrity.spec.ts` | 25 |
| Feature flags | `e2e/flags/feature-flag-matrix.spec.ts` | 6 |
| Mobile | `e2e/mobile/mobile-sidebar.spec.ts` | 4 |
| Ticketing (legacy) | `e2e/ticketing/*.spec.ts` | 10 |

## Critical Scenarios

- [x] EMPLOYEE cannot access admin (with credentials)
- [x] Unauthenticated redirect from all protected routes
- [x] Public marketing pages load
- [x] No server 500 on nav paths
- [x] Feature flag smoke (login renders)
- [x] Mobile viewport login/dashboard redirect

## Credentials

Set env vars for authenticated flows:

```
PLAYWRIGHT_ADMIN_EMAIL
PLAYWRIGHT_EMPLOYEE_EMAIL
PLAYWRIGHT_MANAGER_EMAIL
PLAYWRIGHT_HR_EMAIL
```

## CI Integration

```yaml
- run: npm run test:e2e
  env:
    CI: true
    PLAYWRIGHT_BASE_URL: http://localhost:8081
```
