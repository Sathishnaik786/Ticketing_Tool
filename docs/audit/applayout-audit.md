# App Layout Audit

This document audits the structure, styling, and accessibility of the main application layout (`AppLayout.tsx`).

## 1. Structure & Code Smells
* **Successful refactoring**: The sidebar and header have been cleanly separated from `AppLayout.tsx` into standalone files (`components/layout/sidebar/Sidebar.tsx` and `components/layout/Header.tsx`).
* **Conditionals**: The layout has conditional wrappers checking `isEtmsUiV2Enabled` (`etmsShell`) to support both legacy and modern layouts. While this is helpful for transitions, it adds minor complexity.

## 2. Hardcoded Styles
* **Backup colors**: The legacy mode includes an inline style (`style={etmsShell ? undefined : { background: '#c1e1ec' }}`) which should ideally be managed via classes.

## 3. Accessibility Analysis
* **Skip Link**: The layout successfully includes a `Skip to main content` anchor mapping to `id="main-app-content"` for screen readers and keyboard navigation.
* **Outlines**: Focus rings are configured properly, but some custom button elements inside page layouts need explicit focus outlines.
