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
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { logout } from "@/lib/auth";

const NAV = [
  { href: "/beranda", label: "Beranda", icon: LayoutGrid },
  { href: "/peta", label: "Peta", icon: Map },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/tentang", label: "Tentang", icon: Info },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className='flex h-full flex-col bg-surface'>
      <div className='flex items-center gap-3 border-b border-border px-6 py-5'>
        <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-ink'>
          C
        </span>
        <span className='text-title font-semibold text-ink'>Cleanesia</span>
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
                  ? "bg-brand-500 text-ink"
                  : "text-muted hover:bg-brand-50 hover:text-ink"
              }`}>
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-border px-4 py-4'>
        <div className='mb-3 flex items-center gap-3 px-2'>
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-ink text-body-sm font-semibold text-white'>
            {(user?.email?.[0] ?? "P").toUpperCase()}
          </span>
          <div className='min-w-0'>
            <div className='truncate text-body-sm font-semibold text-ink'>
              {user?.displayName ?? "Pemantau"}
            </div>
            <div className='truncate text-caption text-muted'>
              {user?.email}
            </div>
          </div>
        </div>
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
