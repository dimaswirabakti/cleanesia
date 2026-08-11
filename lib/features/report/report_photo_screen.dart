import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'classifier_service.dart';
import 'report_draft.dart';

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
        izin == LocationPermission.deniedForever)
      return null;
    try {
      return await Geolocator.getCurrentPosition();
    } catch (_) {
      return null;
    }
  }

  Future<void> _ambil(ImageSource src) async {
    setState(() => _sibuk = true);
    try {
      final x = await ImagePicker().pickImage(source: src, maxWidth: 1600);
      if (x == null) {
        setState(() => _sibuk = false);
        return;
      }
      final hasil = await _clf.classify(File(x.path));
      final pos = await _gps();
      if (!mounted) return;
      Navigator.pushNamed(
        context,
        '/report/detail',
        arguments: ReportDraft(
          imagePath: x.path,
          types: {...hasil.terdeteksi},
          pakaiStub: hasil.pakaiStub,
          lat: pos?.latitude,
          lng: pos?.longitude,
        ),
      );
    } finally {
      if (mounted) setState(() => _sibuk = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Laporkan Sampah — Foto')),
      body: Center(
        child: _sibuk
            ? const CircularProgressIndicator()
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _ambil(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Ambil Foto'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => _ambil(ImageSource.gallery),
                    icon: const Icon(Icons.photo),
                    label: const Text('Dari Galeri'),
                  ),
                ],
              ),
      ),
    );
  }
}
