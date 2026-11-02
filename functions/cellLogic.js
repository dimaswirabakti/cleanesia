/**
 * Logika murni untuk menentukan isi dokumen sel.
 * `reports` harus sudah terurut dari terbaru ke terlama.
 * `override` mensimulasikan perubahan status hidden pada satu laporan yang
 * sedang diubah di dalam transaksi yang sama.
 */
function pickLatestVisible(reports, override) {
  for (const r of reports) {
    const hidden =
      override && r.id === override.id ? override.hidden : r.hidden === true;
    if (!hidden) return r;
  }
  return null;
}

/** Bentuk dokumen cells/{id}: identik dengan yang ditulis agregasiLaporan. */
function toCellDoc(cellId, r) {
  return {
    cellId,
    latestSeverity: r.severity ?? 3,
    latestReportAt: r.createdAt,
    types: r.types ?? [],
  };
}

module.exports = { pickLatestVisible, toCellDoc };
