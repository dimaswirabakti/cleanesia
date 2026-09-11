"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className='flex min-h-dvh items-center justify-center text-muted'>
        Memuat...
      </div>
    );
  }

  return (
    <div className='flex min-h-dvh flex-col'>
      {/* Shell sementara navigasi asli dibangun di Fase selanjutnya */}
      <header className='flex items-center justify-between border-b border-border bg-surface px-6 py-3'>
        <span className='text-section font-semibold text-ink'>Cleanesia</span>
        <button
          onClick={() => logout()}
          className='text-body-sm text-muted hover:text-ink'>
          Keluar
        </button>
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
