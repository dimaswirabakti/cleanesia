import { Building2, Users, Waves } from "lucide-react";

const STEPS = [
  {
    title: "Laporan Warga",
    body: "Pengguna membuka aplikasi Cleanesia, memilih lokasi, lalu mengirimkan laporan temuan sampah beserta koordinat GPS.",
  },
  {
    title: "Klasifikasi On-Device",
    body: "Model machine learning ringan berjalan langsung di perangkat pengguna untuk mengidentifikasi jenis sampah (Plastik, Styrofoam, Logam, Kaca, Jaring), tanpa perlu koneksi internet.",
  },
  {
    title: "Pemetaan Grid",
    body: "Laporan diproyeksikan ke grid sel berukuran ~111 meter. Setiap sel mengambil keparahan dari laporan terbarunya (Level 1–5), lalu divisualisasikan sebagai peta kloroplet dengan warna yang memudar seiring usia laporan.",
  },
  {
    title: "Dasbor Pemantauan",
    body: "Data real-time tersedia di dasbor ini untuk pemantau, baik instansi pemerintah, komunitas, maupun publik, dalam bentuk peta, tabel laporan, dan analitik.",
  },
];

const SOURCES = [
  "Data laporan dikumpulkan secara sukarela oleh warga melalui aplikasi Cleanesia.",
  "Peta dasar menggunakan data OpenStreetMap (© kontributor OpenStreetMap).",
  "Sistem klasifikasi menggunakan model on-device yang dilatih dengan dataset sampah laut bersumber terbuka.",
  "Agregasi keparahan per sel dihitung otomatis di server begitu laporan baru masuk.",
];

const AUDIENCE = [
  {
    icon: Building2,
    title: "Pemerintah",
    body: "Instansi lingkungan hidup dan kelautan untuk perencanaan kebijakan berbasis data.",
  },
  {
    icon: Users,
    title: "Komunitas Bersih",
    body: "Organisasi relawan dan komunitas yang merencanakan kegiatan bersih pantai.",
  },
  {
    icon: Waves,
    title: "Masyarakat Umum",
    body: "Siapa pun yang peduli dengan kondisi pesisir Indonesia dapat memantau data ini.",
  },
];

export const metadata = { title: "Tentang — Cleanesia" };

export default function TentangPage() {
  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>Tentang Cleanesia</h1>
        <p className='mt-1 text-body text-muted'>
          Platform pemantauan sampah pesisir berbasis laporan warga.
        </p>
      </div>

      {/* Misi */}
      <div className='rounded-2xl bg-ink p-8 text-white'>
        <div className='text-caption font-semibold uppercase tracking-widest text-brand-500'>
          Misi Kami
        </div>
        <p className='mt-4 text-2xl font-semibold leading-snug'>
          Cleanesia hadir untuk menjembatani laporan warga dengan pengambilan
          kebijakan berbasis data. Kami percaya teknologi dan partisipasi
          masyarakat adalah kunci menjaga kelestarian pesisir Indonesia.
        </p>
      </div>

      {/* Apa itu */}
      <section className='rounded-xl border border-border bg-surface p-6 lg:p-8'>
        <h2 className='text-title font-semibold text-ink'>
          Apa itu Cleanesia?
        </h2>
        <p className='mt-3 text-body leading-relaxed text-ink'>
          Cleanesia adalah platform pemantauan sampah laut dan pesisir berbasis
          laporan warga di Indonesia. Melalui aplikasi mobile, siapa pun dapat
          melaporkan temuan sampah di pantai, muara, atau perairan pesisir.
          Laporan tersebut diproses menggunakan model kecerdasan buatan langsung
          di perangkat pengguna (on-device AI), kemudian divisualisasikan dalam
          dasbor ini untuk mendukung pemantauan oleh pemerintah, komunitas
          bersih pantai, dan masyarakat umum.
        </p>
      </section>

      {/* Cara kerja */}
      <section className='rounded-xl border border-border bg-surface p-6 lg:p-8'>
        <h2 className='text-title font-semibold text-ink'>Cara Kerja Sistem</h2>
        <ol className='mt-5 space-y-6'>
          {STEPS.map((s, i) => (
            <li key={s.title} className='flex gap-4'>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-body-sm font-semibold text-white'>
                {i + 1}
              </span>
              <div>
                <h3 className='text-h3 font-semibold text-ink'>{s.title}</h3>
                <p className='mt-1 text-body leading-relaxed text-muted'>
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Sumber data */}
      <section className='rounded-xl border border-border bg-surface p-6 lg:p-8'>
        <h2 className='text-title font-semibold text-ink'>
          Sumber Data &amp; Pengakuan
        </h2>
        <ul className='mt-4 space-y-3'>
          {SOURCES.map((t) => (
            <li
              key={t}
              className='flex gap-3 text-body leading-relaxed text-ink'>
              <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500' />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Audiens */}
      <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {AUDIENCE.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className='rounded-xl border border-border bg-surface p-6'>
            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500'>
              <Icon size={22} />
            </span>
            <h3 className='mt-4 text-h3 font-semibold text-ink'>{title}</h3>
            <p className='mt-1 text-body-sm leading-relaxed text-muted'>
              {body}
            </p>
          </div>
        ))}
      </section>

      <p className='pt-2 text-center text-caption text-muted'>
        Cleanesia Dasbor Pemantau v1.0 · Data diperbarui real-time · © 2026
        Cleanesia
      </p>
    </div>
  );
}
