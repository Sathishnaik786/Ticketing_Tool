# Bundle Size Audit — Phase 4

**Audit Date:** 2026-06-24
**Scope:** Frontend bundle composition, code splitting, lazy loading, and tree shaking

---

## Build Tool

- **Bundler:** Vite 5.x
- **Framework:** React 18
- **TypeScript:** 5.x

---

## Known Large Dependencies

| Package | Size (approx) | Usage | Optimization |
|---|---|---|---|
| `recharts` | ~300 KB gzipped | Dashboard charts | Lazy-load chart pages |
| `@tanstack/react-table` | ~45 KB gzipped | DataGrid / TicketList | ✅ Tree-shaken |
| `@tanstack/react-query` | ~32 KB gzipped | All data fetching | ✅ Tree-shaken |
| `lucide-react` | ~variable | Icons everywhere | ⚠️ Import individually |
| `xlsx` | ~450 KB gzipped | CSV/Excel export | ⚠️ Lazy-load on demand |
| `date-fns` | ~80 KB gzipped | Date formatting | ✅ Tree-shaken |
| `sonner` | ~15 KB gzipped | Toast notifications | ✅ Small |
| `socket.io-client` | ~50 KB gzipped | Real-time events | Consider dynamic import |

---

## Code Splitting Status

| Route | Lazy-loaded | Status |
|---|---|---|
| Dashboard | ❓ Unknown | Verify in Vite config |
| Ticket List | ❓ Unknown | Should be lazy |
| Ticket Detail | ❓ Unknown | Should be lazy |
| Admin pages | ❓ Unknown | Should be lazy |
| Notification Center | ❓ Unknown | Should be lazy |

---

## Optimization Recommendations

### 1. Lazy-load `xlsx` (High Priority)
```tsx
// Current — always bundled
import * as XLSX from 'xlsx';

// Recommended — load only on export click
const handleExport = async () => {
  const { utils, writeFile } = await import('xlsx');
  // ... export logic
};
```
**Savings:** ~450 KB from initial bundle.

### 2. Route-level Code Splitting
```tsx
// In App.tsx / router config
const TicketListPage = React.lazy(() => import('./modules/ticketing/pages/TicketListPage'));
const ExecutiveDashboard = React.lazy(() => import('./modules/executive/pages/ExecutiveDashboardPage'));
```

### 3. Lucide Icon Tree Shaking
```tsx
// ❌ Avoid barrel imports
import { Search, Bell, Menu } from 'lucide-react'; // Fine — already tree-shaken by lucide-react

// ✅ Already correct — lucide-react supports named imports with no bundle bloat
```

### 4. Recharts Lazy Loading
```tsx
const TicketStatusChart = React.lazy(() => import('./components/TicketStatusChart'));
```

---

## Estimated Bundle Size Targets

| Metric | Current (est.) | Target |
|---|---|---|
| Initial JS bundle | ~800 KB gzipped | <400 KB |
| First Contentful Paint | ~2.5s | <1.5s |
| Time to Interactive | ~3.5s | <2.5s |

---

## Overall Score

| Dimension | Score |
|---|---|
| Code splitting | 4/10 |
| Lazy loading | 3/10 |
| Tree shaking | 8/10 |
| Bundle analysis tooling | 5/10 |
| **Overall** | **5/10** |

> **Action Required:** Add `rollup-plugin-visualizer` to Vite config and review bundle composition before Phase 5.
