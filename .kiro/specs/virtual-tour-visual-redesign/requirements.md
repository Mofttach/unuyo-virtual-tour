# Requirements Document

## Introduction

Fitur ini mencakup redesign visual menyeluruh pada aplikasi Virtual Tour UNU Yogyakarta berbasis Next.js 16, TypeScript, Tailwind CSS v4, dan Photo Sphere Viewer. Delapan peningkatan UI/UX akan diimplementasikan melalui komponen baru yang terpisah: LoadingOverlay, OnboardingHint, SceneCounter, MobileInfoBar, dan TourLanding. Tujuannya adalah meningkatkan keterbacaan, aksesibilitas mobile, estetika premium, dan kelancaran navigasi antar scene panorama 360°.

## Glossary

- **TourLanding**: Komponen halaman `/tour` yang menampilkan hero panorama dan tombol CTA "Mulai Tur" sebelum viewer dibuka.
- **PSViewer**: Komponen `PSViewer.tsx` yang mengintegrasikan Photo Sphere Viewer dan mengelola navigasi scene.
- **LoadingOverlay**: Komponen `LoadingOverlay.tsx` yang menampilkan status loading saat transisi antar scene.
- **OnboardingHint**: Komponen `OnboardingHint.tsx` yang menampilkan petunjuk interaksi pertama kali untuk pengguna baru.
- **SceneCounter**: Komponen `SceneCounter.tsx` yang menampilkan progres jumlah scene yang telah dijelajahi.
- **MobileInfoBar**: Komponen `MobileInfoBar.tsx` yang menampilkan nama scene dan tombol info di bagian bawah layar pada perangkat mobile.
- **Scene**: Objek data yang merepresentasikan satu lokasi panorama 360°, memiliki properti `slug`, `title`, `floor`, `building`, `hotspots`, dll.
- **Hotspot**: Titik interaktif di dalam panorama yang mengarah ke scene lain atau menampilkan informasi.
- **localStorage**: Web Storage API browser untuk menyimpan data persisten sisi klien.
- **unu-gold**: Warna brand UNU Yogyakarta dengan nilai `#d4af37`.
- **Overlay**: Lapisan UI yang ditampilkan di atas konten utama tanpa navigasi ke halaman baru.

## Requirements

### Requirement 1: Informatif Loading State

**User Story:** Sebagai pengunjung virtual tour, saya ingin melihat informasi yang jelas saat berpindah scene, sehingga saya tahu ke mana saya sedang diarahkan dan tidak merasa kebingungan selama loading.

#### Acceptance Criteria

1. WHEN transisi antar scene dimulai, THE LoadingOverlay SHALL menampilkan indeterminate progress bar bergaya premium di bagian bawah layar.
2. WHEN transisi antar scene dimulai, THE LoadingOverlay SHALL menampilkan nama scene tujuan yang sedang dimuat dalam teks yang terlihat jelas.
3. WHILE LoadingOverlay ditampilkan, THE LoadingOverlay SHALL menutupi seluruh area viewport dengan latar semi-transparan dan efek backdrop blur.
4. WHEN transisi selesai, THE LoadingOverlay SHALL menghilang dengan animasi fade-out dalam 300ms.
5. THE LoadingOverlay SHALL diimplementasikan sebagai komponen terpisah di `client/components/Viewer/LoadingOverlay.tsx`.

---

### Requirement 2: Onboarding Hint untuk Pengguna Baru

**User Story:** Sebagai pengunjung pertama kali, saya ingin melihat petunjuk cara menggunakan kontrol viewer, sehingga saya langsung memahami cara menjelajahi panorama tanpa harus menebak.

#### Acceptance Criteria

1. WHEN pengguna membuka viewer untuk pertama kali tanpa flag `vtour_onboarding_shown` di localStorage, THE OnboardingHint SHALL menampilkan animasi petunjuk interaksi selama 3 detik.
2. WHEN OnboardingHint ditampilkan, THE OnboardingHint SHALL menampilkan instruksi drag/swipe untuk memutar panorama dan instruksi klik/tap untuk navigasi hotspot.
3. WHEN OnboardingHint selesai ditampilkan selama 3 detik, THE OnboardingHint SHALL menghilang dengan animasi fade-out dan menyimpan flag `vtour_onboarding_shown = true` ke localStorage.
4. WHEN pengguna membuka viewer dan flag `vtour_onboarding_shown` sudah ada di localStorage, THE OnboardingHint SHALL tidak ditampilkan sama sekali.
5. THE OnboardingHint SHALL diimplementasikan sebagai komponen terpisah di `client/components/Viewer/OnboardingHint.tsx`.

---

### Requirement 3: Mobile Info Bar Permanen

**User Story:** Sebagai pengguna mobile, saya ingin selalu bisa melihat nama scene aktif dan mengakses informasinya, sehingga saya tidak kehilangan konteks posisi saya di dalam tour.

#### Acceptance Criteria

1. WHILE PSViewer aktif pada perangkat dengan lebar layar kurang dari 768px, THE MobileInfoBar SHALL ditampilkan secara permanen di bagian bawah layar.
2. THE MobileInfoBar SHALL menampilkan judul scene aktif (`currentScene.title`) secara real-time setiap kali scene berubah.
3. WHEN pengguna menekan tombol info pada MobileInfoBar, THE MobileInfoBar SHALL memicu tampilan deskripsi scene aktif dalam modal atau panel.
4. THE MobileInfoBar SHALL tidak menutupi hotspot atau kontrol navigasi utama pada viewport mobile.
5. THE MobileInfoBar SHALL diimplementasikan sebagai komponen terpisah di `client/components/Viewer/MobileInfoBar.tsx`.

---

### Requirement 4: Landing Page /tour dengan Hero Panorama dan Overlay Viewer

**User Story:** Sebagai pengunjung yang baru tiba di halaman `/tour`, saya ingin melihat landing page yang menarik dengan CTA "Mulai Tur", sehingga saya mendapat kesan pertama yang premium sebelum masuk ke viewer.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman `/tour`, THE TourLanding SHALL menampilkan tampilan hero dengan gambar panorama statis sebagai background.
2. THE TourLanding SHALL menampilkan tombol CTA berlabel "Mulai Tur" yang terlihat menonjol di atas hero panorama.
3. WHEN pengguna mengklik tombol "Mulai Tur" pada TourLanding, THE TourLanding SHALL memuat PSViewer sebagai full-screen overlay di halaman yang sama tanpa navigasi ke URL baru.
4. WHEN PSViewer overlay aktif, THE TourLanding SHALL tidak terlihat di belakang overlay dan PSViewer mengisi seluruh viewport.
5. THE TourLanding SHALL diimplementasikan sebagai komponen terpisah di `client/components/TourLanding.tsx` dan digunakan di `client/app/tour/page.tsx`.

---

### Requirement 5: Sidebar Search dan Floor Highlight

**User Story:** Sebagai pengunjung yang menggunakan menu navigasi sidebar, saya ingin bisa mencari scene berdasarkan nama dan melihat lantai mana yang sedang aktif, sehingga saya bisa menemukan lokasi yang saya cari lebih cepat.

#### Acceptance Criteria

1. THE PSViewer SHALL menampilkan input field pencarian di bagian atas sidebar yang memfilter daftar scene secara real-time berdasarkan teks yang diketik.
2. WHEN pengguna mengetikkan teks pada field pencarian, THE PSViewer SHALL memperbarui daftar scene yang ditampilkan agar hanya menampilkan scene yang judulnya mengandung teks tersebut (case-insensitive).
3. WHILE sidebar terbuka, THE PSViewer SHALL menampilkan highlight visual pada floor yang sesuai dengan `currentScene.floor` sehingga lantai aktif mudah diidentifikasi.
4. IF hasil pencarian tidak ditemukan, THEN THE PSViewer SHALL menampilkan pesan "Lokasi tidak ditemukan" di area daftar scene.
5. WHEN field pencarian dikosongkan, THE PSViewer SHALL menampilkan kembali seluruh daftar scene tanpa filter.

---

### Requirement 6: Hotspot Arrow Premium

**User Story:** Sebagai pengunjung virtual tour, saya ingin hotspot panah terlihat lebih premium dengan efek visual yang menarik dan label nama scene di bawahnya, sehingga navigasi antar lokasi terasa lebih intuitif dan indah.

#### Acceptance Criteria

1. THE PSViewer SHALL merender hotspot bertipe `scene` dengan ikon panah yang memiliki efek glow berwarna `unu-gold` (#d4af37).
2. THE PSViewer SHALL merender hotspot bertipe `scene` dengan animasi pulse halus yang berulang secara periodik pada ikon panah.
3. THE PSViewer SHALL menampilkan label teks nama scene tujuan di bawah ikon panah hotspot bertipe `scene`.
4. WHEN pengguna mengarahkan kursor ke hotspot panah pada perangkat desktop, THE PSViewer SHALL menampilkan efek hover yang meningkatkan intensitas glow.
5. THE PSViewer SHALL mempertahankan keterbacaan label nama scene pada berbagai kondisi latar panorama dengan menggunakan latar teks semi-transparan gelap.

---

### Requirement 7: Smooth Transition dan Scene Name Overlay

**User Story:** Sebagai pengunjung virtual tour, saya ingin perpindahan antar scene terasa halus dengan animasi fade dan nama scene yang muncul sebentar di layar, sehingga pengalaman navigasi terasa sinematik dan tidak tiba-tiba.

#### Acceptance Criteria

1. WHEN transisi ke scene baru dimulai, THE PSViewer SHALL menerapkan animasi fade-out pada panorama aktif sebelum memuat panorama baru.
2. WHEN panorama baru selesai dimuat, THE PSViewer SHALL menerapkan animasi fade-in pada panorama baru.
3. WHEN scene baru berhasil dimuat, THE PSViewer SHALL menampilkan overlay teks nama scene baru (`newScene.title`) di tengah viewport selama 1.5 detik.
4. WHEN overlay nama scene ditampilkan, THE PSViewer SHALL merender teks dengan gaya tipografi yang mencolok dan latar semi-transparan di tengah layar.
5. WHEN durasi 1.5 detik berakhir, THE PSViewer SHALL menghilangkan overlay nama scene dengan animasi fade-out dalam 300ms.

---

### Requirement 8: Scene Counter dengan Progress Tracking

**User Story:** Sebagai pengunjung virtual tour, saya ingin melihat berapa banyak lokasi yang sudah saya jelajahi dari total keseluruhan, sehingga saya termotivasi untuk menjelajahi lebih banyak scene.

#### Acceptance Criteria

1. THE SceneCounter SHALL menampilkan teks "X dari Y lokasi dijelajahi" di mana X adalah jumlah scene unik yang telah dikunjungi dan Y adalah total scene yang tersedia.
2. WHEN pengguna berpindah ke scene baru, THE SceneCounter SHALL memperbarui nilai X dengan menambahkan slug scene baru ke daftar scene yang telah dikunjungi.
3. THE SceneCounter SHALL menyimpan daftar slug scene yang telah dikunjungi ke localStorage dengan key `vtour_visited_scenes` agar progres persisten antar sesi.
4. THE SceneCounter SHALL menampilkan progress bar yang mencerminkan persentase scene yang telah dikunjungi relatif terhadap total scene.
5. WHEN pengguna membuka kembali viewer dalam sesi baru, THE SceneCounter SHALL membaca data dari localStorage `vtour_visited_scenes` dan melanjutkan progres dari sesi sebelumnya.
6. THE SceneCounter SHALL diimplementasikan sebagai komponen terpisah di `client/components/Viewer/SceneCounter.tsx`.
