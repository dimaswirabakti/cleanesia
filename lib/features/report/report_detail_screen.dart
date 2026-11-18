import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/geo.dart';
import '../../core/theme.dart';
import '../../models/report.dart';
import 'detector_service.dart';
import 'report_draft.dart';

const _labelJenis = {
  WasteType.plastik: 'Plastik',
  WasteType.styrofoam: 'Styrofoam',
  WasteType.logam: 'Logam',
  WasteType.kaca: 'Kaca',
  WasteType.jaring: 'Jaring',
};
/// Warna kotak deteksi per jenis sampah
const _warnaJenis = {
  WasteType.plastik: Color(0xFF3B82F6),
  WasteType.styrofoam: Color(0xFFF59E0B),
  WasteType.logam: Color(0xFFA855F7),
  WasteType.kaca: Color(0xFF10B981),
  WasteType.jaring: Color(0xFFEF4444),
};
const _labelParah = {
  Severity.sangatRendah: 'Sangat Rendah',
  Severity.rendah: 'Rendah',
  Severity.sedang: 'Sedang',
  Severity.tinggi: 'Tinggi',
  Severity.sangatTinggi: 'Sangat Tinggi',
};

class ReportDetailScreen extends StatefulWidget {
  const ReportDetailScreen({super.key});
  @override
  State<ReportDetailScreen> createState() => _S();
}

class _S extends State<ReportDetailScreen> {
  ReportDraft? d;
  bool _kirim = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    d ??= ModalRoute.of(context)!.settings.arguments as ReportDraft;
  }

  Future<void> _simpan() async {
    final draft = d!;
    if (draft.severity == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih tingkat keparahan dulu')),
      );
      return;
    }
    setState(() => _kirim = true);
    try {
      final uid =
          FirebaseAuth.instance.currentUser?.uid ??
              (await FirebaseAuth.instance.signInAnonymously()).user!.uid;
      final lat = draft.lat ?? 0, lng = draft.lng ?? 0;
      final r = Report(
        types: draft.types.toList(),
        severity: draft.severity!,
        // ai = pengguna memakai saran AI apa adanya, manual = diubah sendiri
        severitySource:
        draft.saranKeparahan != null &&
            draft.severity == draft.saranKeparahan
            ? SeveritySource.ai
            : SeveritySource.manual,
        lat: lat,
        lng: lng,
        cellId: computeCellId(lat, lng),
        createdAt: DateTime.now(),
        reporterId: uid,
        localPhotoPath: draft.localPhotoName,
      );
      FirebaseFirestore.instance.collection('reports').add(r.toMap());
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/report/done');
    } finally {
      if (mounted) setState(() => _kirim = false);
    }
  }

  Widget _stepIndicator() {
    Widget dot(int n, String label, bool active) => Column(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: active ? AppColors.brand500 : AppColors.line,
          child: Text(
            '$n',
            style: AppText.section.copyWith(
              color: active ? Colors.white : AppColors.ink600,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppText.caption.copyWith(
            color: active ? AppColors.brand700 : AppColors.ink600,
          ),
        ),
      ],
    );
    Widget line() => Expanded(
      child: Container(
        height: 1,
        color: AppColors.line,
        margin: const EdgeInsets.only(bottom: 20),
      ),
    );
    return Row(
      children: [
        dot(1, 'Foto', false),
        line(),
        dot(2, 'Detail', true),
        line(),
        dot(3, 'Selesai', false),
      ],
    );
  }

  Widget _deteksiRow(WasteType t, double p) {
    final aktif = d!.types.contains(t);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          InkWell(
            onTap: () =>
                setState(() => aktif ? d!.types.remove(t) : d!.types.add(t)),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: aktif ? AppColors.brand500 : AppColors.brand50,
                border: Border.all(
                  color: aktif ? AppColors.brand500 : AppColors.brand100,
                ),
              ),
              child: Icon(
                aktif ? Icons.check : Icons.add,
                size: 18,
                color: aktif ? Colors.white : AppColors.brand700,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_labelJenis[t]!, style: AppText.body),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: p.clamp(0.0, 1.0),
                    minHeight: 6,
                    backgroundColor: AppColors.line,
                    valueColor: const AlwaysStoppedAnimation(
                      AppColors.brand500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text('${(p * 100).round()}%', style: AppText.section),
        ],
      ),
    );
  }

  /// Foto laporan beserta kotak hasil deteksi.
  Widget _foto(ReportDraft draft) {
    if (draft.lebarFoto == 0 || draft.tinggiFoto == 0) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        child: Image.file(
          File(draft.imagePath),
          height: 200,
          width: double.infinity,
          fit: BoxFit.cover,
        ),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radius),
      child: Container(
        height: 260,
        width: double.infinity,
        color: AppColors.ink900,
        child: Center(
          child: AspectRatio(
            aspectRatio: draft.lebarFoto / draft.tinggiFoto,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.file(File(draft.imagePath), fit: BoxFit.fill),
                CustomPaint(
                  painter: _KotakPainter(
                    draft.kotak,
                    draft.lebarFoto,
                    draft.tinggiFoto,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Ringkasan hasil AI: jumlah sampah per jenis dan lama proses.
  Widget _ringkasanAi(ReportDraft draft) {
    if (draft.kotak.isEmpty) {
      return Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Text(
          'AI tidak menemukan sampah di foto ini. Pilih jenis dan '
              'tingkat keparahan secara manual.',
          style: AppText.caption.copyWith(color: AppColors.warning),
        ),
      );
    }
    final jumlah = <WasteType, int>{};
    for (final k in draft.kotak) {
      jumlah[k.jenis] = (jumlah[k.jenis] ?? 0) + 1;
    }
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: jumlah.entries
                .map(
                  (e) => Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: _warnaJenis[e.key],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${_labelJenis[e.key]} ${e.value}',
                    style: AppText.caption,
                  ),
                ],
              ),
            )
                .toList(),
          ),
          const SizedBox(height: 4),
          Text(
            '${draft.kotak.length} sampah terdeteksi, '
                'diproses dalam ${draft.durasiMs} ms',
            style: AppText.caption,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final draft = d!;
    // urutkan kelas dari keyakinan tertinggi
    final entries = draft.prob.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return Scaffold(
      appBar: AppBar(title: const Text('Laporkan Sampah')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          _stepIndicator(),
          const SizedBox(height: AppSpacing.lg),
          _foto(draft),
          if (!draft.pakaiStub) _ringkasanAi(draft),
          if (draft.pakaiStub)
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                'Mode stub (model tak jalan di Simulator)',
                style: TextStyle(color: AppColors.warning, fontSize: 12),
              ),
            ),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.line),
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Hasil Deteksi AI', style: AppText.section),
                    Text(
                      'Ubah jika perlu',
                      style: AppText.caption.copyWith(
                        color: AppColors.brand700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ...entries.map((e) => _deteksiRow(e.key, e.value)),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.line),
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Tingkat Keparahan', style: AppText.section),
                if (draft.saranKeparahan != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Saran AI: ${_labelParah[draft.saranKeparahan]!} '
                        '(sampah menutupi sekitar '
                        '${(draft.tutupan * 100).toStringAsFixed(1)}% foto). '
                        'Ubah jika tidak sesuai.',
                    style: AppText.caption,
                  ),
                ],
                const SizedBox(height: AppSpacing.sm),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: Severity.values.map((s) {
                    final sel = draft.severity == s;
                    return GestureDetector(
                      onTap: () => setState(() => draft.severity = s),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: sel ? AppColors.brand500 : AppColors.brand50,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _labelParah[s]!,
                          style: AppText.body.copyWith(
                            color: sel ? Colors.white : AppColors.ink900,
                            fontWeight: sel ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            height: 54,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.brand700,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                textStyle: AppText.section.copyWith(fontSize: 16),
              ),
              onPressed: _kirim ? null : _simpan,
              child: _kirim
                  ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
                  : const Text('Kirim Laporan'),
            ),
          ),
        ],
      ),
    );
  }
}

/// Menggambar kotak deteksi di atas foto.
/// Koordinat kotak dalam piksel foto asli, jadi diskalakan ke ukuran widget.
class _KotakPainter extends CustomPainter {
  final List<KotakDeteksi> kotak;
  final int lebarFoto;
  final int tinggiFoto;

  _KotakPainter(this.kotak, this.lebarFoto, this.tinggiFoto);

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / lebarFoto;
    final sy = size.height / tinggiFoto;
    for (final k in kotak) {
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = _warnaJenis[k.jenis] ?? Colors.white;
      canvas.drawRect(
        Rect.fromLTRB(k.x1 * sx, k.y1 * sy, k.x2 * sx, k.y2 * sy),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _KotakPainter old) =>
      old.kotak != kotak ||
          old.lebarFoto != lebarFoto ||
          old.tinggiFoto != tinggiFoto;
}