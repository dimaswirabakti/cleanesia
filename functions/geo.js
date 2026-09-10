// Logika sel untuk Cloud Functions
// Harus identik dengan lib/core/geo.dart (mobile) dan dashboard/src/lib/geo.ts

const CELL_SIZE_DEG = 0.001;

function computeCellId(lat, lng) {
  const latCell = Math.floor(lat / CELL_SIZE_DEG);
  const lngCell = Math.floor(lng / CELL_SIZE_DEG);
  return `${latCell}_${lngCell}`;
}

module.exports = { CELL_SIZE_DEG, computeCellId };
