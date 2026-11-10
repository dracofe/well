# 3well — well, well, well.

MVP dari `3well_PRD.md`: PWA mobile-first untuk cut / bulk / maintain yang menyatukan **Well-Fueled** (makanan), **Well-Trained** (latihan), dan **Well-Progressed** (tren berat).

## Jalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit test kalkulasi (skenario QA PRD T01–T14, T20)
npm run build    # output ke dist/ (≈35 KB JS + 8.5 KB CSS gzip)
```

## Stack (versi ringan)

PRD menyarankan Next.js + Supabase. Untuk MVP yang ringan dan bisa jalan tanpa backend, versi ini memakai:

- **Vite + Preact + TypeScript**: runtime ~4 KB
- **Chart SVG buatan sendiri** (tanpa Recharts): titik timbang, rata-rata 7 hari, band forecast, tooltip, navigasi keyboard
- **Animasi CSS/WAAPI**: transisi 150–250 ms, tidak menghalangi input, dimatikan saat `prefers-reduced-motion`
- **Local-first**: data di `localStorage`; service worker untuk app shell offline + installable PWA

## Struktur

```
src/lib/calc.ts        logika domain murni (BMR/TDEE, planner, MA 7 hari, forecast Theil–Sen,
                       nutrisi, volume, e1RM, MET, weekly review)
src/lib/calc.test.ts   unit test
src/lib/store.ts       state + persistensi, target versioned per tanggal efektif, ekspor, data demo
src/data/              starter pack makanan Indonesia & katalog latihan/template
src/screens/           Landing, Onboarding, Today, Food, Train, Progress, Settings, WeightSheet
src/ui/                komponen, chart, helper animasi, router
```

## Belum dikerjakan / perlu tindak lanjut

- Auth, cloud sync, offline mutation queue + resolusi konflik (F11/F12), butuh backend (mis. Supabase + RLS).
- Nilai gizi starter pack & nilai MET adalah **perkiraan**; wajib ditinjau ahli gizi sebelum rilis (PRD §19).
- Custom recipe, barcode, water tracker (P1).
