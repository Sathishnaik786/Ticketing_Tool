# Dead Code Analysis

## Confirmed Dead (Pre-Fix)

| Asset | References | Action |
|-------|------------|--------|
| FloatingOperationsPanel.tsx | 0 | **Deleted** |
| 8× `*.nav.ts` module files | Tests only | **Deleted** — tests migrated to central NAV_ITEMS |
| Mock GlobalSearch data | Replaced | **Removed** |

## Retained (Verified In Use)

- All App.tsx page imports (EMS routes active)
- `navigation.utils.ts` — primary nav/search SSOT
- Module route files — all referenced from App.tsx

## Post-Split Navigation

Monolithic `navigation.ts` → `config/navigation/` domain files with backward-compatible re-export.
