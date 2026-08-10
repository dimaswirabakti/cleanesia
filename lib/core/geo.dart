import 'constants.dart';

/// Konversi koordinat ke indeks grid
/// Contoh: (-8.0251, 110.3320) -> "-8026_110332"
String computeCellId(double lat, double lng) {
  final latCell = (lat / kCellSizeDeg).floor();
  final lngCell = (lng / kCellSizeDeg).floor();
  return '${latCell}_$lngCell';
}
