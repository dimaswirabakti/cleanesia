"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setReportHidden } from "@/lib/functions";
import type { Report } from "@/lib/types";

const PRESETS = [
  "Data uji coba / pengembang",
  "Spam",
  "Lokasi tidak valid",
  "Isi laporan tidak sesuai",
];
export function ModerationPanel({
  report,
  onChanged,
}: {
  report: Report;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(hidden: boolean) {
    setBusy(true);
    setError(null);
    try {
      await setReportHidden({
        reportId: report.id,
        hidden,
        reason: hidden ? reason : undefined,
      });
      setOpen(false);
      setReason("");
      onChanged();
    } catch (e) {
      setError((e as Error).message || "Gagal memproses permintaan.");
    } finally {
      setBusy(false);
    }
  }

  if (report.hidden) {
    return (
      <div
        className='rounded-xl border border-danger/30 bg-danger/5 p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <EyeOff size={20} className='mt-0.5 text-danger' />
            <div>
              <div className='text-body font-semibold text-ink'>
                Laporan ini disembunyikan
              </div>
              <p className='mt-0.5 text-body-sm text-muted'>
                Tidak tampil di peta, statistik, maupun daftar bagi pemantau.
                {report.hiddenReason && <> Alasan: {report.hiddenReason}.</>}
                {report.hiddenAt && (
                  <>
                    {" "}
                    Disembunyikan{" "}
                    {report.hiddenAt.toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    .
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            disabled={busy}
            onClick={() => run(false)}
            className='flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-body-sm font-semibold text-white disabled:opacity-60'>
            <Eye size={16} /> {busy ? "Memproses..." : "Pulihkan laporan"}
          </button>
        </div>
        {error && (
          <p className='mt-2 text-body-sm text-danger'>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-border bg-surface p-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='text-body font-semibold text-ink'>Moderasi</div>
          <p className='text-body-sm text-muted'>
            Sembunyikan laporan yang tidak layak masuk peta. Dapat dipulihkan
            kapan saja.
          </p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className='flex items-center gap-2 rounded-xl px-4 py-2 text-body-sm font-semibold bg-danger/10 text-danger'>
            <EyeOff size={16} /> Sembunyikan laporan
          </button>
        )}
      </div>

      {open && (
        <div className='mt-4 space-y-3'>
          <div className='flex flex-wrap gap-2'>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setReason(p)}
                className={`rounded-full border px-3 py-1 text-body-sm transition ${
                  reason === p
                    ? "border-transparent bg-brand-500 text-white"
                    : "border-border text-muted hover:border-brand-500"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder='Alasan (wajib, 3–200 karakter)'
            className='w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-sm text-ink focus:border-brand-500 focus:outline-none'
          />
          {error && (
            <p className='text-body-sm text-danger'>
              {error}
            </p>
          )}
          <div className='flex gap-2'>
            <button
              disabled={busy || reason.trim().length < 3}
              onClick={() => run(true)}
              className='rounded-xl px-4 py-2 text-body-sm font-semibold disabled:opacity-50 bg-danger/10 text-danger'>
              {busy ? "Memproses..." : "Konfirmasi sembunyikan"}
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setReason("");
                setError(null);
              }}
              className='rounded-xl border border-border px-4 py-2 text-body-sm text-ink'>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
