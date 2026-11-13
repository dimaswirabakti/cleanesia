# Cleanesia Dashboard

Dasbor web untuk memantau laporan sampah pesisir dari aplikasi mobile Cleanesia, dengan alat moderasi untuk admin. Dibangun dengan Next.js (App Router), TypeScript, dan Tailwind CSS v4; data dibaca langsung dari Firebase (Authentication dan Cloud Firestore).

URL Production: `https://cleanesia-dashboard.vercel.app/`

## Halaman

| Rute | Isi | Akses |
|---|---|---|
| `/login` | masuk dengan Google atau email dan kata sandi | publik |
| `/beranda` | ringkasan: total laporan, sel prioritas, peta mini, komposisi, laporan terbaru | masuk |
| `/peta` | peta sel keparahan, filter tingkat dan jenis, panel laporan per sel | masuk |
| `/laporan`, `/laporan/[id]` | tabel dengan filter dan paginasi, detail satu laporan | masuk |
| `/statistik` | tren, komposisi jenis, distribusi keparahan, area teratas | masuk |
| `/tentang`, `/profil` | informasi proyek, akun dan peran | masuk |
| `/pengguna` | daftar akun dasbor; ubah peran hanya untuk Super Admin | admin (ubah peran: Super Admin) |
| `/audit` | 100 aksi admin terakhir | admin |

Di detail laporan, admin juga mendapat panel moderasi (sembunyikan/pulihkan dengan alasan).

## Menjalankan

```bash
cd dashboard
pnpm install
cp .env.local.example .env.local   # isi variabel di bawah
pnpm dev                           # http://localhost:3000
```

### Variabel lingkungan

Nilainya ada di Firebase Console, Project settings, Your apps, aplikasi Web, SDK setup and configuration. Konfigurasi web Firebase bukan rahasia, tetapi `.env.local` tetap tidak di-commit.

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Variabel `NEXT_PUBLIC_*` ditanamkan saat build, jadi perubahan nilai di Vercel membutuhkan deploy ulang.

## Script

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | server pengembangan |
| `pnpm build` | build produksi (butuh variabel lingkungan terisi) |
| `pnpm lint` | ESLint |
| `pnpm test:run` | Vitest: paritas geo terhadap `shared/geo-fixtures.json`, kesesuaian palet warna dengan token CSS |
| `pnpm exec tsc --noEmit` | pemeriksaan tipe |

## Peran dan akses

- **Pemantau** (bawaan saat login pertama): hanya membaca peta, laporan, dan statistik. Laporan yang disembunyikan tidak terlihat.
- **Admin**: moderasi laporan, serta melihat halaman Pengguna dan Jejak Audit. Tidak dapat mengangkat atau mencabut admin.
- **Super Admin** (hanya satu): semua kemampuan admin, ditambah satu-satunya yang dapat mengangkat dan mencabut admin. Tidak dapat dicabut atau diubah dari dasbor.

Peran disimpan sebagai *custom claim* pada Firebase Auth: `admin` untuk admin, dan `superAdmin` (bersama `admin`) untuk Super Admin. Dokumen `users/{uid}.role` (`pemantau`, `admin`, `superadmin`) hanya cermin untuk tampilan; Security Rules sudah mencegah pengguna mengubah `role`-nya sendiri. `isAdmin` dan `isSuperAdmin` di UI dibaca dari token dan hanya untuk kenyamanan; yang melindungi data adalah Cloud Functions (memverifikasi peran ke Firebase Auth pada setiap panggilan, `setUserRole` khusus Super Admin dan menolak target Super Admin) dan Security Rules (penulisan langsung ke `reports` dan `cells` ditolak). Claim yang baru diberikan baru terbaca di UI setelah pengguna keluar lalu masuk lagi.

Super Admin hanya dapat dibuat dengan `functions/scripts/bootstrap-admin.js --super`; langkahnya ada di README root. Pemilik proyek Firebase tetap dapat mengubah claim lewat Console atau Admin SDK, karena itu di luar sistem peran dasbor.

## Data

Koleksi Firestore yang dipakai:

| Koleksi | Isi | Ditulis oleh |
|---|---|---|
| `reports` | laporan mentah: jenis, keparahan, koordinat, `cellId`, waktu, `reporterId`; opsional `hidden`, `hiddenBy`, `hiddenAt`, `hiddenReason` | aplikasi mobile (buat); Cloud Function (moderasi) |
| `cells` | keparahan terbaru per sel ~111 m | Cloud Functions |
| `users` | profil akun dasbor dan cermin peran | dasbor (buat, profil sendiri); Cloud Function (peran) |
| `auditLogs` | catatan aksi admin | Cloud Functions |

Cloud Functions yang dipanggil dari dashboard: `setReportHidden` dan `setUserRole`. Menyembunyikan laporan, memperbarui sel terkait, dan mencatat audit terjadi dalam satu transaksi.

Dokumen laporan lama tanpa field `hidden` dianggap terlihat. Dasbor menyaring laporan tersembunyi di sisi klien untuk pemantau; datanya sendiri tidak rahasia.

## Struktur

```
src/app/(dashboard)/   halaman (lihat tabel di atas)
src/app/login/         halaman masuk
src/components/        AppSidebar, AuthProvider, ModerationPanel, RequireAdmin, StateNotice, peta (Leaflet)
src/hooks/             pembacaan Firestore (useCells realtime, useAllReports, useReport, useUsers, ...)
src/lib/               firebase, functions (callable), palette (warna dan label satu sumber), geo, mappers, types
```

`src/lib/geo.ts` adalah salinan logika grid dari `functions/geo.js` dan `lib/core/geo.dart`; ketiganya dijaga oleh satu fixture (`shared/geo-fixtures.json`). Warna keparahan didefinisikan di `src/lib/palette.ts` dan harus sama dengan token di `src/app/globals.css`; `palette.test.ts` menjaganya.

## Batasan yang diketahui

- Laporan tidak menyimpan nama tempat atau tingkat keyakinan klasifikasi, jadi dashboard menampilkan koordinat dan ID sel.
- Foto laporan belum disimpan di cloud; kolom foto di detail laporan menampilkan keadaan kosong.
- Tabel Laporan dan Statistik memuat maksimal 2000 laporan terbaru dan menyaring di sisi klien. Bila data melampaui sekitar 5000, penyaringan perlu dipindah ke server.
- Angka total di Beranda dihitung dari hitungan server dikurangi laporan tersembunyi (hingga 1000).
