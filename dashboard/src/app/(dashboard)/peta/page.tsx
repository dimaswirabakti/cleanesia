"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useCells } from "@/hooks/useCells";
import { WASTE_TYPE_LABELS, type Cell, type WasteType } from "@/lib/types";
import { CellPanel } from "@/components/map/CellPanel";

const SeverityMap = dynamic(() => import("@/components/map/SeverityMap"), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center text-muted'>
      Memuat peta...
    </div>
  ),
});

const LEVELS = [1, 2, 3, 4, 5];
const LEVEL_LABEL: Record<number, string> = {
  1: "Sangat Rendah",
  2: "Rendah",
  3: "Sedang",
  4: "Tinggi",
  5: "Sangat Tinggi",
};
const LEVEL_COLOR: Record<number, string> = {
  1: "#12a150",
  2: "#6c8c28",
  3: "#c77700",
  4: "#d0581f",
  5: "#d93a3f",
};
const TYPES: WasteType[] = ["plastik", "styrofoam", "logam", "kaca", "jaring"];

function toggle<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  next.has(val) ? next.delete(val) : next.add(val);
  return next;
}

export default function PetaPage() {
  const { cells } = useCells();
  const [levels, setLevels] = useState<Set<number>>(new Set());
  const [types, setTypes] = useState<Set<WasteType>>(new Set());
  const [selected, setSelected] = useState<Cell | null>(null);

  const filtered = useMemo(
    () =>
      cells.filter((c) => {
        const levelOk = levels.size === 0 || levels.has(c.latestSeverity);
        const typeOk = types.size === 0 || c.types.some((t) => types.has(t));
        return levelOk && typeOk;
      }),
    [cells, levels, types],
  );

  return (
    <div className='flex h-dvh flex-col lg:h-full'>
      {/* Top bar filter */}
      <div className='flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border bg-surface px-6 py-3'>
        <h1 className='text-title font-semibold text-ink'>Peta Keparahan</h1>

        <div className='flex items-center gap-2'>
          <span className='text-body-sm text-muted'>Filter tingkat:</span>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevels((s) => toggle(s, l))}
              className={`h-8 w-9 rounded-lg border text-body-sm font-medium transition ${
                levels.has(l)
                  ? "border-transparent text-white"
                  : "border-border text-muted hover:border-brand-500"
              }`}
              style={
                levels.has(l) ? { backgroundColor: LEVEL_COLOR[l] } : undefined
              }>
              L{l}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-body-sm text-muted'>Jenis:</span>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypes((s) => toggle(s, t))}
              className={`rounded-full border px-3 py-1 text-body-sm font-medium transition ${
                types.has(t)
                  ? "border-transparent bg-brand-500 text-white"
                  : "border-border text-muted hover:border-brand-500"
              }`}>
              {WASTE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className='flex min-h-0 flex-1'>
        <div className='relative min-w-0 flex-1'>
          <div className='absolute left-4 top-4 z-[1000] rounded-xl border border-border bg-surface/95 p-4 shadow-sm backdrop-blur'>
            <div className='mb-2 text-body-sm font-semibold text-ink'>
              Tingkat Keparahan
            </div>
            <ul className='space-y-1.5'>
              {LEVELS.map((l) => (
                <li
                  key={l}
                  className='flex items-center gap-2 text-body-sm text-ink'>
                  <span
                    className='flex h-5 w-5 items-center justify-center rounded text-caption font-bold text-white'
                    style={{ backgroundColor: LEVEL_COLOR[l] }}>
                    {l}
                  </span>
                  {LEVEL_LABEL[l]}
                </li>
              ))}
            </ul>
          </div>

          <SeverityMap
            cells={filtered}
            selectedCellId={selected?.cellId ?? null}
            onSelectCell={setSelected}
          />
        </div>

        <aside className='hidden w-80 shrink-0 border-l border-border bg-surface lg:block'>
          <CellPanel cell={selected} onClose={() => setSelected(null)} />
        </aside>
      </div>
    </div>
  );
}
