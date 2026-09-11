"use client";
import { useAuth } from "@/components/AuthProvider";

export default function Beranda() {
  const { user } = useAuth();
  return (
    <div className='p-8'>
      <h1 className='text-h1 font-semibold text-ink'>Beranda</h1>
      <p className='mt-2 text-body text-muted'>
        Kamu masuk sebagai {user?.email ?? "pengguna"}. Halaman asli dibangun di
        nantinya.
      </p>
    </div>
  );
}
