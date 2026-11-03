import { SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/palette";
import { UNMONITORED_COLOR } from "@/lib/palette";

export function SeverityBadge({ level }: { level: number }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink'>
      <span
        className='h-2 w-2 rounded-full'
        style={{ backgroundColor: SEVERITY_COLOR[level] ?? UNMONITORED_COLOR }}
      />
      {level} · {SEVERITY_LABEL[level] ?? "Tidak diketahui"}
    </span>
  );
}
