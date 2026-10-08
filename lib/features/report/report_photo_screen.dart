import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/theme.dart';
import 'classifier_service.dart';
import 'report_draft.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ReportPhotoScreen extends StatefulWidget {
  const ReportPhotoScreen({super.key});
  @override
  State<ReportPhotoScreen> createState() => _S();
}

class _S extends State<ReportPhotoScreen> {
  final _clf = ClassifierService();
  bool _sibuk = false;

  @override
  void initState() {
    super.initState();
    _clf.init();
  }

  Future<Position?> _gps() async {
    var izin = await Geolocator.checkPermission();
    if (izin == LocationPermission.denied) {
      izin = await Geolocator.requestPermission();
    }
    if (izin == LocationPermission.denied ||
        izin == LocationPermission.deniedForever) {
      return null;
    }
    try {
      return await Geolocator.getCurrentPosition();
    } catch (_) {
      return null;
    }
  }

  Future<void> _ambil() async {
    setState(() => _sibuk = true);
    try {
      final x = await ImagePicker().pickImage(
        source: ImageSource.camera,
        maxWidth: 1600,
      );
      if (x == null) return;
      final hasil = await _clf.classify(File(x.path));
      final pos = await _gps();
      final dir = await getApplicationDocumentsDirectory();
      final fotoDir = Directory(p.join(dir.path, 'foto'));
      if (!await fotoDir.exists()) await fotoDir.create(recursive: true);
      final namaFile = '${DateTime.now().millisecondsSinceEpoch}.jpg';
      final tujuan = p.join(fotoDir.path, namaFile);
      await File(x.path).copy(tujuan);
      if (!mounted) return;
      Navigator.pushNamed(
        context,
        '/report/detail',
        arguments: ReportDraft(
          imagePath: tujuan,
          localPhotoName: namaFile,
          prob: hasil.prob,
          types: {...hasil.terdeteksi},
          pakaiStub: hasil.pakaiStub,
          lat: pos?.latitude,
          lng: pos?.longitude,
        ),
      );
    } on PlatformException catch (e) {
      if (!mounted) return;
      final ditolak = e.code == 'camera_access_denied';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ditolak
                ? 'Izin kamera ditolak. Aktifkan izin kamera untuk Cleanesia di Pengaturan.'
                : 'Kamera tidak bisa dibuka. Coba lagi.',
          ),
          action: ditolak
              ? SnackBarAction(
                  label: 'Pengaturan',
                  onPressed: () => Geolocator.openAppSettings(),
                )
              : null,
        ),
      );
    } finally {
      if (mounted) setState(() => _sibuk = false);
    }
  }

  Widget _petunjuk(IconData ikon, String teks) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(ikon, size: 20, color: AppColors.brand700),
        const SizedBox(width: 12),
        Expanded(child: Text(teks, style: AppText.body)),
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Foto Laporan Sampah')),
      body: SafeArea(
        child: _sibuk
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            const SizedBox(height: AppSpacing.md),
                            Container(
                              width: 96,
                              height: 96,
                              decoration: const BoxDecoration(
                                color: AppColors.brand50,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.camera_alt_outlined,
                                size: 44,
                                color: AppColors.brand700,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            const Text(
                              'Potret sampah di lokasi',
                              textAlign: TextAlign.center,
                              style: AppText.title,
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            Text(
                              'Foto diambil langsung dari kamera supaya laporan '
                              'sesuai dengan kondisi pantai saat ini.',
                              textAlign: TextAlign.center,
                              style: AppText.body.copyWith(
                                color: AppColors.ink600,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(AppSpacing.md),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.line),
                                borderRadius: BorderRadius.circular(
                                  AppSpacing.radius,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Sebelum memotret',
                                    style: AppText.section,
                                  ),
                                  const SizedBox(height: AppSpacing.sm),
                                  _petunjuk(
                                    Icons.place_outlined,
                                    'Potret di tempat sampah berada. Lokasi laporan '
                                    'mengikuti posisi ponsel saat memotret.',
                                  ),
                                  _petunjuk(
                                    Icons.wb_sunny_outlined,
                                    'Pastikan cahaya cukup dan sampah terlihat jelas.',
                                  ),
                                  _petunjuk(
                                    Icons.crop_free,
                                    'Usahakan seluruh tumpukan sampah masuk dalam bingkai.',
                                  ),
                                  _petunjuk(
                                    Icons.auto_awesome_outlined,
                                    'Jenis sampah dikenali otomatis setelah foto diambil. '
                                    'Hasilnya bisa diubah di langkah berikutnya.',
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.brand700,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                              AppSpacing.radius,
                            ),
                          ),
                          textStyle: AppText.section.copyWith(fontSize: 16),
                        ),
                        onPressed: _ambil,
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Ambil Foto'),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
