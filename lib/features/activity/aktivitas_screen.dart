import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/theme.dart';
import '../../models/report.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

Future<File?> _fotoFile(String? nama) async {
  if (nama == null) return null;
  final dir = await getApplicationDocumentsDirectory();
  final f = File(p.join(dir.path, 'foto', nama));
  return await f.exists() ? f : null;
}

const _labelJenis = {
  WasteType.plastik: 'Plastik',
  WasteType.styrofoam: 'Styrofoam',
  WasteType.logam: 'Logam',
  WasteType.kaca: 'Kaca',
  WasteType.jaring: 'Jaring',
};
const _labelParah = {
  1: 'Sangat Rendah',
  2: 'Rendah',
  3: 'Sedang',
  4: 'Tinggi',
  5: 'Sangat Tinggi',
};

class AktivitasScreen extends StatelessWidget {
  const AktivitasScreen({super.key});

  String _ago(DateTime t) {
    final d = DateTime.now().difference(t);
    if (d.inDays > 0) return '${d.inDays} hari lalu';
    if (d.inHours > 0) return '${d.inHours} jam lalu';
    if (d.inMinutes > 0) return '${d.inMinutes} menit lalu';
    return 'Baru saja';
  }

  Color _severityColor(int s) =>
      AppColors.severity[s] ?? AppColors.severity[3]!;

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    return Scaffold(
      appBar: AppBar(title: const Text('Aktivitas')),
      body: uid == null
          ? const Center(child: Text('Belum ada laporan.', style: AppText.body))
          : StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('reports')
                  .where('reporterId', isEqualTo: uid)
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (context, snap) {
                if (!snap.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final docs = snap.data!.docs;
                if (docs.isEmpty) {
                  return const Center(
                    child: Text('Belum ada laporan.', style: AppText.body),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: docs.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, i) {
                    final m = docs[i].data() as Map<String, dynamic>;
                    final pending = docs[i].metadata.hasPendingWrites;
                    return _kartu(m, pending);
                  },
                );
              },
            ),
    );
  }

  Widget _kartu(Map<String, dynamic> m, bool pending) {
    final types = ((m['types'] as List?) ?? const [])
        .map((e) => WasteType.values.byName(e as String))
        .toList();
    final sev = (m['severity'] as num?)?.toInt() ?? 3;
    final ts = m['createdAt'];
    final at = ts is Timestamp ? ts.toDate() : DateTime.now();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FutureBuilder<File?>(
            future: _fotoFile(m['localPhotoPath'] as String?),
            builder: (context, snap) {
              final f = snap.data;
              return ClipRRect(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
                child: f != null
                    ? Image.file(f, width: 84, height: 84, fit: BoxFit.cover)
                    : Container(
                        width: 84,
                        height: 84,
                        color: AppColors.brand50,
                        child: const Icon(
                          Icons.image_not_supported_outlined,
                          color: AppColors.ink600,
                        ),
                      ),
              );
            },
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: types
                      .map(
                        (t) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brand50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _labelJenis[t]!,
                            style: AppText.caption.copyWith(
                              color: AppColors.brand700,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: _severityColor(sev),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _labelParah[sev]!,
                    style: AppText.caption.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(_ago(at), style: AppText.caption),
                const SizedBox(height: 6),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      pending ? Icons.sync : Icons.check_circle_outline,
                      size: 15,
                      color: pending ? AppColors.ink600 : AppColors.success,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      pending ? 'Menunggu sinkron' : 'Terkirim',
                      style: AppText.caption.copyWith(
                        color: pending ? AppColors.ink600 : AppColors.success,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
