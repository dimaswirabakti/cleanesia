"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
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

        const [totalSnap, todaySnap, hiddenSnap, ...typeSnaps] =
          await Promise.all([
            getCountFromServer(query(reports)),
            getCountFromServer(
              query(
                reports,
                where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
              ),
            ),
            // laporan tersembunyi: jumlahnya kecil, dikurangkan dari hitungan server
            getDocs(query(reports, where("hidden", "==", true), limit(1000))),
            ...TYPES.map((t) =>
              getCountFromServer(
                query(reports, where("types", "array-contains", t)),
              ),
            ),
          ]);
        if (cancelled) return;

        const hidden = hiddenSnap.docs.map(mapReport);
        const composition = {} as Record<WasteType, number>;
        TYPES.forEach(
          (t, i) =>
            (composition[t] =
              typeSnaps[i].data().count -
              hidden.filter((r) => r.types.includes(t)).length),
        );

        setStats({
          totalReports: totalSnap.data().count - hidden.length,
          todayReports:
            todaySnap.data().count -
            hidden.filter((r) => r.createdAt >= startOfDay).length,
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
