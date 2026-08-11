import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants.dart';
import '../../core/geo.dart';
import '../../core/theme.dart';
import '../../models/report.dart';

class CellAgg {
  final int severity;
  final DateTime latestAt;
  final Set<WasteType> types;
  CellAgg(this.severity, this.latestAt, this.types);
}

Map<String, CellAgg> aggregateCells(List<QueryDocumentSnapshot> docs) {
  final cells = <String, CellAgg>{};
  for (final d in docs) {
    final m = d.data() as Map<String, dynamic>;
    final id = m['cellId'] as String?;
    final ts = m['latestReportAt'];
    if (id == null || ts is! Timestamp) continue;
    cells[id] = CellAgg(
      (m['latestSeverity'] as num?)?.toInt() ?? 3,
      ts.toDate(),
      ((m['types'] as List?) ?? const [])
          .map((e) => WasteType.values.byName(e as String))
          .toSet(),
    );
  }
  return cells;
}

double _freshOpacity(int ageDays) {
  final t = (ageDays / kStaleThresholdDays).clamp(0.0, 1.0);
  return 0.70 - 0.45 * t;
}

List<Polygon> cellPolygons(Map<String, CellAgg> cells) {
  final now = DateTime.now();
  final out = <Polygon>[];
  cells.forEach((id, agg) {
    final b = cellBounds(id);
    final ageDays = now.difference(agg.latestAt).inDays;
    final fill = ageDays > kStaleThresholdDays
        ? AppColors.unmonitored.withValues(alpha: 0.35)
        : (AppColors.severity[agg.severity] ?? AppColors.severity[3]!)
              .withValues(alpha: _freshOpacity(ageDays));
    out.add(
      Polygon(
        points: [
          LatLng(b.latLo, b.lngLo),
          LatLng(b.latHi, b.lngLo),
          LatLng(b.latHi, b.lngHi),
          LatLng(b.latLo, b.lngHi),
        ],
        color: fill,
        borderColor: Colors.black26,
        borderStrokeWidth: 0.5,
      ),
    );
  });
  return out;
}

class CellMap extends StatelessWidget {
  final bool interactive;
  final void Function(Map<String, CellAgg> cells, LatLng p)? onTapCell;
  const CellMap({super.key, this.interactive = true, this.onTapCell});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('cells').snapshots(),
      builder: (context, snap) {
        final docs = snap.data?.docs ?? const <QueryDocumentSnapshot>[];
        final cells = aggregateCells(docs);
        final center = cells.isNotEmpty
            ? () {
                final b = cellBounds(cells.keys.first);
                return LatLng(b.latMid, b.lngMid);
              }()
            : const LatLng(-8.025, 110.332);
        return FlutterMap(
          options: MapOptions(
            initialCenter: center,
            initialZoom: 15,
            onTap: (interactive && onTapCell != null)
                ? (tp, p) => onTapCell!(cells, p)
                : null,
            interactionOptions: InteractionOptions(
              flags: interactive ? InteractiveFlag.all : InteractiveFlag.none,
            ),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.mencarijatidiri.cleanesia',
            ),
            PolygonLayer(polygons: cellPolygons(cells)),
            if (interactive)
              const RichAttributionWidget(
                attributions: [
                  TextSourceAttribution('OpenStreetMap contributors'),
                ],
              ),
          ],
        );
      },
    );
  }
}
