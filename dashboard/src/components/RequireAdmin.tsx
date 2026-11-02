"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/** Hanya kenyamanan UI. Perlindungan sebenarnya ada di Cloud Functions dan Rules. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/beranda");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;
  return <>{children}</>;
}
