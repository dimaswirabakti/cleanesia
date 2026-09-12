"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
import type { Report } from "@/lib/types";

export function useReportsByCell(cellId: string | null) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Yield sekali agar tidak ada setState yang berjalan sinkron di badan efek
      await Promise.resolve();
      if (cancelled) return;

      if (!cellId) {
        setReports([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(
          query(
            collection(db, "reports"),
            where("cellId", "==", cellId),
            orderBy("createdAt", "desc"),
            limit(50),
          ),
        );
        if (!cancelled) setReports(snap.docs.map(mapReport));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cellId]);

  return { reports, loading, error };
}
