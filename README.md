# YourCabinet Pro - Control Cabinet Configurator

A comprehensive industrial control cabinet configuration and e-commerce platform built with modern web frameworks.

## 🚀 Main Implementation

**nextjs-pro/** - Production-ready Next.js 14 implementation with a complete webshop experience:

- **Landing Page**: Hero section, cabinet catalog with product cards, quick model selector
- **3-Column Configurator**: 
  - Left: Babylon.js 3D WebGL preview with face-click navigation
  - Center: 2D panel editor with snap grid, click-to-place elements
  - Right: Properties editor + element list
- **Features**: Keyboard shortcuts, undo/redo, price calculation, cart integration, query param deep linking (`?cabinet=<key>`)
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Babylon.js, Zustand, Framer Motion

**Run**: `cd nextjs-pro && npm install && npx next dev -p 3010`

---

## 📚 Reference Implementations

All reference implementations include the same core logic and component architecture, demonstrating platform agnostic design:

### reference/nextjs-app/
- **Framework**: Next.js 14 with daisyUI components
- **Layout**: Left sidebar (3D + side pills + element list), center editor, right properties
- **Purpose**: Baseline Next.js implementation with all UI components

### reference/nuxt-app/
- **Framework**: Nuxt 3 with Composition API
- **Layout**: Same 3-part layout as nextjs-app
- **Purpose**: Vue.js ecosystem demonstration

### reference/sveltekit-app/
- **Framework**: SvelteKit with Tailwind CSS
- **Layout**: Identical component structure
- **Purpose**: Svelte reactive system demonstration

### reference/nextjs-shadcn-babylon/
- **Framework**: Next.js 14 with shadcn/ui components and Babylon.js
- **Layout**: Enhanced 3D integration, professional UI components
- **Purpose**: Advanced Babylon.js implementation reference

### reference/nuxt-vuetify/
- **Framework**: Nuxt 3 with Vuetify 3 Material Design components
- **Layout**: Material Design implementations of all panels
- **Purpose**: Enterprise UI component library demonstration

### reference/nextjs-daisyui/
- **Framework**: Next.js 14 with daisyUI components
- **Layout**: Tailwind-based component library
- **Purpose**: Alternative component library approach

### reference/design-variants/
Three pre-configured design theme variants (industrial, nordic, electric):
- **design-1-industrial/**: Steel gray, angular aesthetics
- **design-2-nordic/**: Minimalist, light palette
- **design-3-electric/**: Bold colors, electric accents

---

## 🏗️ Shared Architecture

All implementations share:

### Core Types (`lib/types.ts`)
- `Side` (front, back, left, right, top, bottom)
- `ElementType` (hole, rect, opening)
- `ToolType` (move, hole, rect, opening)
- `CabinetSpec` with dimensions, basePrice, description

### Constants (`lib/constants.ts`)
- `CABINETS`: 4 cabinet models with pricing
- `ELEMENT_PRICES`: Price per element type (€12.50 hole, €18 rect, €25 opening)
- `SNAP_GRID`: 5mm snap increments
- Helper functions: `snap()`, `getPanelDimensions()`, `calcPrice()`, `formatDimensions()`

### State Management (`store/configurator-store.ts`)
- Zustand store with 50-item undo/redo stack
- Cabinet selection, side management, element CRUD operations
- Zoom, price calculation, cart management
- Toast notifications

### Keyboard Shortcuts (`hooks/use-keyboard-shortcuts.ts`)
- V: Select/Move tool
- H: Add hole
- R: Add rectangle
- O: Add opening
- M: Mark for cart
- Delete: Remove element
- Ctrl+Z / Ctrl+Y: Undo/Redo

---

## 🎨 Design System

**Colors**:
- Primary: Brand indigo (`#4c6ef5`)
- Backgrounds: Slate/gray neutrals (50-900 scale)
- Accents: Contextual (amber for holes, sky for rectangles, emerald for openings)

**Responsive**: Mobile-first Tailwind CSS, all layouts adapt to viewport

---

## 🔄 Business Logic

### Cabinet Configuration
- 6 sides per cabinet (front, back, left, right, top, bottom)
- Each side can have unlimited elements
- Cross-side navigation via 3D model or side pills

### Element Management
- Drag-and-drop placement on 2D grid
- Snap to 5mm increments
- Properties editor for precise coordinate/size input
- Undo/redo for all operations

### Pricing
- Base cabinet price + (element count × element price)
- Real-time total calculation
- Add-to-cart functionality

---

## 📁 Repository Structure

```
nextjs-pro/                    # Main production implementation
├── app/
│   ├── page.tsx              # Landing page
│   ├── configure/
│   │   └── page.tsx          # Configurator page
│   └── globals.css           # Design system CSS variables
├── components/
│   ├── landing/              # Landing page components
│   └── configurator/         # Configurator components (3D, editor, details)
├── lib/
│   ├── types.ts              # Shared type definitions
│   ├── constants.ts          # Business logic constants
│   └── utils.ts              # Helpers (cn, tooltip, etc.)
├── store/
│   └── configurator-store.ts # Zustand state management
├── hooks/
│   └── use-keyboard-shortcuts.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs

reference/                     # Framework comparison implementations
├── nextjs-app/               # Next.js baseline
├── nuxt-app/                 # Nuxt 3 alternative
├── sveltekit-app/            # SvelteKit alternative
├── nextjs-shadcn-babylon/    # shadcn/ui + Babylon.js
├── nuxt-vuetify/             # Vuetify 3 Material Design
├── nextjs-daisyui/           # daisyUI components
└── design-variants/          # 3 design theme variants
    ├── design-1-industrial/
    ├── design-2-nordic/
    └── design-3-electric/
```

---

## 🛠️ Development

All implementations use the same development workflow:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 📝 License

All code and designs are provided as reference implementations. Modify and use according to your project needs.

---

**Author**: Andreas Ebner (ebner.andreaas@outlook.com)  
**Created**: March 2026
