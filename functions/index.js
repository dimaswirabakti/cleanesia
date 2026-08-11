const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// harus identik dengan kCellSizeDeg di lib/core/constants.dart
const CELL_SIZE_DEG = 0.001;

function computeCellId(lat, lng) {
  const latCell = Math.floor(lat / CELL_SIZE_DEG);
  const lngCell = Math.floor(lng / CELL_SIZE_DEG);
  return `${latCell}_${lngCell}`;
}

// Dipicu tiap laporan baru
// O(1): hanya menyentuh 1 dokumen sel
exports.agregasiLaporan = onDocumentCreated("reports/{id}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const r = snap.data();

  const cellId =
    r.cellId ||
    (typeof r.lat === "number" && typeof r.lng === "number"
      ? computeCellId(r.lat, r.lng)
      : null);
  const createdAt = r.createdAt;
  if (!cellId || !createdAt) return;

  const cellRef = db.collection("cells").doc(cellId);
  await db.runTransaction(async (tx) => {
    const prev = await tx.get(cellRef);
    const p = prev.exists ? prev.data() : null;
    // diperbarui jika laporan ini lebih baru dari yang tersimpan
    if (
      p &&
      p.latestReportAt &&
      p.latestReportAt.toMillis() >= createdAt.toMillis()
    ) {
      return;
    }
    tx.set(cellRef, {
      cellId: cellId,
      latestSeverity: r.severity ?? 3,
      latestReportAt: createdAt,
      types: r.types ?? [],
    });
  });
});
