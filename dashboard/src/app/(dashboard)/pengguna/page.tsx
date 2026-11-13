"use client";
import { useState } from "react";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { useUsers } from "@/hooks/useUsers";
import { setUserRole } from "@/lib/functions";
import { ErrorNotice, TableSkeleton } from "@/components/StateNotice";
import type { AppUser, UserRole } from "@/lib/types";

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  superadmin: { label: "Super Admin", className: "bg-ink text-white" },
  admin: { label: "Admin", className: "bg-brand-500 text-white" },
  pemantau: { label: "Pemantau", className: "bg-brand-50 text-ink" },
};

function PenggunaContent() {
  const { user, isSuperAdmin } = useAuth();
  const { users, loading, error, reload } = useUsers();
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const adminCount = users.filter((u) => u.role !== "pemantau").length;

  async function change(u: AppUser) {
    const role = u.role === "admin" ? "pemantau" : "admin";
    setBusy(u.uid);
    setNotice(null);
    try {
      await setUserRole({ uid: u.uid, role });
      setNotice({
        ok: true,
        text:
          role === "admin"
            ? `${u.email} sekarang admin. Pengguna perlu keluar lalu masuk lagi agar menu admin muncul.`
            : `${u.email} kembali menjadi pemantau.`,
      });
      setPending(null);
      reload();
    } catch (e) {
      setNotice({
        ok: false,
        text: (e as Error).message || "Gagal mengubah peran.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className='space-y-5 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>Pengguna</h1>
        <p className='mt-1 text-body text-muted'>
          Akun dashboard dan perannya. Pelapor aplikasi mobile bersifat anonim
          sehingga tidak tercantum di sini.
          {!isSuperAdmin && " Hanya Super Admin yang dapat mengubah peran."}
        </p>
      </div>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`rounded-xl border p-4 text-body-sm ${
            notice.ok
              ? "border-brand-500/30 bg-brand-500/5 text-ink"
              : "border-danger/30 bg-danger/5 text-danger"
          }`}>
          {notice.text}
        </div>
      )}
      {error && <ErrorNotice what='daftar pengguna' error={error} />}

      <div className='text-body-sm text-muted'>
        {loading ? "Memuat..." : `${users.length} akun · ${adminCount} admin`}
      </div>

      <div className='overflow-x-auto rounded-xl border border-border bg-surface'>
        <table className='w-full min-w-[640px] text-left'>
          <thead>
            <tr className='border-b border-border text-caption uppercase tracking-wide text-muted'>
              <th className='px-4 py-3 font-medium'>Nama</th>
              <th className='px-4 py-3 font-medium'>Email</th>
              <th className='px-4 py-3 font-medium'>Peran</th>
              <th className='px-4 py-3 font-medium'>Bergabung</th>
              <th className='px-4 py-3 font-medium text-right'>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <TableSkeleton cols={5} />}
            {users.map((u) => {
              const isSelf = u.uid === user?.uid;
              const isAdminRow = u.role === "admin";
              const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.pemantau;
              return (
                <tr
                  key={u.uid}
                  className='border-b border-border last:border-0'>
                  <td className='px-4 py-3 text-body-sm font-medium text-ink'>
                    {u.displayName || "—"}
                  </td>
                  <td className='px-4 py-3 text-body-sm text-ink'>{u.email}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-caption font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className='px-4 py-3 font-mono text-body-sm text-muted'>
                    {u.createdAt.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {isSelf ? (
                      <span className='text-body-sm text-muted'>Akun Anda</span>
                    ) : u.role === "superadmin" ? (
                      <span className='text-body-sm text-muted'>Dilindungi</span>
                    ) : !isSuperAdmin ? (
                      <span className='text-body-sm text-muted'>—</span>
                    ) : pending === u.uid ? (
                      <div className='flex justify-end gap-2'>
                        <button
                          disabled={busy === u.uid}
                          onClick={() => change(u)}
                          className={`rounded-lg px-3 py-1.5 text-body-sm font-semibold disabled:opacity-60 ${
                            isAdminRow
                              ? "bg-danger/10 text-danger"
                              : "bg-brand-500 text-white"
                          }`}>
                          {busy === u.uid
                            ? "Memproses..."
                            : isAdminRow
                              ? "Ya, cabut admin"
                              : "Ya, jadikan admin"}
                        </button>
                        <button
                          disabled={busy === u.uid}
                          onClick={() => setPending(null)}
                          className='rounded-lg border border-border px-3 py-1.5 text-body-sm text-ink'>
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNotice(null);
                          setPending(u.uid);
                        }}
                        className='rounded-lg border border-border px-3 py-1.5 text-body-sm font-medium text-ink hover:border-brand-500'>
                        {isAdminRow ? "Cabut admin" : "Jadikan admin"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && !error && (
              <tr>
                <td
                  colSpan={5}
                  className='px-4 py-10 text-center text-body-sm text-muted'>
                  Belum ada akun.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PenggunaPage() {
  return (
    <RequireAdmin>
      <PenggunaContent />
    </RequireAdmin>
  );
}
