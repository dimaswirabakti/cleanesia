"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AuditLog {
  id: string;
  actorEmail: string | null;
  action: string;
  target: Record<string, unknown>;
  details: Record<string, unknown>;
  at: Date;
}

export function useAuditLogs(cap = 100) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      try {
        const snap = await getDocs(
          query(collection(db, "auditLogs"), orderBy("at", "desc"), limit(cap)),
        );
        if (cancelled) return;
        setLogs(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              actorEmail: (x.actorEmail as string | null) ?? null,
              action: (x.action as string) ?? "",
              target: (x.target as Record<string, unknown>) ?? {},
              details: (x.details as Record<string, unknown>) ?? {},
              at: x.at?.toDate?.() ?? new Date(0),
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
  }, [cap]);

  return { logs, loading, error };
}
