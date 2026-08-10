import 'package:flutter/material.dart';

class ReportPhotoScreen extends StatelessWidget {
  const ReportPhotoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Laporkan Sampah — Foto')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pushNamed(context, '/report/detail'),
          child: const Text('Foto + klasifikasi (Fase 3)'),
        ),
      ),
    );
  }
}
