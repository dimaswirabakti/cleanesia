/// Ukuran sel grid dalam derajat (~111 m pada arah lintang).
/// Sel sedikit memanjang arah timur-barat, cukup untuk skala pilot.
const double kCellSizeDeg = 0.001;

/// Paruh-waktu peluruhan (dalam hari).
const int kDecayHalfLifeDays = 7;

/// Ambang basi: sel dianggap "belum terpantau" bila laporan terbaru lebih tua dari 21 hari.
const int kStaleThresholdDays = 21;
