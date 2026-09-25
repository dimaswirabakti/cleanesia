"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Map,
  FileText,
  BarChart3,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";
import Image from "next/image";

const NAV = [
  { href: "/beranda", label: "Beranda", icon: LayoutGrid },
  { href: "/peta", label: "Peta", icon: Map },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/tentang", label: "Tentang", icon: Info },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  return (
    <div className='flex h-full flex-col bg-surface'>
      <div className='flex items-center border-b border-border px-6 py-5'>
        <Image
          src='/logo-horizontal.png'
          alt='Cleanesia'
          width={2000}
          height={551}
          className='h-9 w-auto'
          priority
        />
      </div>

      <nav className='flex-1 space-y-1 px-3 py-4'>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-body font-medium transition ${
                active
                  ? "bg-brand-500 text-white shadow-[0_8px_20px_-10px_rgba(15,138,126,0.9)]"
                  : "text-muted hover:bg-brand-50 hover:text-ink"
              }`}>
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-border px-4 py-4'>
        <Link
          href='/profil'
          onClick={onNavigate}
          className='mb-3 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-brand-50'>
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-ink text-body-sm font-semibold text-white'>
            {(
              profile?.displayName?.[0] ??
              user?.email?.[0] ??
              "P"
            ).toUpperCase()}
          </span>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-body-sm font-semibold text-ink'>
              {profile?.displayName ?? "Pemantau"}
            </div>
            <div className='truncate text-caption text-muted'>
              {user?.email}
            </div>
          </div>
          <ChevronRight size={16} className='shrink-0 text-muted' />
        </Link>

        <button
          onClick={() => logout()}
          className='flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-body font-medium text-muted transition hover:bg-brand-50 hover:text-ink'>
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </div>
  );
}
