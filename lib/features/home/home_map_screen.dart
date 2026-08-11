import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../core/geo.dart';
import '../../core/theme.dart';
import 'cell_map.dart';

const _labelParah = {
  1: 'Sangat Rendah',
  2: 'Rendah',
  3: 'Sedang',
  4: 'Tinggi',
  5: 'Sangat Tinggi',
};

class HomeMapScreen extends StatelessWidget {
  const HomeMapScreen({super.key});

  String _ago(DateTime t) {
    final d = DateTime.now().difference(t);
    if (d.inDays > 0) return '${d.inDays} hari lalu';
    if (d.inHours > 0) return '${d.inHours} jam lalu';
    return '${d.inMinutes} menit lalu';
  }

  void _detailSel(BuildContext ctx, Map<String, CellAgg> cells, LatLng p) {
    final agg = cells[computeCellId(p.latitude, p.longitude)];
    showModalBottomSheet(
      context: ctx,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: agg == null
            ? const Text('Belum terpantau di sel ini.', style: AppText.body)
            : Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Keparahan: ${_labelParah[agg.severity]}',
                    style: AppText.section,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Jenis: ${agg.types.map((t) => t.name).join(", ")}',
                    style: AppText.body,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Terakhir dilaporkan: ${_ago(agg.latestAt)}',
                    style: AppText.caption,
                  ),
                ],
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Peta Sebaran')),
      body: CellMap(
        interactive: true,
        onTapCell: (cells, p) => _detailSel(context, cells, p),
      ),
    );
  }
}
