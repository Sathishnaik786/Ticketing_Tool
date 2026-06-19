# Dead Code Removal Report

## Deleted Files

| File | Size | Reason |
|------|------|--------|
| `components/common/FloatingOperationsPanel.tsx` | 7 KB | Zero imports |
| `modules/*/ *.nav.ts` (8 files) | ~5 KB total | Superseded by central NAV_ITEMS |

## Test Migration

All module feature-flag tests updated to use:
- `@/config/navigation` NAV_ITEMS
- `buildEtmsNavGroups()` / `filterNavItem()`

## Verification

```bash
rg "FloatingOperationsPanel" frontend/src  # 0 matches
rg "\.nav\.ts" frontend/src               # 0 matches
```

## Not Deleted (Verified Active)

- App.tsx EMS page imports
- Legacy EMS nav items in registry
- Duplicate my-payslips route (backward compatibility)
