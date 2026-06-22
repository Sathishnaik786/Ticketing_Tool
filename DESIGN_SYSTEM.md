# Ticketra ETMS — Design System & Tokens

**Prepared by:** Senior Frontend Engineer & UI Architect  
**Status:** Complete  
**Date:** June 20, 2026

---

## 1. Palette & Colors

Color variables are mapped to HSL tokens inside CSS files to facilitate runtime theme swaps and dark mode compatibility:

```css
:root {
  /* Brand / Primary */
  --primary: 221.2 83.2% 53.3%;          /* #2563EB - Blue */
  --primary-foreground: 210 40% 98%;
  
  /* Status Color Mapping */
  --success: 162.2 75.8% 39%;            /* #10B981 - Green */
  --success-foreground: 210 40% 98%;
  
  --warning: 37.7 90.2% 50.2%;            /* #F59E0B - Amber */
  --warning-foreground: 222.2 47.4% 11.2%;
  
  --danger: 348.6 84.5% 59.8%;           /* #EF4444 - Red */
  --danger-foreground: 210 40% 98%;
  
  /* Neutral Palette */
  --background: 210 40% 98%;             /* #F8FAFC - Light Slate */
  --foreground: 222.2 47.4% 11.2%;
  
  --card: 0 0% 100%;
  --card-foreground: 222.2 47.4% 11.2%;
  
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}

.dark {
  /* Dark Palette (Neutral and Muted shades) */
  --background: 222.2 84% 4.9%;          /* #0F172A - Deep Navy */
  --foreground: 210 40% 98%;
  
  --card: 222.2 84% 8.5%;
  --card-foreground: 210 40% 98%;
  
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

---

## 2. Typography & Fonts

### Base Specifications
- **Primary Typeface**: `Inter, system-ui, sans-serif`
- **Fallback Stack**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Loading Pattern**: Google Web Fonts linked asynchronously via HTML preconnect blocks.

### Typography Scales
- **Display 1**: `36px (2.25rem)` / Weight: `800 (Extra Bold)` / Tracking: `-0.02em`
- **Heading 1**: `24px (1.5rem)` / Weight: `700 (Bold)` / Tracking: `-0.015em`
- **Heading 2**: `18px (1.125rem)` / Weight: `600 (Semi Bold)` / Tracking: `-0.01em`
- **Body Regular**: `14px (0.875rem)` / Weight: `400 (Regular)` / Tracking: `0`
- **Body Medium**: `14px (0.875rem)` / Weight: `500 (Medium)` / Tracking: `0`
- **Label / Small**: `12px (0.75rem)` / Weight: `600 (Semi Bold)` / Tracking: `0.05em` (uppercase)

---

## 3. Spacing & Spatial Grid

All paddings, margins, gaps, and sizes conform to a standard **8px grid system**:

- **Grid Increments**:
  - `space-1 (4px)`: Micro alignments (badge paddings)
  - `space-2 (8px)`: Small layouts (gaps, list item padding)
  - `space-4 (16px)`: Standard content gaps (form fields spacing)
  - `space-6 (24px)`: Card internal paddings
  - `space-8 (32px)`: Sections and page header margins

---

## 4. Border Radius & Corners

Corners are rounded to a standardized value to create a modern visual look:

- **Large Components (Cards, Dashboards Panel, Dialog Boxes)**: `border-radius: 12px (0.75rem)`
- **Medium Components (Inputs, Buttons, Badges)**: `border-radius: 8px (0.5rem)`
- **Small Components (Tooltip boxes, small tags)**: `border-radius: 4px (0.25rem)`

---

## 5. Shadows & Elevation

- **Low (Default Cards)**: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)`
- **Medium (Popovers, Sidebar, Navbars)**: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`
- **High (Modals, Overlays, Command Palette)**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

---

## 6. Accessibility & Contrast Guidelines

1. **Focus States**: All focusable nodes (buttons, inputs, select triggers) must render a primary ring focus indicator (`focus-visible:ring-2 focus-visible:ring-offset-2`).
2. **Text Elements**: Every label or input field must bind to descriptive labeling elements using unique identifier mapping.
3. **Contrast Verification**: Alert text shades are lightened/darkened dynamically during compilation to guarantee WCAG AA level compatibility on dark backgrounds.
