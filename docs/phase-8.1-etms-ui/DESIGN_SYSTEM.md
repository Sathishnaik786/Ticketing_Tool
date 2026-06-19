# Design System — Ticketra ETMS

**Date:** 2026-06-19  
**Version:** 1.0  
**Status:** Specification (migration from EMTS glass tokens)

---

## Design Intent

Ticketra ETMS adopts a **modern enterprise SaaS** visual language aligned with Jira, Freshservice, Zendesk, and ServiceNow:

- Clean, information-dense layouts
- Consistent 8px spacing grid
- Restrained color palette with semantic meaning
- 12px border radius (not oversized capsules)
- Inter typography throughout
- Full dark mode parity

---

## Color Tokens

### Brand & Semantic

| Token | Hex | HSL (for shadcn) | Usage |
|-------|-----|------------------|-------|
| `--color-primary` | `#2563EB` | `221 83% 53%` | Primary actions, active nav, links |
| `--color-primary-hover` | `#1D4ED8` | `224 76% 48%` | Button hover |
| `--color-primary-muted` | `#DBEAFE` | `214 95% 93%` | Selected backgrounds, badges |
| `--color-success` | `#10B981` | `160 84% 39%` | Resolved, approved, SLA met |
| `--color-warning` | `#F59E0B` | `38 92% 50%` | Pending, due soon, at-risk SLA |
| `--color-danger` | `#EF4444` | `0 84% 60%` | Overdue, rejected, breached SLA |
| `--color-info` | `#3B82F6` | `217 91% 60%` | Informational states |

### Surfaces

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-background` | `#F8FAFC` | `#0F172A` | Page background |
| `--color-surface` | `#FFFFFF` | `#1E293B` | Cards, sidebar, navbar |
| `--color-surface-elevated` | `#FFFFFF` | `#334155` | Modals, dropdowns |
| `--color-border` | `#E2E8F0` | `#334155` | Dividers, inputs |
| `--color-border-subtle` | `#F1F5F9` | `#1E293B` | Section separators |

### Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-text-primary` | `#0F172A` | `#F8FAFC` | Headings, body |
| `--color-text-secondary` | `#64748B` | `#94A3B8` | Labels, metadata |
| `--color-text-muted` | `#94A3B8` | `#64748B` | Placeholders |
| `--color-text-inverse` | `#FFFFFF` | `#0F172A` | On primary buttons |

### Priority & Status (Tickets)

| Priority | Color | Background |
|----------|-------|------------|
| Critical | `#EF4444` | `#FEE2E2` |
| High | `#F59E0B` | `#FEF3C7` |
| Medium | `#2563EB` | `#DBEAFE` |
| Low | `#64748B` | `#F1F5F9` |

| Status | Color |
|--------|-------|
| Open | `#2563EB` |
| In Progress | `#F59E0B` |
| Resolved | `#10B981` |
| Closed | `#64748B` |

### Legacy EMS Accent (Optional)

Legacy section uses `--color-legacy` (`#78716C` stone) to visually de-emphasize without hiding.

---

## Typography

**Font family:** Inter (already in `tailwind.config.ts`)

| Scale | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 30px / 1.875rem | 700 | 1.2 | Dashboard hero |
| `h1` | 24px / 1.5rem | 600 | 1.3 | Page titles |
| `h2` | 20px / 1.25rem | 600 | 1.4 | Section headers |
| `h3` | 16px / 1rem | 600 | 1.5 | Card titles |
| `body` | 14px / 0.875rem | 400 | 1.5 | Default text |
| `body-sm` | 12px / 0.75rem | 400 | 1.5 | Secondary text |
| `label` | 12px / 0.75rem | 500 | 1.4 | Form labels, nav groups |
| `kpi` | 28px / 1.75rem | 700 | 1.1 | Stat card values |

**Letter spacing:**
- Headings: `-0.02em`
- Nav group labels: `0.05em` uppercase
- KPI labels: `0.02em`

---

## Spacing (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 8px | Default inline gap |
| `--space-3` | 12px | Compact padding |
| `--space-4` | 16px | Card padding (mobile) |
| `--space-5` | 20px | — |
| `--space-6` | 24px | Card padding (desktop) |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Page section spacing |
| `--space-12` | 48px | Large section breaks |

**Layout constants:**
- Sidebar width expanded: `260px`
- Sidebar width collapsed: `64px`
- Top navbar height: `56px`
- Max content width: `1440px`
- Page padding: `24px` (desktop), `16px` (mobile)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, chips |
| `--radius-md` | **12px** | Cards, inputs, buttons (default) |
| `--radius-lg` | 16px | Modals, drawers |
| `--radius-full` | 9999px | Avatars, pills |

**Migration note:** Replace `--radius-card: 2.5rem` and `rounded-[2.5rem]` in AppLayout with `--radius-md` (12px). Keep subtle rounding — not square, not pill-everywhere.

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,0.05)` | Cards at rest |
| `--shadow-md` | `0 4px 6px -1px rgba(15,23,42,0.08)` | Elevated cards |
| `--shadow-lg` | `0 10px 15px -3px rgba(15,23,42,0.10)` | Modals, popovers |
| `--shadow-focus` | `0 0 0 3px rgba(37,99,235,0.35)` | Focus ring |

Remove heavy cyan glow shadows from active nav states; use left border accent instead.

---

## Components

### Sidebar Nav Item

```
Default:  text-secondary, icon 20px, padding 8px 12px, radius 12px
Hover:    bg-surface-hover (#F1F5F9 / #334155)
Active:   bg-primary-muted, text-primary, font-medium, 3px left border primary
Collapsed: icon only + tooltip
```

### KPI Stat Card

```
Structure: label (body-sm) + value (kpi) + trend chip + optional sparkline
Min height: 96px
Padding: 16px 20px
Border: 1px border-subtle
Icon: 40px circle, semantic color background at 10% opacity
```

### Data Table

```
Header: sticky, bg-surface, text label uppercase, sort icons
Row: 48px height, hover bg-subtle, selected bg-primary-muted
Cell padding: 12px 16px
Actions: icon buttons, dropdown overflow
```

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | primary | white | none |
| Secondary | transparent | primary | 1px primary |
| Ghost | transparent | text-secondary | none |
| Danger | danger | white | none |

Height: `36px` (default), `32px` (sm), `40px` (lg)

### Badges

Pill shape (`radius-full`), padding `4px 10px`, font `body-sm` weight 500.

---

## Iconography

**Library:** Lucide React (existing)

| Module | Icon |
|--------|------|
| Dashboard | `LayoutDashboard` |
| Tickets | `Ticket` |
| Assignments | `ClipboardList` |
| Approvals | `CheckCircle2` |
| Knowledge Base | `BookOpen` |
| Communications | `MessageSquare` |
| Analytics | `BarChart3` |
| Notifications | `Bell` |
| Administration | `Settings` |
| Legacy EMS | `Archive` |

Icon size: `20px` nav, `16px` inline, `24px` page headers.

---

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover, toggle |
| `--duration-normal` | 250ms | Expand/collapse |
| `--duration-slow` | 350ms | Page transitions |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | All transitions |

Reduce framer-motion layout animations in sidebar; prefer CSS transitions for performance.

---

## Dark Mode

Map all tokens to `.dark` class (next-themes existing):

```css
.dark {
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text-primary: #F8FAFC;
  /* ... */
}
```

**Requirements:**
- No hardcoded `#c1e1ec` or inline light backgrounds in AppLayout
- Chart colors: adjust saturation for dark backgrounds
- Border contrast ≥ 3:1 against surface

---

## Accessibility (WCAG AA)

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | 4.5:1 body text, 3:1 large text/UI components |
| Focus visible | `--shadow-focus` on all interactive elements |
| Keyboard nav | Tab order: sidebar → header → main; arrow keys in menus |
| Screen readers | `aria-current="page"` on active nav; live regions for notifications |
| Skip link | Preserve existing skip-to-content |
| Motion | `prefers-reduced-motion` disables animations |

---

## File Migration Plan

| File | Action |
|------|--------|
| `frontend/src/styles/design-tokens.css` | Add ETMS token block; deprecate large radii |
| `frontend/src/index.css` | Map shadcn `--primary` to `#2563EB` |
| `frontend/tailwind.config.ts` | Extend theme with semantic colors |
| `AppLayout.tsx` | Remove inline `#c1e1ec`; use `--color-background` |
| Module components | Gradual adoption — no big-bang rewrite |

---

## Token CSS Snippet (Reference)

```css
:root {
  --color-primary: #2563EB;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-background: #F8FAFC;
  --radius-md: 12px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --font-family: 'Inter', system-ui, sans-serif;
}

.dark {
  --color-background: #0F172A;
  --color-surface: #1E293B;
}
```

---

**Next:** Apply tokens in shell refactor per [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md).
