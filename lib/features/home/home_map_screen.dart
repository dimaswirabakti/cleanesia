import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants.dart';
import '../../core/geo.dart';
import '../../models/report.dart';

class _CellAgg {
  final int severity;
  final DateTime latestAt;
  final Set<WasteType> types;
  _CellAgg(this.severity, this.latestAt, this.types);
}

const _labelParah = {
  1: 'Sangat Rendah',
  2: 'Rendah',
  3: 'Sedang',
  4: 'Tinggi',
  5: 'Sangat Tinggi',
};

class HomeMapScreen extends StatelessWidget {
  const HomeMapScreen({super.key});

  Color _severityColor(int sev) {
    switch (sev) {
      case 1:
        return const Color(0xFF2E7D32);
      case 2:
        return const Color(0xFF9CCC65);
      case 3:
        return const Color(0xFFFFB300);
      case 4:
        return const Color(0xFFF4511E);
      default:
        return const Color(0xFFC62828);
    }
  }

  double _freshOpacity(int ageDays) {
    final t = (ageDays / kStaleThresholdDays).clamp(0.0, 1.0);
    return 0.70 - 0.45 * t;
  }

  List<Polygon> _polygons(Map<String, _CellAgg> cells) {
    final now = DateTime.now();
    final out = <Polygon>[];
    cells.forEach((id, agg) {
      final b = cellBounds(id);
      final ageDays = now.difference(agg.latestAt).inDays;
      final Color fill = ageDays > kStaleThresholdDays
          ? Colors.grey.withValues(alpha: 0.35) // belum terpantau
          : _severityColor(
              agg.severity,
            ).withValues(alpha: _freshOpacity(ageDays));
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

  String _ago(DateTime t) {
    final d = DateTime.now().difference(t);
    if (d.inDays > 0) return '${d.inDays} hari lalu';
    if (d.inHours > 0) return '${d.inHours} jam lalu';
    return '${d.inMinutes} menit lalu';
  }

  void _detailSel(BuildContext ctx, Map<String, _CellAgg> cells, LatLng p) {
    final agg = cells[computeCellId(p.latitude, p.longitude)];
    showModalBottomSheet(
      context: ctx,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: agg == null
            ? const Text('Belum terpantau di sel ini.')
            : Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Keparahan: ${_labelParah[agg.severity]}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Jenis: ${agg.types.map((t) => t.name).join(", ")}'),
                  const SizedBox(height: 4),
                  Text(
                    'Terakhir dilaporkan: ${_ago(agg.latestAt)}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cleanesia')),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('cells').snapshots(),
        builder: (context, snap) {
          final docs = snap.data?.docs ?? const <QueryDocumentSnapshot>[];
          final cells = <String, _CellAgg>{};
          for (final d in docs) {
            final m = d.data() as Map<String, dynamic>;
            final id = m['cellId'] as String?;
            final ts = m['latestReportAt'];
            if (id == null || ts is! Timestamp) continue;
            cells[id] = _CellAgg(
              (m['latestSeverity'] as num?)?.toInt() ?? 3,
              ts.toDate(),
              ((m['types'] as List?) ?? const [])
                  .map((e) => WasteType.values.byName(e as String))
                  .toSet(),
            );
          }
          final center = cells.isNotEmpty
              ? () {
                  final b = cellBounds(cells.keys.first);
                  return LatLng(b.latMid, b.lngMid);
                }()
              : const LatLng(-8.025, 110.332); // default: pantai parangtritis
          return FlutterMap(
            options: MapOptions(
              initialCenter: center,
              initialZoom: 15,
              onTap: (tapPos, latlng) => _detailSel(context, cells, latlng),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.mencarijatidiri.cleanesia',
              ),
              PolygonLayer(polygons: _polygons(cells)),
              const RichAttributionWidget(
                attributions: [
                  TextSourceAttribution('OpenStreetMap contributors'),
                ],
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/report/photo'),
        icon: const Icon(Icons.camera_alt),
        label: const Text('Laporkan Sampah'),
      ),
    );
  }
}
