"use client";
import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";

export function useUsers(cap = 200) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      try {
        const snap = await getDocs(
          query(
            collection(db, "users"),
            orderBy("createdAt", "desc"),
            limit(cap),
          ),
        );
        if (cancelled) return;
        setUsers(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              uid: (x.uid as string) ?? d.id,
              displayName: (x.displayName as string) ?? "",
              email: (x.email as string) ?? "",
              role: ((x.role as string) ?? "pemantau") as UserRole,
              createdAt: x.createdAt?.toDate?.() ?? new Date(0),
            };
          }),
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
  }, [cap, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { users, loading, error, reload };
}
