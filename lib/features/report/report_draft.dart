import '../../models/report.dart';

class ReportDraft {
  final String imagePath;
  final String localPhotoName;
  final Map<WasteType, double> prob;
  Set<WasteType> types;
  Severity? severity;
  double? lat;
  double? lng;
  final bool pakaiStub;

  ReportDraft({
    required this.imagePath,
    required this.localPhotoName,
    required this.prob,
    required this.types,
    required this.pakaiStub,
    this.severity,
    this.lat,
    this.lng,
  });
}
