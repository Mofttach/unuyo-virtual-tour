# Design Document

## Feature: Virtual Tour Visual Redesign

---

## Overview

Redesign visual menyeluruh pada aplikasi Virtual Tour UNU Yogyakarta. Lima komponen baru dibuat sebagai modul terpisah yang diintegrasikan ke `PSViewer.tsx` dan `app/tour/page.tsx`. Semua komponen menggunakan TypeScript, Tailwind CSS v4, dan mengikuti pola dark theme dengan aksen `unu-gold` (#d4af37) yang sudah ada.

Stack: Next.js 16 App Router · TypeScript · Tailwind CSS v4 · Photo Sphere Viewer v5 · React 19

---

## Architecture

### Component Hierarchy

```
app/tour/page.tsx
└── TourLanding (client component)
    ├── Hero background (static panorama image)
    ├── CTA "Mulai Tur" button
    └── PSViewer (full-screen overlay, rendered when isViewerOpen = true)
        ├── Photo Sphere Viewer (canvas)
        ├── LoadingOverlay (z-40, shown during isTransitioning)
        ├── OnboardingHint (z-50, shown once per session)
        ├── SceneCounter (bottom-left, always visible)
        ├── MobileInfoBar (bottom, mobile only < 768px)
        └── ... (existing controls: sidebar, info modal, mobile preview)
```

### File Map

| File | Status | Purpose |
|---|---|---|
| `client/components/Viewer/LoadingOverlay.tsx` | **NEW** | Scene transition loading UI |
| `client/components/Viewer/OnboardingHint.tsx` | **NEW** | First-visit tutorial overlay |
| `client/components/Viewer/SceneCounter.tsx` | **NEW** | Scene progress tracker |
| `client/components/Viewer/MobileInfoBar.tsx` | **NEW** | Mobile bottom info bar |
| `client/components/TourLanding.tsx` | **NEW** | Landing page with hero + CTA |
| `client/components/Viewer/PSViewer.tsx` | **MODIFIED** | Integrate new components, add search, premium hotspots, scene name overlay |
| `client/app/tour/page.tsx` | **MODIFIED** | Use TourLanding instead of direct PSViewer |

---

## Component Designs

### 1. LoadingOverlay

**Props:**
```typescript
interface LoadingOverlayProps {
  isVisible: boolean;
  targetSceneName: string;
}
```

**Behavior:**
- Renders a full-viewport overlay (`position: fixed, inset-0, z-40`) with `bg-black/50 backdrop-blur-md`
- Bottom of overlay contains an indeterminate progress bar with shimmer animation using `unu-gold`
- Center shows destination scene name with gold typography
- Animates in with `animate-in fade-in duration-300` and out via conditional render with a CSS transition

**Implementation Notes:**
- Receives `isVisible` and `targetSceneName` as props from PSViewer
- `isVisible` maps to `isTransitioning` state in PSViewer
- `targetSceneName` is the title of the scene being navigated to (captured just before `loadScene` sets `isTransitioning = true`)

```tsx
// LoadingOverlay.tsx
'use client';

interface LoadingOverlayProps {
  isVisible: boolean;
  targetSceneName: string;
}

export default function LoadingOverlay({ isVisible, targetSceneName }: LoadingOverlayProps) {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Scene name */}
      <p className="text-unu-gold text-xs uppercase tracking-[0.3em] mb-2">Menuju</p>
      <h2 className="text-white font-bold text-xl md:text-2xl mb-8 text-center px-4">{targetSceneName}</h2>
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-unu-gold/30 border-t-unu-gold rounded-full animate-spin mb-8" />
      {/* Indeterminate progress bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/10">
        <div className="h-full bg-unu-gold animate-[shimmer_1.5s_ease-in-out_infinite] w-1/3 rounded-full" />
      </div>
    </div>
  );
}
```

---

### 2. OnboardingHint

**Props:**
```typescript
interface OnboardingHintProps {
  onDismiss?: () => void;
}
```

**Behavior:**
- On mount: checks `localStorage.getItem('vtour_onboarding_shown')`
- If flag is absent: sets `visible = true`, starts a 3-second timer
- After 3 seconds: writes `localStorage.setItem('vtour_onboarding_shown', 'true')`, sets `visible = false`
- If flag is present: never renders (returns `null` immediately)
- Displays two instruction cards: drag/swipe to rotate, click/tap on arrows to navigate

**State:**
```typescript
const [visible, setVisible] = useState(false);
```

**localStorage Key:** `vtour_onboarding_shown`

```tsx
// OnboardingHint.tsx - outline
useEffect(() => {
  const shown = localStorage.getItem('vtour_onboarding_shown');
  if (!shown) {
    setVisible(true);
    const timer = setTimeout(() => {
      localStorage.setItem('vtour_onboarding_shown', 'true');
      setVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }
}, []);
```

---

### 3. SceneCounter

**Props:**
```typescript
interface SceneCounterProps {
  currentSlug: string;
  totalScenes: number;
}
```

**Behavior:**
- On mount: reads `vtour_visited_scenes` from localStorage, parses as `string[]`
- When `currentSlug` changes: adds it to the visited set (using `Set` for uniqueness deduplication), persists back to localStorage
- Renders `"X dari Y lokasi dijelajahi"` where X = visited set size, Y = `totalScenes`
- Renders a `div` progress bar: `width = (X / Y) * 100`%

**localStorage Key:** `vtour_visited_scenes` (JSON-serialized `string[]`)

**State:**
```typescript
const [visitedSlugs, setVisitedSlugs] = useState<Set<string>>(new Set());
```

**Key logic (pure, testable):**
```typescript
// Pure helper - can be unit/property tested in isolation
export function addVisited(current: Set<string>, slug: string): Set<string> {
  return new Set([...current, slug]);
}

export function calcProgress(visited: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((visited / total) * 100));
}
```

---

### 4. MobileInfoBar

**Props:**
```typescript
interface MobileInfoBarProps {
  sceneName: string;
  sceneDescription?: string;
  onInfoClick: () => void;
}
```

**Behavior:**
- Always rendered by PSViewer but uses `md:hidden` (hidden on ≥768px) via Tailwind responsive class
- Sticky `bottom-0` position with `z-30`
- Left side: scene title (truncated with `truncate`)
- Right side: "ⓘ" button that calls `onInfoClick`
- `onInfoClick` in PSViewer sets `showInfo = true` to open the existing info panel

**Layout:**
```tsx
<div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
  <div className="bg-black/80 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center gap-3">
    <span className="w-2 h-2 rounded-full bg-unu-gold animate-pulse shrink-0" />
    <span className="text-white text-sm font-semibold truncate flex-1">{sceneName}</span>
    <button onClick={onInfoClick} className="...">ⓘ</button>
  </div>
</div>
```

---

### 5. TourLanding

**Props:** None (reads data from its own `useEffect`)

**State:**
```typescript
const [startScene, setStartScene] = useState<Scene | null>(null);
const [isViewerOpen, setIsViewerOpen] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Behavior:**
- On mount: fetches featured scene from `/api/scenes/featured/` (same logic as the current `tour/page.tsx`)
- Before viewer opens: renders hero section with `bg-hero-wide.webp` as background, university name, and "Mulai Tur" CTA button
- When "Mulai Tur" is clicked: sets `isViewerOpen = true`
- When `isViewerOpen = true`: renders `<PSViewer>` as a `fixed inset-0 z-50` overlay

**Migration:** `app/tour/page.tsx` is refactored to simply import and render `<TourLanding />`.

---

### 6. PSViewer Modifications

#### 6a. Sidebar Search
New state: `const [searchQuery, setSearchQuery] = useState('');`

Filter logic applied before rendering the sidebar scene list:
```typescript
const filteredScenes = (scenes: Scene[]) =>
  scenes.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
```

The grouped `scenesByBuildingFloor` rendering uses `filteredScenes` per floor group.

Empty state: when all floors across all buildings are empty after filtering, renders `<p>Lokasi tidak ditemukan</p>`.

#### 6b. Active Floor Highlight
In the sidebar, the floor label receives a conditional class:
```tsx
const isActiveFloor = currentScene.floor !== null &&
  scene.floor === currentScene.floor &&
  building === currentScene.building;
```
Active floor label uses `text-unu-gold font-bold` instead of `text-gray-400`.

#### 6c. Premium Hotspot Arrow (SVG update)
The `arrowSvg` string is replaced with an SVG that includes:
- Glow filter using `<feDropShadow>` with `unu-gold` flood color
- Label text element below the arrow showing `h.text`
- Pulse animation (`animateTransform`) kept
- Dark semi-transparent rectangle behind the label text for readability

```typescript
const buildArrowSvg = (label: string): string => {
  const encoded = encodeURIComponent(label.substring(0, 20));
  return `data:image/svg+xml,...`; // SVG with glow + label
};
```

#### 6d. Scene Name Overlay
New state:
```typescript
const [sceneNameOverlay, setSceneNameOverlay] = useState<string | null>(null);
```

In `loadScene`, after `setPanorama` resolves:
```typescript
setSceneNameOverlay(newSceneData.title);
setTimeout(() => setSceneNameOverlay(null), 1500);
```

Rendered as:
```tsx
{sceneNameOverlay && (
  <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
    <div className="bg-black/60 backdrop-blur-sm px-8 py-4 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
      <p className="text-white font-bold text-2xl md:text-3xl tracking-wide">{sceneNameOverlay}</p>
    </div>
  </div>
)}
```

#### 6e. Target Scene Name for LoadingOverlay
New state: `const [targetSceneName, setTargetSceneName] = useState('');`

Set at the top of `loadScene` before the fetch:
```typescript
const targetTitle = sceneList.find(s => s.slug === slug)?.title || slug;
setTargetSceneName(targetTitle);
setIsTransitioning(true);
```

---

## Data Flow

```
TourLanding
  ├── fetches featured scene → passes as initialData to PSViewer
  └── isViewerOpen: false → true (on CTA click)

PSViewer
  ├── initialData (Scene) → initializes PSV viewer
  ├── loadScene(slug)
  │   ├── setTargetSceneName(title)  → LoadingOverlay shows
  │   ├── setIsTransitioning(true)   → LoadingOverlay shows
  │   ├── fetch scene data
  │   ├── setPanorama()
  │   ├── setSceneNameOverlay(title) → scene name toast (1.5s)
  │   ├── setCurrentScene(data)
  │   └── setIsTransitioning(false)  → LoadingOverlay hides
  ├── SceneCounter receives currentSlug + totalScenes
  ├── MobileInfoBar receives sceneName + onInfoClick
  └── OnboardingHint self-manages via localStorage
```

---

## Error Handling

| Scenario | Handling |
|---|---|
| Featured scene fetch fails in TourLanding | Shows error message with "Kembali ke Beranda" link |
| Scene transition fetch fails | `setLoadError` shows full-screen error message (existing behavior retained) |
| localStorage not available (SSR / private browsing) | `try/catch` wraps all localStorage calls; graceful degradation (onboarding shows every time, counter starts at 0) |
| Empty scene list from API | Sidebar shows loading spinner (existing behavior) |
| Scene has no title (empty string) | LoadingOverlay renders empty string (safe), SceneCounter still counts the slug |

---

## Animations & CSS

The following keyframe is added to `globals.css`:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(200%); }
  100% { transform: translateX(200%); }
}
```

All transition animations use Tailwind's `animate-in` / `fade-in` / `slide-in-from-*` utilities (provided by `tailwindcss-animate` or Next.js's built-in). Since the project uses Tailwind v4 which has `animate-in` from `@tailwindcss/animate`, no additional package is needed.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: LoadingOverlay Displays Target Scene Name

*For any* string used as a scene destination name, when the `LoadingOverlay` component renders with `isVisible=true` and that name as `targetSceneName`, the rendered output SHALL contain that exact string.

**Validates: Requirements 1.2**

---

### Property 2: OnboardingHint Visibility Is Gated by localStorage Flag

*For any* localStorage state: if the key `vtour_onboarding_shown` is absent, the `OnboardingHint` SHALL render its hint UI; if the key is present (any truthy value), the `OnboardingHint` SHALL render nothing (return null).

**Validates: Requirements 2.1, 2.4**

---

### Property 3: OnboardingHint Dismissal Writes localStorage Flag

*For any* invocation of `OnboardingHint` where the flag is absent, after the 3-second auto-dismiss timer fires, `localStorage.getItem('vtour_onboarding_shown')` SHALL equal `'true'`.

**Validates: Requirements 2.3**

---

### Property 4: MobileInfoBar Always Reflects Current Scene Title

*For any* `Scene` object passed as `sceneName` to `MobileInfoBar`, the rendered component SHALL contain the scene's title string verbatim.

**Validates: Requirements 3.2**

---

### Property 5: TourLanding Opens Viewer on CTA Click

*For any* initial state where `isViewerOpen` is `false`, clicking the "Mulai Tur" button SHALL set `isViewerOpen` to `true`, causing `PSViewer` to render.

**Validates: Requirements 4.3**

---

### Property 6: Sidebar Search Filter Correctness

*For any* non-empty query string `q` and any list of scenes, every scene in the filtered result SHALL have a title where `title.toLowerCase().includes(q.toLowerCase())` is `true`, and every scene excluded from the result SHALL NOT satisfy that condition.

**Validates: Requirements 5.1, 5.2**

---

### Property 7: Sidebar Search Empty Query Returns Full List

*For any* list of scenes, filtering with an empty string SHALL return all scenes unchanged (no scene is excluded).

**Validates: Requirements 5.5**

---

### Property 8: Hotspot Label Included in Marker SVG

*For any* hotspot of type `scene` with a non-empty `text` property, the SVG data URI generated by `buildArrowSvg(text)` SHALL contain the `text` string encoded within the SVG markup.

**Validates: Requirements 6.3**

---

### Property 9: Hotspot Label Has Dark Background for Readability

*For any* call to `buildArrowSvg(label)`, the returned SVG string SHALL contain a `rect` element with a dark fill attribute (e.g., `fill='rgba(0,0,0,...)'` or `fill='%23000'`) positioned to serve as the label background.

**Validates: Requirements 6.5**

---

### Property 10: SceneCounter Renders Correct Visited / Total Text

*For any* visited slug set of size X and any total scene count Y (Y ≥ X ≥ 0), the `SceneCounter` component SHALL render a string containing `X` and `Y` in the pattern "X dari Y lokasi dijelajahi".

**Validates: Requirements 8.1**

---

### Property 11: SceneCounter Visited Set Grows Monotonically

*For any* existing visited slug set and any new slug, calling `addVisited(set, slug)` SHALL return a set whose size is either equal to the original size (if `slug` was already present) or equal to `original.size + 1` (if `slug` was absent). The set SHALL always contain `slug` after the call.

**Validates: Requirements 8.2**

---

### Property 12: SceneCounter Progress Calculation Is Bounded and Proportional

*For any* visited count X (0 ≤ X ≤ Y) and total Y > 0, `calcProgress(X, Y)` SHALL return a value in the range [0, 100], and `calcProgress(Y, Y)` SHALL equal 100.

**Validates: Requirements 8.4**

---

### Property 13: SceneCounter localStorage Round-Trip

*For any* set of visited slugs persisted via `localStorage.setItem('vtour_visited_scenes', JSON.stringify([...slugs]))`, reading back with `JSON.parse(localStorage.getItem('vtour_visited_scenes'))` SHALL produce an array containing exactly the same slugs (order-independent comparison as a Set).

**Validates: Requirements 8.3, 8.5**
