"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapCell } from "@/lib/mappers";
import type { Cell } from "@/lib/types";

export function useCells() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "cells"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCells(snap.docs.map(mapCell));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { cells, loading, error };
}
