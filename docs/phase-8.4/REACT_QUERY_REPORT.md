# React Query Cache Health Report — Phase 8.4

**Date:** June 20, 2026  
**Audience:** Performance Engineer, Principal Frontend Engineer  
**Scope:** React Query client configuration, query keys validation, invalidation sequences, and mutations.

---

## 🔍 Validation Summary

We verified the default query client options and custom ticketing/dashboard module hooks:

* **Central Configuration**: Query client options configured in `App.tsx` establish a default `staleTime` of **5 minutes** and `gcTime` of **10 minutes**.
* **Query Key Security**: All query keys are managed using the central helper `queryKeys.ts`, avoiding duplicate query key hashes.
* **Mutation Invalidation**: Core mutations (assign, reassign, status change, feedback, attachments, comments) trigger query client cache invalidations (`invalidateQueries`) upon resolution.
* **Error Observability**: Global mutation errors trigger observability logging (`observability.captureException`) to catch failure spikes.

---

## 📊 React Query Configuration Parameters

| Option | Configuration Value | Target Performance Benefit | Status |
| :--- | :--- | :--- | :---: |
| `staleTime` | `5 * 60 * 1000` (5 mins) | Minimizes duplicate API fetches during page navigation. | ✅ PASS |
| `gcTime` | `10 * 60 * 1000` (10 mins) | Garbage collects unused cache entries from client state. | ✅ PASS |
| `refetchOnWindowFocus` | `false` | Prevents unnecessary backend requests when switching browser tabs. | ✅ PASS |
| `retry` | `1` (queries), `false` (mutations) | Limits database query drain while keeping UI loading states snappy. | ✅ PASS |
| `retryDelay` | Exponential backoff (`2^attempt * 1000ms`) | Avoids hitting rate limits when recovery is in progress. | ✅ PASS |

---

## 💡 Cache Health Invalidation Rules

* **Ticket Details Invalidation**: Confirm that [TicketDetailPage.tsx](file:///c:/Users/DELL/Downloads/Ticketing_Tool/frontend/src/modules/ticketing/pages/TicketDetailPage.tsx) mutator calls (e.g. `assignTicket`, `reassignTicket`, `createComment`) trigger immediate invalidation of the corresponding query key:
  * `queryKeys.tickets.detail(ticketId)` is marked stale immediately on success.
* **Dashboard Data**: Re-fetches stats from cache bounds when navigated.
