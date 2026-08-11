import 'dart:io';
import 'dart:math';
import 'package:flutter/services.dart' show rootBundle;
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../../models/report.dart';

class HasilKlasifikasi {
  final Map<WasteType, double> prob;
  final Set<WasteType> terdeteksi;
  final bool pakaiStub;
  HasilKlasifikasi(this.prob, this.terdeteksi, this.pakaiStub);
}

class ClassifierService {
  Interpreter? _interp;
  List<WasteType> _labels = WasteType.values;
  List<double> _th = List.filled(5, 0.5);
  bool _stub = false;

  static const _urutan = [
    WasteType.plastik,
    WasteType.styrofoam,
    WasteType.logam,
    WasteType.kaca,
    WasteType.jaring,
  ];

  Future<void> init() async {
    try {
      _interp = await Interpreter.fromAsset('assets/model/model_jenis.tflite');
      final th = await rootBundle.loadString('assets/model/thresholds.txt');
      _th = th.trim().split('\n').map((e) => double.parse(e.trim())).toList();
      _labels = _urutan;
      _stub = false;
    } catch (e) {
      // Simulator / model gagal dimuat
      _stub = true;
    }
  }

  Future<HasilKlasifikasi> classify(File file) async {
    if (_stub || _interp == null) return _stubResult();

    final image = img.decodeImage(await file.readAsBytes());
    if (image == null) return _stubResult();
    final r = img.copyResize(image, width: 224, height: 224);

    final input = List.generate(
      1,
      (_) => List.generate(
        224,
        (y) => List.generate(224, (x) {
          final p = r.getPixel(x, y);
          return [p.r.toDouble(), p.g.toDouble(), p.b.toDouble()];
        }),
      ),
    );

    final output = List.filled(1 * 5, 0.0).reshape([1, 5]);
    _interp!.run(input, output);
    final probs = (output[0] as List)
        .map((e) => (e as num).toDouble())
        .toList();

    final prob = <WasteType, double>{};
    final det = <WasteType>{};
    for (var i = 0; i < _urutan.length; i++) {
      prob[_urutan[i]] = probs[i];
      if (probs[i] >= _th[i]) det.add(_urutan[i]);
    }
    return HasilKlasifikasi(prob, det, false);
  }

  HasilKlasifikasi _stubResult() {
    final rnd = Random();
    final prob = {for (final k in _urutan) k: rnd.nextDouble()};
    final det = prob.entries
        .where((e) => e.value > 0.6)
        .map((e) => e.key)
        .toSet();
    if (det.isEmpty) det.add(WasteType.plastik);
    return HasilKlasifikasi(prob, det, true);
  }
}
