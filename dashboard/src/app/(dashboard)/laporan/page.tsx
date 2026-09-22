"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAllReports } from "@/hooks/useAllReports";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WASTE_TYPE_LABELS, type WasteType } from "@/lib/types";

const TYPES: WasteType[] = ["plastik", "styrofoam", "logam", "kaca", "jaring"];
const LEVELS = [1, 2, 3, 4, 5];
const LEVEL_COLOR: Record<number, string> = {
  1: "#12a150",
  2: "#6c8c28",
  3: "#c77700",
  4: "#d0581f",
  5: "#d93a3f",
};
const PAGE_SIZE = 15;

function toggle<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  next.has(val) ? next.delete(val) : next.add(val);
  return next;
}

export default function LaporanPage() {
  const router = useRouter();
  const { reports, loading } = useAllReports();
  const [types, setTypes] = useState<Set<WasteType>>(new Set());
  const [levels, setLevels] = useState<Set<number>>(new Set());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00") : null;
    const toTs = to ? new Date(to + "T23:59:59") : null;
    return reports.filter((r) => {
      if (types.size && !r.types.some((t) => types.has(t))) return false;
      if (levels.size && !levels.has(r.severity)) return false;
      if (fromTs && r.createdAt < fromTs) return false;
      if (toTs && r.createdAt > toTs) return false;
      return true;
    });
  }, [reports, types, levels, from, to]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(
    current * PAGE_SIZE,
    current * PAGE_SIZE + PAGE_SIZE,
  );
  const hasFilter = types.size || levels.size || from || to;

  function resetFilters() {
    setTypes(new Set());
    setLevels(new Set());
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <div className='space-y-5 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>Laporan</h1>
        <p className='mt-1 text-body text-muted'>
          Semua laporan warga, diurut dari terbaru dan dapat difilter.
        </p>
      </div>

      {/* Filter */}
      <div className='space-y-3 rounded-xl border border-border bg-surface p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='w-24 text-body-sm text-muted'>Jenis:</span>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypes((s) => toggle(s, t));
                setPage(0);
              }}
              className={`rounded-full border px-3 py-1 text-body-sm font-medium transition ${
                types.has(t)
                  ? "border-transparent bg-brand-500 text-ink"
                  : "border-border text-muted hover:border-brand-500"
              }`}>
              {WASTE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='w-24 text-body-sm text-muted'>Tingkat:</span>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLevels((s) => toggle(s, l));
                setPage(0);
              }}
              className={`h-8 w-9 rounded-lg border text-body-sm font-medium transition ${
                levels.has(l)
                  ? "border-transparent text-white"
                  : "border-border text-muted hover:border-brand-500"
              }`}
              style={
                levels.has(l) ? { backgroundColor: LEVEL_COLOR[l] } : undefined
              }>
              L{l}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='w-24 text-body-sm text-muted'>Rentang:</span>
          <input
            type='date'
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
            className='rounded-lg border border-border bg-surface px-3 py-1.5 text-body-sm text-ink focus:border-brand-500 focus:outline-none'
          />
          <span className='text-muted'>–</span>
          <input
            type='date'
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(0);
            }}
            className='rounded-lg border border-border bg-surface px-3 py-1.5 text-body-sm text-ink focus:border-brand-500 focus:outline-none'
          />
          {hasFilter ? (
            <button
              onClick={resetFilters}
              className='flex items-center gap-1 text-body-sm text-muted hover:text-ink'>
              <X size={14} /> Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className='text-body-sm text-muted'>
        {loading ? "Memuat..." : `${filtered.length} laporan`}
      </div>

      {/* Tabel */}
      <div className='overflow-x-auto rounded-xl border border-border bg-surface'>
        <table className='w-full min-w-[640px] text-left'>
          <thead>
            <tr className='border-b border-border text-caption uppercase tracking-wide text-muted'>
              <th className='px-4 py-3 font-medium'>ID</th>
              <th className='px-4 py-3 font-medium'>Waktu</th>
              <th className='px-4 py-3 font-medium'>Lokasi</th>
              <th className='px-4 py-3 font-medium'>Jenis</th>
              <th className='px-4 py-3 font-medium'>Keparahan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/laporan/${r.id}`)}
                className='cursor-pointer border-b border-border last:border-0 hover:bg-brand-50'>
                <td className='px-4 py-3 font-mono text-body-sm text-brand-500'>
                  {r.id.slice(0, 6).toUpperCase()}
                </td>
                <td className='px-4 py-3 font-mono text-body-sm text-ink'>
                  {r.createdAt.toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className='px-4 py-3 font-mono text-body-sm text-muted'>
                  {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex flex-wrap gap-1'>
                    {r.types.map((t) => (
                      <span
                        key={t}
                        className='rounded-full bg-brand-50 px-2 py-0.5 text-caption font-medium text-ink'>
                        {WASTE_TYPE_LABELS[t]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <SeverityBadge level={r.severity} />
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className='px-4 py-10 text-center text-body-sm text-muted'>
                  Tidak ada laporan yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginasi */}
      {pageCount > 1 && (
        <div className='flex items-center justify-between'>
          <span className='text-body-sm text-muted'>
            Halaman {current + 1} dari {pageCount}
          </span>
          <div className='flex gap-2'>
            <button
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              className='rounded-lg border border-border bg-surface px-3 py-1.5 text-body-sm text-ink disabled:opacity-50'>
              Sebelumnya
            </button>
            <button
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount - 1}
              className='rounded-lg border border-border bg-surface px-3 py-1.5 text-body-sm text-ink disabled:opacity-50'>
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
