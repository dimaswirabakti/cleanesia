import '../../models/report.dart';

class ReportDraft {
  final String imagePath;
  Set<WasteType> types;
  Severity? severity;
  double? lat;
  double? lng;
  final bool pakaiStub;

  ReportDraft({
    required this.imagePath,
    required this.types,
    required this.pakaiStub,
    this.severity,
    this.lat,
    this.lng,
  });
}
