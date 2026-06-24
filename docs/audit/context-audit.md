# Context API Usage Audit — Phase 4

**Audit Date:** 2026-06-24
**Scope:** React Context providers, consumer patterns, and context-related re-render analysis

---

## Context Providers Inventory

| Context | Provider Location | Consumers | Re-render Risk |
|---|---|---|---|
| `AuthContext` | `AppBootstrap.tsx` | 20+ components | Medium |
| `FeatureFlagContext` | `AppBootstrap.tsx` | 15+ components | Low |
| `ThemeContext` | `AppBootstrap.tsx` | 10+ components | Low |
| `NotificationContext` | `AppBootstrap.tsx` | 5+ components | Medium |
| `QueryClientContext` | `App.tsx` | All pages | Low (TanStack) |

---

## Issues Found

### MEDIUM — `AuthContext` over-subscription
**Risk:** Components that only need `user.id` re-render when any `user` field changes.

**Current pattern:**
```tsx
// ❌ Full context subscription
const { user, logout, isLoading } = useAuth();
// Component re-renders when isLoading changes, even if not needed
```

**Recommended pattern:**
```tsx
// ✅ Selector pattern (if memoized sub-context added)
const userId = useAuthSelector(u => u.id);
```

**Action:** Low priority for now; defer to Phase 5 if performance degrades.

### LOW — `FeatureFlagContext` boolean stability
**Status:** ✅ No issue — flags are stable booleans; no re-render risk.

### LOW — Missing `useMemo` on context value objects
Some context providers construct value objects inline, which creates new references on every render.

```tsx
// ❌ New object on every render
<SomeContext.Provider value={{ data, setData }}>

// ✅ Stable reference
const contextValue = useMemo(() => ({ data, setData }), [data]);
<SomeContext.Provider value={contextValue}>
```

---

## TanStack Query as Context Replacement

| Use Case | Approach | Status |
|---|---|---|
| Server data (tickets, users) | `useQuery` + cache | ✅ Done |
| Real-time invalidation | `invalidateQueries` | ✅ Done |
| Optimistic updates | `useMutation` | ✅ Done |
| UI-only state | Local `useState` | ✅ Done |
| Cross-component UI state | Context | ✅ Minimal |

---

## Recommendations

1. **Audit `AuthContext` for selective subscription** — add sub-selectors if profiling reveals re-render cascades.
2. **Memoize all context value objects** constructed inline using `useMemo`.
3. **Add React DevTools Profiler runs** on Dashboard and Ticket Detail pages to surface hidden re-renders.
4. **Document context shape** with TypeScript interfaces for all 5 providers.

---

## Overall Score

| Dimension | Score |
|---|---|
| Context shape documentation | 6/10 |
| Re-render risk | 7/10 |
| Selector pattern adoption | 4/10 |
| TanStack Query utilization | 10/10 |
| **Overall** | **6.75/10** |
