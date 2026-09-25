import type { Timestamp } from "firebase/firestore";
export type UserRole = "pemantau" | "admin";

export type WasteType = "plastik" | "styrofoam" | "logam" | "kaca" | "jaring";

export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  plastik: "Plastik",
  styrofoam: "Styrofoam",
  logam: "Logam",
  kaca: "Kaca",
  jaring: "Jaring",
};

export type SeveritySource = "manual" | "ai";

// Bentuk mentah di Firestore (createdAt/latestReportAt masih Timestamp)
export interface CellDocRaw {
  cellId: string;
  latestSeverity: number;
  latestReportAt: Timestamp;
  types: string[];
}
export interface ReportDocRaw {
  types: string[];
  severity: number;
  severitySource: string;
  lat: number;
  lng: number;
  cellId: string;
  createdAt: Timestamp;
  reporterId: string;
  thumbnailUrl: string | null;
  localPhotoPath: string | null;
}

// Bentuk yang dipakai UI (Timestamp sudah jadi Date)
export interface Cell {
  cellId: string;
  latestSeverity: number;
  latestReportAt: Date;
  types: WasteType[];
}
export interface Report {
  id: string;
  types: WasteType[];
  severity: number;
  severitySource: SeveritySource;
  lat: number;
  lng: number;
  cellId: string;
  createdAt: Date;
  reporterId: string;
  thumbnailUrl: string | null;
  localPhotoPath: string | null;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
