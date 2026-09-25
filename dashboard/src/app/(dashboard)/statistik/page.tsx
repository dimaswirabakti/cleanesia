"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell as RCell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAllReports } from "@/hooks/useAllReports";
import { useCells } from "@/hooks/useCells";
import { cellCenter } from "@/lib/geo";
import { WASTE_TYPE_LABELS, type WasteType } from "@/lib/types";

const TYPES: WasteType[] = ["plastik", "styrofoam", "logam", "kaca", "jaring"];
const TYPE_COLOR: Record<WasteType, string> = {
  plastik: "#0f8a7e",
  styrofoam: "#6c8c28",
  logam: "#c77700",
  kaca: "#0c2c2a",
  jaring: "#d0581f",
};
const SEV = [
  {
    level: 1,
    label: "Sangat Rendah",
    short: "Sangat Rendah",
    color: "#12a150",
  },
  { level: 2, label: "Rendah", short: "Rendah", color: "#6c8c28" },
  { level: 3, label: "Sedang", short: "Sedang", color: "#c77700" },
  { level: 4, label: "Tinggi", short: "Tinggi", color: "#d0581f" },
  {
    level: 5,
    label: "Sangat Tinggi",
    short: "Sangat Tinggi",
    color: "#d93a3f",
  },
];

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='rounded-xl border border-border bg-surface p-5'>
      <div className='text-body-sm text-muted'>{label}</div>
      <div className='mt-1 font-mono text-4xl font-bold text-ink'>{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-border bg-surface p-5'>
      <h2 className='text-title font-semibold text-ink'>{title}</h2>
      <p className='mb-4 mt-0.5 text-body-sm text-muted'>{subtitle}</p>
      {children}
    </div>
  );
}

export default function StatistikPage() {
  const { reports, loading } = useAllReports();
  const { cells } = useCells();
  const [now] = useState(() => Date.now());

  const s = useMemo(() => {
    const WEEKS = 12;

    // Tren mingguan
    const trend = Array.from({ length: WEEKS }, (_, i) => {
      const d = new Date(now - (WEEKS - 1 - i) * 7 * 86_400_000);
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 };
    });
    for (const r of reports) {
      const w = Math.floor((now - r.createdAt.getTime()) / (7 * 86_400_000));
      if (w >= 0 && w < WEEKS) trend[WEEKS - 1 - w].count++;
    }

    // Komposisi jenis
    const compRaw = TYPES.map((t) => ({
      type: t,
      label: WASTE_TYPE_LABELS[t],
      color: TYPE_COLOR[t],
      value: reports.filter((r) => r.types.includes(t)).length,
    }));
    const compTotal = compRaw.reduce((a, b) => a + b.value, 0) || 1;
    const composition = compRaw.map((c) => ({
      ...c,
      pct: Math.round((c.value / compTotal) * 100),
    }));

    // Distribusi keparahan
    const severity = SEV.map((x) => ({
      ...x,
      count: reports.filter((r) => r.severity === x.level).length,
    }));

    // Area (sel) dengan laporan terbanyak
    const byCell = new Map<string, number>();
    for (const r of reports)
      byCell.set(r.cellId, (byCell.get(r.cellId) ?? 0) + 1);
    const topAreas = [...byCell.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cellId, count]) => {
        const c = cellCenter(cellId);
        return { label: `${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}`, count };
      });

    // Periode data
    let period = 0;
    if (reports.length > 1) {
      const times = reports.map((r) => r.createdAt.getTime());
      period = Math.round(
        (Math.max(...times) - Math.min(...times)) / 86_400_000,
      );
    }

    const distinctTypes = new Set(reports.flatMap((r) => r.types)).size;

    return {
      trend,
      composition,
      severity,
      topAreas,
      period,
      distinctTypes,
      total: reports.length,
    };
  }, [reports, now]);

  if (!s) {
    return (
      <div className='p-6 lg:p-8 text-body text-muted'>Memuat statistik...</div>
    );
  }

  return (
    <div className='space-y-6 p-6 lg:p-8'>
      <div>
        <h1 className='text-h1 font-semibold text-ink'>
          Statistik &amp; Analitik
        </h1>
        <p className='mt-1 text-body text-muted'>
          Visualisasi data pemantauan sampah pesisir Indonesia.
        </p>
      </div>

      {/* KPI */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <KpiCard label='Total Laporan' value={loading ? "—" : s.total} />
        <KpiCard label='Titik Pantau (Sel)' value={cells.length} />
        <KpiCard label='Jenis Sampah' value={loading ? "—" : s.distinctTypes} />
        <KpiCard
          label='Periode Data'
          value={loading ? "—" : `${s.period} hr`}
        />
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        {/* Tren */}
        <ChartCard title='Tren Jumlah Laporan' subtitle='12 minggu terakhir'>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={s.trend}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id='trendFill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#0f8a7e' stopOpacity={0.35} />
                    <stop offset='100%' stopColor='#0f8a7e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e2eceb'
                  vertical={false}
                />
                <XAxis
                  dataKey='label'
                  tick={{ fontSize: 12, fill: "#4c625f" }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#4c625f" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2eceb",
                    fontSize: 13,
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#0f8a7e'
                  strokeWidth={2.5}
                  fill='url(#trendFill)'
                  dot={{ r: 3, fill: "#0f8a7e" }}
                  name='Laporan'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Komposisi */}
        <ChartCard
          title='Komposisi Jenis Sampah'
          subtitle='Seluruh periode data'>
          <div className='flex flex-col items-center gap-6 sm:flex-row'>
            <div className='h-48 w-48 shrink-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={s.composition}
                    dataKey='value'
                    nameKey='label'
                    innerRadius='60%'
                    outerRadius='100%'
                    paddingAngle={2}
                    strokeWidth={0}>
                    {s.composition.map((c) => (
                      <RCell key={c.type} fill={c.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className='w-full flex-1 space-y-3'>
              {s.composition.map((c) => (
                <li key={c.type}>
                  <div className='flex items-center gap-2 text-body-sm'>
                    <span
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: c.color }}
                    />
                    <span className='text-ink'>{c.label}</span>
                    <span className='ml-auto font-mono font-semibold text-ink'>
                      {c.pct}%
                    </span>
                  </div>
                  <div className='mt-1 h-1.5 w-full rounded-full bg-brand-50'>
                    <div
                      className='h-full rounded-full'
                      style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        {/* Area terbanyak */}
        <ChartCard
          title='Area dengan Laporan Terbanyak'
          subtitle='8 sel teratas (koordinat pusat)'>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={s.topAreas}
                layout='vertical'
                margin={{ left: 24, right: 16 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e2eceb'
                  horizontal={false}
                />
                <XAxis
                  type='number'
                  tick={{ fontSize: 12, fill: "#4c625f" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type='category'
                  dataKey='label'
                  width={110}
                  tick={{
                    fontSize: 11,
                    fill: "#4c625f",
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2eceb",
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey='count'
                  fill='#0f8a7e'
                  radius={[0, 6, 6, 0]}
                  name='Laporan'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Distribusi keparahan */}
        <ChartCard
          title='Distribusi Tingkat Keparahan'
          subtitle='Seluruh laporan'>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={s.severity}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e2eceb'
                  vertical={false}
                />
                <XAxis
                  dataKey='short'
                  tick={{ fontSize: 11, fill: "#4c625f" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#4c625f" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2eceb",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey='count' radius={[6, 6, 0, 0]} name='Laporan'>
                  {s.severity.map((x) => (
                    <RCell key={x.level} fill={x.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-2'>
            {s.severity.map((x) => (
              <li
                key={x.level}
                className='flex items-center gap-1.5 text-caption text-ink'>
                <span
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: x.color }}
                />
                L{x.level} · {x.label}
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}
