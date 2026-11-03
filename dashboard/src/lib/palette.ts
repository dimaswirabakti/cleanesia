import type { WasteType } from "./types";

/**
 * Sumber tunggal warna dan label dashboard untuk kode JS (peta Leaflet, Recharts,
 * gaya inline). Nilai severity harus sama dengan token --color-severity-* di
 * app/globals.css; kesamaannya dijaga oleh palette.test.ts.
 */
export const SEVERITY_LEVELS = [1, 2, 3, 4, 5] as const;

export const SEVERITY_COLOR: Record<number, string> = {
  1: "#12a150",
  2: "#6c8c28",
  3: "#c77700",
  4: "#d0581f",
  5: "#d93a3f",
};

export const SEVERITY_LABEL: Record<number, string> = {
  1: "Sangat Rendah",
  2: "Rendah",
  3: "Sedang",
  4: "Tinggi",
  5: "Sangat Tinggi",
};

/** Sel belum terpantau / basi (> STALE_THRESHOLD_DAYS). */
export const UNMONITORED_COLOR = "#9aa8a5";

export const WASTE_TYPES: WasteType[] = [
  "plastik",
  "styrofoam",
  "logam",
  "kaca",
  "jaring",
];

export const WASTE_TYPE_COLOR: Record<WasteType, string> = {
  plastik: "#0f8a7e",
  styrofoam: "#6c8c28",
  logam: "#c77700",
  kaca: "#0c2c2a",
  jaring: "#d0581f",
};
