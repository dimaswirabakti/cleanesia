/** Komponen kecil bersama untuk keadaan gagal-muat dan memuat. */

export function ErrorNotice({
  what,
  error,
}: {
  /** Apa yang gagal dimuat, mis. "laporan" atau "peta". */
  what: string;
  error: Error;
}) {
  return (
    <div
      role='alert'
      className='rounded-xl border border-danger/30 bg-danger/5 p-4 text-body-sm text-danger'>
      <div className='font-semibold'>Gagal memuat {what}.</div>
      <div className='mt-0.5'>
        Muat ulang halaman atau coba lagi nanti.
      </div>
      <div className='mt-1 break-words font-mono text-caption opacity-80'>
        {error.message}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-border ${className}`}
    />
  );
}

/** Baris kerangka untuk tabel saat data dimuat. */
export function TableSkeleton({
  rows = 6,
  cols,
}: {
  rows?: number;
  cols: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className='border-b border-border last:border-0'>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className='px-4 py-3'>
              <Skeleton className='h-4 w-full max-w-[9rem]' />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
