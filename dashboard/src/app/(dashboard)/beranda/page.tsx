"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useCells } from "@/hooks/useCells";
import { useReports } from "@/hooks/useReports";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { CompositionDonut } from "@/components/CompositionDonut";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WASTE_TYPE_LABELS } from "@/lib/types";

const SeverityMap = dynamic(() => import("@/components/map/SeverityMap"), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center text-muted'>
      Memuat peta...
    </div>
  ),
});

const LEVELS = [1, 2, 3, 4, 5];
const LEVEL_LABEL: Record<number, string> = {
  1: "Sangat Rendah",
  2: "Rendah",
  3: "Sedang",
  4: "Tinggi",
  5: "Sangat Tinggi",
};
const LEVEL_COLOR: Record<number, string> = {
  1: "#12a150",
  2: "#6c8c28",
  3: "#c77700",
  4: "#d0581f",
  5: "#d93a3f",
};

function Kpi({
  label,
  value,
  sub,
  dark = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${dark ? "border-transparent bg-ink" : "border-border bg-surface"}`}>
      <div className={`text-body-sm ${dark ? "text-white/70" : "text-muted"}`}>
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-3xl font-bold ${dark ? "text-white" : "text-ink"}`}>
        {value}
      </div>
      <div
        className={`mt-1 text-caption ${dark ? "text-white/60" : "text-muted"}`}>
        {sub}
      </div>
    </div>
  );
}

export default function BerandaPage() {
  const { cells } = useCells();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { reports } = useReports(8);

  const priorityCells = useMemo(
    () => cells.filter((c) => c.latestSeverity >= 4).length,
    [cells],
  );
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dash = (v: number | undefined) =>
    statsLoading || v === undefined ? "—" : v;

  return (
    <div className='space-y-6 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>Beranda</h1>
        <p className='mt-1 text-body text-muted'>
          Ringkasan pemantauan sampah pesisir, diperbarui secara real-time.
        </p>
      </div>

      {/* KPI */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Kpi
          label='Total Laporan'
          value={dash(stats?.totalReports)}
          sub='Semua waktu'
        />
        <Kpi label='Titik Pantau (Sel)' value={cells.length} sub='Grid ~111m' />
        <Kpi label='Sel Prioritas' value={priorityCells} sub='Keparahan ≥ 4' />
        <Kpi
          label='Laporan Hari Ini'
          value={dash(stats?.todayReports)}
          sub={today}
          dark
        />
      </div>

      {/* Peta preview + komposisi */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <div className='rounded-xl border border-border bg-surface p-5 xl:col-span-2'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-section font-semibold text-ink'>
              Sebaran Keparahan
            </h2>
            <Link
              href='/peta'
              className='flex items-center gap-1 text-body-sm font-medium text-brand-500'>
              Buka Peta Penuh <ArrowRight size={15} />
            </Link>
          </div>
          <div className='h-80 overflow-hidden rounded-lg border border-border'>
            <SeverityMap
              cells={cells}
              selectedCellId={null}
              onSelectCell={() => {}}
            />
          </div>
          <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-2'>
            {LEVELS.map((l) => (
              <li
                key={l}
                className='flex items-center gap-1.5 text-caption text-ink'>
                <span
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: LEVEL_COLOR[l] }}
                />
                L{l} · {LEVEL_LABEL[l]}
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-xl border border-border bg-surface p-5'>
          <h2 className='mb-4 text-section font-semibold text-ink'>
            Komposisi Jenis Sampah
          </h2>
          {stats ? (
            <CompositionDonut data={stats.composition} />
          ) : (
            <div className='text-body-sm text-muted'>Memuat...</div>
          )}
        </div>
      </div>

      {/* Laporan terbaru */}
      <div className='rounded-xl border border-border bg-surface p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-section font-semibold text-ink'>
            Laporan Terbaru
          </h2>
          <Link
            href='/laporan'
            className='flex items-center gap-1 text-body-sm font-medium text-brand-500'>
            Lihat Semua <ArrowRight size={15} />
          </Link>
        </div>
        <ul className='divide-y divide-border'>
          {reports.map((r) => (
            <li
              key={r.id}
              className='flex flex-wrap items-center gap-x-4 gap-y-2 py-3'>
              <span className='font-mono text-caption text-muted'>
                {r.createdAt.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span className='font-mono text-body-sm text-ink'>
                {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
              </span>
              <div className='ml-auto flex flex-wrap items-center gap-1.5'>
                {r.types.map((t) => (
                  <span
                    key={t}
                    className='rounded-full bg-brand-50 px-2.5 py-1 text-caption font-medium text-ink'>
                    {WASTE_TYPE_LABELS[t]}
                  </span>
                ))}
                <SeverityBadge level={r.severity} />
              </div>
            </li>
          ))}
          {reports.length === 0 && (
            <li className='py-6 text-center text-body-sm text-muted'>
              Belum ada laporan.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
