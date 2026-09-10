// Port presisi dari lib/core/geo.dart + lib/core/constants.dart.
// identik dengan versi Dart (mobile) dan functions/index.js.

export const CELL_SIZE_DEG = 0.001;
export const DECAY_HALF_LIFE_DAYS = 7;
export const STALE_THRESHOLD_DAYS = 21;

export function computeCellId(lat: number, lng: number): string {
  const latCell = Math.floor(lat / CELL_SIZE_DEG);
  const lngCell = Math.floor(lng / CELL_SIZE_DEG);
  return `${latCell}_${lngCell}`;
}

export interface CellBounds {
  latLo: number;
  latHi: number;
  lngLo: number;
  lngHi: number;
}

export function cellBounds(cellId: string): CellBounds {
  const [latStr, lngStr] = cellId.split("_");
  const latCell = parseInt(latStr, 10);
  const lngCell = parseInt(lngStr, 10);
  return {
    latLo: latCell * CELL_SIZE_DEG,
    latHi: (latCell + 1) * CELL_SIZE_DEG,
    lngLo: lngCell * CELL_SIZE_DEG,
    lngHi: (lngCell + 1) * CELL_SIZE_DEG,
  };
}

export function cellCenter(cellId: string): { lat: number; lng: number } {
  const b = cellBounds(cellId);
  return { lat: (b.latLo + b.latHi) / 2, lng: (b.lngLo + b.lngHi) / 2 };
}
