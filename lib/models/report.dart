import 'package:cloud_firestore/cloud_firestore.dart';

/// 5 label
enum WasteType { plastik, styrofoam, logam, kaca, jaring }

/// Keparahan ordinal
enum Severity {
  sangatRendah(1),
  rendah(2),
  sedang(3),
  tinggi(4),
  sangatTinggi(5);

  final int level;
  const Severity(this.level);

  static Severity fromLevel(int level) => Severity.values.firstWhere(
    (s) => s.level == level,
    orElse: () => Severity.sedang,
  );
}

/// Sumber nilai keparahan
enum SeveritySource { manual, ai }

class Report {
  final String? reportId;
  final List<WasteType> types;
  final Severity severity;
  final SeveritySource severitySource;
  final double lat;
  final double lng;
  final String cellId;
  final DateTime createdAt;
  final String reporterId;
  final String? thumbnailUrl;
  final String? localPhotoPath;

  const Report({
    this.reportId,
    required this.types,
    required this.severity,
    required this.severitySource,
    required this.lat,
    required this.lng,
    required this.cellId,
    required this.createdAt,
    required this.reporterId,
    this.thumbnailUrl,
    this.localPhotoPath,
  });

  Map<String, dynamic> toMap() => {
    'types': types.map((t) => t.name).toList(),
    'severity': severity.level,
    'severitySource': severitySource.name,
    'lat': lat,
    'lng': lng,
    'cellId': cellId,
    'createdAt': Timestamp.fromDate(createdAt),
    'reporterId': reporterId,
    'thumbnailUrl': thumbnailUrl,
    'localPhotoPath': localPhotoPath,
  };

  factory Report.fromMap(String id, Map<String, dynamic> m) => Report(
    reportId: id,
    types: (m['types'] as List<dynamic>)
        .map((e) => WasteType.values.byName(e as String))
        .toList(),
    severity: Severity.fromLevel(m['severity'] as int),
    severitySource: SeveritySource.values.byName(m['severitySource'] as String),
    lat: (m['lat'] as num).toDouble(),
    lng: (m['lng'] as num).toDouble(),
    cellId: m['cellId'] as String,
    createdAt: (m['createdAt'] as Timestamp).toDate(),
    reporterId: m['reporterId'] as String,
    thumbnailUrl: m['thumbnailUrl'] as String?,
    localPhotoPath: m['localPhotoPath'] as String?,
  );
}
