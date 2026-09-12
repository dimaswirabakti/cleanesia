"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className='min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]'>
      <aside className='hidden border-r border-border lg:block'>
        <div className='sticky top-0 h-dvh'>
          <AppSidebar />
        </div>
      </aside>

      <header className='flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden'>
        <span className='text-section font-semibold text-ink'>Cleanesia</span>
        <button onClick={() => setMobileOpen(true)} aria-label='Buka menu'>
          <Menu size={22} className='text-ink' />
        </button>
      </header>

      {mobileOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='absolute inset-0 bg-ink/40'
            onClick={() => setMobileOpen(false)}
          />
          <div className='absolute left-0 top-0 h-full w-64 shadow-xl'>
            <button
              onClick={() => setMobileOpen(false)}
              className='absolute -right-10 top-3 text-white'
              aria-label='Tutup menu'>
              <X size={24} />
            </button>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className='min-w-0'>{children}</main>
    </div>
  );
}
