"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
import type { Report } from "@/lib/types";

export function useAllReports(cap = 2000) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      try {
        const snap = await getDocs(
          query(
            collection(db, "reports"),
            orderBy("createdAt", "desc"),
            limit(cap),
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
  }, [cap]);

  return { reports, loading, error };
}
