# Design System Audit

This document identifies visual design system issues in `index.css`, `design-tokens.css`, and `tailwind.config.ts`.

## 1. Duplicate Tokens
* **Color variables**: `--color-primary` (#2563EB) in `design-tokens.css` matches `--primary` (#2563EB) in `index.css`.
* **Surface tokens**: `--color-surface` (#FFFFFF) overlaps with `--bg-surface` (#FFFFFF).

## 2. Hardcoded Colors
* **Theme backgrounds**: Hardcoded background color styles like `background: '#c1e1ec'` exist as clean-up fallbacks in `AppLayout.tsx` for non-V2 mode.
* **Component colors**: Occasional inline Tailwind hex-colors (e.g. `dark:bg-[#030B17]`) are used instead of referencing semantic variables.

## 3. Glass Effects
* **Varying styles**: Both `backdrop-blur-3xl` + `bg-white/70` and custom glass variables (`--glass-bg`, `--glass-border`) are used simultaneously, creating minor visual inconsistencies between panels.

## 4. Radius Inconsistencies
* **Inconsistent values**: Cards use `12px` (`--radius-card`), buttons use `8px` (`--radius-button`), and Tailwind utilities scale with `calc(var(--radius) - 2px)`, leading to slight misalignments when components are nested.
