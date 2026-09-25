"use client";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";

export default function ProfilPage() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className='p-8 text-body text-muted'>Memuat...</div>;

  const isGoogle = user?.providerData[0]?.providerId === "google.com";
  const displayName = profile?.displayName ?? "Pemantau";
  const initial = displayName[0]?.toUpperCase() ?? "P";
  const joined = profile?.createdAt
    ? profile.createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
  const roleLabel = profile?.role === "admin" ? "Administrator" : "Pemantau";

  return (
    <div className='mx-auto max-w-3xl space-y-5 p-6 lg:p-8'>
      <Link
        href='/beranda'
        className='inline-flex items-center gap-1.5 text-body-sm font-medium text-brand-500'>
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      {/* Header identitas */}
      <div className='overflow-hidden rounded-2xl border border-border bg-surface'>
        <div className='h-24 bg-gradient-to-r from-ink to-[#14504a]' />
        <div className='px-6 pb-6'>
          <div className='flex items-end gap-4'>
            <span className='-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-surface bg-ink text-3xl font-bold text-white'>
              {initial}
            </span>
            <div className='min-w-0 pb-1'>
              <h1 className='truncate text-title font-semibold text-ink'>
                {displayName}
              </h1>
              <p className='truncate text-body-sm text-muted'>{user?.email}</p>
            </div>
          </div>
          <div className='mt-4'>
            <span className='rounded-full bg-brand-50 px-3 py-1 text-caption font-medium text-ink'>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Informasi akun */}
      <section className='rounded-xl border border-border bg-surface p-6'>
        <h2 className='text-title font-semibold text-ink'>Informasi Akun</h2>
        <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
          <IconField icon={Mail} label='Email' value={user?.email ?? "—"} />
          <IconField icon={Clock} label='Bergabung Sejak' value={joined} />
          <IconField
            icon={ShieldCheck}
            label='Metode Masuk'
            value={isGoogle ? "Google" : "Email & Kata Sandi"}
          />
        </div>
      </section>

      {/* Hak akses */}
      <section className='rounded-xl border border-border bg-surface p-6'>
        <h2 className='text-title font-semibold text-ink'>Hak Akses</h2>
        <div className='mt-4 flex items-start gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500'>
            <Eye size={19} />
          </span>
          <div>
            <div className='text-body font-medium text-ink'>
              Akses baca ({roleLabel})
            </div>
            <p className='mt-1 text-body-sm leading-relaxed text-muted'>
              Anda dapat melihat seluruh peta keparahan, tabel laporan, dan
              analitik. Dasbor ini bersifat pemantauan saja, sehingga data
              laporan warga tidak dapat diubah, dihapus, atau ditambah dari
              sini.
            </p>
          </div>
        </div>
      </section>

      {/* Sesi */}
      <section className='rounded-xl border border-border bg-surface p-6'>
        <h2 className='text-title font-semibold text-ink'>Sesi</h2>
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4'>
          <div className='flex items-center gap-3'>
            <LogOut size={19} className='text-muted' />
            <div>
              <div className='text-body font-medium text-ink'>Keluar</div>
              <div className='text-body-sm text-muted'>
                Akhiri sesi di perangkat ini.
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className='rounded-xl px-4 py-2 text-body-sm font-semibold'
            style={{ backgroundColor: "#d93a3f1F", color: "#d93a3f" }}>
            Keluar
          </button>
        </div>
      </section>
    </div>
  );
}

function IconField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-start gap-3'>
      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500'>
        <Icon size={19} />
      </span>
      <div className='min-w-0'>
        <div className='text-body-sm text-muted'>{label}</div>
        <div className='truncate text-body font-medium text-ink'>{value}</div>
      </div>
    </div>
  );
}
