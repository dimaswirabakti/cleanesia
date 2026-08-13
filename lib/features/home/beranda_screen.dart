import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/theme.dart';
import 'cell_map.dart';

class BerandaScreen extends StatelessWidget {
  final VoidCallback onLihatPeta;
  const BerandaScreen({super.key, required this.onLihatPeta});

  Future<List<int>> _stats() async {
    final r = await FirebaseFirestore.instance
        .collection('reports')
        .count()
        .get();
    final c = await FirebaseFirestore.instance
        .collection('cells')
        .count()
        .get();
    return [r.count ?? 0, c.count ?? 0];
  }

  Widget _statCol(String label, String value) => Expanded(
    child: Column(
      children: [
        Text(label, style: AppText.caption),
        const SizedBox(height: 4),
        Text(value, style: AppText.number),
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.md,
          AppSpacing.md,
          AppSpacing.lg,
        ),
        children: [
          Row(
            children: [
              Image.asset('assets/images/logo-horizontal.png', height: 30),
              const Spacer(),
              IconButton(
                onPressed: () {},
                icon: const Icon(
                  Icons.notifications_none,
                  color: AppColors.ink900,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.line),
                    borderRadius: BorderRadius.circular(AppSpacing.radius),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search, color: AppColors.ink600, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Cari lokasi...',
                        style: TextStyle(color: AppColors.ink600),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.line),
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.tune, size: 18, color: AppColors.ink900),
                    SizedBox(width: 6),
                    Text('Filter'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          GestureDetector(
            onTap: onLihatPeta,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
              child: const IgnorePointer(
                child: SizedBox(
                  height: 240,
                  child: IgnorePointer(
                    child: SizedBox(
                      height: 240,
                      child: CellMap(interactive: false, tampilNasional: true),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Ringkasan', style: AppText.title),
              GestureDetector(
                onTap: onLihatPeta,
                child: Text(
                  'Lihat Peta',
                  style: AppText.section.copyWith(color: AppColors.brand700),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          FutureBuilder<List<int>>(
            future: _stats(),
            builder: (context, snap) {
              final s = snap.data ?? const [0, 0];
              return IntrinsicHeight(
                child: Row(
                  children: [
                    _statCol('Laporan', '${s[0]}'),
                    const VerticalDivider(color: AppColors.line, width: 1),
                    _statCol('Area Terpantau', '${s[1]}'),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.brand700,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                textStyle: AppText.section.copyWith(fontSize: 16),
              ),
              onPressed: () => Navigator.pushNamed(context, '/report/photo'),
              icon: const Icon(Icons.camera_alt),
              label: const Text('Laporkan Sampah'),
            ),
          ),
        ],
      ),
    );
  }
}
