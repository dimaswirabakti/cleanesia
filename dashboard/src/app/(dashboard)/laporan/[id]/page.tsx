"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { useReport } from "@/hooks/useReport";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WASTE_TYPE_LABELS } from "@/lib/types";

const ReportLocationMap = dynamic(
  () => import("@/components/map/ReportLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-full items-center justify-center text-muted'>
        Memuat peta...
      </div>
    ),
  },
);

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between'>
      <span className='text-body-sm text-muted'>{label}</span>
      <span className='text-body text-ink'>{children}</span>
    </div>
  );
}

export default function DetailLaporanPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;
  const { report, loading, notFound } = useReport(id);

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6 lg:p-8'>
      <Link
        href='/laporan'
        className='inline-flex items-center gap-1.5 text-body-sm font-medium text-brand-500'>
        <ArrowLeft size={16} /> Kembali ke Laporan
      </Link>

      {loading ? (
        <div className='text-body text-muted'>Memuat...</div>
      ) : notFound || !report ? (
        <div className='rounded-xl border border-border bg-surface p-10 text-center'>
          <div className='text-title font-semibold text-ink'>
            Laporan tidak ditemukan
          </div>
          <p className='mt-1 text-body-sm text-muted'>
            ID laporan tidak valid atau sudah dihapus.
          </p>
        </div>
      ) : (
        <>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h1 className='font-mono text-h3 font-semibold text-ink'>
                RPT-{report.id.slice(0, 6).toUpperCase()}
              </h1>
              <p className='mt-1 text-body-sm text-muted'>
                {report.createdAt.toLocaleString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <SeverityBadge level={report.severity} />
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='rounded-xl border border-border bg-surface p-5'>
              <h2 className='mb-3 text-section font-semibold text-ink'>
                Foto Laporan
              </h2>
              {report.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={report.thumbnailUrl}
                  alt='Foto laporan'
                  className='w-full rounded-lg'
                />
              ) : (
                <div className='flex aspect-video flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted'>
                  <ImageOff size={28} />
                  <span className='mt-2 text-body-sm'>Foto belum tersedia</span>
                  <span className='text-caption'>
                    Penyimpanan foto ke cloud belum aktif
                  </span>
                </div>
              )}
            </div>

            <div className='rounded-xl border border-border bg-surface p-5'>
              <h2 className='mb-3 text-section font-semibold text-ink'>
                Lokasi
              </h2>
              <div className='h-56 overflow-hidden rounded-lg border border-border'>
                <ReportLocationMap report={report} />
              </div>
              <div className='mt-3 font-mono text-body-sm text-ink'>
                {report.lat.toFixed(5)}°, {report.lng.toFixed(5)}°
              </div>
              <div className='mt-0.5 font-mono text-caption text-muted'>
                Sel {report.cellId}
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-border bg-surface p-5'>
            <h2 className='mb-2 text-section font-semibold text-ink'>
              Rincian
            </h2>
            <Row label='Jenis sampah terdeteksi'>
              <div className='flex flex-wrap justify-end gap-1.5'>
                {report.types.length ? (
                  report.types.map((t) => (
                    <span
                      key={t}
                      className='rounded-full bg-brand-50 px-2.5 py-1 text-caption font-medium text-ink'>
                      {WASTE_TYPE_LABELS[t]}
                    </span>
                  ))
                ) : (
                  <span className='text-muted'>—</span>
                )}
              </div>
            </Row>
            <Row label='Tingkat keparahan'>
              <SeverityBadge level={report.severity} />
            </Row>
            <Row label='Sumber keparahan'>
              {report.severitySource === "ai"
                ? "Deteksi AI"
                : "Ditetapkan pelapor"}
            </Row>
            <Row label='Koordinat'>
              <span className='font-mono'>
                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
              </span>
            </Row>
            <Row label='ID Sel'>
              <span className='font-mono'>{report.cellId}</span>
            </Row>
          </div>

          <p className='text-caption text-muted'>
            Catatan: nilai keyakinan (confidence) klasifikasi tidak disimpan di
            server, hanya jenis akhir yang tercatat. Menyimpannya memerlukan
            penyesuaian di aplikasi mobile.
          </p>
        </>
      )}
    </div>
  );
}
