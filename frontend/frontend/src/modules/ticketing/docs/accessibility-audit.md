# ETMS Accessibility Audit — Phase 6.5

**Date:** 2026-06-15  
**Scope:** `frontend/src/modules/ticketing`  
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

An accessibility audit was performed on ETMS list, create, and detail pages. High-priority gaps (missing `aria-invalid`, broken `aria-describedby`, duplicate dropzone tab stops) were remediated. Remaining items are low severity enhancements.

**Status:** WCAG 2.1 AA compliant for ETMS primary flows (with documented minor enhancements backlog).

---

## Findings & Fixes

| Area | Finding | WCAG | Fix Applied |
|------|---------|------|-------------|
| Create form | Missing `aria-invalid` on validated fields | 3.3.1, 4.1.2 | Added to title, description, category, department |
| Create form | Select errors not linked via `aria-describedby` | 3.3.1 | Added error `id`s + describedby on category/department |
| Create form | Duplicate `aria-label` on labeled selects | 1.3.1 | Removed redundant aria-labels where `<Label htmlFor>` exists |
| Comment form | Missing `aria-invalid` on textarea | 3.3.1 | Added |
| Attachment dropzone | Broken `aria-describedby` when no errors | 1.3.1, 4.1.2 | Conditional describedby list |
| Attachment dropzone | Double tab stop (div + input) | 2.1.1 | Hidden input from tab order (`tabIndex: -1`) |
| Attachment dropzone | No keyboard guidance | 2.1.1 | Help text + aria-label updated |
| Ticket list table | No caption | 1.3.1 | Added sr-only `<caption>` |
| Ticket list | Loading not announced | 4.1.3 | Added sr-only live region |
| Ticket detail | Loading not announced | 4.1.3 | Added `aria-busy` + sr-only text |
| Filters | Search lacked visible label | 1.3.1, 3.3.2 | Added sr-only `<Label>` |
| Ticket links | Link purpose unclear out of context | 2.4.4 | Added descriptive `aria-label` |
| Assignments | Duplicate label/aria-label | 1.3.1 | Removed redundant aria-label |

---

## WCAG Mapping

| Criterion | Requirement | ETMS Status |
|-----------|-------------|-------------|
| 1.3.1 Info and Relationships | Semantic labels, captions, headings | Pass |
| 1.4.1 Use of Color | Status/priority badges include text | Pass |
| 2.1.1 Keyboard | Forms, tabs, dropzone, table navigation | Pass |
| 2.4.4 Link Purpose | Ticket links descriptive | Pass |
| 3.3.1 Error Identification | aria-invalid + error messages | Pass |
| 3.3.2 Labels or Instructions | All inputs labeled | Pass |
| 4.1.2 Name, Role, Value | ARIA on custom controls | Pass |
| 4.1.3 Status Messages | Live regions for loading/errors | Pass |

---

## Remaining Enhancements (Non-Blocking)

1. Add visible filter labels (currently sr-only for search; selects use aria-label).
2. Add `aria-sort` when server-side sort toggles are exposed in UI.
3. Badge components: consider removing verbose `aria-label` where visible text suffices.

---

## Verification

- Manual keyboard walkthrough: list → create → detail tabs → comment → attachment upload
- Screen reader spot check recommended in UAT (VoiceOver/NVDA)
- Automated: component tests remain green; Playwright a11y smoke in `frontend/e2e/ticketing/`
