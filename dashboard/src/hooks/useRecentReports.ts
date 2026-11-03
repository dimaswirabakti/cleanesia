"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
import type { Report } from "@/lib/types";

/** `count` laporan terbaru yang terlihat (laporan tersembunyi dilewati). */
export function useRecentReports(count = 8) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      try {
        // Ambil sedikit lebih banyak agar tetap terisi bila ada yang tersembunyi.
        const snap = await getDocs(
          query(
            collection(db, "reports"),
            orderBy("createdAt", "desc"),
            limit(count * 3),
          ),
        );
        if (cancelled) return;
        setReports(
          snap.docs
            .map(mapReport)
            .filter((r) => !r.hidden)
            .slice(0, count),
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [count]);

  return { reports, loading, error };
}
