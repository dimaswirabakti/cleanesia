"use client";
import Link from "next/link";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuditLogs, type AuditLog } from "@/hooks/useAuditLogs";
import { ErrorNotice, TableSkeleton } from "@/components/StateNotice";

const ACTION_LABEL: Record<string, string> = {
  bootstrapAdmin: "Admin pertama diatur",
  setUserRole: "Ubah peran pengguna",
  hideReport: "Sembunyikan laporan",
  restoreReport: "Pulihkan laporan",
};

function Target({ a }: { a: AuditLog }) {
  const t = a.target;
  if (typeof t.reportId === "string") {
    return (
      <Link
        href={`/laporan/${t.reportId}`}
        className='font-mono text-brand-500'>
        RPT-{t.reportId.slice(0, 6).toUpperCase()}
      </Link>
    );
  }
  if (typeof t.email === "string") return <span>{t.email}</span>;
  return <span className='text-muted'>—</span>;
}

function detail(a: AuditLog): string {
  const d = a.details;
  if (typeof d.reason === "string") return `Alasan: ${d.reason}`;
  if (d.from && d.to) return `${String(d.from)} → ${String(d.to)}`;
  return "—";
}

function AuditContent() {
  const { logs, loading, error } = useAuditLogs();

  return (
    <div className='space-y-5 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>Jejak Audit</h1>
        <p className='mt-1 text-body text-muted'>
          100 aksi admin terakhir. Catatan hanya dapat ditulis oleh server.
        </p>
      </div>

      {error && <ErrorNotice what='jejak audit' error={error} />}

      <div className='overflow-x-auto rounded-xl border border-border bg-surface'>
        <table className='w-full min-w-[720px] text-left'>
          <thead>
            <tr className='border-b border-border text-caption uppercase tracking-wide text-muted'>
              <th className='px-4 py-3 font-medium'>Waktu</th>
              <th className='px-4 py-3 font-medium'>Admin</th>
              <th className='px-4 py-3 font-medium'>Aksi</th>
              <th className='px-4 py-3 font-medium'>Target</th>
              <th className='px-4 py-3 font-medium'>Rincian</th>
            </tr>
          </thead>
          <tbody>
            {loading && <TableSkeleton cols={5} />}
            {logs.map((a) => (
              <tr key={a.id} className='border-b border-border last:border-0'>
                <td className='px-4 py-3 font-mono text-body-sm text-ink'>
                  {a.at.toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className='px-4 py-3 text-body-sm text-ink'>
                  {a.actorEmail ?? "sistem"}
                </td>
                <td className='px-4 py-3 text-body-sm font-medium text-ink'>
                  {ACTION_LABEL[a.action] ?? a.action}
                </td>
                <td className='px-4 py-3 text-body-sm text-ink'>
                  <Target a={a} />
                </td>
                <td className='px-4 py-3 text-body-sm text-muted'>
                  {detail(a)}
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && !error && (
              <tr>
                <td
                  colSpan={5}
                  className='px-4 py-10 text-center text-body-sm text-muted'>
                  Belum ada aksi admin tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <RequireAdmin>
      <AuditContent />
    </RequireAdmin>
  );
}
