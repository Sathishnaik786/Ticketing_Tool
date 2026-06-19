# Phase 8.2 — Pre-Fix Audit

**Date:** 2026-06-19  
**Scope:** ETMS UI transformation production hardening (frontend)  
**Baseline:** Phase 8.1 implementation behind feature flags

## Executive Summary

Pre-fix audit identified **4 P0 defects**, **nav-only RBAC gaps**, **mock GlobalSearch**, **empty notification UI** under partial flag combinations, and **bundle size** above target. Legacy EMS behavior with all flags OFF was preserved.

## Critical Findings (P0)

| ID | Issue | Impact |
|----|-------|--------|
| P0-1 | Payroll approvals nav href `/app/payroll/approvals` (404) | Broken link for HR/Managers |
| P0-2 | Ticket list `scope` query changed title only, not API filters | EMPLOYEE could request team/all scopes |
| P0-3 | `ETMS_NOTIFICATIONS=true` + `NOTIFICATION_CENTER=false` → empty header | No notification UI |
| P0-4 | No matrix tests for 4 ETMS flags (16 combos) | Crash risk undetected |

## Route Registry

- **Registered routes:** App.tsx + 10 module route files
- **Orphan hrefs:** 1 (payroll approvals — fixed)
- **Duplicate routes:** `/app/payroll/my-payslips` (App.tsx + payroll.routes — retained for BC)
- **Dead components:** `FloatingOperationsPanel` (0 imports)

## Navigation

- **SSOT:** `config/navigation.ts` (71 NAV_ITEMS)
- **Duplicate nav sources:** 8 module `*.nav.ts` files (test-only, superseded)
- **Missing ETMS entries:** operator-dashboard, approval-analytics, kb-analytics, notification-analytics (added in 8.1)

## RBAC

- **Enforcement:** Nav filtering only for most routes
- **Route-level guards:** Admin users only
- **API-level:** Backend module middleware documented per phase 7.x docs

## Feature Flags

| Flag | Default | Risk |
|------|---------|------|
| VITE_ENABLE_ETMS_UI_V2 | false | Shell/branding |
| VITE_ENABLE_ETMS_NAVIGATION | false | Sidebar mode |
| VITE_ENABLE_ETMS_DASHBOARD | false | Command dashboard |
| VITE_ENABLE_ETMS_NOTIFICATIONS | false | Unified notifications |

## Performance (Pre-Fix)

- Main bundle: ~2.6 MB / ~751 KB gzip
- No manual chunks
- Eager CommandPalette load

## Accessibility (Pre-Fix)

- No `prefers-reduced-motion`
- No notification live regions
- No mobile sidebar focus trap
- Skip link present

## Test Coverage

- 327 unit tests (1 pre-existing Landing property test flaky)
- No GlobalSearch registry tests
- No RouteGuard tests
- No flag matrix tests
