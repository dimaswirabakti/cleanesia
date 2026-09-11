"use client";
import { useCells } from "@/hooks/useCells";
import { useReports } from "@/hooks/useReports";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WASTE_TYPE_LABELS } from "@/lib/types";

export default function Beranda() {
  const { cells, loading: cellsLoading } = useCells();
  const { reports, loading, loadingMore, hasMore, loadMore } = useReports(10);

  return (
    <div className='space-y-6 p-8'>
      <h1 className='text-h1 font-semibold text-ink'>
        Beranda (uji lapisan data)
      </h1>

      <p className='text-body text-muted'>
        Sel terpantau (real-time): {cellsLoading ? "memuat..." : cells.length}
      </p>

      <div>
        <h2 className='mb-3 text-section font-semibold text-ink'>
          Laporan terbaru {loading && "(memuat...)"}
        </h2>
        <ul className='space-y-2'>
          {reports.map((r) => (
            <li
              key={r.id}
              className='flex items-center gap-3 rounded-lg border border-border bg-surface p-3'>
              <SeverityBadge level={r.severity} />
              <span className='text-body-sm text-ink'>
                {r.types.map((t) => WASTE_TYPE_LABELS[t]).join(", ") || "—"}
              </span>
              <span className='ml-auto font-mono text-caption text-muted'>
                {r.createdAt.toLocaleString("id-ID")}
              </span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className='mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-body-sm text-ink disabled:opacity-60'>
            {loadingMore ? "Memuat..." : "Muat lebih banyak"}
          </button>
        )}
      </div>
    </div>
  );
}
