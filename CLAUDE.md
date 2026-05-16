# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev              # Start Vite dev server on http://localhost:5173
npm run tauri:dev        # Run Tauri desktop app in dev mode

# Build
npm run build            # Build website (Vite)
npm run tauri:build      # Build Tauri desktop app for Windows

# Code generation
node scripts/gen-logo.mjs [output-path]  # Generate 1024x1024 logo PNG from wireframe geometry
node scripts/gen-icons.mjs               # Regenerate all app icons (png, ico) from logo

# Type checking & linting
npm run lint             # Run ESLint
npm run type-check       # Check types (if configured)

# Tests
npm test                 # Run all tests
npm test -- <pattern>    # Run tests matching pattern
```

## Architecture Overview

### Two Deployments, One Codebase

This is a **dual-target React + Vite project** that ships two products:

1. **Website** (`clearpathodai.com`) — Pure React SPA, deployed to Vercel
   - Entry: `src/App.jsx` → checks `isTauri` → renders `HomePage` 
   - Live preview with interactive demo
   - No backend, no auth
   
2. **Desktop App** (Windows) — Tauri + React, distributed via GitHub releases
   - Same codebase; entry detects `isTauri` → renders `DesktopApp` instead
   - Overlay window + screen capture + OCR

**Detection**: `src/utils/isTauri.js:1` — checks for `__TAURI_INTERNALS__` in window

### React Component Tree

```
App.jsx (isTauri check)
├─ DesktopApp.jsx              [desktop only, overlay UI]
│  ├─ AnalyzeDialog.jsx         [screen capture wizard]
│  └─ processText() helper      [mode-aware AI responses]
└─ HomePage.jsx                [website only, landing page]
   ├─ Navbar                    [header + mobile menu]
   ├─ Hero                      [headline + CTA]
   ├─ MiniDemo.jsx              [interactive toggle demo]
   ├─ What It Does              [feature cards]
   ├─ Overlay Mode section      [step-by-step explanation]
   ├─ Workspace Mode section    [secondary feature]
   ├─ Modes section             [6 mode cards]
   ├─ Privacy/Ethics section    [trust signals]
   └─ Footer                    [links + copyright]
```

## Key Functionality

### 1. Overlay Mode: Screen Capture + OCR Pipeline

**Flow**: User clicks "Analyze Screen" → OS picker → crop region → OCR → clean → process

**Files**:
- `src/components/desktop/AnalyzeDialog.jsx:1-650` — State machine (chooser → capturing → cropping → extracting → review → error)
  - `CropStep` sub-component: drag-to-select overlay with `clip-path` dimming
  - Steps managed by `state` enum
- `src/utils/screenCapture.js:1-202` — Pure browser APIs
  - `captureScreen()`: line 16, uses `navigator.mediaDevices.getDisplayMedia()`
  - `cropDataUrl()`: line 88, normalized rectangle crop
  - `preprocessForOcr()`: line 112, upscale 1.5-2x, grayscale, contrast 1.35, unsharp mask
  - `extractTextFromImage()`: line 174, Tesseract.js dynamic import
- `src/utils/textCleanup.js:1-137` — OCR result filtering
  - `cleanOcrResult()`: line 50, removes nav labels, timestamps, low-confidence (<35), dedupes
  - Three-pass approach: trim/filter → dedupe → score by action keywords

**Key design**: All processing happens **on-device** (Tesseract.js, canvas). No network calls.

### 2. Mode-Aware Processing

**Six modes** control how content is transformed:
- **Overwhelmed**: one section at a time + breathing prompts
- **Foggy**: bold key terms, short sections
- **Anxious**: urgency language removed, reassurance messaging
- **Stressed**: checkable step lists with progress
- **Calm**: full info, clean layout
- **Original**: unmodified

**Configuration**: `src/utils/modeConfigs.js:1-100` — 6 mode objects with colors, taglines, descriptions

**Processing logic**: `src/components/desktop/DesktopApp.jsx:467` — `processText()` helper
```javascript
// Line 467-550 (approx)
function processText(text, action, options = {}) {
  const { overlayMode, demoMode } = options;
  
  if (action === 'analyze') {
    // Mode-specific output structure
    const cleaned = cleanOcrResult(result);
    
    switch(overlayMode) {
      case 'overwhelmed': return { mattersMost, nextStep };     // minimal
      case 'foggy':       return { keyPoints };                 // highlighted
      case 'anxious':     return { calm, reassurance };         // reworded
      case 'stressed':    return { numberedSteps };             // checklist
      case 'calm':        return { full, all_modes };           // complete
      case 'original':    return { rawText };                   // unchanged
    }
  }
}
```

### 3. Desktop App State Machine

**File**: `src/components/desktop/DesktopApp.jsx:1-600`

**States**: `idle` | `session` | `workspace` | `collapsed`

**Key props**:
- `overlayMode`: current mode (Overwhelmed, Foggy, etc.) — color-coded UI
- `sessionActive`: session started, overlay visible
- `lastResult`: cached OCR + AI response

**Tauri integration**:
- `getCurrentWindow()`: line ~50 (window control)
- `setAlwaysOnTop()`: keep overlay above other apps
- `LogicalSize(400, 640)`: frameless overlay dimensions

**Drag region**: `[data-tauri-drag-region]` CSS class (see `src/index.css:29`)

### 4. Website Demo Section

**File**: `src/components/MiniDemo.jsx:1-450`

Interactive demo with 6 mode toggles. Closed by default; "Try the demo" button expands.

**Content**: Payment notice ($128.45, due May 5) — shows how each mode transforms it:
- **Calm**: 2×2 grid (amount, date, account, late fee) + options
- **Overwhelmed**: 3-step click-through with breathing prompts
- **Foggy**: 5 labeled sections with **bold** key terms
- **Anxious**: calm rewrite, reassurance bar
- **Stressed**: 5-item checklist with progress bar
- **Original**: dense, unmodified notice

## Icon Generation

**Logo source**: Geometric wireframe polyhedron (SVG paths from `src/components/ClearPathLogo.jsx:20-40`)

**PNG rasterizer**: `scripts/gen-logo.mjs` + `scripts/gen-icons.mjs`
- Pure Node.js (no canvas/sharp dependency)
- Bresenham-style line drawing with circular anti-aliased brush
- zlib + CRC32 for PNG encoding
- Color: Indigo-700 (#4338CA) on transparent/white

**Icon usage**:
- Website: `public/favicon.svg` (scalable), `public/icons/icon-{192,512}.png` (PWA)
- Tauri app: `src-tauri/icons/32x32.png`, `128x128.png`, `256x256.png`, `icon.ico`

## Responsive Design

**Mobile-first approach**:
- Hero title: `text-[1.85rem] sm:text-4xl lg:text-[2.875rem]`
- Section padding: `py-14 sm:py-20 lg:py-24` (tight on mobile, normal on desktop)
- Navbar: hamburger menu (`<md`), desktop nav links (`md+`)
- Overlay mockup: hidden on tiny screens, visible `sm:block` (tablets+)
- Footer nav gap: `gap-x-8 sm:gap-x-14`

**CSS variables**: `src/index.css:21-26` — safe area insets for notched devices

## Animations & Interactions

**Scroll-reveal system**: `src/components/HomePage.jsx:169-186`
- Four variants: `reveal-up`, `reveal-left`, `reveal-right`, `reveal-scale`
- `useScrollReveal()` hook with IntersectionObserver (threshold 0.08, rootMargin -40px)
- Stagger delays: `stagger-1` through `stagger-4`

**Key animations** (`src/index.css`):
- `heroFadeUp`: hero text entrance (cubic-bezier cascade)
- `demoContentIn`: demo card transition (fade + translateY)
- `navDropDown`: mobile menu dropdown
- `breathe`: overwhelmed mode pulsing (4s cycle)

## Tauri Configuration

**File**: `src-tauri/tauri.conf.json`

```json
{
  "windows": [{
    "label": "main",
    "width": 400,
    "height": 640,
    "decorations": false,        // frameless
    "transparent": false,
    "center": true,
    "shadow": true
  }],
  "identifier": "com.clearpathodai.app"
}
```

**Capabilities** (`src-tauri/capabilities/default.json`):
- Window: minimize, close, setSize, setAlwaysOnTop, center, startDragging
- No filesystem, shell, or network access (keeps overlay minimal)

**Build**: Windows-only CI/CD (`github/workflows/release.yml`)
- Triggers on version tags
- Builds with `npm run tauri:build`
- Creates `.exe` installer + uploads to GitHub releases

## PWA & Deployment

**Website**:
- Vite build output → `dist/`
- PWA config: `vite.config.js:8-85` (VitePWA plugin)
- Service worker auto-generated
- Deploy: Vercel (auto on push to main)

**Desktop**:
- Tauri build → `.exe` installer
- Manual GitHub release (not automated, requires tag + upload)

## Common Patterns

### State Management
- **Hook-based**: React `useState`, `useRef`, `useEffect`
- **No Redux/Context**: Simple component-level state sufficient
- **LocalStorage**: `useAuth.js` for remembering preferences (MVP only)

### Styling
- **Tailwind CSS** with custom extensions
- **Inline `style` props** for dynamic colors (mode-specific accent colors)
- **CSS classes** for animations and responsive breakpoints

### Error Handling
- OCR failures → fallback to "Demo Safe Mode" (known-good sample text)
- Screen capture cancellation → close dialog, return to idle state
- Tauri window failures → console errors logged, UI remains responsive

## Debugging Tips

**Desktop app**:
```bash
npm run tauri:dev      # Opens dev console (F12)
# Check for __TAURI_INTERNALS__ in console
```

**Website**:
```bash
npm run dev            # Vite HMR on localhost:5173
# Browser DevTools → Network/Console
```

**OCR issues**:
- Check `preprocessForOcr()` output (upscale, contrast, sharpening)
- Try different regions; edge artifacts can confuse Tesseract
- Demo Safe Mode works if Tesseract.js fails to load

**Mobile testing**:
```bash
npm run build && npx vite preview --host
# Access via phone on your local IP
```

## File Organization

```
src/
├─ App.jsx                           [isTauri router]
├─ main.jsx                          [entry point]
├─ index.css                         [tailwind + animations]
├─ components/
│  ├─ HomePage.jsx                  [website landing page]
│  ├─ MiniDemo.jsx                  [demo section]
│  ├─ ClearPathLogo.jsx              [SVG logo component]
│  ├─ desktop/
│  │  ├─ DesktopApp.jsx             [overlay UI, session state]
│  │  └─ AnalyzeDialog.jsx          [screen capture wizard]
│  └─ demo/
│     ├─ [various demo components]  [not used in main site]
├─ utils/
│  ├─ isTauri.js                    [env detection]
│  ├─ screenCapture.js              [OCR pipeline]
│  ├─ textCleanup.js                [result filtering]
│  ├─ modeConfigs.js                [mode metadata]
│  └─ [others]
└─ data/
   ├─ scenarios.js                  [demo content]
   └─ demoContent.js                [payment notice data]

scripts/
├─ gen-logo.mjs                     [1024px logo rasterizer]
└─ gen-icons.mjs                    [multi-size icon generator]

src-tauri/
├─ tauri.conf.json                  [app config]
├─ src/main.rs                      [Rust entry, minimal]
├─ icons/                           [.png, .ico files]
└─ capabilities/                    [security policies]

public/
├─ favicon.svg                      [browser tab icon]
├─ clearpath-logo.png               [1024x1024 reference]
└─ icons/                           [PWA icons]

index.html                          [HTML shell]
vite.config.js                      [Vite + PWA config]
```
