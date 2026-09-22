"use client";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
import type { Report } from "@/lib/types";

export function useReport(id: string | null) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!id) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      try {
        const snap = await getDoc(doc(db, "reports", id));
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
          setReport(null);
        } else {
          setReport(mapReport(snap as QueryDocumentSnapshot<DocumentData>));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { report, loading, notFound, error };
}
