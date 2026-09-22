"use client";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { WASTE_TYPE_LABELS, type WasteType } from "@/lib/types";

const COLORS: Record<WasteType, string> = {
  plastik: "#00cdbe",
  styrofoam: "#6c8c28",
  logam: "#c77700",
  kaca: "#0c2c2a",
  jaring: "#d0581f",
};

export function CompositionDonut({
  data,
}: {
  data: Record<WasteType, number>;
}) {
  const entries = (Object.keys(data) as WasteType[]).map((t) => ({
    type: t,
    label: WASTE_TYPE_LABELS[t],
    value: data[t],
    color: COLORS[t],
  }));
  const hasData = entries.some((e) => e.value > 0);

  return (
    <div className='flex flex-col items-center gap-6 sm:flex-row'>
      <div className='h-44 w-44 shrink-0'>
        {hasData ? (
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={entries}
                dataKey='value'
                nameKey='label'
                innerRadius='62%'
                outerRadius='100%'
                paddingAngle={2}
                strokeWidth={0}>
                {entries.map((e) => (
                  <Cell key={e.type} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className='flex h-full items-center justify-center text-body-sm text-muted'>
            Belum ada data
          </div>
        )}
      </div>
      <ul className='flex-1 space-y-2 self-stretch'>
        {entries.map((e) => (
          <li key={e.type} className='flex items-center gap-2 text-body-sm'>
            <span
              className='h-3 w-3 rounded-full'
              style={{ backgroundColor: e.color }}
            />
            <span className='text-ink'>{e.label}</span>
            <span className='ml-auto font-mono font-semibold text-ink'>
              {e.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
