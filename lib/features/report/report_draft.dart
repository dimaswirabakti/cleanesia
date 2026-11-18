import '../../models/report.dart';
import 'detector_service.dart';

class ReportDraft {
  final String imagePath;
  final String localPhotoName;
  final Map<WasteType, double> prob;
  Set<WasteType> types;
  Severity? severity;
  double? lat;
  double? lng;
  final bool pakaiStub;

  /// Hasil object detection
  final List<KotakDeteksi> kotak;
  final int lebarFoto;
  final int tinggiFoto;
  final double tutupan;
  final Severity? saranKeparahan;
  final int durasiMs;

  ReportDraft({
    required this.imagePath,
    required this.localPhotoName,
    required this.prob,
    required this.types,
    required this.pakaiStub,
    this.severity,
    this.lat,
    this.lng,
    this.kotak = const [],
    this.lebarFoto = 0,
    this.tinggiFoto = 0,
    this.tutupan = 0.0,
    this.saranKeparahan,
    this.durasiMs = 0,
  });
}