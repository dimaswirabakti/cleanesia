"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WasteType } from "@/lib/types";

const TYPES: WasteType[] = ["plastik", "styrofoam", "logam", "kaca", "jaring"];

export interface DashboardStats {
  totalReports: number;
  todayReports: number;
  composition: Record<WasteType, number>;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      try {
        const reports = collection(db, "reports");
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [totalSnap, todaySnap, ...typeSnaps] = await Promise.all([
          getCountFromServer(query(reports)),
          getCountFromServer(
            query(
              reports,
              where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
            ),
          ),
          ...TYPES.map((t) =>
            getCountFromServer(
              query(reports, where("types", "array-contains", t)),
            ),
          ),
        ]);
        if (cancelled) return;

        const composition = {} as Record<WasteType, number>;
        TYPES.forEach((t, i) => (composition[t] = typeSnaps[i].data().count));

        setStats({
          totalReports: totalSnap.data().count,
          todayReports: todaySnap.data().count,
          composition,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
