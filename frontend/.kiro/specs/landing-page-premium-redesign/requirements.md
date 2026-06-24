# Requirements Document

## Introduction

This document defines the requirements for a complete UI/UX redesign of the EMS Landing Page (`frontend/src/pages/Landing.tsx`). The goal is to evolve the current dark-only, teal-accented, all-caps heavy landing page into the same premium visual ecosystem established by the upgraded Login Page — a light-first design with dark mode support, orange accent system, sentence-case typography, soft glassmorphism, spring-physics animations, and a reusable component architecture. The refactor must be safe: all routing, navigation, business logic, and functional components (MegaMenu, Counter, FAQ accordion) are preserved. Changes are purely visual and architectural.

## Glossary

- **Landing_Page**: The public-facing marketing page at route `/`, implemented in `frontend/src/pages/Landing.tsx`.
- **Login_Page**: The authentication page at route `/login`, used as the premium design reference.
- **Design_System**: The shared token set defined in `design-tokens.css` and `index.css`, including radius, shadow, glass, motion, spacing, and typography tokens.
- **Orange_Accent**: The primary brand accent color `from-orange-600 to-orange-500` used on the Login Page, replacing teal on the Landing Page.
- **Teal_Accent**: The legacy accent color (`teal-500` / `teal-400`) currently used throughout the Landing Page.
- **Glass_Panel**: A glassmorphism surface using `bg-white/[0.22]`, `border border-white/30`, `backdrop-blur-3xl`, `rounded-[2rem]` — the light-glass standard from the Login Page.
- **Dark_Glass_Panel**: The legacy dark glassmorphism surface using `glass-panel` / `glass-panel-teal` CSS classes with slate-900 backgrounds.
- **Navbar**: The fixed top navigation bar component inside `Landing.tsx`.
- **Hero_Section**: The full-screen opening section of the Landing Page containing the headline, CTA, and `OperationalPreview`.
- **OperationalPreview**: The dashboard mockup component rendered in the Hero section's right column.
- **Stats_Strip**: The "Live Operational Pulse" data strip section with animated counters.
- **ProductShowcase**: The alternating feature showcase sections with full-bleed images.
- **Module_Grid**: The "Enterprise Module Ecosystem" section containing 8 feature cards.
- **FAQ_Section**: The accordion-based frequently asked questions section.
- **CTA_Section**: The final call-to-action section before the footer.
- **Footer**: The bottom navigation and branding section.
- **GlassCard**: A new reusable component implementing the light glassmorphism card pattern.
- **PremiumButton**: A new reusable component implementing the orange gradient button pattern.
- **SectionHeading**: A new reusable component for consistent section title and label rendering.
- **AnimatedContainer**: A new reusable Framer Motion wrapper with spring-physics entrance animation.
- **FeatureCard**: A new reusable card component for the Module_Grid items.
- **ThemeToggle**: The Vercel-style dark/light mode toggle component from the Login Page.
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA compliance standard.
- **Reduced_Motion**: The `prefers-reduced-motion` CSS media query for users who prefer minimal animation.
- **Design_Token**: A CSS custom property defined in `design-tokens.css` (e.g., `--radius-card`, `--shadow-premium`).

## Requirements

### Requirement 1: Global Design Token Alignment

**User Story:** As a product designer, I want the Landing Page to consume the same Design_System tokens as the Login Page, so that both pages share a unified visual language without manual duplication.

#### Acceptance Criteria

1. THE Design_System SHALL define an orange accent CSS custom property (`--accent-orange: #ea580c`) in `design-tokens.css` alongside the existing teal glow variables.
2. THE Design_System SHALL define a light-theme mesh background variable (`--bg-mesh-light`) in `design-tokens.css` for use on the Landing_Page.
3. WHEN the Landing_Page renders in light mode, THE Landing_Page SHALL use `bg-[#eef0f4]` as the page background, matching the Login_Page.
4. WHEN the Landing_Page renders in dark mode, THE Landing_Page SHALL use `bg-slate-950` as the page background.
5. THE Landing_Page SHALL apply `--radius-card` (2.5rem) as the border radius for all card surfaces, replacing any hardcoded `rounded-[3rem]` or `rounded-[5rem]` values. Hardcoded values may be removed even if the token replacement is confirmed to be working, as long as the visual output is verified.
6. THE Landing_Page SHALL apply `--shadow-premium` and `--shadow-hover` tokens for card and section shadows, replacing hardcoded shadow values.
7. THE Landing_Page SHALL apply `--section-spacing` (`clamp(2rem, 10vh, 5rem)`) as the vertical padding for all major sections, replacing hardcoded `py-40` values.
8. THE Landing_Page SHALL apply `--page-padding` (`clamp(1rem, 6vw, 4rem)`) as the horizontal padding for all sections, replacing hardcoded `px-6` values.

---

### Requirement 2: Typography System Normalization

**User Story:** As a UX designer, I want the Landing Page typography to match the refined, sentence-case style of the Login Page, so that the product feels enterprise-elegant rather than aggressive.

#### Acceptance Criteria

1. THE Landing_Page SHALL render all section headings using `font-display font-semibold tracking-tight` in sentence-case, replacing `font-black uppercase tracking-tighter`. WHERE a heading element serves a specific branding or emphasis purpose (e.g., the hero wordmark "YVI People"), THE Landing_Page MAY retain uppercase styling for that element only.
2. THE Landing_Page SHALL render all body copy and feature descriptions using `font-sans font-normal` or `font-sans font-medium`, replacing `font-bold uppercase tracking-wider`.
3. THE Landing_Page SHALL render all metadata labels and badges using `font-sans font-medium tracking-wide` at `text-xs`, replacing `font-black uppercase tracking-[0.4em]` at `text-[9px]`.
4. THE Landing_Page SHALL apply fluid font sizes using the `--font-size-hero`, `--font-size-h1`, and `--font-size-h2` Design_Token variables for headings, replacing hardcoded `text-7xl` and `text-9xl` values.
5. THE FAQ_Section SHALL render answer text using `font-sans font-normal leading-relaxed` in sentence-case, replacing `uppercase tracking-wider font-bold`.
6. THE Navbar SHALL render navigation link labels using `text-xs font-medium tracking-wide`, replacing `text-[9px] font-black uppercase tracking-[0.25em]`.
7. THE Footer SHALL render body copy using `font-sans font-normal text-sm leading-relaxed`, replacing `font-bold uppercase tracking-wider`.

---

### Requirement 3: Light Theme and Dark Mode Support

**User Story:** As a user, I want the Landing Page to support both light and dark themes with a toggle, so that I can view it in my preferred visual mode just like the Login Page.

#### Acceptance Criteria

1. THE Landing_Page SHALL render in light theme by default, using `bg-[#eef0f4]` and `text-slate-900` as base styles.
2. WHEN the dark mode class is applied to the HTML element, THE Landing_Page SHALL switch all surfaces to dark equivalents (`bg-slate-950`, `text-white`).
3. THE Navbar SHALL include a ThemeToggle component matching the Vercel-style toggle used on the Login_Page. THE ThemeToggle component SHALL be the only supported method for switching themes on the Landing_Page; system-preference-only switching is not sufficient.
4. WHEN the ThemeToggle is activated, THE Landing_Page SHALL transition between light and dark themes using `transition-colors duration-500`.
5. THE Landing_Page SHALL NOT render any section with a hardcoded dark-only background (e.g., `bg-black`, `bg-slate-950`) without a corresponding light-mode override.
6. THE Stats_Strip SHALL render with `bg-white/40 dark:bg-black/40` to support both themes.
7. THE FAQ_Section SHALL render with `bg-white/50 dark:bg-black` to support both themes.

---

### Requirement 4: Orange Accent System Migration

**User Story:** As a brand designer, I want the Landing Page to use the orange accent system instead of teal, so that both the Landing Page and Login Page share a unified brand color identity.

#### Acceptance Criteria

1. THE Landing_Page SHALL replace all `teal-500` and `teal-400` accent colors with `orange-500` and `orange-400` equivalents, and both orange-500 and orange-400 are permitted for use in different contexts (e.g., interactive states, icons, gradients).
2. THE Navbar CTA button SHALL use `bg-gradient-to-r from-orange-600 to-orange-500` styling, matching the Login_Page's PremiumButton.
3. THE Hero_Section badge SHALL use `bg-orange-500/10 border-orange-500/20 text-orange-500` styling.
4. THE Hero_Section primary CTA button SHALL use `bg-gradient-to-r from-orange-600 to-orange-500` with a shimmer effect, matching the Login_Page's LoginButton component.
5. THE ProductShowcase section badges SHALL use `bg-orange-500/10 border-orange-500/20 text-orange-500` styling.
6. THE Module_Grid "active" status labels SHALL use `text-orange-400/60 group-hover:text-orange-400` styling.
7. THE FAQ_Section chevron icon SHALL use `text-orange-400` when an item is open.
8. THE Footer brand accent SHALL use `text-orange-400` for the "EMS" wordmark, replacing `text-teal-400`.
9. THE Landing_Page SHALL NOT contain any remaining `teal-500`, `teal-400`, or `teal-300` color references after migration.

---

### Requirement 5: Glassmorphism Unification

**User Story:** As a UI designer, I want all glass surfaces on the Landing Page to use the same light glassmorphism standard as the Login Page, so that the visual depth system is consistent across the product.

#### Acceptance Criteria

1. THE GlassCard component SHALL implement `bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 backdrop-blur-3xl rounded-[2rem]` as its base style, matching the Login_Page's `LoginGlassCard`.
2. THE Hero_Section floating KPI cards SHALL use GlassCard styling, replacing the legacy `glass-panel-teal` and `glass-panel` dark glass classes. THE Hero_Section SHALL be strictly prohibited from using any legacy glass classes, including `glass-panel` and `glass-panel-teal`, with no exceptions.
3. THE OperationalPreview dashboard surface SHALL use `bg-white/[0.18] dark:bg-slate-900/40 border border-white/25 dark:border-white/10 backdrop-blur-2xl` styling.
4. THE ProductShowcase floating overlay cards SHALL use GlassCard styling.
5. THE Module_Grid cards SHALL use `bg-white/[0.18] dark:bg-white/[0.02] border border-white/25 dark:border-white/5 backdrop-blur-xl` styling.
6. THE CTA_Section container SHALL use `bg-white/[0.22] dark:bg-gradient-to-br dark:from-slate-900 dark:to-black border border-white/30 dark:border-white/10 backdrop-blur-2xl` styling.
7. THE Landing_Page SHALL NOT use the legacy `glass-panel` or `glass-panel-teal` CSS classes on any surface. These classes are prohibited throughout the entire migration; partial migration states where one class is removed but the other remains are not permitted.

---

### Requirement 6: Navbar Premium Upgrade

**User Story:** As a visitor, I want the Navbar to feel premium and theme-aware, so that the first element I see matches the quality of the rest of the redesigned page.

#### Acceptance Criteria

1. WHEN the page is in light mode, THE Navbar SHALL use `bg-white/80 backdrop-blur-2xl border-b border-slate-200/50` as its scrolled state background.
2. WHEN the page is in dark mode, THE Navbar SHALL use `bg-slate-950/90 backdrop-blur-2xl border-b border-white/5` as its scrolled state background.
3. THE Navbar SHALL include a ThemeToggle component positioned in the right action area.
4. THE Navbar CTA button label SHALL read "Get Started" or "Enter Platform", replacing "Terminal Access" for the secondary link.
5. THE Navbar CTA button SHALL use PremiumButton styling with orange gradient. WHERE a button uses the orange gradient (`from-orange-600 to-orange-500`) but differs in other base styling, THE Navbar SHALL consider it compliant provided the orange gradient is present.
6. THE Navbar brand wordmark SHALL use sentence-case "YVI People" with `font-display font-semibold`, replacing `font-black uppercase`.
7. THE Navbar navigation links SHALL use `text-xs font-medium tracking-wide` typography.
8. WHEN the mobile menu is opened, THE Navbar SHALL animate the menu panel entrance using a spring-physics slide-down transition.

---

### Requirement 7: Hero Section Premium Redesign

**User Story:** As a visitor, I want the Hero section to immediately communicate premium quality with a light, airy aesthetic, so that I feel confident in the product's enterprise positioning.

#### Acceptance Criteria

1. THE Hero_Section SHALL use a light mesh background (`bg-[#eef0f4]` with radial orange and blue ambient glows) in light mode, replacing `mesh-bg-dark`.
2. THE Hero_Section SHALL reduce top padding to `pt-32 md:pt-40`, replacing `pt-60`.
3. THE Hero_Section headline SHALL use `font-display font-semibold tracking-tight` in sentence-case, replacing `font-black uppercase tracking-tighter`.
4. THE Hero_Section primary CTA button SHALL use PremiumButton with orange gradient and shimmer effect.
5. THE Hero_Section badge SHALL use light glass styling (`bg-white/[0.35] border border-white/30 backdrop-blur-md`) with orange accent dot.
6. THE OperationalPreview component SHALL use light-glass surfaces in light mode and dark-glass surfaces in dark mode. THE OperationalPreview SHALL always render with at least one of these surface types active; IF neither surface type is available, THEN THE OperationalPreview SHALL prevent rendering and display a fallback placeholder.
7. THE Hero_Section floating KPI cards SHALL use GlassCard styling with a maximum float animation of 8px (replacing 20px).
8. THE Hero_Section trust badge area SHALL display "SOC2 Type II · ISO 27001 · AES-256" using `font-sans font-medium text-xs text-slate-500` in sentence-case.

---

### Requirement 8: Stats Strip Theme Support

**User Story:** As a visitor, I want the statistics strip to be readable and visually consistent in both light and dark modes, so that the key metrics are always clearly communicated.

#### Acceptance Criteria

1. THE Stats_Strip SHALL use `bg-white/40 dark:bg-black/40 border-y border-slate-200/50 dark:border-white/5` for its background.
2. THE Stats_Strip counter values SHALL use `font-display font-semibold text-slate-900 dark:text-white` typography.
3. THE Stats_Strip counter accent suffix (e.g., "+", "%") SHALL use `text-orange-500` color.
4. THE Stats_Strip labels SHALL use `font-sans font-medium text-xs text-slate-500 dark:text-slate-600` typography.
5. THE Stats_Strip section padding SHALL use `--section-spacing` token, replacing hardcoded `py-20`.

---

### Requirement 9: ProductShowcase Section Refinement

**User Story:** As a visitor, I want the feature showcase sections to feel visually impactful and readable in both themes, so that I can clearly understand the product's capabilities.

#### Acceptance Criteria

1. THE ProductShowcase section padding SHALL use `--section-spacing` token, replacing hardcoded `py-40`.
2. THE ProductShowcase gap between columns SHALL use `gap-16 lg:gap-24`, replacing `gap-32`.
3. THE ProductShowcase images SHALL render at full color and opacity by default (removing `grayscale opacity-40`), with a subtle hover scale effect.
4. THE ProductShowcase feature list items SHALL use `font-sans font-medium text-sm` in sentence-case, replacing `font-black uppercase tracking-widest`.
5. THE ProductShowcase feature description text SHALL use `font-sans font-normal text-sm text-slate-500 dark:text-slate-400 leading-relaxed`, replacing `font-bold uppercase tracking-wider`.
6. THE ProductShowcase section badge SHALL use orange accent styling matching Requirement 4.
7. THE ProductShowcase heading SHALL use `font-display font-semibold tracking-tight` in sentence-case.
8. THE ProductShowcase "Explore" button SHALL use a ghost button with orange border-on-hover, replacing the current white ghost button.
9. WHEN the ProductShowcase image is hovered, THE ProductShowcase SHALL apply a subtle `scale-[1.02]` transform with `transition-transform duration-700`.

---

### Requirement 10: Module Grid Refinement

**User Story:** As a visitor, I want the enterprise module grid to display cards that feel premium and consistent with the design system, so that the product's breadth is communicated clearly.

#### Acceptance Criteria

1. THE Module_Grid cards SHALL use `rounded-card` (2.5rem via `--radius-card` token), replacing hardcoded `rounded-[3rem]`.
2. THE Module_Grid cards SHALL use GlassCard styling as defined in Requirement 5.
3. THE Module_Grid cards SHALL apply `--shadow-soft` on default state and `--shadow-medium` on hover. THE hover shadow MUST always be visually stronger (higher elevation) than the default shadow; the reverse configuration is not permitted.
4. THE Module_Grid card hover lift SHALL be `whileHover={{ y: -6 }}`, replacing `whileHover={{ y: -10 }}`.
5. THE Module_Grid cards SHALL use `p-8`, replacing `p-10`.
6. THE Module_Grid card title SHALL use `font-display font-semibold text-lg tracking-tight` in sentence-case, replacing `font-black uppercase tracking-tighter`.
7. THE Module_Grid card description SHALL use `font-sans font-normal text-xs text-slate-500 dark:text-slate-500 leading-relaxed` in sentence-case, replacing `font-bold uppercase tracking-widest`.
8. THE Module_Grid SHALL include a `md:grid-cols-2` breakpoint between `sm:grid-cols-2` and `lg:grid-cols-4`.

---

### Requirement 11: FAQ Section Redesign

**User Story:** As a visitor, I want the FAQ section to be readable and accessible, so that I can quickly find answers to my questions without straining to read all-caps paragraph text.

#### Acceptance Criteria

1. THE FAQ_Section SHALL use `bg-white/50 dark:bg-black` background with `border-y border-slate-200/50 dark:border-white/5`.
2. THE FAQ_Section question text SHALL use `font-display font-semibold text-xl tracking-tight text-slate-800 dark:text-slate-200` in sentence-case, replacing `font-black uppercase tracking-tight`.
3. THE FAQ_Section answer text SHALL use `font-sans font-normal text-sm text-slate-600 dark:text-slate-400 leading-relaxed` in sentence-case, replacing `font-bold uppercase tracking-wider`.
4. THE FAQ_Section SHALL contain at least 5 FAQ items, replacing the current 2 items.
5. WHEN a FAQ item is expanded, THE FAQItem button SHALL have `aria-expanded="true"` set on the trigger button.
6. WHEN a FAQ item is collapsed, THE FAQItem button SHALL have `aria-expanded="false"` set on the trigger button.
7. THE FAQItem chevron icon SHALL use `text-orange-400` when the item is open, replacing `text-teal-400`.

---

### Requirement 12: CTA Section Token Compliance

**User Story:** As a designer, I want the final CTA section to use design system tokens and the orange accent, so that it feels cohesive with the rest of the redesigned page.

#### Acceptance Criteria

1. THE CTA_Section container SHALL use `rounded-card` (via `--radius-card` token), replacing hardcoded `rounded-[5rem]`.
2. THE CTA_Section container padding SHALL use `p-16 md:p-24`, replacing `p-24 md:p-40`.
3. THE CTA_Section heading SHALL use `font-display font-semibold tracking-tight` with fluid sizing via `--font-size-hero` token, replacing `text-7xl md:text-9xl font-black uppercase`.
4. THE CTA_Section primary button SHALL use PremiumButton with orange gradient, replacing the teal button.
5. THE CTA_Section secondary button label SHALL read "View documentation", replacing "Executive Documentation".
6. THE CTA_Section heading accent span SHALL use `text-orange-500`, replacing `text-teal-500`.

---

### Requirement 13: Footer Enhancement

**User Story:** As a visitor, I want the footer to feel complete and professional, so that I can find relevant links and trust the product's legitimacy.

#### Acceptance Criteria

1. THE Footer SHALL use `bg-white/30 dark:bg-black border-t border-slate-200/50 dark:border-white/5` background.
2. THE Footer padding SHALL use `py-16`, replacing `py-32`.
3. THE Footer SHALL include at least 4 links per navigation column, replacing the current 3.
4. THE Footer SHALL include a social links row with LinkedIn, Twitter/X, and GitHub icon links.
5. THE Footer SHALL include a legal links row with "Privacy Policy", "Terms of Service", and "Security" text links.
6. THE Footer brand description SHALL use `font-sans font-normal text-sm text-slate-500 leading-relaxed` in sentence-case, replacing `font-bold uppercase tracking-wider`.
7. THE Footer column headings SHALL use `font-sans font-semibold text-xs tracking-wide text-slate-400 dark:text-slate-500` in sentence-case, replacing `font-black uppercase tracking-[0.5em]`.
8. THE Footer link text SHALL use `font-sans font-normal text-sm text-slate-500 dark:text-slate-400` in sentence-case, replacing `font-black uppercase tracking-widest`.

---

### Requirement 14: Mobile Responsiveness Hardening

**User Story:** As a mobile user, I want the Landing Page to render correctly on all screen sizes without overflow or excessive spacing, so that I can browse the product on any device.

#### Acceptance Criteria

1. THE OperationalPreview component SHALL use `w-full max-w-[100%]` to prevent horizontal overflow, replacing `w-[110%]`.
2. THE Hero_Section top padding SHALL use `pt-28 md:pt-36 lg:pt-40`, replacing `pt-60`.
3. THE ProductShowcase column gap SHALL use `gap-12 lg:gap-16`, replacing `gap-32`.
4. THE Module_Grid SHALL include a `md:grid-cols-2` breakpoint as specified in Requirement 10.
5. WHEN the viewport width is below 768px, THE Landing_Page SHALL not render any element that causes horizontal scroll. THE Landing_Page SHALL also prevent horizontal scroll on all viewport sizes including tablet and desktop.
6. THE Navbar mobile menu SHALL animate its entrance using a spring-physics slide-down transition with `initial={{ height: 0 }} animate={{ height: 'auto' }}`.

---

### Requirement 15: Animation System Refinement

**User Story:** As a user, I want the Landing Page animations to feel smooth and purposeful without being distracting, so that motion enhances rather than detracts from the content.

#### Acceptance Criteria

1. THE Landing_Page floating card animations SHALL use a maximum y-axis travel of 8px (`animate={{ y: [0, -8, 0] }}`), replacing 20px.
2. THE Landing_Page entrance animations SHALL use `transition={{ type: "spring", stiffness: 100, damping: 18 }}` spring physics, replacing `duration: 1.2` linear easing.
3. THE Landing_Page section reveal animations SHALL use `transition={{ duration: 0.6 }}` maximum, replacing `duration: 1.5`.
4. WHEN the user has `prefers-reduced-motion: reduce` set, THE Landing_Page SHALL disable all floating, parallax, and entrance animations, rendering elements in their final visible state. THE Landing_Page SHALL also provide an in-page animation toggle control so users who have not set the system preference can optionally disable animations.
5. THE Landing_Page SHALL remove unused imports: `useScroll`, `useTransform`, `useSpring` from Framer Motion.
6. THE Landing_Page SHALL remove unused component imports: `EnterpriseCard`, `EnterpriseStatCard`.

---

### Requirement 16: Accessibility Hardening

**User Story:** As a user relying on assistive technology, I want the Landing Page to be navigable and understandable, so that I can access all content regardless of my abilities.

#### Acceptance Criteria

1. THE Landing_Page SHALL include a skip-to-content link as the first focusable element, linking to the main content area with `id="main-content"`.
2. THE FAQItem button SHALL have `aria-expanded` set to reflect the open/closed state as specified in Requirement 11.
3. THE Landing_Page product images SHALL have descriptive `alt` text that conveys the content of the image (not generic "image" or the title text).
4. THE Navbar CTA button and all interactive elements SHALL have visible `focus-visible` ring styles using `focus-visible:ring-2 focus-visible:ring-orange-500/50`.
5. THE Landing_Page SHALL ensure all text-on-background color combinations meet WCAG_AA contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.
6. THE Navbar mobile menu toggle button SHALL have `aria-label="Open navigation menu"` when closed and `aria-label="Close navigation menu"` when open.
7. THE Stats_Strip counter elements SHALL have `aria-live="polite"` to announce value changes to screen readers.

---

### Requirement 17: Performance Optimization

**User Story:** As a developer, I want the Landing Page to load efficiently without dead code or unoptimized assets, so that the page performs well for all users.

#### Acceptance Criteria

1. THE Landing_Page SHALL load all Unsplash images using the `loading="lazy"` attribute.
2. THE Landing_Page SHALL remove all unused imports identified in the audit: `useScroll`, `useTransform`, `useSpring`, `EnterpriseCard`, `EnterpriseStatCard`. THE Landing_Page SHALL remove only the unused imports that are actually present in the code at the time of refactor; if any listed import has already been removed, no action is required for that import.
3. THE Landing_Page SHALL not import any component or hook that is not referenced in the render output.
4. WHEN an image is loading, THE Landing_Page SHALL display a `bg-slate-100 dark:bg-slate-800 animate-pulse` placeholder in the image container. THE Landing_Page SHALL also display this placeholder in any image container that could potentially load content, including empty containers and containers before any load attempt has begun.
5. THE Landing_Page SHALL use `React.lazy` and `Suspense` for the `MegaMenu` component to defer its load until first interaction.

---

### Requirement 18: Reusable Component Extraction

**User Story:** As a developer, I want the Landing Page to use shared, reusable UI components, so that future pages can adopt the same design system without duplicating code.

#### Acceptance Criteria

1. THE Landing_Page SHALL use a `GlassCard` component located at `frontend/src/components/ui/GlassCard.tsx` for all glassmorphism card surfaces.
2. THE Landing_Page SHALL use a `PremiumButton` component located at `frontend/src/components/ui/PremiumButton.tsx` for all primary CTA buttons, implementing the orange gradient and shimmer effect from the Login_Page's `LoginButton`.
3. THE Landing_Page SHALL use a `SectionHeading` component located at `frontend/src/components/landing/SectionHeading.tsx` for all section title + label combinations.
4. THE Landing_Page SHALL use an `AnimatedContainer` component located at `frontend/src/components/landing/AnimatedContainer.tsx` as a Framer Motion wrapper with spring-physics entrance animation and Reduced_Motion support.
5. THE GlassCard component SHALL accept `className`, `children`, and optional `variant` props (`"light"` | `"dark"` | `"auto"`).
6. THE PremiumButton component SHALL accept `children`, `className`, `isLoading`, `loadingText`, and standard HTML button props.
7. THE SectionHeading component SHALL accept `label`, `title`, `subtitle`, `align` (`"left"` | `"center"`), and `accentWord` props for the orange-highlighted word in the title.
8. THE AnimatedContainer component SHALL accept `children`, `className`, `delay`, and `direction` (`"up"` | `"left"` | `"right"`) props.
