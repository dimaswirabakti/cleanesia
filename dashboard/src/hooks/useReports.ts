"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapReport } from "@/lib/mappers";
import type { Report } from "@/lib/types";

export function useReports(pageSize = 20) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursor = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const queryPage = useCallback(
    (after: QueryDocumentSnapshot<DocumentData> | null) => {
      const col = collection(db, "reports");
      const q = after
        ? query(
            col,
            orderBy("createdAt", "desc"),
            startAfter(after),
            limit(pageSize),
          )
        : query(col, orderBy("createdAt", "desc"), limit(pageSize));
      return getDocs(q);
    },
    [pageSize],
  );

  // Halaman pertama. Semua setState terjadi setelah await, jadi tidak sinkron di body effect.
  useEffect(() => {
    let cancelled = false;
    cursor.current = null;
    (async () => {
      try {
        const snap = await queryPage(null);
        if (cancelled) return;
        cursor.current = snap.docs.at(-1) ?? null;
        setHasMore(snap.size === pageSize);
        setReports(snap.docs.map(mapReport));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryPage, pageSize]);

  // Dipicu klik pengguna (bukan efek)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor.current) return;
    setLoadingMore(true);
    try {
      const snap = await queryPage(cursor.current);
      cursor.current = snap.docs.at(-1) ?? cursor.current;
      setHasMore(snap.size === pageSize);
      setReports((prev) => [...prev, ...snap.docs.map(mapReport)]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, pageSize, queryPage]);

  return { reports, loading, loadingMore, error, hasMore, loadMore };
}
