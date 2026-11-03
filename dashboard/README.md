# Cleanesia Dashboard

Dasbor web untuk memantau laporan sampah pesisir dari aplikasi mobile Cleanesia: peta keparahan per sel (~111 m), tabel dan detail laporan, statistik, serta alat moderasi untuk admin. Next.js (App Router) + TypeScript + Tailwind v4, data dari Firebase (Auth + Firestore).

## Menjalankan

```bash
cd dashboard
pnpm install
cp .env.local.example .env.local   # isi 6 variabel NEXT_PUBLIC_FIREBASE_*
pnpm dev                           # http://localhost:3000
```

Nilai variabel ada di Firebase Console, Project settings, Your apps, aplikasi Web, SDK setup and configuration. Config web Firebase bukan rahasia, tetapi `.env.local` tetap tidak di-commit.

## Skrip

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | server pengembangan |
| `pnpm build` | build produksi (butuh variabel env terisi) |
| `pnpm lint` | ESLint |
| `pnpm test:run` | Vitest: paritas geo dengan `shared/geo-fixtures.json`, penjaga palet warna |
| `pnpm exec tsc --noEmit` | cek tipe |

## Peran dan akses

- **Pemantau** (default saat login pertama): hanya membaca peta, laporan, dan statistik. Laporan yang disembunyikan tidak terlihat.
- **Admin**: moderasi laporan (sembunyikan/pulihkan), halaman Pengguna (atur peran), dan Jejak Audit.

Semua perubahan data admin lewat Cloud Functions callable di `functions/` (`setReportHidden`, `setUserRole`); Firestore Rules menolak penulisan langsung. Peran disimpan sebagai custom claim `admin`. Admin pertama dibuat dengan `functions/scripts/bootstrap-admin.js` (lihat komentar di berkas itu). Jangan menyimpan kunci service account di repo atau di Vercel.

## Struktur

```
src/app/(dashboard)/   halaman: beranda, peta, laporan, statistik, tentang, profil, pengguna, audit
src/components/        AppSidebar, AuthProvider, ModerationPanel, StateNotice, peta (Leaflet)
src/hooks/             pembacaan Firestore (useCells realtime, useAllReports, ...)
src/lib/               firebase, palette (warna/label satu sumber), geo (port dari functions/geo.js)
```

`src/lib/geo.ts` adalah salinan logika grid dari `functions/geo.js` dan `lib/core/geo.dart`; ketiganya dijaga satu fixture (`shared/geo-fixtures.json`). Warna keparahan didefinisikan di `src/lib/palette.ts` dan harus sama dengan token di `src/app/globals.css` (dijaga `palette.test.ts`).
