# Implementation Plan: Landing Page Premium Redesign

## Overview

Refactor `frontend/src/pages/Landing.tsx` from a dark-only, teal-accented page into the premium visual ecosystem established by the Login Page. The work is structured as a safe, incremental migration: design tokens and CSS first, then four new reusable components, then the full Landing.tsx section-by-section refactor. All routing, navigation, business logic, and functional components (MegaMenu, Counter, FAQ accordion) are preserved unchanged.

## Tasks

- [ ] 1. CSS foundation — design tokens and utility classes
  - Add `--accent-orange: #ea580c` and `--bg-mesh-light` custom properties to `frontend/src/styles/design-tokens.css`
  - Add `.mesh-bg-light` utility class and `shimmer` keyframe to `frontend/src/index.css` (or equivalent global CSS entry)
  - Verify that `--radius-card`, `--shadow-premium`, `--shadow-hover`, `--shadow-soft`, `--shadow-medium`, `--section-spacing`, `--page-padding`, `--font-size-hero`, `--font-size-h1`, `--font-size-h2` tokens are already present; add any that are missing
  - _Requirements: 1.1, 1.2_

- [x] 2. Create `GlassCard` reusable component
  - [x] 2.1 Implement `GlassCard.tsx` at `frontend/src/components/ui/GlassCard.tsx`
    - Accept `children`, `className`, and optional `variant` (`"light" | "dark" | "auto"`, default `"auto"`) props
    - `"auto"`: `bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 backdrop-blur-3xl rounded-[2rem]`
    - `"light"`: force light glass; `"dark"`: force dark glass
    - Apply shadow: `shadow-[0_24px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]`
    - _Requirements: 5.1, 18.1, 18.5_
  - [x] 2.2 Write property test for GlassCard variant classes
    - **Property 2: GlassCard always renders with correct glass classes for any variant**
    - **Validates: Requirements 5.1, 18.5**
    - Use `fc.constantFrom('light', 'dark', 'auto')` and `fc.string({ minLength: 1 })` as generators
    - Assert `backdrop-blur-3xl` and `rounded-[2rem]` always present; assert variant-specific bg class present

- [ ] 3. Create `PremiumButton` reusable component
  - [x] 3.1 Implement `PremiumButton.tsx` at `frontend/src/components/ui/PremiumButton.tsx`
    - Extend `React.ButtonHTMLAttributes<HTMLButtonElement>`; accept `children`, `className`, `isLoading`, `loadingText`
    - Base styles: `h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-display font-semibold tracking-wide text-sm overflow-hidden relative border-none group`
    - Shimmer overlay: `absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]`
    - Focus ring: `focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none`
    - Loading state: render `<Loader2 className="animate-spin" />` + `loadingText`; set `disabled` when loading
    - _Requirements: 4.2, 4.4, 18.2, 18.6_
  - [x] 3.2 Write property test for PremiumButton loading state
    - **Property 5: PremiumButton renders correct content for any isLoading state**
    - **Validates: Requirements 18.6**
    - Use `fc.boolean()` and `fc.string({ minLength: 1 })` generators
    - Assert children visible when `isLoading=false`; loading indicator + `loadingText` visible and button `disabled` when `isLoading=true`

- [x] 4. Create `SectionHeading` reusable component
  - [x] 4.1 Implement `SectionHeading.tsx` at `frontend/src/components/landing/SectionHeading.tsx`
    - Accept `label`, `title`, `subtitle?`, `align?` (`"left" | "center"`, default `"left"`), `accentWord?`, `className?`
    - Label: `text-xs font-sans font-medium tracking-wide text-orange-500 uppercase`
    - Title: `font-display font-semibold tracking-tight text-slate-900 dark:text-white` with fluid size via `--font-size-h1`/`--font-size-h2`
    - When `accentWord` is a substring of `title`, wrap it in `<span className="text-orange-500">`
    - Subtitle: `font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed`
    - _Requirements: 18.3, 18.7_
  - [x] 4.2 Write property test for SectionHeading accentWord highlighting
    - **Property 6: SectionHeading highlights accentWord in orange for any title**
    - **Validates: Requirements 18.7**
    - Use `fc.string({ minLength: 1 })` for title; derive `accentWord` as a substring of title
    - Assert orange span present when `accentWord` is substring; assert no orange span injected when `accentWord` is not a substring

- [x] 5. Create `AnimatedContainer` reusable component
  - [x] 5.1 Implement `AnimatedContainer.tsx` at `frontend/src/components/landing/AnimatedContainer.tsx`
    - Accept `children`, `className?`, `delay?` (default `0`), `direction?` (`"up" | "left" | "right"`, default `"up"`)
    - Spring config: `{ type: "spring", stiffness: 100, damping: 18 }`
    - Initial states: `"up"` → `{ opacity: 0, y: 30 }`; `"left"` → `{ opacity: 0, x: -40 }`; `"right"` → `{ opacity: 0, x: 40 }`
    - Animate state: `{ opacity: 1, y: 0, x: 0 }`
    - Use `useReducedMotion()` from Framer Motion; when true, render children in a plain `<div>` without animation
    - Accept an optional `animationsDisabled` prop (for in-page toggle); when true, also skip animation
    - _Requirements: 15.2, 15.4, 18.4, 18.8_
  - [x] 5.2 Write property test for AnimatedContainer direction axis
    - **Property 7: AnimatedContainer configures correct animation axis for any direction**
    - **Validates: Requirements 18.8**
    - Use `fc.constantFrom('up', 'left', 'right')` generator
    - Assert `initial.y` non-zero for `"up"`; `initial.x` negative for `"left"`; `initial.x` positive for `"right"`
    - Assert `animate` state is always `{ opacity: 1, y: 0, x: 0 }`

- [~] 6. Checkpoint — verify new components build cleanly
  - Ensure all four new components (`GlassCard`, `PremiumButton`, `SectionHeading`, `AnimatedContainer`) compile without TypeScript errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Landing.tsx — root element, imports, and global wiring
  - [x] 7.1 Remove unused imports and add React.lazy for MegaMenu
    - Remove `useScroll`, `useTransform`, `useSpring` from Framer Motion imports
    - Remove `EnterpriseCard`, `EnterpriseStatCard` component imports
    - Add `React.lazy` + `Suspense` for MegaMenu: `const MegaMenu = React.lazy(() => import('@/components/layout/MegaMenu').then(m => ({ default: m.MegaMenu })))`
    - Import `GlassCard`, `PremiumButton`, `SectionHeading`, `AnimatedContainer`
    - Import `ThemeToggle` from `frontend/src/components/auth/ThemeToggle.tsx`
    - _Requirements: 15.5, 15.6, 17.2, 17.3, 17.5_
  - [x] 7.2 Update root element and add skip-to-content link
    - Replace `mesh-bg-dark text-white` with `mesh-bg-light dark:mesh-bg-dark text-slate-900 dark:text-white transition-colors duration-500` on the root `<div>`
    - Add skip-to-content `<a href="#main-content">` as the first focusable element with `sr-only focus:not-sr-only` styles and `focus-visible:ring-2 focus-visible:ring-orange-500/50`
    - Wrap all page sections in `<main id="main-content">`
    - Add in-page animation toggle state (`animationsDisabled`) and pass to `AnimatedContainer` instances
    - _Requirements: 1.3, 1.4, 3.1, 3.4, 15.4, 16.1_

- [ ] 8. Landing.tsx — Navbar premium upgrade
  - [x] 8.1 Implement Navbar theme-aware backgrounds, typography, and ThemeToggle
    - Scrolled state: `bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5`
    - Brand wordmark: `font-display font-semibold text-2xl tracking-tight` sentence-case "YVI People" with `text-orange-500` on "EMS"
    - Nav links: `text-xs font-medium tracking-wide`; active link: `text-orange-500`
    - Add `ThemeToggle` in right action area between secondary link and CTA
    - Secondary link label: "Sign in" (replacing "Terminal Access")
    - CTA button: `<PremiumButton>` with label "Get Started"
    - _Requirements: 2.6, 3.3, 4.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ] 8.2 Implement Navbar mobile menu accessibility and animation
    - Mobile menu toggle: `aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}`
    - Mobile menu panel: `initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}` with spring `{ stiffness: 300, damping: 30 }`
    - Wrap MegaMenu in `<Suspense fallback={null}>`
    - All interactive elements: `focus-visible:ring-2 focus-visible:ring-orange-500/50`
    - _Requirements: 6.8, 14.6, 16.4, 16.6, 17.5_
  - [-] 8.3 Write unit tests for Navbar
    - Assert ThemeToggle is rendered in the Navbar
    - Assert CTA button contains orange gradient classes (`from-orange-600 to-orange-500`)
    - Assert mobile menu toggle has correct `aria-label` in open and closed states
    - _Requirements: 6.3, 6.5, 16.6_

- [ ] 9. Landing.tsx — Hero section premium redesign
  - [ ] 9.1 Implement Hero section background, badge, headline, and CTA
    - Replace `mesh-bg-dark` with `mesh-bg-light dark:mesh-bg-dark` on hero root; add orange and blue ambient glow divs
    - Padding: `pt-28 md:pt-36 lg:pt-40 pb-24`
    - Badge: `inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.35] dark:bg-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md` with orange pulse dot
    - Headline: `font-display font-semibold tracking-tight text-[length:var(--font-size-hero)] leading-[1.0] text-slate-900 dark:text-white` sentence-case; accent span `text-orange-500`
    - CTA: `<PremiumButton>` wrapping `<Link to="/login">`
    - Trust badge: `font-sans font-medium text-xs text-slate-500 dark:text-slate-400` — "SOC2 Type II · ISO 27001 · AES-256"
    - _Requirements: 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.8_
  - [-] 9.2 Implement OperationalPreview light-glass surfaces and float animation
    - Dashboard surface: `bg-white/[0.18] dark:bg-slate-900/40 border border-white/25 dark:border-white/10 backdrop-blur-2xl`
    - Width: `w-full max-w-[100%]`
    - Floating KPI cards: replace `glass-panel-teal` / `glass-panel` with `<GlassCard>`
    - Float animation: `animate={{ y: [0, -8, 0] }}` max 8px; second card `y: [0, 8, 0]` with `delay: 1`
    - Image loading placeholder: `bg-slate-100 dark:bg-slate-800 animate-pulse` on image containers
    - _Requirements: 5.2, 5.3, 7.6, 7.7, 14.1, 15.1, 17.4_

- [ ] 10. Landing.tsx — Stats Strip theme support
  - [-] 10.1 Implement Stats Strip theme-aware styles and accessibility
    - Background: `bg-white/40 dark:bg-black/40 border-y border-slate-200/50 dark:border-white/5`
    - Padding: `py-[var(--section-spacing)] px-[var(--page-padding)]`
    - Counter values: `font-display font-semibold text-4xl text-slate-900 dark:text-white tracking-tight`
    - Suffix ("+", "%"): `text-orange-500`
    - Labels: `font-sans font-medium text-xs text-slate-500 dark:text-slate-600 uppercase tracking-wide`
    - Wrap each counter in `<div aria-live="polite" aria-atomic="true">`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 16.7_
  - [~] 10.2 Write unit test for Stats Strip aria-live
    - Assert each counter wrapper element has `aria-live="polite"` attribute
    - _Requirements: 16.7_

- [ ] 11. Landing.tsx — ProductShowcase section refinement
  - [~] 11.1 Implement ProductShowcase layout, typography, and image updates
    - Section padding: `py-[var(--section-spacing)] px-[var(--page-padding)]`
    - Column gap: `gap-12 lg:gap-16`
    - Badge: `bg-orange-500/10 border-orange-500/20 text-orange-500`
    - Heading: `<SectionHeading>` with `accentWord` prop
    - Feature list items: `font-sans font-medium text-sm` sentence-case; accent dot `bg-orange-500`
    - Feature descriptions: `font-sans font-normal text-sm text-slate-500 dark:text-slate-400 leading-relaxed`
    - Remove `grayscale opacity-40` from images; add `group-hover:scale-[1.02] transition-transform duration-700`
    - Images: add `loading="lazy"` and descriptive `alt` text; wrap in `bg-slate-100 dark:bg-slate-800 animate-pulse` placeholder container
    - Floating overlay card: replace `glass-panel` with `<GlassCard>`
    - Explore button: ghost variant with `hover:border-orange-500/30 hover:text-orange-500`
    - Entrance: `<AnimatedContainer direction="left">` or `"right"` with `transition={{ duration: 0.6 }}`
    - _Requirements: 4.5, 4.6, 5.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 14.3, 17.1, 17.4_

- [ ] 12. Landing.tsx — Module Grid refinement
  - [~] 12.1 Implement Module Grid cards with GlassCard and updated typography
    - Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8`
    - Section heading: `<SectionHeading>`
    - Cards: `<GlassCard className="p-8 hover:shadow-medium transition-all group">` + `whileHover={{ y: -6 }}`
    - Default shadow: `--shadow-soft`; hover shadow: `--shadow-medium`
    - Card title: `font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white` sentence-case
    - Card description: `font-sans font-normal text-xs text-slate-500 dark:text-slate-500 leading-relaxed` sentence-case
    - Status label: `text-xs font-sans font-medium text-orange-400/60 group-hover:text-orange-400 transition-colors`
    - Icon container: `w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center mb-6`
    - _Requirements: 4.6, 5.2, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 14.4_

- [ ] 13. Landing.tsx — FAQ Section redesign
  - [~] 13.1 Implement FAQ Section styles, expanded items, and accessibility
    - Background: `bg-white/50 dark:bg-black border-y border-slate-200/50 dark:border-white/5`
    - Section heading: `<SectionHeading align="center">`
    - Question text: `font-display font-semibold text-xl tracking-tight text-slate-800 dark:text-slate-200` sentence-case
    - Answer text: `font-sans font-normal text-sm text-slate-600 dark:text-slate-400 leading-relaxed` sentence-case
    - Chevron: `text-orange-400` when open
    - FAQItem button: `aria-expanded={isOpen ? "true" : "false"}`
    - Expand FAQ items to 5+: add "How does the EMS handle multi-region compliance?", "What is the security standard for data transit?", "How does the payroll automation engine work?", "Can the platform integrate with existing HR systems?", "What support and SLA guarantees are available?"
    - _Requirements: 2.5, 3.7, 4.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  - [~] 13.2 Write property test for FAQItem aria-expanded round-trip
    - **Property 3: FAQItem aria-expanded reflects open/closed state for any item**
    - **Validates: Requirements 11.5, 11.6, 16.2**
    - Use `fc.string({ minLength: 1 })` for question and answer generators
    - Assert `aria-expanded="false"` initially; `"true"` after one click; `"false"` after second click

- [ ] 14. Landing.tsx — CTA Section token compliance
  - [~] 14.1 Implement CTA Section with design tokens and orange accent
    - Container: `rounded-card` via `--radius-card`; padding `p-16 md:p-24`
    - Background: `bg-white/[0.22] dark:bg-gradient-to-br dark:from-slate-900 dark:to-black border border-white/30 dark:border-white/10 backdrop-blur-2xl`
    - Heading: `font-display font-semibold tracking-tight text-[length:var(--font-size-hero)]` sentence-case; accent span `text-orange-500`
    - Primary button: `<PremiumButton>` — "Establish access"
    - Secondary button: ghost — "View documentation"
    - _Requirements: 4.8, 5.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 15. Landing.tsx — Footer enhancement
  - [~] 15.1 Implement Footer styles, expanded links, social row, and legal row
    - Background: `bg-white/30 dark:bg-black border-t border-slate-200/50 dark:border-white/5`
    - Padding: `py-16 px-[var(--page-padding)]`
    - Brand description: `font-sans font-normal text-sm text-slate-500 leading-relaxed` sentence-case
    - Column headings: `font-sans font-semibold text-xs tracking-wide text-slate-400 dark:text-slate-500` sentence-case
    - Link text: `font-sans font-normal text-sm text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors`
    - "EMS" wordmark: `text-orange-400`
    - Expand to 4 links per navigation column
    - Add social links row: LinkedIn, Twitter/X, GitHub icon links with `aria-label`
    - Add legal links row: "Privacy policy", "Terms of service", "Security"
    - All links: `focus-visible:ring-2 focus-visible:ring-orange-500/50`
    - _Requirements: 2.7, 4.8, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 16.4_

- [~] 16. Checkpoint — full teal migration audit and no-overflow verification
  - Ensure all tests pass, ask the user if questions arise.
  - Search the entire `Landing.tsx` file for any remaining `teal-500`, `teal-400`, `teal-300`, `glass-panel`, `glass-panel-teal` references and remove them
  - Verify no element causes horizontal scroll at any viewport width
  - _Requirements: 3.5, 4.9, 5.7, 14.5_

- [ ] 17. Property-based and accessibility tests
  - [~] 17.1 Write property test for no teal color classes
    - **Property 1: No teal color classes remain after migration**
    - **Validates: Requirements 4.1, 4.9**
    - Render the full Landing page; collect all element classNames in the tree
    - Use `fc.constantFrom(...allLandingPageElements)` generator
    - Assert no className contains `teal-500`, `teal-400`, or `teal-300`
  - [~] 17.2 Write property test for image element invariants
    - **Property 4: All image elements have descriptive alt text and lazy loading**
    - **Validates: Requirements 16.3, 17.1**
    - Render the full Landing page; collect all `<img>` elements
    - Use `fc.constantFrom(...allRenderedImages)` generator
    - Assert `loading="lazy"` present; assert `alt` non-empty and not in generic list (`"image"`, `"photo"`, `"picture"`, `"img"`)
  - [~] 17.3 Write property test for focus-visible ring on interactive elements
    - **Property 8: All interactive elements have focus-visible ring classes**
    - **Validates: Requirements 16.4**
    - Collect all buttons, anchors, and interactive elements from the rendered Landing page
    - Assert each element's className includes `focus-visible:ring-2` and `focus-visible:ring-orange-500/50`
  - [~] 17.4 Write unit tests for accessibility invariants
    - Assert skip-to-content link is the first focusable element and links to `#main-content`
    - Assert `<main id="main-content">` exists in the rendered output
    - Assert Stats Strip counter wrappers have `aria-live="polite"`
    - _Requirements: 16.1, 16.7_

- [~] 18. Final checkpoint — full test suite and build verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run TypeScript compilation to confirm zero type errors across all new and modified files
  - Confirm no console errors in both light and dark theme renders

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints (tasks 6, 16, 18) ensure incremental validation at key milestones
- Property tests validate universal correctness invariants; unit tests validate specific examples and edge cases
- The design uses TypeScript/React 18 with Framer Motion 12, Tailwind CSS 3, and Vitest + fast-check for testing
- All routing, navigation, business logic, Counter, MegaMenu, and FAQItem logic are preserved unchanged — this is a purely visual and architectural refactor
- The `ThemeProvider` (next-themes) is already wired in `App.tsx`; no new theme infrastructure is needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1", "4.1", "5.1"] },
    { "id": 1, "tasks": ["2.2", "3.2", "4.2", "5.2", "7.1"] },
    { "id": 2, "tasks": ["7.2"] },
    { "id": 3, "tasks": ["8.1", "9.1"] },
    { "id": 4, "tasks": ["8.2", "8.3", "9.2", "10.1"] },
    { "id": 5, "tasks": ["10.2", "11.1", "12.1"] },
    { "id": 6, "tasks": ["13.1", "14.1"] },
    { "id": 7, "tasks": ["13.2", "15.1"] },
    { "id": 8, "tasks": ["17.1", "17.2", "17.3", "17.4"] }
  ]
}
```
