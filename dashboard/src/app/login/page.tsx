"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
} from "@/lib/auth";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/beranda");
  }, [loading, user, router]);

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === "masuk") await signInWithEmail(email, password);
      else await registerWithEmail(email, password, displayName.trim());
      router.replace("/beranda");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace("/beranda");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk dengan Google.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='grid min-h-dvh grid-cols-1 lg:grid-cols-2'>
      {/* Panel kiri */}
      <div className='relative hidden flex-col justify-between bg-ink p-12 text-white lg:flex'>
        <div className='flex items-center'>
          <Image
            src='/logo-horizontal.png'
            alt='Cleanesia'
            width={2000}
            height={551}
            className='h-10 w-auto'
            priority
          />
        </div>

        <div className='max-w-md'>
          <h1 className='text-4xl font-bold leading-tight'>
            Pantau Sampah Pesisir Indonesia dengan Cleanesia.
          </h1>
          <p className='mt-5 text-body leading-relaxed text-white/70'>
            Cleanesia memetakan dan menganalisis data sebaran sampah laut dari
            seluruh pelosok Indonesia secara real-time serta berbasis komunitas.
          </p>
        </div>

        <p className='text-body-sm leading-relaxed text-white/50'>
          Dasbor pemantauan untuk pemerintah, komunitas pembersih pantai, dan
          masyarakat umum.
        </p>
      </div>

      {/* Panel kanan — form */}
      <div className='flex items-center justify-center bg-background p-6 sm:p-12'>
        <div className='w-full max-w-md'>
          <h2 className='text-h1 font-semibold text-ink'>Selamat Datang</h2>
          <p className='mt-1 text-body text-muted'>
            Masuk ke Dashboard Cleanesia.
          </p>

          {/* Tab Masuk / Daftar */}
          <div className='mt-8 grid grid-cols-2 gap-1 rounded-xl border border-border bg-brand-50 p-1'>
            {(["masuk", "daftar"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg py-2.5 text-body font-medium capitalize transition ${
                  mode === m
                    ? "bg-surface text-brand-500 shadow-sm"
                    : "text-muted"
                }`}>
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className='mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface py-3 text-body font-medium text-ink transition hover:bg-brand-50 disabled:opacity-60'>
            <svg width='18' height='18' viewBox='0 0 48 48'>
              <path
                fill='#EA4335'
                d='M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.1 0 24 0 14.6 0 6.4 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5Z'
              />
              <path
                fill='#4285F4'
                d='M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.9Z'
              />
              <path
                fill='#FBBC05'
                d='M10.4 28.3c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3l-7.8-6.1C1 16.7 0 20.2 0 24s1 7.3 2.6 10.4l7.8-6.1Z'
              />
              <path
                fill='#34A853'
                d='M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.4-4.6 2.2-7.9 2.2-6.3 0-11.7-3.7-13.6-9.3l-7.8 6.1C6.4 42.6 14.6 48 24 48Z'
              />
            </svg>
            Masuk dengan Google
          </button>

          <div className='my-6 flex items-center gap-4 text-caption text-muted'>
            <span className='h-px flex-1 bg-border' />
            atau
            <span className='h-px flex-1 bg-border' />
          </div>

          {mode === "daftar" && (
            <>
              <label className='block text-body font-medium text-ink'>
                Nama Lengkap
              </label>
              <input
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Nama Anda'
                className='mb-5 mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none'
              />
            </>
          )}

          <label className='block text-body font-medium text-ink'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='nama@email.com'
            className='mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none'
          />

          <label className='mt-5 block text-body font-medium text-ink'>
            Kata Sandi
          </label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            className='mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none'
          />

          {error && (
            <p className='mt-4 text-body-sm text-severity-5'>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className='mt-6 w-full rounded-xl bg-brand-500 py-3.5 text-body font-semibold text-white transition hover:brightness-95 disabled:opacity-60'>
            {busy ? "Memproses..." : mode === "masuk" ? "Masuk" : "Daftar"}
          </button>

          <p className='mt-5 text-caption leading-relaxed text-muted'>
            Dengan {mode === "masuk" ? "masuk" : "mendaftar"}, Anda menyetujui{" "}
            <span className='text-brand-500'>Syarat Penggunaan</span> dan{" "}
            <span className='text-brand-500'>Kebijakan Privasi</span> Cleanesia.
          </p>
        </div>
      </div>
    </div>
  );
}
