# Implementation Plan: Virtual Tour Visual Redesign

## Overview

Implementasi redesign visual untuk Virtual Tour UNU Yogyakarta. Lima komponen baru dibuat (`LoadingOverlay`, `OnboardingHint`, `SceneCounter`, `MobileInfoBar`, `TourLanding`) dan dua file yang ada dimodifikasi (`PSViewer.tsx`, `app/tour/page.tsx`). Stack: Next.js 16, TypeScript, Tailwind CSS v4, React 19.

## Tasks

- [ ] 1. Setup testing framework dan shimmer animation
  - [ ] 1.1 Install Vitest, @testing-library/react, jsdom, dan happy-dom sebagai devDependencies di `client/`
    - Run: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom`
    - Buat `client/vitest.config.ts` dengan environment jsdom
    - Buat `client/vitest.setup.ts` yang mengimpor `@testing-library/jest-dom`
    - Tambahkan script `"test": "vitest --run"` ke `client/package.json`
    - _Requirements: 1.5, 2.5, 3.5, 4.5, 8.6_

  - [ ] 1.2 Tambahkan keyframe `shimmer` ke `client/app/globals.css`
    - Tambahkan `@keyframes shimmer { 0% { transform: translateX(-100%); } 50% { transform: translateX(200%); } 100% { transform: translateX(200%); } }`
    - _Requirements: 1.1_

- [ ] 2. Implementasi `LoadingOverlay` component
  - [ ] 2.1 Buat `client/components/Viewer/LoadingOverlay.tsx`
    - Props: `isVisible: boolean`, `targetSceneName: string`
    - Render `fixed inset-0 z-40 bg-black/50 backdrop-blur-md` overlay ketika `isVisible = true`
    - Tampilkan teks "Menuju" (uppercase, tracked) dan `targetSceneName` di tengah
    - Tampilkan spinner `border-t-unu-gold rounded-full animate-spin`
    - Tampilkan indeterminate progress bar di `fixed bottom-0` dengan class `animate-[shimmer_1.5s_ease-in-out_infinite]`
    - Gunakan `animate-in fade-in duration-300` saat muncul; kembalikan `null` jika `!isVisible`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Tulis property test untuk `LoadingOverlay` (Property 1)
    - Buat `client/components/Viewer/__tests__/LoadingOverlay.test.tsx`
    - **Property 1: LoadingOverlay Displays Target Scene Name**
    - **Validates: Requirements 1.2**
    - Test: untuk sembarang string `targetSceneName`, render `<LoadingOverlay isVisible={true} targetSceneName={name} />` → rendered output harus mengandung string tersebut

- [ ] 3. Implementasi `OnboardingHint` component
  - [ ] 3.1 Buat `client/components/Viewer/OnboardingHint.tsx`
    - Props: `onDismiss?: () => void`
    - State: `const [visible, setVisible] = useState(false)`
    - `useEffect`: cek `localStorage.getItem('vtour_onboarding_shown')`. Jika tidak ada → set `visible = true`, mulai timer 3 detik → setelah 3 detik set `localStorage.setItem('vtour_onboarding_shown', 'true')`, set `visible = false`
    - Bungkus semua `localStorage` dalam `try/catch` untuk SSR safety
    - Jika flag ada, langsung return `null`
    - Tampilkan dua instruction card: "Seret / Geser" untuk memutar panorama, "Klik / Tap panah" untuk navigasi hotspot
    - Gunakan `fixed inset-0 z-50` dengan `bg-black/40 backdrop-blur-sm`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Tulis property tests untuk `OnboardingHint` (Properties 2 & 3)
    - Buat `client/components/Viewer/__tests__/OnboardingHint.test.tsx`
    - **Property 2: OnboardingHint Visibility Is Gated by localStorage Flag**
    - **Validates: Requirements 2.1, 2.4**
    - Test: jika `vtour_onboarding_shown` tidak ada di localStorage → komponen merender hint UI; jika ada → merender `null`
    - **Property 3: OnboardingHint Dismissal Writes localStorage Flag**
    - **Validates: Requirements 2.3**
    - Test: setelah timer 3 detik mocked via `vi.useFakeTimers()` → `localStorage.getItem('vtour_onboarding_shown')` harus `'true'`

- [ ] 4. Implementasi `SceneCounter` component dan pure helpers
  - [ ] 4.1 Buat `client/components/Viewer/SceneCounter.tsx` beserta pure helper exports
    - Props: `currentSlug: string`, `totalScenes: number`
    - Export pure helpers: `addVisited(current: Set<string>, slug: string): Set<string>` dan `calcProgress(visited: number, total: number): number`
    - State: `const [visitedSlugs, setVisitedSlugs] = useState<Set<string>>(new Set())`
    - `useEffect` on mount: baca `vtour_visited_scenes` dari localStorage, parse sebagai `string[]`, inisialisasi `Set`
    - `useEffect` pada `currentSlug`: panggil `addVisited`, simpan ke localStorage, update state
    - Render `"X dari Y lokasi dijelajahi"` dan progress bar
    - `calcProgress` mengembalikan `0` jika `total === 0`, nilai dibatasi 0-100
    - Gunakan `fixed bottom-4 left-4 z-20` atau sesuaikan agar tidak menutupi kontrol lain
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 4.2 Tulis property tests untuk `SceneCounter` helpers (Properties 10, 11, 12, 13)
    - Buat `client/components/Viewer/__tests__/SceneCounter.test.ts`
    - **Property 10: SceneCounter Renders Correct Visited / Total Text**
    - **Validates: Requirements 8.1**
    - **Property 11: SceneCounter Visited Set Grows Monotonically**
    - **Validates: Requirements 8.2** — `addVisited(set, slug).size` === `set.has(slug) ? set.size : set.size + 1`
    - **Property 12: SceneCounter Progress Calculation Is Bounded and Proportional**
    - **Validates: Requirements 8.4** — `0 ≤ calcProgress(X, Y) ≤ 100`, `calcProgress(Y, Y) === 100`
    - **Property 13: SceneCounter localStorage Round-Trip**
    - **Validates: Requirements 8.3, 8.5**

- [ ] 5. Checkpoint — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan kepada user jika ada pertanyaan.

- [ ] 6. Implementasi `MobileInfoBar` component
  - [ ] 6.1 Buat `client/components/Viewer/MobileInfoBar.tsx`
    - Props: `sceneName: string`, `sceneDescription?: string`, `onInfoClick: () => void`
    - Render `fixed bottom-0 left-0 right-0 z-30 md:hidden`
    - Layout: indikator dot unu-gold (pulse), scene title (truncate flex-1), tombol "ⓘ"
    - Gunakan `bg-black/80 backdrop-blur-md border-t border-white/10`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Tulis property test untuk `MobileInfoBar` (Property 4)
    - Buat `client/components/Viewer/__tests__/MobileInfoBar.test.tsx`
    - **Property 4: MobileInfoBar Always Reflects Current Scene Title**
    - **Validates: Requirements 3.2**
    - Test: untuk sembarang string `sceneName` → rendered output harus mengandung string tersebut

- [ ] 7. Implementasi `TourLanding` component
  - [ ] 7.1 Buat `client/components/TourLanding.tsx`
    - State: `startScene`, `isViewerOpen`, `error` (sama seperti `app/tour/page.tsx` saat ini)
    - `useEffect` on mount: fetch `/api/scenes/featured/` dan set `startScene`
    - Render hero: `bg-hero-wide.webp` sebagai background, overlay gelap, logo, judul universitas, tombol CTA "Mulai Tur"
    - Tombol "Mulai Tur" onClick: `setIsViewerOpen(true)`
    - Jika `isViewerOpen === true`: render `<PSViewer initialData={startScene} />` sebagai `fixed inset-0 z-50` overlay
    - Handle error state dengan "Kembali ke Beranda" link
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.2 Tulis property test untuk `TourLanding` (Property 5)
    - Buat `client/components/__tests__/TourLanding.test.tsx`
    - **Property 5: TourLanding Opens Viewer on CTA Click**
    - **Validates: Requirements 4.3**
    - Test: mock fetch, render `TourLanding` dengan `startScene` tersedia, klik "Mulai Tur" → `PSViewer` harus ter-render

- [ ] 8. Modifikasi `PSViewer.tsx` — Sidebar search dan floor highlight
  - [ ] 8.1 Tambahkan state `searchQuery` dan filter logic ke `PSViewer.tsx`
    - Tambahkan `const [searchQuery, setSearchQuery] = useState('')`
    - Tambahkan `const filteredScenes = (scenes: Scene[]) => scenes.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))`
    - Tambahkan input field pencarian di bagian atas sidebar (`<input>` dengan `value={searchQuery}` dan `onChange`)
    - Terapkan `filteredScenes` pada scene list di dalam sidebar render
    - Jika semua floor kosong setelah filter → tampilkan `<p>Lokasi tidak ditemukan</p>`
    - Jika `searchQuery` dikosongkan → tampilkan semua scene kembali
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ]* 8.2 Tulis property tests untuk sidebar search filter (Properties 6 & 7)
    - Buat `client/components/Viewer/__tests__/PSViewer.filter.test.ts`
    - **Property 6: Sidebar Search Filter Correctness**
    - **Validates: Requirements 5.1, 5.2** — setiap scene dalam hasil filter harus memiliki `title.toLowerCase().includes(q.toLowerCase())`
    - **Property 7: Sidebar Search Empty Query Returns Full List**
    - **Validates: Requirements 5.5** — filter dengan string kosong mengembalikan seluruh daftar

  - [ ] 8.3 Tambahkan active floor highlight ke sidebar `PSViewer.tsx`
    - Di dalam render floor label, tambahkan kondisi: `const isActiveFloor = currentScene.floor !== null && scene.floor === currentScene.floor && building === currentScene.building`
    - Ganti class floor label menjadi conditional: `isActiveFloor ? 'text-unu-gold font-bold' : 'text-gray-400'`
    - _Requirements: 5.3_

- [ ] 9. Modifikasi `PSViewer.tsx` — Premium hotspot arrow dan scene name overlay
  - [ ] 9.1 Ganti `arrowSvg` dengan fungsi `buildArrowSvg(label: string)` di `PSViewer.tsx`
    - Buat fungsi `buildArrowSvg(label: string): string` yang menghasilkan SVG data URI
    - SVG harus mengandung `<feDropShadow>` dengan `flood-color` unu-gold (#d4af37) untuk efek glow
    - SVG harus mengandung `<rect>` gelap (fill semi-transparan gelap) sebagai latar label
    - SVG harus mengandung teks label (`h.text`, maks 20 karakter) di bawah ikon panah
    - Pertahankan animasi `animateTransform` pulse
    - Update `createMarkers` untuk memanggil `buildArrowSvg(h.text)` untuk hotspot bertipe `scene`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 9.2 Tulis property tests untuk `buildArrowSvg` (Properties 8 & 9)
    - Buat `client/components/Viewer/__tests__/PSViewer.hotspot.test.ts`
    - **Property 8: Hotspot Label Included in Marker SVG**
    - **Validates: Requirements 6.3** — `buildArrowSvg(text)` harus mengandung `text` (atau encoded equivalent) dalam markup SVG
    - **Property 9: Hotspot Label Has Dark Background for Readability**
    - **Validates: Requirements 6.5** — SVG yang dihasilkan harus mengandung elemen `rect` dengan fill gelap

  - [ ] 9.3 Tambahkan state `sceneNameOverlay` dan `targetSceneName` ke `PSViewer.tsx`
    - Tambahkan `const [sceneNameOverlay, setSceneNameOverlay] = useState<string | null>(null)`
    - Tambahkan `const [targetSceneName, setTargetSceneName] = useState('')`
    - Di awal `loadScene(slug)`: `const targetTitle = sceneList.find(s => s.slug === slug)?.title || slug; setTargetSceneName(targetTitle);`
    - Setelah `setPanorama` resolve: `setSceneNameOverlay(newSceneData.title); setTimeout(() => setSceneNameOverlay(null), 1500);`
    - Render scene name overlay: `{sceneNameOverlay && <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">...</div>}`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Integrasi semua komponen baru ke `PSViewer.tsx`
  - [ ] 10.1 Import dan render `LoadingOverlay`, `OnboardingHint`, `SceneCounter`, `MobileInfoBar` di `PSViewer.tsx`
    - Import semua komponen baru
    - Ganti blok "Loading Overlay" yang ada dengan `<LoadingOverlay isVisible={isTransitioning} targetSceneName={targetSceneName} />`
    - Tambahkan `<OnboardingHint />` setelah LoadingOverlay
    - Tambahkan `<SceneCounter currentSlug={currentScene.slug} totalScenes={sceneList.length} />` di posisi `bottom-left`
    - Tambahkan `<MobileInfoBar sceneName={currentScene.title} sceneDescription={currentScene.description} onInfoClick={() => setShowInfo(true)} />`
    - Pastikan `MobileInfoBar` tidak menutupi hotspot (sesuaikan z-index dan posisi kontrol lain)
    - _Requirements: 1.3, 1.4, 2.1, 3.1, 3.2, 3.3, 3.4, 8.1_

- [ ] 11. Modifikasi `app/tour/page.tsx` — Gunakan `TourLanding`
  - [ ] 11.1 Refactor `client/app/tour/page.tsx` untuk menggunakan `TourLanding`
    - Hapus semua logic fetch dan state dari `tour/page.tsx`
    - Ganti seluruh konten dengan `import TourLanding from '@/components/TourLanding'; export default function TourIndexPage() { return <TourLanding />; }`
    - _Requirements: 4.5_

- [ ] 12. Final Checkpoint — Pastikan semua tests lulus dan build berhasil
  - Jalankan `npm run test` di `client/` dan pastikan semua tests lulus.
  - Jalankan `npm run build` di `client/` dan pastikan tidak ada error TypeScript.
  - Tanyakan kepada user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task merujuk ke requirements spesifik untuk traceability
- Checkpoint memastikan validasi bertahap
- Property tests memvalidasi correctness properties dari design document
- Unit tests memvalidasi edge cases dan contoh spesifik
- Tidak ada test framework yang terinstal saat ini — Task 1.1 harus diselesaikan terlebih dahulu sebelum task test apapun dapat dijalankan

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "6.2", "7.2", "8.1"] },
    { "id": 3, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 4, "tasks": ["9.2", "9.3"] },
    { "id": 5, "tasks": ["10.1"] },
    { "id": 6, "tasks": ["11.1"] }
  ]
}
```
