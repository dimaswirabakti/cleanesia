import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/geo.dart';
import '../../models/report.dart';
import 'report_draft.dart';

const _labelJenis = {
  WasteType.plastik: 'Plastik',
  WasteType.styrofoam: 'Styrofoam',
  WasteType.logam: 'Logam',
  WasteType.kaca: 'Kaca',
  WasteType.jaring: 'Jaring',
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
    if (d!.severity == null) {
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
      final lat = d!.lat ?? 0, lng = d!.lng ?? 0;
      final r = Report(
        types: d!.types.toList(),
        severity: d!.severity!,
        severitySource: SeveritySource.manual, // keparahan manual
        lat: lat,
        lng: lng,
        cellId: computeCellId(lat, lng),
        createdAt: DateTime.now(),
        reporterId: uid,
      );
      // hasil server async, agar jalan saat luring
      FirebaseFirestore.instance.collection('reports').add(r.toMap());
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/report/done');
    } finally {
      if (mounted) setState(() => _kirim = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = this.d!;
    return Scaffold(
      appBar: AppBar(title: const Text('Laporkan Sampah — Detail')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              File(d.imagePath),
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          if (d.pakaiStub)
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                '⚠ Mode stub (model tak jalan di Simulator) — hasil tiruan',
                style: TextStyle(color: Colors.orange),
              ),
            ),
          const SizedBox(height: 16),
          const Text(
            'Jenis sampah (ubah jika perlu):',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          ...WasteType.values.map(
            (t) => CheckboxListTile(
              dense: true,
              title: Text(_labelJenis[t]!),
              value: d.types.contains(t),
              onChanged: (v) => setState(
                () => v == true ? d.types.add(t) : d.types.remove(t),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Tingkat keparahan:',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          Wrap(
            spacing: 8,
            children: Severity.values
                .map(
                  (s) => ChoiceChip(
                    label: Text(_labelParah[s]!),
                    selected: d.severity == s,
                    onSelected: (_) => setState(() => d.severity = s),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _kirim ? null : _simpan,
            child: _kirim
                ? const CircularProgressIndicator()
                : const Text('Kirim Laporan'),
          ),
        ],
      ),
    );
  }
}
