import 'constants.dart';

/// Konversi koordinat ke indeks grid
/// Contoh: (-8.0251, 110.3320) -> "-8026_110332"
String computeCellId(double lat, double lng) {
  final latCell = (lat / kCellSizeDeg).floor();
  final lngCell = (lng / kCellSizeDeg).floor();
  return '${latCell}_$lngCell';
}

class CellBounds {
  final double latLo, latHi, lngLo, lngHi;
  CellBounds(this.latLo, this.latHi, this.lngLo, this.lngHi);
  double get latMid => (latLo + latHi) / 2;
  double get lngMid => (lngLo + lngHi) / 2;
}

/// Ubah cellId (contoh "-8026_110332") kembali menjadi kotak geografis
CellBounds cellBounds(String cellId) {
  final p = cellId.split('_');
  final latCell = int.parse(p[0]);
  final lngCell = int.parse(p[1]);
  return CellBounds(
    latCell * kCellSizeDeg,
    (latCell + 1) * kCellSizeDeg,
    lngCell * kCellSizeDeg,
    (lngCell + 1) * kCellSizeDeg,
  );
}
