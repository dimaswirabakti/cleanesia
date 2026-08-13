import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/theme.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ProfilScreen extends StatelessWidget {
  const ProfilScreen({super.key});

  Future<Map<String, int>> _stats(String uid) async {
    final snap = await FirebaseFirestore.instance
        .collection('reports')
        .where('reporterId', isEqualTo: uid)
        .get();
    final laporan = snap.docs.length;
    final lokasi = snap.docs
        .map((d) => (d.data()['cellId'] as String?) ?? '')
        .where((c) => c.isNotEmpty)
        .toSet()
        .length;
    return {'laporan': laporan, 'lokasi': lokasi};
  }

  void _tentang(BuildContext c) => _sheet(
    c,
    'Tentang Aplikasi',
    'Cleanesia adalah aplikasi pemetaan sebaran sampah laut berbasis kecerdasan buatan dan '
        'partisipasi warga pesisir. Warga memotret sampah di pantai, model kecerdasan buatan di dalam '
        'ponsel mengenali jenisnya secara langsung tanpa internet, lalu laporan digabung menjadi peta '
        'kepadatan untuk membantu prioritas pembersihan pantai.',
  );

  void _bantuan(BuildContext c) => _sheet(
    c,
    'Bantuan',
    'Cara melapor:\n\n'
        '1. Tekan menu Laporkan di navigasi bawah.\n'
        '2. Foto sampah di lokasi, atau pilih dari galeri.\n'
        '3. Periksa hasil deteksi jenis sampah, ubah bila perlu.\n'
        '4. Pilih tingkat keparahan, lalu tekan Kirim Laporan.\n\n'
        'Jika sedang tidak ada internet, laporan tersimpan otomatis dan terkirim sendiri begitu '
        'perangkat kembali daring. Anda dapat memantau status laporan di menu Aktivitas.',
  );

  void _sheet(BuildContext c, String judul, String isi) {
    showModalBottomSheet(
      context: c,
      backgroundColor: AppColors.bg,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(judul, style: AppText.title),
            const SizedBox(height: AppSpacing.md),
            Text(isi, style: AppText.body),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  Widget _statBox(String value, String label) => Expanded(
    child: Column(
      children: [
        Text(value, style: AppText.number),
        const SizedBox(height: 4),
        Text(label, style: AppText.caption),
      ],
    ),
  );

  Widget _menu(IconData ikon, String judul, VoidCallback onTap) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
      child: Row(
        children: [
          Icon(ikon, size: 22, color: AppColors.ink900),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: Text(judul, style: AppText.body)),
          const Icon(Icons.chevron_right, color: AppColors.ink600),
        ],
      ),
    ),
  );

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final uid = user?.uid ?? '-';
    final idPendek = uid.length >= 6
        ? uid.substring(0, 6).toUpperCase()
        : uid.toUpperCase();

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          const SizedBox(height: AppSpacing.md),
          Center(
            child: Column(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: const BoxDecoration(
                    color: AppColors.brand50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline,
                    size: 44,
                    color: AppColors.brand700,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                const Text('Kontributor Anonim', style: AppText.title),
                const SizedBox(height: 4),
                Text('ID: WRG-$idPendek', style: AppText.caption),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // status koneksi
          StreamBuilder<List<ConnectivityResult>>(
            stream: Connectivity().onConnectivityChanged,
            builder: (context, snap) {
              final hasil = snap.data ?? const [];
              final luring =
                  hasil.isEmpty ||
                  hasil.every((r) => r == ConnectivityResult.none);
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    luring
                        ? Icons.cloud_off_outlined
                        : Icons.cloud_done_outlined,
                    size: 16,
                    color: luring ? AppColors.ink600 : AppColors.success,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    luring ? 'Mode luring' : 'Daring',
                    style: AppText.caption.copyWith(
                      color: luring ? AppColors.ink600 : AppColors.success,
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: AppSpacing.lg),

          // statistik
          FutureBuilder<Map<String, int>>(
            future: _stats(uid),
            builder: (context, snap) {
              final s = snap.data ?? const {'laporan': 0, 'area': 0};
              return Container(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.line),
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                child: IntrinsicHeight(
                  child: Row(
                    children: [
                      _statBox('${s['laporan']}', 'Jumlah Laporan'),
                      const VerticalDivider(color: AppColors.line, width: 1),
                      _statBox('${s['lokasi']}', 'Lokasi Terpantau'),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: AppSpacing.lg),

          Container(
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.line),
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Column(
              children: [
                _menu(
                  Icons.info_outline,
                  'Tentang Aplikasi',
                  () => _tentang(context),
                ),
                const Divider(color: AppColors.line, height: 1),
                _menu(Icons.help_outline, 'Bantuan', () => _bantuan(context)),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          Center(
            child: Text(
              'Cleanesia v1.0.0 | Dibuat untuk lingkungan laut Indonesia.',
              textAlign: TextAlign.center,
              style: AppText.caption,
            ),
          ),
        ],
      ),
    );
  }
}
