# 3well — Product Requirements Document (PRD)

> **Brand:** 3well  
> **Tagline:** *well, well, well.*  
> **Product type:** Mobile-first Progressive Web App (PWA)  
> **Document version:** 1.0  
> **Date:** 10 November 2026  
> **Status:** Product blueprint — siap untuk desain dan pengembangan MVP  
> **Product owner:** 3well Team

---

## 1. Executive Summary

**3well** adalah aplikasi web berbasis mobile untuk membantu pengguna menjalani **cutting (fat loss)**, **bulking (weight gain/muscle gain)**, atau **maintenance** secara lebih terukur. Tiga hal yang biasanya dicatat secara terpisah—berat badan, makanan, dan latihan—disatukan menjadi satu sistem yang menunjukkan **apa yang dilakukan hari ini, apa dampaknya dalam beberapa minggu, dan apa yang perlu disesuaikan berikutnya**.

3well bukan hanya penghitung kalori atau pencatat gym. Nilai utamanya adalah **menghubungkan input sehari-hari dengan perkembangan aktual** tanpa memberi kesan bahwa estimasi kalori maupun prediksi berat badan pasti akurat.

### Tiga pilar produk

| Pilar | Nama produk | Fokus | Pertanyaan yang dijawab |
|---|---|---|---|
| 01 | **Well-Fueled** | Food & nutrition | Sudah makan berapa kalori/protein hari ini? |
| 02 | **Well-Trained** | Workout & activity | Apa yang sudah dilatih dan bagaimana progres kekuatannya? |
| 03 | **Well-Progressed** | Weight & insights | Apakah berat badan bergerak sesuai tujuan? |

**Janji produk:** *Track less. Understand more. Progress better.*

**North Star Metric:** Persentase pengguna aktif yang memiliki data cukup untuk menerima **weekly progress review** yang bermakna (minimal log berat serta log nutrisi/latihan yang relevan pada minggu itu). Produk tidak hanya mengejar banyaknya entry.

---

## 2. Problem Statement

Pengguna yang ingin diet atau bulk menghadapi lima persoalan utama:

1. Berat badan fluktuatif karena air, garam, glikogen, dan waktu penimbangan; perubahan harian mudah disalahartikan sebagai naik/turun lemak.
2. Kalori makanan lokal sulit dicari, terutama nasi, lauk warteg, masakan rumahan, sambal, dan porsi yang tidak ditimbang.
3. Workout dicatat sebagai sets/reps, tetapi hasilnya tidak terhubung dengan estimasi aktivitas atau progres tubuh.
4. Aplikasi sering menunjukkan angka kalori terbakar seolah-olah presisi dan menghitung aktivitas dua kali dalam target energi.
5. Pengguna tidak tahu apakah strategi mereka berhasil sampai beberapa minggu berlalu.

### Product opportunity

Membangun produk yang **cepat digunakan setiap hari**, **cocok dengan pola makan Indonesia**, dan memberikan **proyeksi berbentuk rentang beserta tingkat keyakinan**, bukan janji hasil instan.

---

## 3. Product Goals, Non-Goals, dan Prinsip

### 3.1 Product goals

- Pengguna bisa menyelesaikan onboarding dalam **≤ 3 menit**.
- Pengguna bisa mencatat berat badan dalam **≤ 10 detik** setelah aplikasi dibuka.
- Pengguna bisa mencatat makanan yang sering dikonsumsi dalam **≤ 20 detik** melalui recent/favorites.
- Pengguna bisa memulai workout dari template dalam **≤ 3 tap**.
- Pengguna memahami tren berat **7 hari**, bukan terpaku pada satu titik data.
- Pengguna memahami selisih asupan, target, dan estimasi aktivitas tanpa penghitungan ganda.
- Pengguna bisa melakukan review dan penyesuaian target setiap minggu.

### 3.2 Non-goals untuk MVP

- Bukan diagnosis medis, treatment obesitas, atau pengganti ahli gizi/dokter.
- Bukan wearable fitness tracker atau smart scale native app.
- Bukan alat akurat untuk menghitung kalori tiap repetisi atau menentukan perubahan lemak tubuh persis.
- Bukan aplikasi social feed, marketplace suplemen, atau coaching AI percakapan.
- Bukan aplikasi yang menuntut pengguna membakar setiap kalori makanan lewat olahraga.

### 3.3 Product principles

1. **Fast before fancy.** Data entry harus lebih cepat daripada membuka notes.
2. **Trend over noise.** Rata-rata dan tren lebih penting daripada fluktuasi harian.
3. **Estimate, don't pretend.** Beri label *estimasi* dan rentang jika data tidak pasti.
4. **Indonesian-first.** Makanan, ukuran porsi, istilah, dan satuan mengikuti kebutuhan pengguna Indonesia.
5. **No shame UX.** Tidak ada copywriting yang mempermalukan pengguna karena makan, skip workout, atau naik berat.
6. **Privacy by design.** Data berat badan dan kebiasaan makan bersifat sensitif.
7. **Buildable MVP.** Fitur kompleks disimpan untuk roadmap, bukan memblokir peluncuran.

---

## 4. Target Users & Jobs to Be Done

### Primary persona A — The Cutter

Mahasiswa/pekerja usia dewasa yang gym 2–5 kali seminggu, ingin menurunkan lemak sambil mempertahankan kekuatan dan massa otot. Butuh target kalori yang realistis dan tracking cepat.

> *Saat saya sedang cutting, saya ingin tahu apakah tren berat saya menuju target tanpa panik karena angka timbangan naik dalam satu hari.*

### Primary persona B — The Lean Bulker

Pengguna gym yang ingin menaikkan berat dengan surplus terkendali. Butuh pelacakan protein, konsistensi latihan, dan kecepatan kenaikan berat yang tidak terlalu agresif.

> *Saat saya bulking, saya ingin melihat apakah saya benar-benar lebih kuat dan bertambah berat dengan laju yang saya pilih.*

### Secondary persona C — The Maintainer

Pengguna yang ingin menjaga berat badan, memperbaiki rutinitas, dan memahami pola makan serta aktivitas tanpa target perubahan berat.

### Batasan usia

Produk self-guided ditujukan untuk **orang dewasa (18+)**. Alur untuk remaja, kehamilan/menyusui, atau kondisi klinis memerlukan desain dan panduan khusus di luar cakupan MVP.

---

## 5. Positioning & Differentiation

**Category:** Personal nutrition + workout + weight intelligence app.

**Positioning statement:** *3well menghubungkan kalori makanan, latihan gym, dan tren berat badan dalam satu dashboard minimalis yang mudah dipakai dari smartphone.*

| Dibanding aplikasi biasa | Pendekatan 3well |
|---|---|
| Hanya penghitung kalori | Nutrisi + lifting log + tren berat |
| Fokus timbang harian | Grafik 7-day rolling average + penjelasan fluktuasi |
| Kalori gym terlihat sangat presisi | Estimasi berbasis durasi/intensitas dengan rentang dan label keyakinan |
| Target kalori dibuat sekali | Evaluasi setiap 7–14 hari berdasarkan data nyata |
| Database makanan global | Fast-add makanan Indonesia, porsi lokal, dan custom recipes |
| Prediksi satu angka mutlak | Skenario 30 hari dengan rentang dan confidence |

### Signature feature: **3well Loop**

`Log Food → Log Workout → Weigh In → Understand Trend → Weekly Adjustment → Repeat`

Inilah alur yang menyatukan ketiga pilar, bukan tiga fitur independen.

---

## 6. Information Architecture & Navigation

### Bottom navigation (mobile)

1. **Today** — ringkasan harian dan quick actions.
2. **Food** — meal log, nutrition search, recipes.
3. **Train** — workout session, templates, history.
4. **Progress** — berat badan, grafik, forecast, review.

**Floating `+` button**: quick-add `Weight`, `Food`, `Workout`, `Water` (opsional); jangan sampai menutupi navigasi atau CTA.

**Top bar**: wordmark 3well, tanggal aktif, avatar/settings. Tab `Insights` dapat ditempatkan di dalam Progress agar tidak terlalu banyak tab.

### Site map

```text
3well
├── Landing (publik)
├── Auth (email / Google, jika tersedia)
├── Onboarding
│   ├── Goal: Cut / Bulk / Maintain
│   ├── Body profile
│   ├── Activity & training frequency
│   ├── Goal & preferred pace
│   └── Calorie plan review
└── App
    ├── Today
    ├── Food
    │   ├── Food search / Recent / Favorites
    │   ├── Meal detail & portion editor
    │   └── Custom food / Recipe
    ├── Train
    │   ├── Templates
    │   ├── Active session
    │   └── Workout history / Personal records
    ├── Progress
    │   ├── Weight log & chart
    │   ├── 30-day forecast
    │   ├── Nutrition / strength trends
    │   └── Weekly review
    └── Settings
        ├── Goal & targets
        ├── Units, timezone & preferences
        └── Data export / Delete account
```

---

## 7. Core User Journeys

### Journey A — First use

`Visit landing → Sign up → Choose Cut/Bulk/Maintain → Enter profile → Review recommended calorie target → Land on Today → Optional first weigh-in`

- Input wajib: goal, usia, tinggi, berat awal, tingkat aktivitas; informasi lain opsional bila tidak dibutuhkan.
- Agar estimasi metabolisme lebih baik, aplikasi dapat meminta parameter fisiologis yang relevan dengan rumus; beri penjelasan dan alternatif **custom calorie target** jika pengguna tidak ingin mengisi.
- Target berat dan tanggal boleh diubah; timeline yang terlalu agresif diberi peringatan non-menghakimi.
- User harus bisa mengubah rekomendasi, bukan dipaksa mengikuti angka aplikasi.

### Journey B — Daily weight update

`Today → Add weight → Enter 87.8 kg → Save → Chart + forecast recalculate → Success toast`

- Prefill berat terakhir; tanggal default adalah tanggal lokal pengguna.
- Satu entri resmi per hari untuk grafik standar; entry pada hari yang sama dapat diperbarui.
- Data lama bisa diedit, semua perubahan ditandai timestamp.

### Journey C — Log food

`Food → Search 'nasi merah' → Select portion → Assign meal → Save → Today nutrition summary refresh`

Fallback: `Recent`, `Favorite`, `Custom Food`, atau `Quick Calories` bila item tidak ditemukan. Quick calories tidak otomatis memiliki protein/karbo/lemak yang diketahui.

### Journey D — Log gym

`Train → Start Push Day → Bench Press → 3 sets × 8 reps × 40 kg → Add other exercises → End session → Workout summary`

Summary menampilkan durasi, total set, total volume, estimated activity calories (range), dan best-set/PR jika ada. Untuk estimasi energi, data durasi dan intensitas harus ada atau pengguna menerima asumsi default dengan label low confidence.

### Journey E — Weekly review

`Progress → Weekly Review → See weight trend / intake consistency / workout progress → Keep or adjust plan → Confirm`

Jika data minim, aplikasi mengatakan *belum cukup data* dan tidak memaksakan kesimpulan.

---

## 8. Functional Requirements

### 8.1 F01 — Goal & Calorie Planner [P0 — MVP]

**Input:** age (dewasa), height, current weight, goal (`cut`, `bulk`, `maintain`), activity level, optional body parameters, optional goal weight, target pace.

**Output:** estimated BMR, estimated TDEE, daily food-calorie target, target direction, planned weekly rate, editable macro targets.

**Rules:**

- Default mode: **Fixed Daily Budget**. Aktivitas rata-rata sudah termasuk dalam estimasi TDEE; workout log **tidak otomatis menambah** budget makan supaya aktivitas tidak dihitung dua kali.
- Preview konservatif untuk cut/bulk, dengan peringatan untuk laju yang ekstrem. Default cut mengikuti rentang moderat, bukan memaksimalkan kecepatan.
- Angka rekomendasi tidak boleh menjadi instruksi medis dan harus dapat diedit.
- Hitung ulang target ketika berat atau aktivitas berubah material, setelah persetujuan pengguna.
- Simpan versi target berdasarkan tanggal efektif agar data masa lalu tidak berubah ketika goal diperbarui.

**Acceptance criteria:**

- [ ] Cut menghasilkan target di bawah estimated maintenance; bulk di atas; maintain mendekati maintenance.
- [ ] Workout yang dilog tidak otomatis menambah food budget dalam default mode.
- [ ] Input tidak masuk akal, goal terlalu agresif, dan estimated target sangat rendah memicu validasi/peringatan.
- [ ] Hasil target mempunyai label `estimate` dan bisa diedit.

### 8.2 F02 — Daily Weight Tracker [P0 — MVP]

**Features:**

- Add/edit/delete timbang harian (kg default; lb opsional).
- Weight history: calendar + line chart 7/30/90 hari.
- Overlay daily weight vs **7-day moving average**.
- Highlight perubahan 7 dan 30 hari dari tren, bukan hanya latest-to-latest.
- Goal line dan label pencapaian milestone.
- Penimbangan saat pagi, setelah ke kamar mandi, sebelum sarapan direkomendasikan sebagai praktik konsisten (bukan syarat).
- Opsional: note ringan `late meal`, `travel`, `higher sodium`, `menstrual cycle`, dll. Tidak digunakan sebagai diagnosis.

**Acceptance criteria:**

- [ ] Input baru tampil di chart dan Today.
- [ ] Duplicate date ditangani sebagai edit/upsert, tidak menghasilkan data ganda.
- [ ] Missing days tidak diisi dengan berat palsu atau nol.
- [ ] Grafik menjelaskan bahwa perubahan harian bisa mencerminkan cairan.

### 8.3 F03 — 30-Day Weight Forecast [P0 basic / P1 enhanced]

**UI:** `Possible weight in 30 days: 85.9–87.1 kg` (hanya **contoh tampilan**, bukan prediksi untuk pengguna tertentu) dengan label *Low / Medium / High confidence*, baseline weight trend, dan penjelasan faktor ketidakpastian.

**Forecast states:**

1. **Belum cukup data:** Jika belum ada riwayat memadai, tampilkan *goal-based scenario* sebagai ilustrasi bersyarat, **bukan personal prediction**.
2. **Early forecast:** Setelah sejumlah hari timbang dan rentang hari memadai, perlihatkan arah sementara dengan confidence rendah.
3. **Trend-based:** Gunakan smoothed weight data minimal sekitar 2 minggu, lebih baik 3–4 minggu; model perkiraan tren dengan batas ketidakpastian.

**MVP approach:**

- Hitung moving average berbasis hari dengan data yang ada; jangan mengarang measurement pada hari kosong.
- Gunakan slope robust dari tren berat (mis. regresi pada rata-rata berjalan/robust regression), bukan satu titik awal/akhir.
- Proyeksi pusat `current smoothed weight + estimated daily slope × 30`.
- Bangun prediction interval dari volatilitas dan jumlah data; interval melebar bila data sedikit/noisy.
- Jika slope terlalu ekstrem/tidak stabil, gunakan `insufficient reliable trend` dibanding menampilkan angka meyakinkan.
- Jelaskan bahwa perubahan massa tubuh tidak linier dan tidak semuanya adalah lemak/otot.

**Enhanced P1:** Forecast berbasis campuran tren aktual + pola asupan + tingkat kepatuhan, dievaluasi terhadap data aktual; bukan kalkulasi statis 7.700 kcal/kg sebagai hukum pasti.

**Acceptance criteria:**

- [ ] Forecast dinonaktifkan atau ditandai sebagai scenario sampai minimum data tersedia.
- [ ] Nilai forecast berbentuk rentang dengan confidence dan timestamp model.
- [ ] Data noisy/missing tidak mengeluarkan klaim presisi tinggi.
- [ ] Forecast langsung diperbarui setelah entry historis diedit.

### 8.4 F04 — Food & Nutrition Logger [P0 — MVP]

**Features:**

- Meal buckets: Breakfast, Lunch, Dinner, Snack; label bisa diganti.
- Search food database internal yang diawali koleksi makanan Indonesia.
- Entry mode: berat gram, jumlah porsi, household measures (`sendok nasi`, `centong`, `potong`, `butir`, `gelas`), jika tersedia konversi yang didokumentasikan.
- Calories, protein, carbs, fat; fiber opsional bila sumber ada.
- Recent foods, favorites, repeat meal, copy yesterday.
- Create **custom food** dari label kemasan (MVP); **custom recipe** dari bahan + total servings pada P1.
- `Quick Add Calories` saat detail nutrisi tidak tersedia; tampilkan macro sebagai `unknown`, bukan nol.
- Source indicator: verified label, curated database, user-created, unverified estimate.
- Perbedaan mentah/matang dan ukuran saji wajib jelas. Untuk masakan campuran, hasil tetap estimasi.

**Food starter pack — Indonesia (contoh kategori, tanpa mengasumsikan nilai kalori):** nasi putih/merah; ayam dada/paha; telur; tempe; tahu; ikan; sayur; soto; gado-gado; ayam geprek; bakso; mi; nasi padang; makanan warteg; sambal; minyak/topping; minuman berpemanis.

**Acceptance criteria:**

- [ ] Pengguna bisa mencatat makanan tanpa API eksternal.
- [ ] Nilai nutrisi dihitung konsisten dengan gram/porsi; total meal = jumlah entri.
- [ ] Makanan buatan sendiri dapat diedit; pada P1, custom recipe juga dapat diedit.
- [ ] Sumber dan kemungkinan ketidakakuratan data jelas.

### 8.5 F05 — Daily Nutrition Dashboard [P0 — MVP]

**Display:**

- `Consumed`: energi makanan tercatat hari ini.
- `Food target`: target intake harian.
- `Remaining / over`: target dikurangi asupan; boleh negatif, tanpa warna atau bahasa menghukum.
- Protein tracker dengan target editable; carbs & fat as supporting information.
- Meal timeline and one-tap edit.
- Status completeness: `Food log may be incomplete` jika user menandai belum semua tercatat.

**Important:** Jangan beri label `net calories` yang mengurangi asupan dengan estimasi latihan secara otomatis. Pisahkan **intake**, **estimated baseline expenditure**, dan **recorded activity**.

### 8.6 F06 — Workout Logger [P0 — MVP]

**Features:**

- Exercise catalog: nama, muscle group, equipment, tipe resistance/cardio, default unit.
- Custom exercise.
- Workout templates: Full Body, Push, Pull, Legs, Upper, Lower, Cardio, Custom.
- Active session timer (start, pause, finish).
- Per exercise: sets, reps, weight (kg), optional RPE/RIR, rest time, notes.
- Cardio: type, duration, optional speed, incline, distance, intensity.
- Auto populate last performance for same movement.
- Volume `Σ sets (reps × load)`, best set, weekly set totals per muscle group (perkiraan; hindari menghitung set compound secara terlalu pasti).
- PR notifications: estimated 1RM dan/or highest weight/volume; estimasi diberi label.

**Important:** Set/reps saja **tidak cukup** untuk estimasi kalori gym yang dapat diandalkan. Minta durasi sesi, panjang istirahat atau intensitas, atau tampilkan rentang sangat luas.

**Acceptance criteria:**

- [ ] Session bisa disimpan sebagian dan dilanjutkan.
- [ ] Exercise dapat diulang pada session berikutnya.
- [ ] Negative/zero/invalid reps & loads ditangani.
- [ ] Timer menghitung actual elapsed time, termasuk pause state dengan benar.
- [ ] Personal record history tidak mengubah performa lama ketika template diedit.

### 8.7 F07 — Workout Calorie Estimator [P0 basic]

**Basic calculation:** berdasarkan **MET activity**, berat badan, durasi, serta kategori intensitas yang dipilih. Sumber MET: 2024 Adult Compendium of Physical Activities. Contoh kategorinya resistance training (moderate/vigorous), circuit, walking, dan treadmill.

**Conceptual formula (gross activity energy):**

`Gross kcal ≈ MET × 3.5 × body_weight_kg / 200 × duration_minutes`

**Incremental activity energy over resting baseline (optional):**

`Incremental kcal ≈ max(MET − 1, 0) × 3.5 × body_weight_kg / 200 × active_minutes`

These are **population-based estimates**, not measured personal expenditure. For lifting, classify entire session by general intensity/rest pattern if fine-grained active/rest timing is unavailable. Do not assign a precise MET per rep. Display an uncertainty interval such as `~160–250 kcal` as an illustrative example, **not** a validated fixed ±% interval.

**Workout summary:**

```text
Push Day                 54 min
6 exercises               18 working sets
Training volume          5,420 kg
Estimated exercise       ~160–250 kcal
Confidence               Low–Medium
```

**Exercise examples:** resistance training, treadmill incline walk, stationary cycling, swimming, walking, running. Cardio logs may use richer inputs if backed by a validated equation; otherwise retain MET-based estimate.

**Acceptance criteria:**

- [ ] Set/reps alone do not generate a falsely precise calorie estimate.
- [ ] Workout calorie numbers are clearly marked `estimate` with assumptions.
- [ ] Running different exercise types for equal time can yield different estimates.
- [ ] Paused timer and rest handling do not overstate active time.

### 8.8 F08 — 3well Balance: Food ↔ Activity Connection [P0 — MVP]

**Product intent:** bantu pengguna melihat hubungan antara energi yang dimakan, aktivitas, dan tujuan—tanpa mengharuskan olahraga sebagai hukuman untuk makan.

**Default display:**

```text
Today's energy picture
Food consumed                   1,850 kcal
Daily food goal                 2,100 kcal
Estimated activity             180–260 kcal
Goal status                     250 kcal left

Your workout is tracked separately because
average activity is already included in your daily goal.
```

**User action:** `Explore a scenario` (opsional): “Jika menambah 30 menit jalan kaki, kira-kira berapa aktivitas tambahan?” dan “Jika makan 200 kcal di atas target satu hari, apa artinya terhadap rata-rata seminggu?” Perubahan ditampilkan sebagai skenario, bukan perintah olahraga.

**Do not implement:** `You ate a burger → must run 5 km`. Ini misleading, cenderung berkonotasi menghukum, dan mengabaikan baseline activity serta estimasi yang berisik.

**Anti-double-counting policy:**

- **Default / Fixed Budget:** TDEE sudah mencakup aktivitas tipikal; catatan kalori workout informasional, **tidak ditambah lagi** ke allowance.
- **Future advanced / Dynamic Budget:** Bila baseline benar-benar sedentary, barulah incremental activity bisa dipertimbangkan dengan adjustment yang jelas. Jangan aktifkan mode ini tanpa desain dan uji validasi yang khusus.

### 8.9 F09 — Weekly Review & Adaptive Plan [P1; simplified card in MVP]

**Every 7 days, if enough data:**

- Weight trend: 7-day average vs previous 7-day average.
- Intake: average logged calories, protein target days, missing-day count.
- Training: sessions, total sets, key-lift improvements.
- Goal velocity: target pace vs observed pace.
- Recommendation: `Keep current plan`, `Review portions`, atau `Consider small calorie adjustment`.

**Adjustment logic:**

- Butuh data timbang dan food log yang cukup (mis. paling sedikit 3 weigh-ins/minggu dan catatan makan pada mayoritas hari); bila tidak, review menyatakan kurang data.
- Jangan mengubah target dari satu minggu yang noisy.
- Pertimbangkan evaluasi **2 minggu atau lebih** jika data bertentangan.
- Usulan perubahan bertahap dan harus dikonfirmasi pengguna; jangan otomatis mengubah target.
- Pada bulk, gunakan strength trend sebagai konteks, bukan menganggap semua kenaikan berat adalah otot.

### 8.10 F10 — Progress Signals [P1]

- **Strength Retention:** saat cutting, tampilkan perubahan performa key lifts untuk memantau kemungkinan penurunan kemampuan latihan; bukan diagnosis muscle loss.
- **Consistency Score:** persen hari yang mencatat kebiasaan yang dipilih; jangan beri penalti untuk hari istirahat atau log tidak lengkap.
- **Trend Explanation Cards:** insight deterministik: `Berat 3 hari terakhir naik, tetapi rata-rata 7 hari masih turun`.
- **Measurement Hub:** lingkar pinggang/foto progres hanya jika user opt-in; foto disimpan privat dan dapat dihapus.
- **Plate Builder:** buat meal combo dari bahan makanan lokal dan lihat estimasi makro sebelum disimpan.

### 8.11 F11 — PWA & Offline Logging [P0/P1]

- Installable PWA di Android/iOS (sejauh dukungan browser memungkinkan).
- App shell dan riwayat yang sudah diakses dapat dibuka saat offline.
- Pending changes disimpan lokal dan disinkronkan saat koneksi kembali.
- Offline entry mendapat indikator `Pending sync`; jangan tampilkan sukses cloud sebelum sync benar-benar selesai.
- Conflict rule MVP: last-write-wins pada entry yang sama **dengan notifikasi konflik**; metadata revision untuk mendeteksi perubahan.

### 8.12 F12 — Account, Settings, & Data [P0]

- Auth dengan email/password atau magic link; Google login opsional.
- Profile settings: units, timezone, activity level, goals, calorie/macros.
- Export data CSV/JSON dan delete individual entries/account.
- Privacy notice yang jelas, terutama untuk kesehatan/berat/progress photos.
- Tidak ada publikasi data pribadi secara default.

---

## 9. Design & UX Specification

### 9.1 Brand personality

**Premium, calm, athletic, and human.** Bukan aplikasi gym yang penuh api/teriakan motivasi, dan bukan dashboard klinis yang kaku. Simple dan terasa cepat, dengan microinteractions halus.

**Wordmark:** `3well` (angka 3 sedikit distinctive).  
**Slogan:** `well, well, well.`  
**Tone:** direct, supportive, evidence-aware, never guilt-inducing.

### 9.2 Visual direction

| Element | Direction |
|---|---|
| Layout | Mobile-first; desktop = responsive wider overview |
| Palette | Deep ink `#101717`, warm off-white `#F7F8F5`, soft green `#8CC6A0`, neutral grey; semantic colors accessible |
| Typography | Modern sans-serif: Geist / Inter; tabular numerals for stats |
| Cards | Clean surfaces, generous padding, subtle border; no neon gradients everywhere |
| Charts | Weight line + smoothed trend; tooltips; adaptive Y-scale; accessible text summaries |
| Motion | 150–250 ms transitions; no animation that blocks input; honor reduced motion |
| Touch | Interactive targets at least ~44 × 44 CSS px |
| Responsive | Designed at 360/390/430 px; tablet and desktop supported |
| Localization | Bahasa Indonesia default; English future; kg, cm, kcal; Asia/Jakarta date initially from device timezone |

### 9.3 Screen A — Today / Home

```text
┌──────────────────────────────────┐
│ 3well                  Tue, Nov 10│
│ well, well, well.                │
├──────────────────────────────────┤
│ Good evening.                   │
│ Goal: CUT  ·  Week 2            │
│                                  │
│      Calories today             │
│      1,650 / 2,100 kcal         │
│      [██████████░░░]            │
│      450 kcal remaining          │
│                                  │
│ Protein  108 / 150 g            │
├──────────────────────────────────┤
│ Your weight trend               │
│ 87.6 kg · 7-day avg             │
│ [sparkline]  -0.4 kg vs last wk │
│ [ + Log Weight ]                │
├──────────────────────────────────┤
│ Workout                         │
│ Push Day · 54 min · 18 sets      │
│ [Start Workout]                 │
├──────────────────────────────────┤
│ Quick Add: Food  Weight  Workout│
├──────────────────────────────────┤
│ Today    Food    Train  Progress│
└──────────────────────────────────┘
```

*Seluruh angka di wireframe adalah dummy data untuk menunjukkan layout, bukan target pengguna.*

### 9.4 Screen B — Progress

- Hero: **Current 7-Day Trend**, change vs previous period, goal progress.
- Main chart: toggles `7D | 30D | 90D`; raw weigh-ins as dots; smoothed line.
- Forecast panel: projected **range** at 30 days, confidence badge text, `How estimated?` drawer.
- History list with edit actions.
- Weekly review card below fold.

### 9.5 Screen C — Food

- Sticky `Daily intake` summary and editable date.
- Big search field `Cari nasi, ayam, telur...`.
- Recent/favorites before generic search.
- Grouped meal cards.
- Portion bottom sheet: grams/servings, calorie & macro estimate, source, save.

### 9.6 Screen D — Train

- Template carousel; `Start Empty Workout`.
- In-session giant set entry rows; **Save Set** button easy to reach.
- Timer/pause, rest timer, last set ghost value.
- Summary: duration, total volume, muscle coverage, estimated activity calories.

### 9.7 Interaction details

- Skeleton loading only where necessary; optimistic local updates with clear sync state.
- Empty states provide single CTA, e.g. `Catat berat pertama`.
- Haptics only where technically supported and permission-compatible.
- No compulsory streaks, confetti after “low calories,” or red warning at ordinary intake deviations.
- All charts have equivalent text and keyboard-accessible controls.

---

## 10. Business Logic & Calculation Rules

> **Key rule:** 3well is an estimation and tracking product. Energi dari makanan, pengeluaran energi, dan komposisi berat badan memiliki ketidakpastian. Semua formula perlu pengujian dan peninjauan sebelum production release.

### 10.1 BMR & estimated maintenance energy

MVP dapat memakai **Mifflin–St Jeor** untuk dewasa ketika parameter fisiologis yang dibutuhkan tersedia:

```text
BMR_male   ≈ 10×weight_kg + 6.25×height_cm - 5×age + 5
BMR_female ≈ 10×weight_kg + 6.25×height_cm - 5×age - 161
Estimated_TDEE ≈ BMR × activity_factor
```

This is only an estimate; sex-based formula coefficients may not fit every person's physiology. Allow manual maintenance target and avoid forcing identity into medical formula input.

**Starter activity factors (configurable, standard approximation):**

| Profile | Initial factor |
|---|---:|
| Mostly sitting | 1.20 |
| Lightly active | 1.375 |
| Moderately active | 1.55 |
| Very active | 1.725 |

Activity factor includes a user's *typical* exercise. No default workout calorie eating-back.

### 10.2 Cutting / bulking pace

- Cutting: start from a modest deficit and individualize. A commonly cited sustainable public-health benchmark is around **0.45–0.9 kg per week**, but smaller rates may be appropriate, particularly for lighter or leaner users.
- Bulking: start with a modest surplus; avoid promising an exact proportion of muscle vs fat gain.
- Maintenance: target approximate equilibrium and review trends.
- **Hard guardrails**: do not recommend extreme deficit, crash diet, unsafe rates, or unusually low food intake; redirect to professional guidance when appropriate.
- Users choose preference (`gentle`, `standard`) instead of chasing maximum speed; exact starting calorie adjustments should be validated with domain review before public release.

### 10.3 Macro calculations

- Protein goal is editable; offer a training-aware suggestion as a range, not a prescription.
- Calories from macros: protein ~4 kcal/g, carbohydrates ~4 kcal/g, fat ~9 kcal/g; food-label rounding/fiber/alcohol can cause mismatch.
- Explicitly show unknown macros in quick-added food.

### 10.4 Workout calculations

```text
Workout volume (kg) = Σ (weight_kg × reps) for completed weighted sets
Estimated 1RM (optional) = weight × (1 + reps / 30)
```

1RM equation is only suitable in certain rep ranges/conditions. Do not use it for every movement or bodyweight exercise as an exact figure.

For calorie estimates, reference activity-specific MET values and elapsed/active time. **Rest intervals are lower-intensity periods**, so naive `heavy MET × full elapsed session` tends to overstate expenditure when rests are long.

### 10.5 Forecast method

```text
weight_series → clean duplicate dates → daily trend / rolling average
             → detect inadequate or noisy data
             → robust slope over recent weeks
             → project next 30 days + uncertainty band
```

- Recommended starting threshold: 10 or more weigh-ins spanning at least 14 days for a preliminary trend-based forecast, adjustable after validation.
- Use data older than 30–60 days cautiously if user's goal changed.
- Compare forecast to actual outcomes and record forecast error.
- Never equate 1 kg predicted weight change to exactly 1 kg body fat or muscle.

### 10.6 Dates, units, edits, and rounding

- Store measurement timestamp in UTC with original local date/timezone for day grouping.
- UI shows one decimal kg; calculations preserve full precision internally.
- Nutrition per unit source (e.g., 100 g cooked) is stored distinctly from user's consumed portion.
- Recalculate derived aggregates after edit/delete; avoid permanently storing redundant totals as the only source of truth.
- Calories and macros round only for display.

---

## 11. Prioritization & Delivery Scope

Priority notation: **P0 = essential MVP**, **P1 = high-value next**, **P2 = expansion**.

| Feature | Priority | Why |
|---|---|---|
| Login + onboarding + goal planner | P0 | Personalization foundation |
| Daily weight log + 7D trend | P0 | Core progress loop |
| Food logger + Indonesian starter catalog | P0 | Daily intake visibility |
| Calories & protein overview | P0 | Daily feedback |
| Workout templates + sets/reps/load + session time | P0 | Gym log foundation |
| Approximate MET workout calories | P0 | Requested cross-feature insight |
| 3well Balance (non-punitive summary) | P0 | Makes three pillars work together |
| 30-day scenario / preliminary forecast | P0 | Core differentiation, transparently limited |
| PWA install + basic offline access | P0 | Mobile web positioning |
| Weight forecast with better confidence interval | P1 | Higher quality projection |
| Weekly adaptive review | P1 | Actionable insight |
| Custom recipes / favorites / repeating meals | P1 if time constrained | Improves retention |
| PR & strength progression | P1 | Especially useful for bulk/cut gym users |
| Barcode scan via Open Food Facts | P1 | Packaged products convenience |
| Water tracker + optional reminders | P1 | Useful but not core |
| AI photo-based food estimation | P2 | High cost and uncertainty; needs verification flow |
| Wearable / Apple Health / Health Connect integrations | P2 | Platform, authorization and sync complexity |
| Smart scale / circumference / progress photos | P2 | Optional richer data |
| AI coaching chat | P2 | Risk of inaccurate health advice and increased costs |
| Social challenges & leaderboards | Not planned | Misaligned with private, low-pressure experience |

### Recommended MVP trim if resources are limited

Ship **weight + food + workouts + clear weekly trend** first. Keep forecast as transparently labeled *scenario* until its model has enough data and testing. Do not sacrifice log-entry usability for AI or elaborate visualizations.

---

## 12. Technical Architecture

### 12.1 Recommended stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) + React + TypeScript | Familiar stack, responsive architecture |
| UI | Tailwind CSS + shadcn/ui primitives | Accessible, fast implementation |
| Charts | Recharts (or visx if more custom) | Trend visualization |
| Database | PostgreSQL (managed via Supabase as option) | Structured daily metrics and relationships |
| Auth | Supabase Auth or equivalent | Session/auth lifecycle |
| Data access | Type-safe server routes / server actions | Validation and auth boundaries |
| Validation | Zod | Shared input schemas |
| Forms | React Hook Form | Fast nutrition and workout inputs |
| Cache | TanStack Query | Client fetch/cache where needed |
| Local storage | IndexedDB for offline queue | Durable offline edits |
| PWA | Service worker + manifest | Installability, shell caching |
| Observability | Error reporting + privacy-safe product events | Diagnose failures |
| Hosting | Vercel + managed database | Simple MVP deployment |

**Important:** Server-authoritative ownership and access control. If using Supabase with client access, enforce tested **Row-Level Security (RLS)** on all user tables. Do not expose secret keys to browser. Mobile performance matters more than heavy 3D or decorative motion.

### 12.2 Suggested logical architecture

```text
Mobile Browser / PWA
        │
        ├── Next.js UI + offline queue (IndexedDB)
        │         │
        │         └── authenticated API / server actions
        │                     │
        │               Domain services
        │             /      |       \
        │       Nutrition  Training  Progress/Forecast
        │             \      |       /
        │              PostgreSQL DB
        │
        └── Optional external data providers
                  (food barcode lookup only after P1)
```

### 12.3 Suggested data entities

| Entity/table | Key fields | Notes |
|---|---|---|
| `users` | `id`, `created_at`, `locale`, `timezone` | Auth identity separated from preferences |
| `profiles` | `user_id`, `birth_date_or_age`, `height_cm`, `formula_parameter`, `activity_level` | Minimize sensitive inputs |
| `goals` | `id`, `user_id`, `type`, `target_weight_kg`, `start_at`, `end_at`, `status` | Goal history |
| `nutrition_targets` | `user_id`, `effective_from`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `mode` | Versioned plans |
| `weight_entries` | `id`, `user_id`, `measured_at`, `local_date`, `weight_kg`, `note`, `updated_at` | Unique (user, local date) in MVP |
| `foods` | `id`, `name`, `source`, `reference_unit`, `kcal`, `protein_g`, `carbs_g`, `fat_g` | Per 100g/defined unit, source metadata |
| `custom_foods` | `id`, `user_id`, `nutrients`, `serving_size` | Private |
| `meals` | `id`, `user_id`, `local_date`, `meal_type` | Grouping |
| `meal_items` | `id`, `meal_id`, `food_snapshot`, `quantity_g_or_servings` | Snapshot preserves historical values |
| `exercises` | `id`, `name`, `type`, `muscle_group`, `equipment`, `met_category` | Shared/custom differentiated |
| `workout_templates` | `id`, `user_id`, `name` | Reusable |
| `workout_sessions` | `id`, `user_id`, `start_at`, `end_at`, `status`, `intensity` | Pause/active duration separately |
| `workout_sets` | `id`, `session_id`, `exercise_id`, `seq`, `reps`, `weight_kg`, `rpe`, `completed_at` | Completed sets only in volume |
| `cardio_entries` | `id`, `session_id`, `type`, `duration_s`, `distance_km`, `speed`, `incline` | Per-activity fields |
| `insight_snapshots` | `id`, `user_id`, `period`, `model_version`, `payload` | Optional derived cache, never sole truth |
| `sync_mutations` | `id`, `user_id`, `client_mutation_id`, `revision`, `status` | Idempotent offline replay |

**Data design rules:** Store original macros and unit basis with food snapshots to protect historical logs when a database item changes. Index all tables by `(user_id, date)` or appropriate owner/time keys. Apply soft delete only where necessary; account delete must remove private data through a verified process.

### 12.4 Example API contract

```http
POST   /api/onboarding
GET    /api/today?date=2026-11-10
GET    /api/weights?from=2026-10-01&to=2026-11-10
POST   /api/weights
PATCH  /api/weights/:id
DELETE /api/weights/:id
GET    /api/foods/search?q=nasi%20merah
POST   /api/meals/:id/items
POST   /api/workout-sessions
POST   /api/workout-sessions/:id/sets
PATCH  /api/workout-sessions/:id/finish
GET    /api/progress/forecast?days=30
GET    /api/progress/weekly-review
POST   /api/data-export
DELETE /api/account
```

Every endpoint must validate authentication, ownership, units, maximum sizes, and input types. API paths are proposals, not deployed routes.

---

## 13. Privacy, Safety, and Trust

### Sensitive-data controls

- Obtain clear consent for collecting body and nutrition data; collect only what is needed.
- Private by default: weights, photos, goals, and health-related notes are never publicly searchable.
- HTTPS in transit, encryption at rest where supported, least-privilege access, secret management.
- Row-Level Security and ownership tests for read/write/delete on every relevant table.
- User-controlled export and deletion; document retention policy, third-party processors, and backup deletion behavior.
- Separate analytics events from identifiable weight/food content; never put sensitive notes in tracking event payloads.
- No ads based on sensitive diet/weight entries or sale of health-like data.

### Behavior guardrails

- Refrain from harsh calorie/weight wording (`bad food`, `cheat punishment`, `you failed`).
- No “earn food by exercise” design or obligation to compensate for intake.
- Do not present a dangerous pace as a recommended option.
- Detect/flag impossible physiologic inputs and extreme plans with safe reconfiguration guidance.
- Provide visible note: `Estimates are not medical advice. Individual results vary.`
- Offer users a way to reduce focus on calories/weight, hide a chart temporarily, or switch to maintenance.

---

## 14. Non-Functional Requirements

| Dimension | MVP requirement |
|---|---|
| Mobile usability | Main tasks work without horizontal scrolling at 360 px width |
| Page speed | Aim LCP < 2.5 s on realistic mid-range mobile/network, p75 field measure |
| Interaction | Responsive tap/entry; avoid blocking UI from forecasts |
| Accessibility | WCAG 2.2 AA as implementation target; keyboard, labels, reduced motion |
| Reliability | Failed sync is visible, retryable, and idempotent |
| Data consistency | Totals match ingredient entries and correct date grouping |
| Security | OWASP baseline, RLS tests, rate limiting auth/search endpoints |
| Localization | ID first; currency not necessary for core MVP |
| Maintainability | Domain-calculation pure functions with unit tests |
| Observability | Client errors, API failures, sync failures, forecast coverage |
| Offline | Previously used screens plus add-log queue usable offline as specified |

---

## 15. KPI & Analytics

### Activation

- Onboarding completion rate.
- First weight log completion.
- First meal log completion.
- First workout session completion.
- Time from signup to first meaningful daily summary.

### Engagement & retention

- D1/D7/D30 retention.
- Weekly active loggers.
- Median time to add weight/food/sets.
- % users with at least 3 weigh-ins/week.
- % users with weekly review eligibility.

### Quality & trust

- Food entry correction rate.
- Percentage of foods with verified source/macros.
- Forecast error (MAE in kg at 7/30-day horizon, evaluated only when sufficient data).
- Percentage of forecasts labeled insufficient data.
- Workout calorie feature comprehension in usability tests.
- Sync conflict/failure rates and account deletion success.

**Avoid vanity metric:** Banyaknya kalori “dibakar” oleh semua user bukan KPI keberhasilan produk.

---

## 16. Implementation Roadmap

> Durasi bersifat fase relatif, bukan janji kalender. Dapat dikerjakan paralel setelah kontrak data disepakati.

### Phase 0 — Product foundation

- Finalize user flows, IA, hi-fi mobile UI, data schema, validation, design tokens.
- Implement auth/profile and protected app layout.
- Define formulas, privacy rules, and test datasets.

**Exit:** onboarding prototype and schema reviewed.

### Phase 1 — The logging loop (MVP core)

- Weight tracking + 7-day trend chart.
- Food search, starter catalog, custom entry, macro summary.
- Workout templates, sets/reps/load and session timer.
- Dashboard Today + persistent settings.

**Exit:** user can log a complete day end to end.

### Phase 2 — Intelligence & PWA

- MET-based estimation and 3well Balance.
- Scenario/forecast with confidence states.
- Basic weekly review cards.
- Offline queue, install manifest, export and deletion.
- Usability, security and performance QA.

**Exit:** validated, launchable MVP.

### Phase 3 — Retention & depth

- Better forecast confidence modeling and retrospective accuracy.
- Advanced recipes/favorites, strength trends, personal records.
- Small adaptive plan recommendations (confirmation required).
- Barcode scan and expanded food data with attribution/licensing review.

### Phase 4 — Exploration (conditional)

- Food-photo vision estimation with explicit edit/verification.
- Wearable integrations and optional body measurements.
- Optional smart personalized meal suggestions.

**Go/no-go:** only ship when accuracy, demand, privacy, and operating costs justify them.

---

## 17. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Users believe calorie estimates are exact | Misguided decisions | Range + labels + method explanation |
| Workout energy counted twice | Inflated food allowance | Default fixed budget; separate activity card |
| Indonesian food nutrition inaccurate | Low trust | Source tags, user editing, curated starter foods |
| Forecast overpromises | User frustration | Confidence, minimum-data threshold, backtesting |
| Logging is too labor-intensive | Churn | Favorites, recent entries, templates, quick-add |
| Bulking weight gain assumed to be muscle | Misleading insight | Show weight + strength, no body-composition claim |
| Privacy leak | High severity | RLS, auth checks, private data by default, deletion |
| PWA offline conflicts | Lost/duplicate data | Revision IDs, idempotency, conflict notifications |
| Scope creep | Launch delay | Strict P0, prohibit AI-first implementation |
| Health misuse | Unsafe goals | Adult scope, reasonable guardrails, no punitive UX |

---

## 18. QA & Acceptance Test Scenarios

| ID | Test case | Expected behavior |
|---|---|---|
| T01 | Onboard with `cut` | Recommendation below maintenance, with editability |
| T02 | Onboard with `bulk` | Recommendation above maintenance, with guardrails |
| T03 | Update same-day weight twice | One final daily measurement, no duplicate chart point |
| T04 | Missing 5 weight days | Gaps not replaced with fake values |
| T05 | Only 2 weigh-ins in 30 days | No high-confidence forecast |
| T06 | 30-day stable weight | Projection approximately stable, with uncertainty |
| T07 | Food database item 100 g → 150 g | Correct scaled calories/macros |
| T08 | `Quick Add 250 kcal` without macros | Calories added; macros marked unknown |
| T09 | Edit food reference after meal was logged | Historical food snapshot remains consistent |
| T10 | Log bench press 3×8×40 kg | 960 kg bench-press volume |
| T11 | Log sets without session duration | Workout calories marked unavailable/low-confidence |
| T12 | Finish workout on fixed budget | Nutrition allowance unchanged |
| T13 | Pause workout timer | Paused time handled appropriately in estimate |
| T14 | Enter unrealistic negative weight/reps | Input blocked with constructive validation |
| T15 | Log weight offline; reconnect | Exactly one synchronized record, clear sync states |
| T16 | Change timezone | Local-date aggregation follows defined policy |
| T17 | Cross-user API record access | Denied by authorization/RLS |
| T18 | Delete account | Personal records removed per documented policy |
| T19 | Screenreader / reduced motion | Controls navigable and animation respects preference |
| T20 | Goal becomes clinically risky | Guardrails shown, no extreme recommendation |

### MVP definition of done

- [ ] All P0 end-to-end flows pass on mobile.
- [ ] No critical security, privacy, or data-loss defects.
- [ ] All calculations covered by unit tests and reviewed for double counting.
- [ ] Forecast displays proper uncertainty/insufficient-data state.
- [ ] User test with at least 5–8 target users; most can log food, weight, and workout without guidance.
- [ ] Offline retries and duplicates tested.
- [ ] Core pages have accessible states and acceptable mobile performance.
- [ ] Privacy policy, data deletion, and export processes implemented and reviewed.

---

## 19. Open Product Decisions

These should be resolved through early prototype testing, not assumptions:

1. **Food entry method:** Is search + favorite enough, or does target audience need quick text-based meal parser in MVP?
2. **Meal catalog quality:** Who curates Indonesian portion measures, cooking variants, and nutrition sourcing?
3. **Forecast thresholds:** What minimum number and spacing of weigh-ins gives useful out-of-sample accuracy?
4. **Calorie planner:** Which safe, configurable deficit/surplus presets get domain review before shipping?
5. **Workout energy UX:** Is displaying a range clear, or does it create misleading attention compared to strength/consistency?
6. **Offline requirement:** Is offline read-only plus queued weight/food enough, or full live-workout editing offline on day one?
7. **Monetization:** Build free core product first; only test premium for advanced analysis/insights after core retention exists. Never put raw data export/delete behind a paywall.

---

## 20. Final Product Direction

**Build 3well as a daily decision tool, not just a fitness dashboard.**

The user should be able to answer these three questions in seconds:

1. **Well-Fueled:** *Apakah asupan dan protein saya hari ini sesuai arah tujuan?*
2. **Well-Trained:** *Apa yang saya latih, dan apakah performa saya bergerak maju?*
3. **Well-Progressed:** *Apakah tren aktual saya selama beberapa minggu sesuai target?*

### Launch headline

**3well**  
*well, well, well.*  
**Eat with intention. Train with purpose. Track what matters.**

*Log your food. Log your lifts. See your trend.*

### Product leader's final call

**Prioritas tertinggi adalah kenyamanan logging, kualitas data makanan Indonesia, dan grafik tren berat badan.** Ketiganya membuat orang kembali setiap hari. Prediksi 30 hari adalah fitur pembeda yang layak dibuat, tetapi harus selalu mengakui ketidakpastian. **AI food camera, smartwatch sync, social feed, dan gamifikasi berlebihan bukan prioritas awal.**

---

## Appendix A — Data & Evidence References

References are for product direction and calculation validation; not endorsements or medical advice.

1. **CDC — Steps for Losing Weight** (17 Jan 2025). Gradual, sustainable weight change and broader lifestyle factors. https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html
2. **NIDDK — Body Weight Planner.** Demonstrates that future weight and calorie needs are dynamic and affected by changes in activity and intake; adult-use disclaimer. https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner
3. **2024 Adult Compendium of Physical Activities.** Activity-specific MET values for broad population-level exercise energy estimation. https://pacompendium.com/adult-compendium/
4. **Open Food Facts — API documentation.** Potential future barcode/nutrition data source; check API version, rate limits, licensing, and data reliability before integration. https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/

## Appendix B — Draft Future Enhancements

- **3well Pulse:** 15-second daily check-in (“weighed in?”, “nutrition logged?”, “workout/rest?”) with no streak punishment.
- **3well What-If:** adjustable scenario for adherence or activity across 30 days, labeled as scenario not prediction.
- **3well Recipe Stack:** save `nasi merah + dada ayam + tempe` as repeatable meal with editable cooked weights and nutrition.
- **3well Lift Lens:** show strength/volume alongside weight trend to make bulking and cutting reviews more useful.
- **3well Reality Check:** compare forecasts from previous weeks to realized weight; display error openly and improve calibration.

