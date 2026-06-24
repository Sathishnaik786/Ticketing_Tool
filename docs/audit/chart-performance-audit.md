# Chart Performance Audit — Phase 4

**Audit Date:** 2026-06-24
**Scope:** All Recharts usage across the ETMS frontend

---

## Components Reviewed

### `TicketStatusChart.tsx`
| Check | Status | Notes |
|---|---|---|
| Data memoization | ✅ Fixed | `chartData` wrapped in `useMemo` in Phase 4.5 |
| Component memoization | ✅ Fixed | Wrapped with `React.memo` |
| Animation on re-render | ✅ Pass | Recharts animates on mount only |
| Responsive container | ✅ Pass | Uses `ResponsiveContainer width="100%"` |
| Error boundary | ✅ Pass | Wrapped via parent `CommandDashboardPage` boundary |

### `DepartmentPerformancePanel.tsx`
| Check | Status | Notes |
|---|---|---|
| Sub-component extraction | ✅ Fixed | `DeptRow` extracted as separate `React.memo` |
| Data memoization | ✅ Fixed | Department data memoized with `useMemo` |
| Re-render count | ✅ Pass | Only re-renders on query data change |

---

## Recharts Best Practices

### Pattern Applied
```tsx
// ✅ Correct — memoize data transformation
const chartData = useMemo(() =>
  tickets.reduce((acc, t) => {
    const entry = acc.find(e => e.status === t.status);
    if (entry) entry.count++;
    else acc.push({ status: t.status, count: 1 });
    return acc;
  }, [] as { status: string; count: number }[]),
[tickets]);

// ✅ Correct — memoize the component
export const TicketStatusChart = React.memo(function TicketStatusChart({ tickets }) {
  // ...
});
```

---

## Known Recharts Issues

| Issue | Impact | Mitigation |
|---|---|---|
| Recharts re-mounts entire chart on container size change | Low | Use `isAnimationActive={false}` for dashboards with frequent resize |
| Legend items cause extra re-renders | Low | Pass `wrapperStyle` as a stable object |
| Tooltip can lag on large datasets | Medium | Limit data points to `<200` per chart; paginate if needed |

---

## Recommendations

1. **Add `isAnimationActive={false}`** to production dashboards where performance > aesthetics.
2. **Lazy-load chart components** using `React.lazy` + `Suspense` for initial bundle split.
3. **Virtualize list-based charts** using `recharts-virtualized` if row count exceeds 100.
4. **Cache API responses** in React Query with `staleTime: 60_000` to avoid chart flicker.

---

## Overall Score

| Dimension | Score |
|---|---|
| Memoization | 10/10 |
| Re-render efficiency | 9/10 |
| Animation control | 7/10 |
| Bundle footprint | 7/10 |
| **Overall** | **8.25/10** |
