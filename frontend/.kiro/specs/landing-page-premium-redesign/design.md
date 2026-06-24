# Design Document: Landing Page Premium Redesign

## Overview

This document describes the technical design for evolving `frontend/src/pages/Landing.tsx` from a dark-only, teal-accented, all-caps page into the same premium visual ecosystem established by the Login Page. The redesign is a **safe visual and architectural refactor** — all routing, navigation, business logic, and functional components (MegaMenu, Counter, FAQ accordion) are preserved unchanged.

### Design Goals

- Align with the Login Page's light-first design language: `bg-[#eef0f4]`, orange accent, sentence-case typography, soft glassmorphism, spring-physics animations
- Extract four reusable components (`GlassCard`, `PremiumButton`, `SectionHeading`, `AnimatedContainer`) that future pages can consume
- Migrate all teal accent references to orange, and all legacy `glass-panel` / `glass-panel-teal` classes to the new GlassCard standard
- Add full dark mode support via the existing `ThemeProvider` (next-themes) and `ThemeToggle` component
- Harden accessibility to WCAG AA and add performance optimizations (lazy loading, React.lazy for MegaMenu)

### Reference Implementation

The Login Page (`frontend/src/pages/Login.tsx`) and its auth components serve as the canonical design reference:

- **Background**: `bg-[#eef0f4]` light / `bg-slate-950` dark
- **Glass card**: `bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 backdrop-blur-3xl rounded-[2rem]` (from `LoginGlassCard`)
- **Primary button**: `bg-gradient-to-r from-orange-600 to-orange-500` with shimmer (from `LoginButton`)
- **Theme toggle**: `ThemeToggle` component from `frontend/src/components/auth/ThemeToggle.tsx`
- **Typography**: `font-display font-semibold tracking-tight` sentence-case headings, `font-sans font-normal` body

### Technology Stack

- **React 18** with TypeScript
- **Framer Motion 12** for animations
- **Tailwind CSS 3** with custom design tokens from `design-tokens.css`
- **next-themes 0.3** for theme management (already wired in `App.tsx` via `ThemeProvider`)
- **lucide-react** for icons

---

## Architecture

### Component Hierarchy

```
Landing.tsx (page)
├── <a href="#main-content"> (skip-to-content, first focusable)
├── Navbar (internal component)
│   ├── ThemeToggle (from auth/ThemeToggle.tsx)
│   └── React.lazy(MegaMenu) (deferred load)
├── <main id="main-content">
│   ├── HeroSection (internal)
│   │   ├── AnimatedContainer
│   │   ├── PremiumButton
│   │   └── OperationalPreview (internal)
│   │       └── GlassCard (floating KPI cards)
│   ├── StatsStrip (internal)
│   │   └── Counter (existing, preserved)
│   ├── ProductShowcase × 3 (internal)
│   │   ├── AnimatedContainer
│   │   ├── SectionHeading
│   │   └── GlassCard (overlay card)
│   ├── ModuleGrid (internal)
│   │   ├── SectionHeading
│   │   └── GlassCard × 8 (module cards)
│   ├── FAQSection (internal)
│   │   ├── SectionHeading
│   │   └── FAQItem × 5+ (existing, enhanced)
│   └── CTASection (internal)
│       └── PremiumButton
└── Footer (internal)
```

### File Structure

New files to create:

```
frontend/src/components/ui/
  GlassCard.tsx              ← new reusable glass surface
  PremiumButton.tsx          ← new reusable orange CTA button

frontend/src/components/landing/
  SectionHeading.tsx         ← new reusable section title + label
  AnimatedContainer.tsx      ← new Framer Motion spring wrapper
```

Modified files:

```
frontend/src/styles/design-tokens.css   ← add --accent-orange, --bg-mesh-light
frontend/src/pages/Landing.tsx          ← full redesign
```

### Theme Architecture

The app already uses `next-themes` with `ThemeProvider defaultTheme="light" attribute="class"` in `App.tsx`. The `ThemeToggle` component from `auth/ThemeToggle.tsx` uses `useTheme()` from `next-themes` and toggles the `dark` class on the `<html>` element. No new theme infrastructure is needed — the Landing Page simply needs to:

1. Use `dark:` Tailwind variants on all surfaces
2. Include `ThemeToggle` in the Navbar
3. Replace `mesh-bg-dark` (hardcoded dark) with a light-first background class

---

## Components and Interfaces

### GlassCard

**Path**: `frontend/src/components/ui/GlassCard.tsx`

The light glassmorphism card surface, matching `LoginGlassCard`'s base style. Used for all card surfaces on the Landing Page.

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';  // default: 'auto'
}
```

**Variant behavior**:
- `'auto'` (default): `bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 backdrop-blur-3xl rounded-[2rem]`
- `'light'`: forces light glass regardless of theme — `bg-white/[0.22] border border-white/30 backdrop-blur-3xl rounded-[2rem]`
- `'dark'`: forces dark glass — `bg-slate-950/[0.22] border border-white/10 backdrop-blur-3xl rounded-[2rem]`

**Shadow**: `shadow-[0_24px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]`

---

### PremiumButton

**Path**: `frontend/src/components/ui/PremiumButton.tsx`

The orange gradient CTA button, extracted from `LoginButton`. Implements shimmer sweep, spring tap animation, loading state with animated text cycling.

```typescript
interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}
```

**Base styles**: `h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-display font-semibold tracking-wide text-sm shadow-[0_8px_20px_rgba(249,115,22,0.12)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.22)] hover:-translate-y-[0.5px] transition-all duration-300 overflow-hidden relative border-none group`

**Shimmer**: `absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]`

**Focus ring**: `focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none`

**Loading state**: Shows `<Loader2 className="animate-spin" />` + `loadingText` prop

---

### SectionHeading

**Path**: `frontend/src/components/landing/SectionHeading.tsx`

Consistent section title + label rendering with optional orange-highlighted accent word.

```typescript
interface SectionHeadingProps {
  label: string;                          // small badge label above title
  title: string;                          // main heading text
  subtitle?: string;                      // optional body copy below title
  align?: 'left' | 'center';             // default: 'left'
  accentWord?: string;                    // word in title to highlight orange
  className?: string;
}
```

**Label styles**: `text-xs font-sans font-medium tracking-wide text-orange-500 uppercase`

**Title styles**: `font-display font-semibold tracking-tight text-slate-900 dark:text-white` with fluid size via `--font-size-h1` or `--font-size-h2`

**Accent word**: wrapped in `<span className="text-orange-500">` when matched in title

**Subtitle styles**: `font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed`

---

### AnimatedContainer

**Path**: `frontend/src/components/landing/AnimatedContainer.tsx`

Framer Motion wrapper with spring-physics entrance animation and `prefers-reduced-motion` support.

```typescript
interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;                         // default: 0
  direction?: 'up' | 'left' | 'right';  // default: 'up'
}
```

**Spring config**: `{ type: "spring", stiffness: 100, damping: 18 }`

**Initial states by direction**:
- `'up'`: `{ opacity: 0, y: 30 }`
- `'left'`: `{ opacity: 0, x: -40 }`
- `'right'`: `{ opacity: 0, x: 40 }`

**Animate state**: `{ opacity: 1, y: 0, x: 0 }`

**Reduced motion**: Uses `useReducedMotion()` from Framer Motion. When true, renders children directly without animation wrapper (or with `initial={false}` and instant transition).

---

### Navbar (internal to Landing.tsx)

The Navbar is kept as an internal component inside `Landing.tsx` to preserve the existing `activeCategory` / `MegaMenu` interaction pattern.

**Key changes from current**:
- Scrolled state: `bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5`
- Brand wordmark: `font-display font-semibold text-2xl tracking-tight` sentence-case "YVI People" with `text-orange-500` on "EMS"
- Nav links: `text-xs font-medium tracking-wide` (replacing `text-[9px] font-black uppercase tracking-[0.25em]`)
- Active nav link: `text-orange-500` (replacing `text-teal-400`)
- CTA button: `PremiumButton` with orange gradient, label "Get Started"
- Secondary link: "Sign in" (replacing "Terminal Access")
- ThemeToggle: positioned in right action area between secondary link and CTA
- Mobile menu toggle: `aria-label="Open navigation menu"` / `aria-label="Close navigation menu"`
- Mobile menu panel: `initial={{ height: 0 }} animate={{ height: 'auto' }}` spring slide-down
- MegaMenu: loaded via `React.lazy` + `Suspense`

### FAQItem (internal to Landing.tsx)

**Key changes**:
- Question: `font-display font-semibold text-xl tracking-tight text-slate-800 dark:text-slate-200` sentence-case
- Answer: `font-sans font-normal text-sm text-slate-600 dark:text-slate-400 leading-relaxed` sentence-case
- Chevron: `text-orange-400` when open (replacing `text-teal-400`)
- `aria-expanded` attribute: set to `"true"` when open, `"false"` when closed
- Section background: `bg-white/50 dark:bg-black border-y border-slate-200/50 dark:border-white/5`
- FAQ items: expanded from 2 to 5+ items

### OperationalPreview (internal to Landing.tsx)

**Key changes**:
- Dashboard surface: `bg-white/[0.18] dark:bg-slate-900/40 border border-white/25 dark:border-white/10 backdrop-blur-2xl` (replacing `bg-slate-900/40`)
- Width: `w-full max-w-[100%]` (replacing `w-[110%]`)
- Floating KPI cards: use `GlassCard` (replacing `glass-panel-teal` and `glass-panel`)
- Float animation: `animate={{ y: [0, -8, 0] }}` max 8px (replacing 20px)
- Typography inside: sentence-case, `font-sans font-medium` labels
- Teal accent dot in sidebar: replaced with orange
- Title bar text: sentence-case

---

## Data Models

This feature has no new data models. All data is static (hardcoded arrays for modules, FAQ items, stats, showcase sections). The existing `Counter` component and `MegaMenu` data structures are preserved unchanged.

### Design Token Additions

Two new CSS custom properties added to `design-tokens.css`:

```css
:root {
  /* Orange accent — replaces teal glow variables for Landing Page */
  --accent-orange: #ea580c;

  /* Light-theme mesh background for Landing Page */
  --bg-mesh-light: radial-gradient(at 20% 20%, rgba(234, 88, 12, 0.06) 0px, transparent 50%),
                   radial-gradient(at 80% 10%, rgba(59, 130, 246, 0.05) 0px, transparent 50%);
}
```

The existing `--radius-card: 2.5rem`, `--shadow-premium`, `--shadow-hover`, `--shadow-soft`, `--shadow-medium`, `--section-spacing`, `--page-padding`, `--font-size-hero`, `--font-size-h1`, `--font-size-h2` tokens are already defined and will be consumed by the Landing Page.

### Tailwind Utility Classes Added to `index.css`

A new utility for the light mesh background:

```css
@layer utilities {
  .mesh-bg-light {
    @apply relative overflow-hidden bg-[#eef0f4];
  }

  .mesh-bg-light::before {
    content: '';
    @apply absolute inset-0 opacity-60 pointer-events-none;
    background-image: var(--bg-mesh-light);
    filter: blur(80px);
  }
}
```

A shimmer keyframe (already referenced by `LoginButton`, added if not present):

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
```

---

## Section-by-Section Implementation

### Hero Section

**Background**: Replace `mesh-bg-dark` with `mesh-bg-light dark:mesh-bg-dark` on the root `<div>`. The hero `<header>` uses `bg-transparent` — the page root provides the background.

**Ambient glows**: Two `pointer-events-none` radial gradient divs:
- Orange glow: `bg-[radial-gradient(circle_at_20%_-20%,rgba(234,88,12,0.08),transparent_60%)]`
- Blue glow: `bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_60%)]`

**Padding**: `pt-28 md:pt-36 lg:pt-40 pb-24` (replacing `pt-60 pb-32`)

**Badge**: `inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.35] dark:bg-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md` with `<div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />`

**Headline**: `font-display font-semibold tracking-tight text-[length:var(--font-size-hero)] leading-[1.0] text-slate-900 dark:text-white` sentence-case

**Accent span**: `text-orange-500` (replacing `text-gradient-teal`)

**CTA button**: `<PremiumButton>` wrapping `<Link to="/login">`

**Trust badge**: `font-sans font-medium text-xs text-slate-500 dark:text-slate-400` — "SOC2 Type II · ISO 27001 · AES-256"

**Gap**: `gap-16 lg:gap-20` (replacing `gap-24`)

### Stats Strip

```
bg-white/40 dark:bg-black/40 border-y border-slate-200/50 dark:border-white/5
py-[var(--section-spacing)] px-[var(--page-padding)]
```

Counter values: `font-display font-semibold text-4xl text-slate-900 dark:text-white tracking-tight`

Suffix ("+", "%"): `text-orange-500`

Labels: `font-sans font-medium text-xs text-slate-500 dark:text-slate-600 uppercase tracking-wide`

`aria-live="polite"` on each counter wrapper div.

### ProductShowcase

**Section padding**: `py-[var(--section-spacing)] px-[var(--page-padding)]`

**Column gap**: `gap-12 lg:gap-16` (replacing `gap-32`)

**Badge**: `bg-orange-500/10 border-orange-500/20 text-orange-500` (replacing teal)

**Heading**: `SectionHeading` component with `accentWord` prop

**Feature list items**: `font-sans font-medium text-sm` sentence-case; accent dot `bg-orange-500`

**Feature descriptions**: `font-sans font-normal text-sm text-slate-500 dark:text-slate-400 leading-relaxed`

**Image**: Remove `grayscale opacity-40`; add `group-hover:scale-[1.02] transition-transform duration-700`

**Floating overlay card**: `GlassCard` (replacing `glass-panel`)

**Explore button**: `variant="ghost"` with `hover:border-orange-500/30 hover:text-orange-500`

**Entrance animation**: `AnimatedContainer direction="left"` or `"right"` with `transition={{ duration: 0.6 }}`

### Module Grid

**Section background**: `bg-slate-50/50 dark:bg-slate-950/50`

**Section heading**: `SectionHeading` component

**Grid**: `grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8`

**Card**: `GlassCard` with `className="p-8 hover:shadow-medium transition-all group"` + `whileHover={{ y: -6 }}`

**Card title**: `font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white` sentence-case

**Card description**: `font-sans font-normal text-xs text-slate-500 dark:text-slate-500 leading-relaxed` sentence-case

**Status label**: `text-xs font-sans font-medium text-orange-400/60 group-hover:text-orange-400 transition-colors`

**Icon container**: `w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center mb-6`

### FAQ Section

**Background**: `bg-white/50 dark:bg-black border-y border-slate-200/50 dark:border-white/5`

**Section heading**: `SectionHeading align="center"`

**FAQ items**: 5 items minimum (expanded from 2):
1. How does the EMS handle multi-region compliance?
2. What is the security standard for data transit?
3. How does the payroll automation engine work?
4. Can the platform integrate with existing HR systems?
5. What support and SLA guarantees are available?

**FAQItem button**: `aria-expanded={isOpen ? "true" : "false"}` — critical for accessibility

**Chevron**: `text-orange-400` when open

### CTA Section

**Container**: `rounded-card` (via `--radius-card`), `p-16 md:p-24`

**Background**: `bg-white/[0.22] dark:bg-gradient-to-br dark:from-slate-900 dark:to-black border border-white/30 dark:border-white/10 backdrop-blur-2xl`

**Heading**: `font-display font-semibold tracking-tight text-[length:var(--font-size-hero)]` sentence-case

**Accent span**: `text-orange-500`

**Primary button**: `PremiumButton` — "Establish access"

**Secondary button**: ghost — "View documentation"

### Footer

**Background**: `bg-white/30 dark:bg-black border-t border-slate-200/50 dark:border-white/5`

**Padding**: `py-16 px-[var(--page-padding)]`

**Brand description**: `font-sans font-normal text-sm text-slate-500 leading-relaxed` sentence-case

**Column headings**: `font-sans font-semibold text-xs tracking-wide text-slate-400 dark:text-slate-500` sentence-case

**Link text**: `font-sans font-normal text-sm text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors`

**"EMS" wordmark**: `text-orange-400`

**Navigation columns**: 4 links per column (expanded from 3)

**Social links row**: LinkedIn, Twitter/X, GitHub icon links with `aria-label`

**Legal links row**: "Privacy policy", "Terms of service", "Security"

---

## Animation Specifications

### Spring Physics Standard

All entrance animations use:
```typescript
transition={{ type: "spring", stiffness: 100, damping: 18 }}
```

Section reveal animations cap at `duration: 0.6` for non-spring transitions.

### Floating Cards

```typescript
animate={{ y: [0, -8, 0] }}
transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
```

Maximum y-axis travel: **8px** (down from 20px). Second card uses `delay: 1` and `y: [0, 8, 0]` for visual variety.

### Mobile Menu Slide-Down

```typescript
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

### Reduced Motion

`AnimatedContainer` uses `useReducedMotion()` from Framer Motion:

```typescript
const shouldReduceMotion = useReducedMotion();

if (shouldReduceMotion) {
  return <div className={className}>{children}</div>;
}
```

Additionally, the Landing Page root provides an in-page animation toggle (a small button in the footer or fixed corner) that sets a local `animationsDisabled` state, passed via context or prop drilling to `AnimatedContainer`. When `animationsDisabled` is true, `AnimatedContainer` renders without animation regardless of system preference.

### Removed Framer Motion Imports

The following unused imports are removed from `Landing.tsx`:
- `useScroll`
- `useTransform`
- `useSpring`

### Removed Component Imports

- `EnterpriseCard` (from `@/components/payroll/EnterpriseComponents`)
- `EnterpriseStatCard` (from `@/components/payroll/EnterpriseComponents`)

---

## Accessibility Implementation

### Skip-to-Content Link

The first element in `Landing.tsx` render output:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-orange-500"
>
  Skip to main content
</a>
```

The `<main>` element receives `id="main-content"`.

### Focus-Visible Rings

All interactive elements (buttons, links, accordion triggers) include:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50
```

The global `:focus-visible` rule in `index.css` already applies `var(--focus-ring)`, but the orange-specific ring is added explicitly on Landing Page interactive elements.

### aria-expanded on FAQItem

```tsx
<button
  onClick={() => setIsOpen(!isOpen)}
  aria-expanded={isOpen}
  className="w-full flex items-center justify-between text-left group"
>
```

### aria-label on Mobile Menu Toggle

```tsx
<Button
  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
```

### Image Alt Text

All `<img>` elements use descriptive alt text:
- Logo: `alt="YVI People logo"`
- ProductShowcase images: descriptive alt conveying the content (e.g., `alt="Payroll analytics dashboard showing disbursement flows"`)
- OperationalPreview: decorative, `alt=""` with `role="presentation"`

### aria-live on Stats Strip

```tsx
<div aria-live="polite" aria-atomic="true">
  <Counter value={item.value} />
  <span>{item.suffix}</span>
</div>
```

### WCAG AA Contrast

Color combinations used and their approximate contrast ratios:
- `text-slate-900` on `bg-[#eef0f4]`: ~14:1 ✓
- `text-slate-500` on `bg-[#eef0f4]`: ~4.6:1 ✓ (just above 4.5:1 threshold)
- `text-orange-500` on `bg-[#eef0f4]`: ~3.1:1 for large text ✓ (meets 3:1 for large text)
- `text-white` on `bg-gradient-to-r from-orange-600 to-orange-500`: ~4.5:1 ✓
- `text-slate-400` on `bg-slate-950`: ~5.9:1 ✓

Note: Full WCAG AA validation requires manual testing with assistive technologies and expert accessibility review. The color choices above are selected to meet the mathematical contrast thresholds.

---

## Migration Strategy

The refactor is structured as a safe, incremental migration that preserves all routing and business logic.

### Phase 1: Token and CSS Foundation

1. Add `--accent-orange` and `--bg-mesh-light` to `design-tokens.css`
2. Add `mesh-bg-light` utility and `shimmer` keyframe to `index.css`
3. Verify existing tokens (`--radius-card`, `--shadow-*`, `--section-spacing`, `--page-padding`, `--font-size-*`) are present (they are)

### Phase 2: Reusable Component Creation

Create the four new components in order:
1. `GlassCard.tsx` — no dependencies
2. `PremiumButton.tsx` — depends on `framer-motion`, `lucide-react`
3. `SectionHeading.tsx` — no dependencies
4. `AnimatedContainer.tsx` — depends on `framer-motion`

Each component is independently testable before Landing.tsx integration.

### Phase 3: Landing.tsx Refactor

Apply changes section by section, top to bottom:

1. **Root element**: Replace `mesh-bg-dark text-white` with `mesh-bg-light dark:mesh-bg-dark text-slate-900 dark:text-white transition-colors duration-500`; add skip-to-content link; add `<main id="main-content">`
2. **Remove unused imports**: `useScroll`, `useTransform`, `useSpring`, `EnterpriseCard`, `EnterpriseStatCard`
3. **Add React.lazy for MegaMenu**: `const MegaMenu = React.lazy(() => import('@/components/layout/MegaMenu').then(m => ({ default: m.MegaMenu })))`
4. **Navbar**: Apply theme-aware backgrounds, replace teal with orange, add ThemeToggle, update typography, update CTA to PremiumButton
5. **OperationalPreview**: Replace glass classes, update float animation to 8px, update typography
6. **Hero Section**: Update background, padding, badge, headline, CTA, trust badge
7. **Stats Strip**: Apply theme-aware background, update typography, add aria-live
8. **ProductShowcase**: Update padding, gap, badge, heading, features, image, overlay card, button
9. **Module Grid**: Update cards to GlassCard, update typography, add md:grid-cols-2
10. **FAQ Section**: Update background, typography, expand to 5+ items, add aria-expanded
11. **CTA Section**: Update container, heading, buttons
12. **Footer**: Update background, padding, typography, add social/legal links

### Preservation Guarantees

- `Counter` component: unchanged
- `FAQItem` logic: unchanged (only styling and aria attributes added)
- `MegaMenu` data and behavior: unchanged (only lazy-loaded)
- `OperationalPreview` structure: unchanged (only styling updated)
- All `Link to="/login"` and routing: unchanged
- `useAuth`, `useNavigate`, and all business logic: not touched

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is primarily a UI/UX redesign. Most acceptance criteria are specific rendering checks (EXAMPLE or SMOKE). However, several universal properties emerge from the requirements — particularly around component APIs, accessibility invariants, and the no-teal migration guarantee. These are suitable for property-based testing because input variation (different children, props, states) meaningfully exercises the logic.

**Property Reflection Summary**: The prework identified 12 candidate properties. After reflection:
- Requirements 4.1 and 4.9 (no teal) are identical — consolidated into Property 1
- Requirements 5.1 and 18.5 (GlassCard classes) overlap — consolidated into Property 2
- Requirements 11.5, 11.6, and 16.2 (aria-expanded) are identical — consolidated into Property 3
- Requirements 16.3 and 17.1 (image attributes) test different attributes on the same elements — consolidated into Property 4
- Requirements 18.6, 18.7, 18.8 (component APIs) are independent — kept as Properties 5, 6, 7
- Requirements 16.4 (focus-visible) and 16.5 (WCAG contrast) are independent accessibility universals — kept as Properties 8 and 9

Final count: 9 properties.

---

### Property 1: No teal color classes remain after migration

*For any* element rendered anywhere in the Landing Page component tree, that element's className string should not contain `teal-500`, `teal-400`, or `teal-300`.

**Validates: Requirements 4.1, 4.9**

---

### Property 2: GlassCard always renders with correct glass classes for any variant

*For any* valid variant value (`"light"`, `"dark"`, `"auto"`) and any children content passed to `GlassCard`, the rendered wrapper element should contain `backdrop-blur-3xl` and `rounded-[2rem]`, and the background opacity class should correspond to the variant: `bg-white/[0.22]` for `"light"`, `bg-slate-950/[0.22]` for `"dark"`, and both `bg-white/[0.22] dark:bg-slate-950/[0.22]` for `"auto"`.

**Validates: Requirements 5.1, 18.5**

---

### Property 3: FAQItem aria-expanded reflects open/closed state for any item

*For any* FAQ item with any question and answer text, the trigger button's `aria-expanded` attribute should equal `"true"` when the item is open and `"false"` when the item is closed. Toggling the item twice (open then close) should return `aria-expanded` to `"false"`.

**Validates: Requirements 11.5, 11.6, 16.2**

---

### Property 4: All image elements have descriptive alt text and lazy loading

*For any* `<img>` element rendered in the Landing Page, the element should have a non-empty `alt` attribute that is not equal to generic values (e.g., `"image"`, `"photo"`, `"picture"`), and the element should have `loading="lazy"` attribute set.

**Validates: Requirements 16.3, 17.1**

---

### Property 5: PremiumButton renders correct content for any isLoading state

*For any* `isLoading` boolean value and any `children` content passed to `PremiumButton`, when `isLoading` is `true` the button should render a loading indicator and `loadingText`, and when `isLoading` is `false` the button should render the `children` content. The button should be `disabled` when `isLoading` is `true`.

**Validates: Requirements 18.6**

---

### Property 6: SectionHeading highlights accentWord in orange for any title

*For any* `title` string and any `accentWord` string that is a substring of `title`, the rendered output of `SectionHeading` should contain the `accentWord` wrapped in an element with `text-orange-500` class. When `accentWord` is not a substring of `title`, no orange-highlighted span should be injected.

**Validates: Requirements 18.7**

---

### Property 7: AnimatedContainer configures correct animation axis for any direction

*For any* `direction` value (`"up"`, `"left"`, `"right"`), the `AnimatedContainer` should configure the Framer Motion `initial` state with a non-zero offset on the correct axis: `y` for `"up"`, `x` (negative) for `"left"`, `x` (positive) for `"right"`. The `animate` state should always be `{ opacity: 1, y: 0, x: 0 }` regardless of direction.

**Validates: Requirements 18.8**

---

### Property 8: All interactive elements have focus-visible ring classes

*For any* button, anchor, or interactive element rendered in the Landing Page, the element's className should include `focus-visible:ring-2` and `focus-visible:ring-orange-500/50`.

**Validates: Requirements 16.4**

---

### Property 9: WCAG AA contrast for text-on-background combinations

*For any* text element rendered in the Landing Page with a defined foreground color and a deterministic background color, the computed contrast ratio should be at least 4.5:1 for normal text (below 18pt / 14pt bold) and at least 3:1 for large text (18pt+ / 14pt+ bold).

**Validates: Requirements 16.5**

---

## Error Handling

### React.lazy / Suspense for MegaMenu

The MegaMenu is loaded lazily. A `Suspense` boundary wraps it with a minimal fallback:

```tsx
const MegaMenu = React.lazy(() =>
  import('@/components/layout/MegaMenu').then(m => ({ default: m.MegaMenu }))
);

// In Navbar render:
<Suspense fallback={null}>
  <MegaMenu isOpen={!!activeCategory} onClose={() => setActiveCategory(null)} activeCategory={activeCategory} />
</Suspense>
```

The `fallback={null}` is appropriate here because the MegaMenu only renders when `isOpen` is true (triggered by user hover), so there is no visible flash during the initial load.

### OperationalPreview Fallback

Per Requirement 7.6, if neither light-glass nor dark-glass surface is available (e.g., a CSS loading failure), the OperationalPreview renders a fallback placeholder:

```tsx
{surfaceReady ? (
  <DashboardSurface />
) : (
  <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]" role="img" aria-label="Dashboard preview loading" />
)}
```

In practice, since the surface styles are pure CSS classes, `surfaceReady` is always `true` in a functioning browser. This guard is a defensive pattern.

### Image Loading Placeholders

All image containers use a CSS-based placeholder that shows before and during load:

```tsx
<div className="relative bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[3.5rem] overflow-hidden">
  <img
    src={img}
    alt={altText}
    loading="lazy"
    className="w-full h-[500px] object-cover transition-opacity duration-500"
    onLoad={(e) => e.currentTarget.parentElement?.classList.remove('animate-pulse')}
  />
</div>
```

### Theme Toggle Error Boundary

The `ThemeToggle` uses `next-themes` `useTheme()`. If `next-themes` is not available (SSR or provider missing), the hook returns `undefined` for `theme`. The toggle button handles this gracefully:

```tsx
const { theme, setTheme } = useTheme();
const isDark = theme === 'dark';
// Clicking always calls setTheme — safe even if theme is undefined
```

---

## Testing Strategy

### Overview

This feature is a UI/UX redesign. The testing approach uses:
- **Unit tests** for the four new reusable components (GlassCard, PremiumButton, SectionHeading, AnimatedContainer)
- **Property-based tests** for universal invariants (no-teal guarantee, component API correctness, accessibility universals)
- **Snapshot tests** for section-level rendering verification
- **Integration tests** for theme switching behavior

### Property-Based Testing Library

**Library**: [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for TypeScript/JavaScript

**Test runner**: Vitest (already used in the project ecosystem via Vite)

**Minimum iterations**: 100 per property test

**Tag format**: `// Feature: landing-page-premium-redesign, Property {N}: {property_text}`

### Property Tests

Each property from the Correctness Properties section maps to one property-based test:

**Property 1 — No teal color classes**
```typescript
// Feature: landing-page-premium-redesign, Property 1: No teal color classes remain after migration
fc.assert(fc.property(
  fc.constantFrom(...allLandingPageElements),
  (element) => {
    const classNames = element.className || '';
    return !classNames.includes('teal-500') &&
           !classNames.includes('teal-400') &&
           !classNames.includes('teal-300');
  }
), { numRuns: 100 });
```

**Property 2 — GlassCard variant classes**
```typescript
// Feature: landing-page-premium-redesign, Property 2: GlassCard renders correct glass classes for any variant
fc.assert(fc.property(
  fc.constantFrom('light', 'dark', 'auto'),
  fc.string({ minLength: 1 }),  // arbitrary children text
  (variant, childText) => {
    const { container } = render(<GlassCard variant={variant}><span>{childText}</span></GlassCard>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('backdrop-blur-3xl');
    expect(wrapper.className).toContain('rounded-[2rem]');
    // variant-specific assertions...
    return true;
  }
), { numRuns: 100 });
```

**Property 3 — FAQItem aria-expanded round-trip**
```typescript
// Feature: landing-page-premium-redesign, Property 3: FAQItem aria-expanded reflects open/closed state
fc.assert(fc.property(
  fc.string({ minLength: 1 }),  // question
  fc.string({ minLength: 1 }),  // answer
  (question, answer) => {
    const { getByRole } = render(<FAQItem question={question} answer={answer} />);
    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    return true;
  }
), { numRuns: 100 });
```

**Property 4 — Image element invariants**
```typescript
// Feature: landing-page-premium-redesign, Property 4: All image elements have descriptive alt text and lazy loading
fc.assert(fc.property(
  fc.constantFrom(...allRenderedImages),
  (img) => {
    expect(img).toHaveAttribute('loading', 'lazy');
    const alt = img.getAttribute('alt') ?? '';
    expect(alt.length).toBeGreaterThan(0);
    expect(['image', 'photo', 'picture', 'img']).not.toContain(alt.toLowerCase());
    return true;
  }
), { numRuns: 100 });
```

**Properties 5, 6, 7** — Component API tests for PremiumButton, SectionHeading, AnimatedContainer follow the same pattern with `fc.boolean()`, `fc.string()`, and `fc.constantFrom('up', 'left', 'right')` generators respectively.

**Properties 8, 9** — Accessibility universals use rendered element collections as the input space.

### Unit Tests

Focused example-based tests for specific behaviors:

- `GlassCard` renders children correctly
- `PremiumButton` shows loading spinner when `isLoading={true}`
- `SectionHeading` renders label, title, subtitle in correct DOM order
- `AnimatedContainer` renders children without animation when `useReducedMotion()` returns true
- `Navbar` includes `ThemeToggle` component
- `Navbar` CTA button has orange gradient classes
- `FAQItem` expands/collapses on click
- Stats Strip counter has `aria-live="polite"`
- Skip-to-content link is the first focusable element
- Mobile menu toggle has correct `aria-label` in open and closed states

### Snapshot Tests

Snapshot tests for each major section to catch unintended regressions:

- `HeroSection` light mode snapshot
- `HeroSection` dark mode snapshot
- `StatsStrip` snapshot
- `ProductShowcase` snapshot (one instance)
- `ModuleGrid` snapshot
- `FAQSection` snapshot
- `CTASection` snapshot
- `Footer` snapshot

### Integration Tests

- Theme toggle switches root element class between `light` and `dark`
- MegaMenu loads lazily (Suspense boundary resolves)
- Full Landing page renders without console errors in both themes

### Dual Testing Balance

Unit tests cover specific examples and edge cases. Property tests verify universal invariants. Snapshot tests catch visual regressions. Together they provide comprehensive coverage without redundancy — property tests handle the "for all inputs" cases so unit tests can focus on concrete examples.
