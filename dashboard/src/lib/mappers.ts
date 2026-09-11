import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Cell, Report, SeveritySource, WasteType } from "./types";

export function mapCell(snap: QueryDocumentSnapshot<DocumentData>): Cell {
  const d = snap.data();
  return {
    cellId: (d.cellId as string) ?? snap.id,
    latestSeverity: (d.latestSeverity as number) ?? 3,
    latestReportAt: d.latestReportAt?.toDate?.() ?? new Date(0),
    types: ((d.types as string[]) ?? []) as WasteType[],
  };
}

export function mapReport(snap: QueryDocumentSnapshot<DocumentData>): Report {
  const d = snap.data();
  return {
    id: snap.id,
    types: ((d.types as string[]) ?? []) as WasteType[],
    severity: (d.severity as number) ?? 3,
    severitySource: ((d.severitySource as string) ??
      "manual") as SeveritySource,
    lat: (d.lat as number) ?? 0,
    lng: (d.lng as number) ?? 0,
    cellId: (d.cellId as string) ?? "",
    createdAt: d.createdAt?.toDate?.() ?? new Date(0),
    reporterId: (d.reporterId as string) ?? "",
    thumbnailUrl: (d.thumbnailUrl as string | null) ?? null,
    localPhotoPath: (d.localPhotoPath as string | null) ?? null,
  };
}
