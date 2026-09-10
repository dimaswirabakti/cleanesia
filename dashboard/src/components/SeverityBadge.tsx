const DOT: Record<number, string> = {
  1: "bg-severity-1",
  2: "bg-severity-2",
  3: "bg-severity-3",
  4: "bg-severity-4",
  5: "bg-severity-5",
};

const LABEL: Record<number, string> = {
  1: "Sangat rendah",
  2: "Rendah",
  3: "Sedang",
  4: "Tinggi",
  5: "Sangat tinggi",
};

export function SeverityBadge({ level }: { level: number }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink'>
      <span
        className={`h-2 w-2 rounded-full ${DOT[level] ?? "bg-unmonitored"}`}
      />
      {level} · {LABEL[level] ?? "Tidak diketahui"}
    </span>
  );
}
