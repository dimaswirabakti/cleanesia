"use client";
import { MapPin, X } from "lucide-react";
import { useReportsByCell } from "@/hooks/useReportsByCell";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WASTE_TYPE_LABELS, type Cell } from "@/lib/types";
import { cellCenter } from "@/lib/geo";

export function CellPanel({
  cell,
  onClose,
}: {
  cell: Cell | null;
  onClose: () => void;
}) {
  const { reports, loading } = useReportsByCell(cell?.cellId ?? null);

  if (!cell) {
    return (
      <div className='flex h-full flex-col items-center justify-center px-8 text-center'>
        <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500'>
          <MapPin size={26} />
        </div>
        <div className='text-title font-semibold text-ink'>
          Pilih Sel di Peta
        </div>
        <p className='mt-1 text-body-sm text-muted'>
          Klik sel berwarna untuk melihat daftar laporan di area tersebut.
        </p>
      </div>
    );
  }

  const center = cellCenter(cell.cellId);

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-start justify-between border-b border-border p-4'>
        <div>
          <div className='text-section font-semibold text-ink'>Detail Sel</div>
          <div className='mt-1 font-mono text-caption text-muted'>
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label='Tutup'
          className='text-muted hover:text-ink'>
          <X size={18} />
        </button>
      </div>

      <div className='border-b border-border p-4'>
        <SeverityBadge level={cell.latestSeverity} />
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {cell.types.map((t) => (
            <span
              key={t}
              className='rounded-full bg-brand-50 px-2.5 py-1 text-caption font-medium text-ink'>
              {WASTE_TYPE_LABELS[t]}
            </span>
          ))}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <div className='mb-3 text-body-sm font-semibold text-ink'>
          Laporan di sel ini {reports.length > 0 && `(${reports.length})`}
        </div>
        {loading ? (
          <div className='text-body-sm text-muted'>Memuat...</div>
        ) : reports.length === 0 ? (
          <div className='text-body-sm text-muted'>Belum ada laporan.</div>
        ) : (
          <ul className='space-y-2'>
            {reports.map((r) => (
              <li key={r.id} className='rounded-lg border border-border p-3'>
                <div className='flex items-center justify-between'>
                  <SeverityBadge level={r.severity} />
                  <span className='font-mono text-caption text-muted'>
                    {r.createdAt.toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className='mt-2 text-body-sm text-ink'>
                  {r.types.map((t) => WASTE_TYPE_LABELS[t]).join(", ") || "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
